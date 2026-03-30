import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ArrowRight, ArrowLeft, Server, Globe, Shield, Mail, HardDrive, Clock } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

type BillingPeriod = "monthly" | "12mo" | "24mo" | "36mo";

const plans = [
  { id: "basic", base: 1.49, websites: "1", storage: "10 GB", visits: "~30k", cpu: "1 vCPU" },
  { id: "standard", base: 2.49, websites: "5", storage: "30 GB", visits: "~100k", cpu: "2 vCPUs", popular: true },
  { id: "business", base: 4.99, websites: "20", storage: "60 GB", visits: "~200k", cpu: "4 vCPUs" },
  { id: "agency", base: 8.99, websites: "Unlimited", storage: "120 GB", visits: "~400k", cpu: "8 vCPUs" },
];

const extras = [
  { id: "backup", price: 0.99, icon: HardDrive },
  { id: "email", price: 1.49, icon: Mail },
  { id: "priority", price: 2.99, icon: Clock },
  { id: "ddos", price: 1.99, icon: Shield },
];

const Onboarding = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const preselectedPlan = searchParams.get("plan") || "";
  const preselectedPeriod = (searchParams.get("period") as BillingPeriod) || "monthly";

  const [step, setStep] = useState(preselectedPlan ? 1 : 0);
  const [selectedPlan, setSelectedPlan] = useState(preselectedPlan || "standard");
  const [period, setPeriod] = useState<BillingPeriod>(preselectedPeriod);
  const [domain, setDomain] = useState("");
  const [domainType, setDomainType] = useState<"existing" | "new">("existing");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const multiplier = period === "12mo" ? 1 : period === "24mo" ? 0.85 : period === "36mo" ? 0.75 : 1.15;

  const currentPlan = plans.find((p) => p.id === selectedPlan) || plans[1];
  const planPrice = (currentPlan.base * multiplier).toFixed(2);

  const extrasTotal = selectedExtras.reduce((sum, id) => {
    const extra = extras.find((e) => e.id === id);
    return sum + (extra?.price || 0);
  }, 0);

  const totalPrice = (parseFloat(planPrice) + extrasTotal).toFixed(2);

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));
  };

  const stepTitles = [
    t("onboarding.step1") || "Choose your plan",
    t("onboarding.step2") || "Set up your domain",
    t("onboarding.step3") || "Add extras",
    t("onboarding.step4") || "Review & confirm",
  ];

  if (!user) {
    navigate("/register");
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Progress bar */}
        <ScrollReveal>
          <div className="mb-12">
            <div className="flex items-center justify-between">
              {stepTitles.map((title, i) => (
                <div key={i} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                        i <= step
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i < step ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className="hidden text-xs font-medium text-muted-foreground sm:block">
                      {title}
                    </span>
                  </div>
                  {i < 3 && (
                    <div className={`mx-2 h-0.5 flex-1 rounded ${i < step ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Step 0: Plan selection */}
        {step === 0 && (
          <ScrollReveal>
            <h2 className="mb-2 text-2xl font-bold text-foreground">{stepTitles[0]}</h2>
            <p className="mb-8 text-muted-foreground">{t("onboarding.step1.desc") || "Select the plan that fits your needs."}</p>

            {/* Billing toggle */}
            <div className="mb-8 flex items-center justify-center gap-1 rounded-full bg-muted p-1">
              {(["monthly", "12mo", "24mo", "36mo"] as BillingPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    period === p ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p === "monthly" ? t("pricing.monthly") : p === "12mo" ? t("pricing.12months") : t("pricing.24months")}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan) => {
                const price = (plan.base * multiplier).toFixed(2);
                const isSelected = selectedPlan === plan.id;
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative rounded-xl border p-5 text-left transition-all duration-300 ease-out ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary scale-[1.03] shadow-lg shadow-primary/10"
                        : "border-border bg-card hover:border-primary/50 hover:scale-[1.01] hover:shadow-md"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2.5 right-3 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                        {t("pricing.mostPopular")}
                      </span>
                    )}
                    <div className="mb-3 flex items-center gap-2">
                      <Server className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">{t(`pricing.${plan.id}`)}</span>
                    </div>
                    <div className="mb-3">
                      <span className="text-2xl font-bold text-foreground">€{price}</span>
                      <span className="text-sm text-muted-foreground">{t("pricing.mo")}</span>
                    </div>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      <li>{plan.websites} {t("pricing.feature.websites")}</li>
                      <li>{plan.storage} SSD</li>
                      <li>{plan.visits} {t("pricing.feature.visits")}</li>
                      <li>{plan.cpu}</li>
                    </ul>
                    <div className={`mt-3 flex items-center gap-1 text-sm font-medium text-primary transition-all duration-300 ${isSelected ? "opacity-100 max-h-8 translate-y-0" : "opacity-0 max-h-0 -translate-y-1 overflow-hidden"}`}>
                      <Check className="h-4 w-4" /> {t("onboarding.selected") || "Selected"}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <Button size="lg" onClick={() => setStep(1)} className="gap-2">
                {t("onboarding.next") || "Continue"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </ScrollReveal>
        )}

        {/* Step 1: Domain */}
        {step === 1 && (
          <ScrollReveal>
            <h2 className="mb-2 text-2xl font-bold text-foreground">{stepTitles[1]}</h2>
            <p className="mb-8 text-muted-foreground">{t("onboarding.step2.desc") || "Connect your existing domain or register a new one."}</p>

            <div className="mb-6 flex gap-3">
              <button
                onClick={() => setDomainType("existing")}
                className={`flex-1 rounded-xl border p-5 text-left transition-all duration-300 ease-out ${
                  domainType === "existing" ? "border-primary bg-primary/5 ring-2 ring-primary scale-[1.02] shadow-lg shadow-primary/10" : "border-border bg-card hover:border-primary/50 hover:scale-[1.01] hover:shadow-md"
                }`}
              >
                <Globe className="mb-2 h-5 w-5 text-primary" />
                <div className="font-semibold text-foreground">{t("onboarding.existingDomain") || "I have a domain"}</div>
                <p className="mt-1 text-sm text-muted-foreground">{t("onboarding.existingDomain.desc") || "Connect a domain you already own."}</p>
              </button>
              <button
                onClick={() => setDomainType("new")}
                className={`flex-1 rounded-xl border p-5 text-left transition-all duration-300 ease-out ${
                  domainType === "new" ? "border-primary bg-primary/5 ring-2 ring-primary scale-[1.02] shadow-lg shadow-primary/10" : "border-border bg-card hover:border-primary/50 hover:scale-[1.01] hover:shadow-md"
                }`}
              >
                <Globe className="mb-2 h-5 w-5 text-primary" />
                <div className="font-semibold text-foreground">{t("onboarding.newDomain") || "Register a new domain"}</div>
                <p className="mt-1 text-sm text-muted-foreground">{t("onboarding.newDomain.desc") || "Search and register a new domain name."}</p>
              </button>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <label className="mb-2 block text-sm font-medium text-foreground">
                {domainType === "existing"
                  ? t("onboarding.enterDomain") || "Enter your domain name"
                  : t("onboarding.searchDomain") || "Search for a domain"}
              </label>
              <div className="flex gap-3">
                <Input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="example.com"
                  className="flex-1"
                  maxLength={253}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {t("onboarding.domainHint") || "You can always change this later in your dashboard."}
              </p>
            </div>

            <div className="mt-8 flex justify-between">
              <Button variant="outline" size="lg" onClick={() => setStep(0)} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> {t("onboarding.back") || "Back"}
              </Button>
              <Button size="lg" onClick={() => setStep(2)} className="gap-2">
                {t("onboarding.next") || "Continue"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </ScrollReveal>
        )}

        {/* Step 2: Extras */}
        {step === 2 && (
          <ScrollReveal>
            <h2 className="mb-2 text-2xl font-bold text-foreground">{stepTitles[2]}</h2>
            <p className="mb-8 text-muted-foreground">{t("onboarding.step3.desc") || "Enhance your hosting with optional add-ons."}</p>

            <div className="grid gap-4 sm:grid-cols-2">
              {extras.map((extra) => {
                const isSelected = selectedExtras.includes(extra.id);
                const Icon = extra.icon;
                return (
                  <button
                    key={extra.id}
                    onClick={() => toggleExtra(extra.id)}
                    className={`flex items-start gap-4 rounded-xl border p-5 text-left transition-all duration-300 ease-out ${
                      isSelected ? "border-primary bg-primary/5 ring-2 ring-primary scale-[1.02] shadow-lg shadow-primary/10" : "border-border bg-card hover:border-primary/50 hover:scale-[1.01] hover:shadow-md"
                    }`}
                  >
                    <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isSelected ? "bg-primary/10" : "bg-muted"}`}>
                      <Icon className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{t(`onboarding.extra.${extra.id}`) || extra.id}</span>
                        <span className="text-sm font-medium text-primary">+€{extra.price.toFixed(2)}{t("pricing.mo")}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{t(`onboarding.extra.${extra.id}.desc`) || ""}</p>
                    </div>
                    {isSelected && <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-between">
              <Button variant="outline" size="lg" onClick={() => setStep(1)} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> {t("onboarding.back") || "Back"}
              </Button>
              <Button size="lg" onClick={() => setStep(3)} className="gap-2">
                {t("onboarding.next") || "Continue"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </ScrollReveal>
        )}

        {/* Step 3: Summary */}
        {step === 3 && (
          <ScrollReveal>
            <h2 className="mb-2 text-2xl font-bold text-foreground">{stepTitles[3]}</h2>
            <p className="mb-8 text-muted-foreground">{t("onboarding.step4.desc") || "Review your selections before confirming."}</p>

            <div className="rounded-xl border border-border bg-card p-6">
              {/* Plan summary */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <div className="text-sm text-muted-foreground">{t("onboarding.plan") || "Plan"}</div>
                  <div className="text-lg font-semibold text-foreground">{t(`pricing.${currentPlan.id}`)}</div>
                  <div className="text-sm text-muted-foreground">
                    {currentPlan.storage} · {currentPlan.websites} {t("pricing.feature.websites")} · {currentPlan.cpu}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-foreground">€{planPrice}{t("pricing.mo")}</div>
                  <div className="text-xs text-muted-foreground">
                    {period === "monthly" ? t("pricing.monthly") : period === "12mo" ? t("pricing.12months") : t("pricing.24months")}
                  </div>
                </div>
              </div>

              {/* Domain */}
              {domain && (
                <div className="flex items-center justify-between border-b border-border py-4">
                  <div>
                    <div className="text-sm text-muted-foreground">{t("onboarding.domain") || "Domain"}</div>
                    <div className="font-medium text-foreground">{domain}</div>
                  </div>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </div>
              )}

              {/* Extras */}
              {selectedExtras.length > 0 && (
                <div className="border-b border-border py-4">
                  <div className="mb-2 text-sm text-muted-foreground">{t("onboarding.extras") || "Add-ons"}</div>
                  {selectedExtras.map((id) => {
                    const extra = extras.find((e) => e.id === id)!;
                    return (
                      <div key={id} className="flex items-center justify-between py-1">
                        <span className="text-sm font-medium text-foreground">{t(`onboarding.extra.${id}`) || id}</span>
                        <span className="text-sm text-muted-foreground">+€{extra.price.toFixed(2)}{t("pricing.mo")}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Total */}
              <div className="flex items-center justify-between pt-4">
                <span className="text-lg font-bold text-foreground">{t("onboarding.total") || "Total"}</span>
                <span className="text-2xl font-bold text-primary">€{totalPrice}{t("pricing.mo")}</span>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <Button variant="outline" size="lg" onClick={() => setStep(2)} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> {t("onboarding.back") || "Back"}
              </Button>
              <Button size="lg" className="gap-2 bg-primary px-8 shadow-lg shadow-primary/25">
                {t("onboarding.confirm") || "Confirm & activate"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
