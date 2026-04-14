import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[FOSSBILLING-PROXY] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

async function fossbillingRequest(endpoint: string, method = "GET", body?: unknown) {
  const baseUrl = Deno.env.get("FOSSBILLING_API_URL");
  const apiKey = Deno.env.get("FOSSBILLING_API_KEY");
  if (!baseUrl || !apiKey) throw new Error("FOSSBilling credentials not configured");

  // baseUrl already includes /api/ so just append the endpoint
  const url = `${baseUrl.replace(/\/$/, "")}/${endpoint}`;
  logStep("FOSSBilling request", { url, method });

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  };
  if (body && method !== "GET") {
    options.body = JSON.stringify(body);
  }

  const resp = await fetch(url, options);
  const data = await resp.json();

  if (!resp.ok) {
    logStep("FOSSBilling error", { status: resp.status, data });
    throw new Error(data?.error?.message || `FOSSBilling API error: ${resp.status}`);
  }

  return data;
}

async function findOrCreateClient(user: { id: string; email?: string; user_metadata?: Record<string, string> }, params: Record<string, string>) {
  const clientSearch = await fossbillingRequest("admin/client/get_list", "POST", {
    search: user.email,
    per_page: 1,
  });

  if (clientSearch?.result?.list?.length > 0) {
    return clientSearch.result.list[0].id as number;
  }

  const newClient = await fossbillingRequest("admin/client/create", "POST", {
    email: user.email,
    first_name: params.first_name || user.user_metadata?.full_name?.split(" ")[0] || "User",
    last_name: params.last_name || user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || "",
    password: crypto.randomUUID(),
  });
  return newClient.result as number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("User not authenticated");
    const user = userData.user;
    logStep("Authenticated user", { userId: user.id, email: user.email });

    const { action, ...params } = await req.json();
    logStep("Action requested", { action });

    let result: unknown;

    switch (action) {
      // ── Client Management ──
      case "get_client": {
        result = await fossbillingRequest("admin/client/get", "POST", { id: params.client_id });
        break;
      }
      case "create_client": {
        result = await fossbillingRequest("admin/client/create", "POST", {
          email: user.email,
          first_name: params.first_name || user.user_metadata?.full_name?.split(" ")[0] || "User",
          last_name: params.last_name || user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || "",
          password: params.password || crypto.randomUUID(),
          ...params.extra,
        });
        break;
      }
      case "find_client": {
        result = await fossbillingRequest("admin/client/get_list", "POST", {
          search: user.email,
          per_page: 1,
        });
        break;
      }

      // ── Order Management ──
      case "list_orders": {
        result = await fossbillingRequest("admin/order/get_list", "POST", {
          search: user.email,
          per_page: params.per_page || 50,
          page: params.page || 1,
        });
        break;
      }
      case "create_order": {
        const clientId = await findOrCreateClient(user, params);
        logStep("Using client", { clientId });

        result = await fossbillingRequest("admin/order/create", "POST", {
          client_id: clientId,
          product_id: params.product_id,
          period: params.period || "1M",
          quantity: params.quantity || 1,
          price: params.price,
          config: params.config,
          activate: params.activate ?? true,
        });
        break;
      }
      case "get_order": {
        result = await fossbillingRequest("admin/order/get", "POST", { id: params.order_id });
        break;
      }

      // ── Product Catalog ──
      case "list_products": {
        result = await fossbillingRequest("guest/product/get_list", "POST", {
          per_page: params.per_page || 50,
        });
        break;
      }
      case "get_product": {
        result = await fossbillingRequest("guest/product/get", "POST", { id: params.product_id });
        break;
      }

      // ── Provisioning ──
      case "activate_order": {
        result = await fossbillingRequest("admin/order/activate", "POST", { id: params.order_id });
        break;
      }
      case "suspend_order": {
        result = await fossbillingRequest("admin/order/suspend", "POST", {
          id: params.order_id,
          reason: params.reason || "Payment failed",
        });
        break;
      }
      case "unsuspend_order": {
        result = await fossbillingRequest("admin/order/unsuspend", "POST", { id: params.order_id });
        break;
      }
      case "cancel_order": {
        result = await fossbillingRequest("admin/order/cancel", "POST", { id: params.order_id });
        break;
      }

      // ── Domain Management ──
      case "check_domain": {
        // Get TLD list with pricing from FOSSBilling
        const tlds = await fossbillingRequest("guest/servicedomain/tlds", "POST", {});

        // If a specific domain was provided, check availability via DNS
        let availability = null;
        if (params.domain) {
          const fullDomain = params.tld ? `${params.domain}.${params.tld}` : params.domain;
          try {
            const dnsResp = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(fullDomain)}&type=A`);
            const dnsData = await dnsResp.json();
            const isTaken = dnsData.Status === 0 && Array.isArray(dnsData.Answer) && dnsData.Answer.length > 0;
            availability = { domain: fullDomain, available: !isTaken };
          } catch (e) {
            logStep("DNS check failed, assuming available", { error: String(e) });
            availability = { domain: fullDomain, available: true };
          }
        }

        result = { tlds: tlds?.result, availability };
        break;
      }

      case "register_domain": {
        if (!params.domain || !params.product_id) {
          throw new Error("domain and product_id are required for register_domain");
        }

        const domainClientId = await findOrCreateClient(user, params);
        logStep("Using client for domain registration", { clientId: domainClientId });

        const fullDomain = params.tld ? `${params.domain}.${params.tld}` : params.domain;

        result = await fossbillingRequest("admin/order/create", "POST", {
          client_id: domainClientId,
          product_id: params.product_id,
          period: params.period || "1Y",
          quantity: 1,
          config: {
            domain: fullDomain,
            action: "register",
            register_years: params.register_years || 1,
            ...(params.config || {}),
          },
          activate: params.activate ?? true,
        });
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    logStep("Success", { action });

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message });
    return new Response(JSON.stringify({ success: false, error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
