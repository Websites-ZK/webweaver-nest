import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SERVERUS_BASE = "https://api.serverus.cloud";
const API_TOKEN = "0b781202f9d7cfc872cfc800401d3f38aa6852bd95cb14f92bd974ea5660638d";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    const { action, params } = await req.json();

    const apiHeaders = {
      "Authorization": `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
    };

    let endpoint = "";
    switch (action) {
      case "system_health":
        endpoint = "/metrics/server";
        break;
      case "services_status":
        endpoint = "/metrics/services";
        break;
      case "nginx_logs": {
        const domain = params?.domain || "serverus.cloud";
        const lines = params?.lines || 50;
        endpoint = `/metrics/logs?domain=${encodeURIComponent(domain)}&lines=${lines}`;
        break;
      }
      case "fossbilling_stats":
        endpoint = "/fossbilling/stats";
        break;
      case "fossbilling_clients":
        endpoint = "/fossbilling/stats";
        break;
      case "backup_status":
        endpoint = "/metrics/backup";
        break;
      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: corsHeaders });
    }

    const upstream = await fetch(`${SERVERUS_BASE}${endpoint}`, { headers: apiHeaders });
    const rawData = await upstream.json();

    // Unwrap FOSSBilling responses that come wrapped in { result, error }
    const data = (action === "fossbilling_stats" || action === "fossbilling_clients") && rawData?.result !== undefined
      ? rawData.result
      : rawData;

    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("server-monitor error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
