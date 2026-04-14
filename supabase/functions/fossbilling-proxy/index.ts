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

  const url = `${baseUrl.replace(/\/$/, "")}/api/${endpoint}`;
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Authenticate user
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
        result = await fossbillingRequest("admin/client/get", "POST", {
          id: params.client_id,
        });
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
        // First find or create client in FOSSBilling
        const clientSearch = await fossbillingRequest("admin/client/get_list", "POST", {
          search: user.email,
          per_page: 1,
        });

        let clientId: number;
        if (clientSearch?.result?.list?.length > 0) {
          clientId = clientSearch.result.list[0].id;
        } else {
          const newClient = await fossbillingRequest("admin/client/create", "POST", {
            email: user.email,
            first_name: params.first_name || "User",
            last_name: params.last_name || "",
            password: crypto.randomUUID(),
          });
          clientId = newClient.result;
        }

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
        result = await fossbillingRequest("admin/order/get", "POST", {
          id: params.order_id,
        });
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
        result = await fossbillingRequest("guest/product/get", "POST", {
          id: params.product_id,
        });
        break;
      }

      // ── Provisioning ──
      case "activate_order": {
        result = await fossbillingRequest("admin/order/activate", "POST", {
          id: params.order_id,
        });
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
        result = await fossbillingRequest("admin/order/unsuspend", "POST", {
          id: params.order_id,
        });
        break;
      }
      case "cancel_order": {
        result = await fossbillingRequest("admin/order/cancel", "POST", {
          id: params.order_id,
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
