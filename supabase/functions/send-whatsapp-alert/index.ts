import { corsHeaders } from "@supabase/supabase-js/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

const RECIPIENTS = [
  "+385991944689",
  "+385919003284",
  "+385913592825",
];

// Default Twilio WhatsApp Sandbox number — update if using a registered sender
const TWILIO_FROM = "whatsapp:+14155238886";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
  if (!TWILIO_API_KEY) {
    return new Response(JSON.stringify({ error: "TWILIO_API_KEY is not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { message: string; severity?: string };
  try {
    body = await req.json();
    if (!body.message || typeof body.message !== "string") {
      throw new Error("Missing message");
    }
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body. Required: { message: string, severity?: string }" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const severity = (body.severity ?? "critical").toUpperCase();
  const text = `🚨 *WebWeaver Alert [${severity}]*\n\n${body.message}\n\n🕐 ${new Date().toISOString()}`;

  const results = [];

  for (const number of RECIPIENTS) {
    try {
      const response = await fetch(`${GATEWAY_URL}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": TWILIO_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: `whatsapp:${number}`,
          From: TWILIO_FROM,
          Body: text,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error(`Failed to send to ${number}:`, JSON.stringify(data));
        results.push({ number, success: false, error: data });
      } else {
        results.push({ number, success: true, sid: data.sid });
      }
    } catch (err) {
      console.error(`Error sending to ${number}:`, err);
      results.push({ number, success: false, error: String(err) });
    }
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
