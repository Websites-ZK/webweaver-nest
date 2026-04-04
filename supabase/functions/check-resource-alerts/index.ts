import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // Get enabled thresholds
  const { data: thresholds, error: thErr } = await supabase
    .from("alert_thresholds")
    .select("*")
    .eq("is_enabled", true);

  if (thErr || !thresholds || thresholds.length === 0) {
    return new Response(JSON.stringify({ message: "No active thresholds", error: thErr }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get all active hosting plans
  const { data: plans, error: plErr } = await supabase
    .from("hosting_plans")
    .select("*")
    .eq("status", "active");

  if (plErr || !plans || plans.length === 0) {
    return new Response(JSON.stringify({ message: "No active plans", error: plErr }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const alertsCreated: string[] = [];

  for (const plan of plans) {
    for (const threshold of thresholds) {
      let usagePercent = 0;
      const metric = threshold.metric;

      if (metric === "ram") {
        usagePercent = plan.ram_mb > 0 ? (plan.ram_used_mb / plan.ram_mb) * 100 : 0;
      } else if (metric === "disk") {
        usagePercent = plan.storage_limit_gb > 0 ? (plan.storage_used_gb / plan.storage_limit_gb) * 100 : 0;
      } else if (metric === "bandwidth") {
        usagePercent = plan.bandwidth_limit_gb > 0 ? (plan.bandwidth_used_gb / plan.bandwidth_limit_gb) * 100 : 0;
      } else if (metric === "cpu") {
        // Simulate CPU usage based on RAM usage ratio (no cpu_used column)
        usagePercent = plan.ram_mb > 0 ? (plan.ram_used_mb / plan.ram_mb) * 100 : 0;
      }

      if (usagePercent < threshold.threshold_percent) continue;

      // Deduplication: check for recent unresolved alert for same plan+metric
      const alertKey = `${metric}_${plan.id}`;
      const { data: existing } = await supabase
        .from("admin_alerts")
        .select("id")
        .eq("alert_type", "high_load")
        .eq("is_resolved", false)
        .ilike("message", `%${plan.id}%`)
        .ilike("message", `%${metric}%`)
        .gte("created_at", oneHourAgo)
        .limit(1);

      if (existing && existing.length > 0) continue;

      const alertMessage = `High ${metric.toUpperCase()} usage on plan "${plan.plan_name}" (${plan.domain || "no domain"}): ${usagePercent.toFixed(1)}% (threshold: ${threshold.threshold_percent}%). Plan ID: ${plan.id}, Metric: ${metric}`;

      // Insert admin alert
      await supabase.from("admin_alerts").insert({
        alert_type: "high_load",
        severity: threshold.severity,
        message: alertMessage,
      });

      // Notify the plan owner
      await supabase.from("user_notifications").insert({
        user_id: plan.user_id,
        domain_name: plan.domain || plan.plan_name,
        notification_type: "high_load",
        message: `${metric.toUpperCase()} usage at ${usagePercent.toFixed(1)}% on your ${plan.plan_name} plan. Consider upgrading or optimizing.`,
      });

      alertsCreated.push(alertKey);

      // Send WhatsApp for critical alerts
      if (threshold.severity === "critical") {
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
        } catch (e) {
          console.error("WhatsApp alert failed:", e);
        }
      }
    }
  }

  return new Response(JSON.stringify({ 
    alerts_created: alertsCreated.length, 
    details: alertsCreated,
    checked_at: new Date().toISOString() 
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
