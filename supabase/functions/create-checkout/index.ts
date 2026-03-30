import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const plans: Record<string, { name: string; base: number }> = {
  basic: { name: "Basic Hosting", base: 1.49 },
  standard: { name: "Standard Hosting", base: 2.49 },
  business: { name: "Business Hosting", base: 4.99 },
  agency: { name: "Agency Hosting", base: 8.99 },
};

const extras: Record<string, { name: string; price: number }> = {
  backup: { name: "Automatic Backups", price: 1.59 },
  email: { name: "Professional Email", price: 1.29 },
  priority: { name: "Priority Support", price: 3.09 },
  ddos: { name: "DDoS Protection", price: 2.49 },
};

const periodMultiplier: Record<string, number> = {
  monthly: 1.15,
  "12mo": 1,
  "24mo": 0.85,
  "36mo": 0.75,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { planId, period, domain, selectedExtras } = await req.json();

    const plan = plans[planId];
    if (!plan) throw new Error("Invalid plan");

    const multiplier = periodMultiplier[period] || 1.15;
    const planPriceCents = Math.round(plan.base * multiplier * 100);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find or skip creating customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    const periodLabel =
      period === "monthly" ? "Monthly" : period === "12mo" ? "12 Months" : period === "24mo" ? "24 Months" : "36 Months";

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `${plan.name} (${periodLabel})`,
            description: domain ? `Domain: ${domain}` : undefined,
          },
          unit_amount: planPriceCents,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ];

    // Add extras as line items
    for (const extraId of selectedExtras || []) {
      const extra = extras[extraId];
      if (extra) {
        lineItems.push({
          price_data: {
            currency: "eur",
            product_data: { name: extra.name },
            unit_amount: Math.round(extra.price * 100),
            recurring: { interval: "month" },
          },
          quantity: 1,
        });
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/onboarding?success=true`,
      cancel_url: `${req.headers.get("origin")}/onboarding?canceled=true`,
      metadata: {
        plan_id: planId,
        period,
        domain: domain || "",
        extras: (selectedExtras || []).join(","),
        user_id: user.id,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
