import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
      const alertMessage = `${url} is down. Status: ${statusCode}, Response time: ${responseTimeMs}ms`;

      await supabase.from("admin_alerts").insert({
        alert_type: "downtime",
        severity: "critical",
        message: alertMessage,
      });

      // Notify all users who own domains matching this URL
      const { data: affectedDomains } = await supabase
        .from("domains")
        .select("user_id, domain_name")
        .eq("status", "active");

      if (affectedDomains && affectedDomains.length > 0) {
        // Match domains: check if the target URL contains the domain name
        const matchedDomains = affectedDomains.filter((d) =>
          url.includes(d.domain_name)
        );

        // If no specific domain match, notify all active domain owners (system-wide outage)
        const domainsToNotify = matchedDomains.length > 0 ? matchedDomains : affectedDomains;

        const notifications = domainsToNotify.map((d) => ({
          user_id: d.user_id,
          domain_name: d.domain_name,
          notification_type: "downtime",
          message: `Your domain ${d.domain_name} may be affected. Server returned status ${statusCode}. Response time: ${responseTimeMs}ms.`,
        }));

        // Deduplicate by user_id to avoid spamming
        const seen = new Set<string>();
        const uniqueNotifications = notifications.filter((n) => {
          if (seen.has(n.user_id)) return false;
          seen.add(n.user_id);
          return true;
        });

        if (uniqueNotifications.length > 0) {
          await supabase.from("user_notifications").insert(uniqueNotifications);
        }
      }

      // Send WhatsApp notification for critical alerts
      try {
        const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";
        await fetch(`${supabaseUrl}/functions/v1/send-whatsapp-alert`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${anonKey}`,
          },
          body: JSON.stringify({
            message: alertMessage,
            severity: "critical",
          }),
        });
      } catch (whatsappErr) {
        console.error("Failed to send WhatsApp alert:", whatsappErr);
      }
    }

    results.push({ url, statusCode, responseTimeMs, isUp, insertError });
  }

  // Trigger resource usage check
  let resourceCheckResult = null;
  try {
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";
    const resp = await fetch(`${supabaseUrl}/functions/v1/check-resource-alerts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${anonKey}`,
      },
    });
    resourceCheckResult = await resp.json();
  } catch (e) {
    console.error("Resource check failed:", e);
    resourceCheckResult = { error: String(e) };
  }

  return new Response(JSON.stringify({ results, resourceCheckResult, checked_at: new Date().toISOString() }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
