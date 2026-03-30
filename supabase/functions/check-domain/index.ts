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

    // Basic domain format validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(domain)) {
      return new Response(JSON.stringify({ error: 'Invalid domain format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check DNS records via Google's public DNS API
    const dnsResponse = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`);
    const dnsData = await dnsResponse.json();

    // If Status is 0 (NOERROR) and there are Answer records, domain is taken
    const isTaken = dnsData.Status === 0 && Array.isArray(dnsData.Answer) && dnsData.Answer.length > 0;

    return new Response(JSON.stringify({ available: !isTaken, domain }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
