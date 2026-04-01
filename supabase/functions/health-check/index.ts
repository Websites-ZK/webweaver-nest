import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.49.1/cors";

const TARGETS = [
  "https://webweaver-nest.lovable.app",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const results = [];

  for (const url of TARGETS) {
    const start = Date.now();
    let statusCode = 0;
    let isUp = false;

    try {
      const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
      statusCode = resp.status;
      isUp = resp.ok;
    } catch {
      statusCode = 0;
      isUp = false;
    }

    const responseTimeMs = Date.now() - start;

    const { error: insertError } = await supabase.from("server_health_checks").insert({
      target_url: url,
      status_code: statusCode,
      response_time_ms: responseTimeMs,
      is_up: isUp,
    });

    if (!isUp) {
      await supabase.from("admin_alerts").insert({
        alert_type: "downtime",
        severity: "critical",
        message: `${url} is down. Status: ${statusCode}, Response time: ${responseTimeMs}ms`,
      });
    }

    results.push({ url, statusCode, responseTimeMs, isUp, insertError });
  }

  return new Response(JSON.stringify({ results, checked_at: new Date().toISOString() }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
