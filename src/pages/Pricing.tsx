import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import { Check, X, Zap } from "lucide-react";

type BillingPeriod = "monthly" | "12mo" | "24mo" | "36mo";
type Tier = "standard" | "highPerformance";

interface Feature {
  label: string;
  value: string | boolean;
}

const Pricing = () => {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [tier, setTier] = useState<Tier>("standard");

  const standardPlans = [
    {
      name: t("pricing.basic"),
      desc: t("pricing.basic.desc"),
      base: 1.49,
      popular: false,
      features: [
        { label: t("pricing.feature.websites"), value: "1" },
        { label: t("pricing.feature.storage"), value: "10 GB SSD" },
        { label: t("pricing.feature.ssl"), value: true },
        { label: t("pricing.feature.cpanel"), value: true },
        { label: t("pricing.feature.visits"), value: "~30k" },
        { label: t("pricing.feature.backup"), value: false },
        { label: t("pricing.feature.cdn"), value: false },
        { label: t("pricing.feature.staging"), value: false },
        { label: t("pricing.feature.support"), value: t("pricing.support.standard") },
      ],
    },
    {
      name: t("pricing.standard"),
      desc: t("pricing.standard.desc"),
      base: 2.49,
      popular: true,
      features: [
        { label: t("pricing.feature.websites"), value: "5" },
        { label: t("pricing.feature.storage"), value: "30 GB SSD" },
        { label: t("pricing.feature.ssl"), value: true },
        { label: t("pricing.feature.cpanel"), value: true },
        { label: t("pricing.feature.visits"), value: "~100k" },
        { label: t("pricing.feature.backup"), value: t("pricing.backup.weekly") },
        { label: t("pricing.feature.cdn"), value: false },
        { label: t("pricing.feature.staging"), value: false },
        { label: t("pricing.feature.support"), value: t("pricing.support.priority") },
      ],
    },
    {
      name: t("pricing.business"),
      desc: t("pricing.business.desc"),
      base: 4.99,
      popular: false,
      features: [
        { label: t("pricing.feature.websites"), value: "20" },
        { label: t("pricing.feature.storage"), value: "60 GB SSD" },
        { label: t("pricing.feature.ssl"), value: true },
        { label: t("pricing.feature.cpanel"), value: true },
        { label: t("pricing.feature.visits"), value: "~200k" },
        { label: t("pricing.feature.backup"), value: t("pricing.backup.daily") },
        { label: t("pricing.feature.cdn"), value: false },
        { label: t("pricing.feature.staging"), value: false },
        { label: t("pricing.feature.support"), value: t("pricing.support.phone") },
      ],
    },
    {
      name: t("pricing.agency"),
      desc: t("pricing.agency.desc"),
      base: 8.99,
      popular: false,
      features: [
        { label: t("pricing.feature.websites"), value: t("pricing.unlimited") },
        { label: t("pricing.feature.storage"), value: "120 GB SSD" },
        { label: t("pricing.feature.ssl"), value: true },
        { label: t("pricing.feature.cpanel"), value: true },
        { label: t("pricing.feature.visits"), value: "~400k" },
        { label: t("pricing.feature.backup"), value: t("pricing.backup.daily") },
        { label: t("pricing.feature.cdn"), value: false },
        { label: t("pricing.feature.staging"), value: false },
        { label: t("pricing.feature.support"), value: t("pricing.support.dedicated") },
      ],
    },
  ];

  const highPerformancePlans = [
    {
      name: t("pricing.basic"),
      desc: t("pricing.basic.desc"),
      base: 2.99,
      popular: false,
      features: [
        { label: t("pricing.feature.websites"), value: "5" },
        { label: t("pricing.feature.storageNvme"), value: "20 GB NVMe" },
        { label: t("pricing.feature.ssl"), value: true },
        { label: t("pricing.feature.cpanel"), value: true },
        { label: t("pricing.feature.visits"), value: "~50k" },
        { label: t("pricing.feature.backup"), value: t("pricing.backup.weekly") },
        { label: t("pricing.feature.cdn"), value: true },
        { label: t("pricing.feature.staging"), value: false },
        { label: t("pricing.feature.ddos"), value: false },
        { label: t("pricing.feature.malware"), value: false },
        { label: t("pricing.feature.ssh"), value: false },
        { label: t("pricing.feature.support"), value: t("pricing.support.priority") },
      ],
    },
    {
      name: t("pricing.standard"),
      desc: t("pricing.standard.desc"),
      base: 4.99,
      popular: true,
      features: [
        { label: t("pricing.feature.websites"), value: "25" },
        { label: t("pricing.feature.storageNvme"), value: "60 GB NVMe" },
        { label: t("pricing.feature.ssl"), value: true },
        { label: t("pricing.feature.cpanel"), value: true },
        { label: t("pricing.feature.visits"), value: "~200k" },
        { label: t("pricing.feature.backup"), value: t("pricing.backup.daily") },
        { label: t("pricing.feature.cdn"), value: true },
        { label: t("pricing.feature.staging"), value: true },
        { label: t("pricing.feature.ddos"), value: true },
        { label: t("pricing.feature.malware"), value: false },
        { label: t("pricing.feature.ssh"), value: false },
        { label: t("pricing.feature.support"), value: t("pricing.support.phone") },
      ],
    },
    {
      name: t("pricing.business"),
      desc: t("pricing.business.desc"),
      base: 8.99,
      popular: false,
      features: [
        { label: t("pricing.feature.websites"), value: "100" },
        { label: t("pricing.feature.storageNvme"), value: "120 GB NVMe" },
        { label: t("pricing.feature.ssl"), value: true },
        { label: t("pricing.feature.cpanel"), value: true },
        { label: t("pricing.feature.visits"), value: "~400k" },
        { label: t("pricing.feature.backup"), value: t("pricing.backup.dailyOnDemand") },
        { label: t("pricing.feature.cdn"), value: true },
        { label: t("pricing.feature.staging"), value: true },
        { label: t("pricing.feature.ddos"), value: true },
        { label: t("pricing.feature.malware"), value: true },
        { label: t("pricing.feature.ssh"), value: true },
        { label: t("pricing.feature.support"), value: t("pricing.support.dedicated") },
      ],
    },
    {
      name: t("pricing.agency"),
      desc: t("pricing.agency.desc"),
      base: 14.99,
      popular: false,
      features: [
        { label: t("pricing.feature.websites"), value: t("pricing.unlimited") },
        { label: t("pricing.feature.storageNvme"), value: "250 GB NVMe" },
        { label: t("pricing.feature.ssl"), value: true },
        { label: t("pricing.feature.cpanel"), value: true },
        { label: t("pricing.feature.visits"), value: "~800k" },
        { label: t("pricing.feature.backup"), value: t("pricing.backup.dailyOnDemand") },
        { label: t("pricing.feature.cdn"), value: true },
        { label: t("pricing.feature.staging"), value: true },
        { label: t("pricing.feature.ddos"), value: true },
        { label: t("pricing.feature.malware"), value: true },
        { label: t("pricing.feature.ssh"), value: true },
        { label: t("pricing.feature.support"), value: t("pricing.support.dedicatedSla") },
      ],
    },
  ];

  const plans = tier === "standard" ? standardPlans : highPerformancePlans;

  const getPrice = (base: number) => {
    const multiplier = period === "monthly" ? 1.15 : period === "24mo" ? 0.85 : period === "36mo" ? 0.75 : 1;
    return (base * multiplier).toFixed(2);
  };

  const discountLabel = period === "24mo" ? t("pricing.save26") : period === "36mo" ? t("pricing.save35") : null;

  const periods: { key: BillingPeriod; label: string }[] = [
    { key: "monthly", label: t("pricing.monthly") },
    { key: "12mo", label: t("pricing.12months") },
    { key: "24mo", label: t("pricing.24months") },
    { key: "36mo", label: t("pricing.36months") },
  ];

  const tiers: { key: Tier; label: string; icon?: React.ReactNode }[] = [
    { key: "standard", label: t("pricing.tier.standard") },
    { key: "highPerformance", label: t("pricing.tier.highPerformance"), icon: <Zap className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl" style={{ textWrap: "balance" }}>
              {t("pricing.title")}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">{t("pricing.subtitle")}</p>
          </div>
        </ScrollReveal>

        {/* Tier toggle */}
        <ScrollReveal delay={80}>
          <div className="mt-10 flex flex-col items-center gap-2">
            {tier === "highPerformance" && (
              <span className="flex items-center gap-1 text-xs font-semibold text-primary animate-fade-in">
                <Zap className="h-3 w-3" />
                {t("pricing.hp.recommended")}
              </span>
            )}
            <div className={`flex items-center gap-1 rounded-full border p-1 w-fit transition-all duration-300 ${
              tier === "highPerformance"
                ? "border-primary/30 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 shadow-md shadow-primary/10"
                : "border-border bg-muted/50"
            }`}>
              {tiers.map((ti) => (
                <button
                  key={ti.key}
                  onClick={() => setTier(ti.key)}
                  className={`relative flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                    tier === ti.key
                      ? ti.key === "highPerformance"
                        ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/30"
                        : "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {ti.icon}
                  {ti.label}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Billing period toggle */}
        <ScrollReveal delay={100}>
          <div className="mt-4 flex items-center justify-center gap-1 rounded-full border border-border bg-muted/50 p-1 w-fit mx-auto">
            {periods.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`relative rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                  period === p.key
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {discountLabel && (
            <div className="mt-3 text-center">
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                {discountLabel}
              </span>
            </div>
          )}
        </ScrollReveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => (
            <ScrollReveal key={`${tier}-${i}`} delay={i * 80}>
              {tier === "highPerformance" ? (
                <div className={`relative rounded-2xl p-[1px] transition-all duration-300 ${
                  plan.popular
                    ? "bg-gradient-to-br from-primary via-secondary to-primary animate-hp-glow"
                    : "bg-gradient-to-br from-primary/40 via-secondary/30 to-primary/40"
                }`}>
                  <div className={`relative flex flex-col rounded-2xl p-8 h-full ${
                    plan.popular
                      ? "bg-gradient-to-br from-[hsl(262,50%,15%)] to-[hsl(230,40%,12%)]"
                      : "bg-card"
                  }`}>
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-1 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/30">
                        {t("pricing.mostPopular")}
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                        <Zap className="h-2.5 w-2.5" />
                        High Performance
                      </span>
                    </div>
                    <h3 className={`text-xl font-bold ${plan.popular ? "text-primary-foreground" : "text-card-foreground"}`}>{plan.name}</h3>
                    <p className={`mt-1.5 text-sm ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{plan.desc}</p>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className={`text-4xl font-extrabold tabular-nums ${plan.popular ? "text-primary-foreground" : "text-card-foreground"}`}>
                        €{getPrice(plan.base)}
                      </span>
                      <span className={`text-sm ${plan.popular ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{t("pricing.mo")}</span>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-secondary">
                      <Zap className="h-3 w-3" />
                      {t("pricing.hp.performance")}
                    </p>

                    <ul className="mt-8 flex-1 space-y-3">
                      {plan.features.map((feature, fi) => (
                        <li key={fi} className="flex items-center gap-2.5 text-sm">
                          {typeof feature.value === "boolean" ? (
                            feature.value ? (
                              <Check className={`h-4 w-4 shrink-0 ${plan.popular ? "text-secondary" : "text-primary"}`} />
                            ) : (
                              <X className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                            )
                          ) : (
                            <Check className={`h-4 w-4 shrink-0 ${plan.popular ? "text-secondary" : "text-primary"}`} />
                          )}
                          <span className={
                            typeof feature.value === "boolean" && !feature.value
                              ? "text-muted-foreground/50"
                              : plan.popular ? "text-primary-foreground/90" : "text-card-foreground"
                          }>
                            {typeof feature.value === "string" ? `${feature.label}: ${feature.value}` : feature.label}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Link to="/register" className="mt-8">
                      <Button
                        className={`w-full active:scale-[0.97] transition-all ${
                          plan.popular
                            ? "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground shadow-lg animate-hp-btn-pulse"
                            : "bg-gradient-to-r from-primary/90 to-secondary/90 hover:from-primary hover:to-secondary text-primary-foreground shadow-md shadow-primary/15"
                        }`}
                        size="lg"
                      >
                        {t("pricing.getStarted")}
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div
                  className={`relative flex flex-col rounded-2xl border p-8 shadow-sm transition-shadow hover:shadow-md ${
                    plan.popular
                      ? "border-primary bg-card shadow-lg shadow-primary/10"
                      : "border-border bg-card"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                      {t("pricing.mostPopular")}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-card-foreground">{plan.name}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{plan.desc}</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tabular-nums text-card-foreground">
                      €{getPrice(plan.base)}
                    </span>
                    <span className="text-sm text-muted-foreground">{t("pricing.mo")}</span>
                  </div>

                  <ul className="mt-8 flex-1 space-y-3">
                    {plan.features.map((feature, fi) => (
                      <li key={fi} className="flex items-center gap-2.5 text-sm">
                        {typeof feature.value === "boolean" ? (
                          feature.value ? (
                            <Check className="h-4 w-4 shrink-0 text-primary" />
                          ) : (
                            <X className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                          )
                        ) : (
                          <Check className="h-4 w-4 shrink-0 text-primary" />
                        )}
                        <span className={typeof feature.value === "boolean" && !feature.value ? "text-muted-foreground/50" : "text-card-foreground"}>
                          {typeof feature.value === "string" ? `${feature.label}: ${feature.value}` : feature.label}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/register" className="mt-8">
                    <Button
                      className={`w-full active:scale-[0.97] transition-all ${
                        plan.popular ? "bg-primary hover:bg-primary/90 shadow-md shadow-primary/20" : ""
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                    >
                      {t("pricing.getStarted")}
                    </Button>
                  </Link>
                </div>
              )}
            </ScrollReveal>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <ScrollReveal delay={200}>
          <div className="mt-20">
            <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl mb-8">
              {tier === "standard" ? t("pricing.tier.standard") : t("pricing.tier.highPerformance")} — {t("pricing.planComparison")}
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-4 text-left font-semibold text-muted-foreground min-w-[160px]">
                      {t("pricing.featureLabel")}
                    </th>
                    {plans.map((p, i) => (
                      <th key={i} className={`px-3 py-4 text-center min-w-[120px] ${tier === "highPerformance" ? "bg-primary/5" : ""}`}>
                        {tier === "highPerformance" && (
                          <div className="flex items-center justify-center gap-1 text-xs font-medium text-primary mb-1">
                            <Zap className="h-3 w-3" />
                            {t("pricing.tier.highPerformance")}
                          </div>
                        )}
                        <div className="font-bold text-card-foreground">{p.name}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const featureLabels = tier === "standard"
                      ? [
                          t("pricing.feature.websites"),
                          t("pricing.feature.storage"),
                          t("pricing.feature.ssl"),
                          t("pricing.feature.cpanel"),
                          t("pricing.feature.visits"),
                          t("pricing.feature.backup"),
                          t("pricing.feature.cdn"),
                          t("pricing.feature.staging"),
                          t("pricing.feature.support"),
                        ]
                      : [
                          t("pricing.feature.websites"),
                          t("pricing.feature.storage"),
                          t("pricing.feature.ssl"),
                          t("pricing.feature.cpanel"),
                          t("pricing.feature.visits"),
                          t("pricing.feature.backup"),
                          t("pricing.feature.cdn"),
                          t("pricing.feature.staging"),
                          t("pricing.feature.ddos"),
                          t("pricing.feature.malware"),
                          t("pricing.feature.ssh"),
                          t("pricing.feature.support"),
                        ];

                    const getVal = (planIdx: number, label: string) => {
                      const storageNvmeLabel = t("pricing.feature.storageNvme");
                      const feat = plans[planIdx]?.features.find(
                        (f) => f.label === label || (label === t("pricing.feature.storage") && f.label === storageNvmeLabel)
                      );
                      return feat?.value;
                    };

                    return featureLabels.map((label, ri) => (
                      <tr key={ri} className={`border-b border-border/50 ${ri % 2 === 0 ? "" : "bg-muted/20"}`}>
                        <td className="px-4 py-3 font-medium text-card-foreground">{label}</td>
                        {plans.map((_, pi) => {
                          const val = getVal(pi, label);
                          return (
                            <td key={pi} className={`px-3 py-3 text-center ${tier === "highPerformance" ? "bg-primary/5" : ""}`}>
                              {val === undefined || val === false ? (
                                <X className="h-4 w-4 mx-auto text-muted-foreground/40" />
                              ) : val === true ? (
                                <Check className="h-4 w-4 mx-auto text-primary" />
                              ) : (
                                <span className="text-card-foreground">{val}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default Pricing;
