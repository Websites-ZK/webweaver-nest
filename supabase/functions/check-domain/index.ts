import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain } = await req.json();

    if (!domain || typeof domain !== 'string') {
      return new Response(JSON.stringify({ error: 'Domain is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(domain)) {
      return new Response(JSON.stringify({ error: 'Invalid domain format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check DNS availability
    const dnsResponse = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`);
    const dnsData = await dnsResponse.json();
    const isTaken = dnsData.Status === 0 && Array.isArray(dnsData.Answer) && dnsData.Answer.length > 0;

    // Fetch TLD pricing from FOSSBilling
    let tldPricing = null;
    const baseUrl = Deno.env.get("FOSSBILLING_API_URL");
    const apiKey = Deno.env.get("FOSSBILLING_API_KEY");

    if (baseUrl && apiKey) {
      try {
        const tldResp = await fetch(`${baseUrl.replace(/\/$/, "")}/guest/servicedomain/tlds`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({}),
        });

        if (tldResp.ok) {
          const tldData = await tldResp.json();
          const tld = "." + domain.split(".").slice(1).join(".");
          const tlds = tldData?.result || [];
          const match = Array.isArray(tlds)
            ? tlds.find((t: Record<string, string>) => t.tld === tld || t.tld === tld.replace(/^\./, ""))
            : null;
          tldPricing = match || null;
        }
      } catch (e) {
        console.log("[CHECK-DOMAIN] FOSSBilling TLD lookup failed:", e);
      }
    }

    return new Response(JSON.stringify({ available: !isTaken, domain, pricing: tldPricing }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
