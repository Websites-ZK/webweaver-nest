import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Check, X, Globe, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";

type Status = "idle" | "checking" | "available" | "taken" | "invalid";

interface DomainSearchProps {
  /** Called when domain is confirmed available (after Check). Used in onboarding flow. */
  onClaim?: (domain: string) => void;
  /** Show as a marketing "register" card (default) vs a claim card (free domain). */
  variant?: "register" | "claim";
  /** Initial value */
  initialDomain?: string;
}

const DOMAIN_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;

export const DomainSearch = ({ onClaim, variant = "register", initialDomain = "" }: DomainSearchProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [domain, setDomain] = useState(initialDomain);
  const [status, setStatus] = useState<Status>("idle");
  const [pricing, setPricing] = useState<{ price?: number; tld?: string } | null>(null);
  const [registering, setRegistering] = useState(false);

  const check = async () => {
    if (!domain || !DOMAIN_REGEX.test(domain)) {
      setStatus("invalid");
      return;
    }
    setStatus("checking");
    setPricing(null);
    try {
      const { data, error } = await supabase.functions.invoke("check-domain", { body: { domain } });
      if (error) throw error;
      setStatus(data.available ? "available" : "taken");
      if (data.pricing) {
        setPricing({
          price: Number(data.pricing.price_registration ?? data.pricing.price ?? 0) || undefined,
          tld: data.pricing.tld,
        });
      }
    } catch {
      setStatus("invalid");
    }
  };

  const handleAction = async () => {
    if (variant === "claim") {
      onClaim?.(domain);
      return;
    }
    // Register variant
    if (!user) {
      navigate(`/register?next=${encodeURIComponent(`/onboarding?domain=${domain}`)}`);
      return;
    }
    setRegistering(true);
    try {
      const { error } = await supabase.functions.invoke("fossbilling-proxy", {
        body: { action: "register_domain", domain, period: "1Y", register_years: 1 },
      });
      if (error) throw error;
      await supabase.from("domains").insert({
        user_id: user.id,
        domain_name: domain,
        status: "active",
      });
      toast({ title: t("domain.registered.title") || "Domain registered", description: domain });
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast({
        title: t("domain.registered.error") || "Registration failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="mb-4 flex items-center gap-2">
        {variant === "claim" ? (
          <Gift className="h-5 w-5 text-primary" />
        ) : (
          <Globe className="h-5 w-5 text-primary" />
        )}
        <h3 className="text-lg font-semibold text-foreground">
          {variant === "claim"
            ? t("domain.claim.title") || "Claim your free domain"
            : t("domain.search.title") || "Register your domain"}
        </h3>
      </div>
      <p className="mb-5 text-sm text-muted-foreground">
        {variant === "claim"
          ? t("domain.claim.subtitle") || "Included free for 1 year with your 3-year plan."
          : t("domain.search.subtitle") || "Search and register a domain in seconds."}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={domain}
          onChange={(e) => {
            setDomain(e.target.value.trim().toLowerCase());
            setStatus("idle");
            setPricing(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && check()}
          placeholder="example.com"
          className="flex-1"
          maxLength={253}
        />
        <Button onClick={check} disabled={status === "checking" || !domain} className="gap-2 sm:w-auto">
          {status === "checking" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {t("domain.search.btn") || "Check"}
        </Button>
      </div>

      {/* Status messages */}
      <div className="mt-4 min-h-[1.5rem]">
        {status === "available" && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="h-4 w-4" />
              <span className="font-mono">{domain}</span> {t("domain.available") || "is available!"}
              {variant === "register" && pricing?.price ? (
                <span className="ml-2 text-muted-foreground">€{pricing.price.toFixed(2)}/yr</span>
              ) : null}
            </p>
            <Button size="sm" onClick={handleAction} disabled={registering} className="gap-2">
              {registering ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {variant === "claim"
                ? t("domain.claim.btn") || "Claim & Continue"
                : t("domain.register.btn") || "Register"}
            </Button>
          </div>
        )}
        {status === "taken" && (
          <p className="flex items-center gap-2 text-sm font-medium text-destructive">
            <X className="h-4 w-4" />
            {t("domain.taken") || "This domain is already taken."}
          </p>
        )}
        {status === "invalid" && (
          <p className="flex items-center gap-2 text-sm font-medium text-destructive">
            <X className="h-4 w-4" />
            {t("domain.invalid") || "Please enter a valid domain (e.g. example.com)"}
          </p>
        )}
      </div>
    </div>
  );
};

export default DomainSearch;
