import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

async function fossbillingRequest(endpoint: string, method = "POST", body?: unknown) {
  const baseUrl = Deno.env.get("FOSSBILLING_API_URL");
  const apiKey = Deno.env.get("FOSSBILLING_API_KEY");
  if (!baseUrl || !apiKey) {
    logStep("FOSSBilling credentials missing, skipping");
    return null;
  }

  const url = `${baseUrl.replace(/\/$/, "")}/${endpoint}`;
  logStep("FOSSBilling request", { url, method });

  const resp = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await resp.json();
  if (!resp.ok) {
    logStep("FOSSBilling error", { status: resp.status, data });
    return null;
  }
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    // If STRIPE_WEBHOOK_SECRET is set, verify signature; otherwise parse directly
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      logStep("Webhook signature verified");
    } else {
      event = JSON.parse(body) as Stripe.Event;
      logStep("Webhook received (no signature verification)", { type: event.type });
    }

    logStep("Processing event", { type: event.type, id: event.id });

    switch (event.type) {
      // ── Checkout completed → provision hosting ──
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        logStep("Checkout completed", { metadata, customer_email: session.customer_email });

        const userId = metadata.user_id;
        const planId = metadata.plan_id;
        const period = metadata.period;
        const domain = metadata.domain;
        const serverLocation = metadata.server_location;
        const tier = metadata.tier;

        if (!userId) {
          logStep("No user_id in metadata, skipping DB update");
          break;
        }

        // Update or create hosting plan in DB
        const planDefaults: Record<string, { storage: number; bandwidth: number; cpu: number; ram: number }> = {
          basic: { storage: 10, bandwidth: 100, cpu: 1, ram: 1024 },
          standard: { storage: 25, bandwidth: 250, cpu: 2, ram: 2048 },
          business: { storage: 50, bandwidth: 500, cpu: 4, ram: 4096 },
          agency: { storage: 100, bandwidth: 1000, cpu: 8, ram: 8192 },
        };

        const defaults = planDefaults[planId || "basic"] || planDefaults.basic;

        const { error: planError } = await supabase.from("hosting_plans").insert({
          user_id: userId,
          plan_name: planId ? planId.charAt(0).toUpperCase() + planId.slice(1) : "Basic",
          billing_period: period || "monthly",
          status: "active",
          domain: domain || null,
          server_location: serverLocation || "EU-Frankfurt",
          storage_limit_gb: defaults.storage,
          bandwidth_limit_gb: defaults.bandwidth,
          cpu_cores: defaults.cpu,
          ram_mb: defaults.ram,
          expires_at: new Date(
            Date.now() +
              (period === "36mo" ? 36 : period === "24mo" ? 24 : period === "12mo" ? 12 : 1) *
                30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        });

        if (planError) logStep("Error inserting hosting plan", { error: planError.message });
        else logStep("Hosting plan created in DB");

        // Create invoice record
        const amountTotal = session.amount_total ? session.amount_total / 100 : 0;
        await supabase.from("invoices").insert({
          user_id: userId,
          amount: amountTotal,
          currency: "EUR",
          status: "paid",
          description: `${planId || "Hosting"} - ${period || "monthly"}`,
          due_date: new Date().toISOString(),
        });
        logStep("Invoice created in DB");

        // Process referral earning if applicable
        const creditsUsed = parseFloat(metadata.credits_used || "0");
        if (creditsUsed > 0) {
          logStep("Referral credits used", { creditsUsed });
        }

        // Provision in FOSSBilling
        const email = session.customer_email || session.customer_details?.email;
        if (email) {
          // Find or create client
          const clientSearch = await fossbillingRequest("admin/client/get_list", "POST", {
            search: email,
            per_page: 1,
          });

          let fbClientId: number | null = null;
          if (clientSearch?.result?.list?.length > 0) {
            fbClientId = clientSearch.result.list[0].id;
          } else {
            const newClient = await fossbillingRequest("admin/client/create", "POST", {
              email,
              first_name: session.customer_details?.name?.split(" ")[0] || "User",
              last_name: session.customer_details?.name?.split(" ").slice(1).join(" ") || "",
              password: crypto.randomUUID(),
            });
            fbClientId = newClient?.result ?? null;
          }

          if (fbClientId) {
            logStep("FOSSBilling client", { fbClientId });
            // Create order in FOSSBilling if product mapping exists
            // This maps Stripe plan IDs to FOSSBilling product IDs
            // You can customize this mapping
            const fbProductMap: Record<string, number> = {
              // planId → FOSSBilling product_id (configure these)
              // basic: 1,
              // standard: 2,
              // business: 3,
              // agency: 4,
            };

            const fbProductId = fbProductMap[planId || ""];
            if (fbProductId) {
              const order = await fossbillingRequest("admin/order/create", "POST", {
                client_id: fbClientId,
                product_id: fbProductId,
                period: period === "monthly" ? "1M" : period === "12mo" ? "1Y" : period === "24mo" ? "2Y" : "3Y",
                activate: true,
                config: {
                  domain: domain || undefined,
                  server_location: serverLocation || undefined,
                  tier: tier || "standard",
                },
              });
              logStep("FOSSBilling order created", { orderId: order?.result });
            } else {
              logStep("No FOSSBilling product mapping for plan", { planId });
            }
          }
        }
        break;
      }

      // ── Invoice paid → update records ──
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Invoice paid", { invoiceId: invoice.id, amount: invoice.amount_paid });

        // Process referral earning if applicable
        if (invoice.customer_email) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("user_id")
            .eq("user_id", (await supabase.auth.admin.listUsers()).data.users.find(
              (u) => u.email === invoice.customer_email
            )?.id || "")
            .maybeSingle();

          if (profile) {
            await supabase.rpc("process_referral_earning", {
              p_referred_user_id: profile.user_id,
              p_invoice_id: invoice.id,
              p_amount: invoice.amount_paid / 100,
            });
            logStep("Referral earning processed");
          }
        }
        break;
      }

      // ── Subscription deleted → suspend in FOSSBilling ──
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription deleted", { subscriptionId: subscription.id });

        const customer = await stripe.customers.retrieve(subscription.customer as string);
        if ("email" in customer && customer.email) {
          // Suspend in FOSSBilling
          const clientSearch = await fossbillingRequest("admin/client/get_list", "POST", {
            search: customer.email,
            per_page: 1,
          });

          if (clientSearch?.result?.list?.length > 0) {
            const orders = await fossbillingRequest("admin/order/get_list", "POST", {
              client_id: clientSearch.result.list[0].id,
              status: "active",
            });

            for (const order of orders?.result?.list || []) {
              await fossbillingRequest("admin/order/suspend", "POST", {
                id: order.id,
                reason: "Subscription cancelled in Stripe",
              });
              logStep("FOSSBilling order suspended", { orderId: order.id });
            }
          }

          // Update hosting plan status in DB
          const { data: users } = await supabase.auth.admin.listUsers();
          const matchedUser = users.users.find((u) => u.email === customer.email);
          if (matchedUser) {
            await supabase
              .from("hosting_plans")
              .update({ status: "suspended" })
              .eq("user_id", matchedUser.id)
              .eq("status", "active");
            logStep("Hosting plans suspended in DB");
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
