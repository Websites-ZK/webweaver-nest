import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import { Check, X } from "lucide-react";

type BillingPeriod = "monthly" | "12mo" | "24mo";

const Pricing = () => {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  const plans = [
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
        { label: t("pricing.feature.backup"), value: true },
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
        { label: t("pricing.feature.backup"), value: true },
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
        { label: t("pricing.feature.backup"), value: true },
        { label: t("pricing.feature.support"), value: t("pricing.support.dedicated") },
      ],
    },
  ];

  const getPrice = (base: number) => {
    const multiplier = period === "12mo" ? 0.85 : period === "24mo" ? 0.75 : 1;
    return (base * multiplier).toFixed(2);
  };

  const discountLabel = period === "12mo" ? t("pricing.save15") : period === "24mo" ? t("pricing.save25") : null;

  const periods: { key: BillingPeriod; label: string }[] = [
    { key: "monthly", label: t("pricing.monthly") },
    { key: "12mo", label: t("pricing.12months") },
    { key: "24mo", label: t("pricing.24months") },
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

        <ScrollReveal delay={100}>
          <div className="mt-10 flex items-center justify-center gap-1 rounded-full border border-border bg-muted/50 p-1 w-fit mx-auto">
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
            <ScrollReveal key={i} delay={i * 80}>
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
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
