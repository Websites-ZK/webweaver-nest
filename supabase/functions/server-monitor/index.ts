import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SERVERUS_BASE = "https://api.serverus.cloud";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const userId = claimsData.claims.sub as string;

    // Check admin role
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    const { action, params } = await req.json();
    const apiToken = Deno.env.get("SERVERUS_API_TOKEN");
    if (!apiToken) {
      return new Response(JSON.stringify({ error: "SERVERUS_API_TOKEN not configured" }), { status: 500, headers: corsHeaders });
    }

    const apiHeaders = {
      "Authorization": `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    };

    let endpoint = "";
    switch (action) {
      case "system_health":
        endpoint = "/api/system/health";
        break;
      case "services_status":
        endpoint = "/api/services/status";
        break;
      case "nginx_logs":
        const domain = params?.domain || "";
        const lines = params?.lines || 50;
        endpoint = `/api/logs/nginx?domain=${encodeURIComponent(domain)}&lines=${lines}`;
        break;
      case "fossbilling_stats":
        endpoint = "/api/fossbilling/stats";
        break;
      case "backup_status":
        endpoint = "/api/backup/status";
        break;
      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: corsHeaders });
    }

    const upstream = await fetch(`${SERVERUS_BASE}${endpoint}`, { headers: apiHeaders });
    const data = await upstream.json();

    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("server-monitor error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
