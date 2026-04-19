import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const ADMIN_FALLBACK_USER_ID = "791336be-d91a-449e-89be-8099712e6490";
const SERVERUS_API = "https://api.serverus.cloud";

interface AapanelSite {
  name: string;
  status?: string | number;
  ssl?: boolean | number | string;
  created?: string;
  expire?: string;
  path?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const serverusToken = Deno.env.get("SERVERUS_API_TOKEN")!;

    // Verify caller is admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = claimsData.claims.sub;
    const { data: isAdmin } = await userClient.rpc("has_role", {
      _user_id: callerId,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch aaPanel sites from VPS
    const sitesRes = await fetch(`${SERVERUS_API}/aapanel/sites`, {
      headers: { Authorization: `Bearer ${serverusToken}` },
    });
    if (!sitesRes.ok) {
      const text = await sitesRes.text();
      return new Response(
        JSON.stringify({ error: "VPS endpoint failed", status: sitesRes.status, detail: text }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const sites: AapanelSite[] = await sitesRes.json();
    if (!Array.isArray(sites)) {
      return new Response(JSON.stringify({ error: "Invalid VPS payload" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service-role client for upsert
    const admin = createClient(supabaseUrl, serviceKey);

    // Existing domains map
    const { data: existing } = await admin.from("domains").select("domain_name");
    const existingSet = new Set((existing ?? []).map((d) => d.domain_name.toLowerCase()));

    let added = 0;
    let updated = 0;

    for (const site of sites) {
      const name = (site.name || "").toLowerCase().trim();
      if (!name) continue;

      const sslEnabled =
        site.ssl === true || site.ssl === 1 || site.ssl === "1" || site.ssl === "on";
      const status =
        site.status === "1" || site.status === 1 || site.status === "active"
          ? "active"
          : "inactive";

      const payload: Record<string, unknown> = {
        domain_name: name,
        ssl_enabled: sslEnabled,
        status,
        dns_provider: "aaPanel",
        user_id: ADMIN_FALLBACK_USER_ID,
      };
      if (site.expire) {
        const d = new Date(site.expire);
        if (!isNaN(d.getTime())) payload.expires_at = d.toISOString();
      }

      if (existingSet.has(name)) {
        const { error } = await admin
          .from("domains")
          .update({
            ssl_enabled: payload.ssl_enabled,
            status: payload.status,
            dns_provider: payload.dns_provider,
            ...(payload.expires_at ? { expires_at: payload.expires_at } : {}),
          })
          .eq("domain_name", name);
        if (!error) updated++;
      } else {
        const { error } = await admin.from("domains").insert(payload);
        if (!error) added++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, added, updated, total: sites.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
