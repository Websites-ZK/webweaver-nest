import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import { Check, X } from "lucide-react";

const Pricing = () => {
  const { t } = useLanguage();
  const [yearly, setYearly] = useState(false);

  const plans = [
    {
      name: t("pricing.starter"),
      desc: t("pricing.starter.desc"),
      monthlyPrice: 4.99,
      popular: false,
      features: [
        { label: t("pricing.feature.storage"), value: t("pricing.starter.storage") },
        { label: t("pricing.feature.bandwidth"), value: t("pricing.starter.bandwidth") },
        { label: t("pricing.feature.domains"), value: t("pricing.starter.domains") },
        { label: t("pricing.feature.email"), value: t("pricing.starter.email") },
        { label: t("pricing.feature.ssl"), value: true },
        { label: t("pricing.feature.backups"), value: false },
        { label: t("pricing.feature.support"), value: false },
        { label: t("pricing.feature.vps"), value: false },
      ],
    },
    {
      name: t("pricing.business"),
      desc: t("pricing.business.desc"),
      monthlyPrice: 12.99,
      popular: true,
      features: [
        { label: t("pricing.feature.storage"), value: t("pricing.business.storage") },
        { label: t("pricing.feature.bandwidth"), value: t("pricing.business.bandwidth") },
        { label: t("pricing.feature.domains"), value: t("pricing.business.domains") },
        { label: t("pricing.feature.email"), value: t("pricing.business.email") },
        { label: t("pricing.feature.ssl"), value: true },
        { label: t("pricing.feature.backups"), value: true },
        { label: t("pricing.feature.support"), value: true },
        { label: t("pricing.feature.vps"), value: false },
      ],
    },
    {
      name: t("pricing.enterprise"),
      desc: t("pricing.enterprise.desc"),
      monthlyPrice: 39.99,
      popular: false,
      features: [
        { label: t("pricing.feature.storage"), value: t("pricing.enterprise.storage") },
        { label: t("pricing.feature.bandwidth"), value: t("pricing.enterprise.bandwidth") },
        { label: t("pricing.feature.domains"), value: t("pricing.enterprise.domains") },
        { label: t("pricing.feature.email"), value: t("pricing.enterprise.email") },
        { label: t("pricing.feature.ssl"), value: true },
        { label: t("pricing.feature.backups"), value: true },
        { label: t("pricing.feature.support"), value: true },
        { label: t("pricing.feature.vps"), value: true },
      ],
    },
  ];

  const getPrice = (monthly: number) => {
    const price = yearly ? monthly * 0.8 : monthly;
    return price.toFixed(2);
  };

  return (
    <div className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl" style={{ textWrap: "balance" }}>
              {t("pricing.title")}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">{t("pricing.subtitle")}</p>
          </div>
        </ScrollReveal>

        {/* Toggle */}
        <ScrollReveal delay={100}>
          <div className="mt-10 flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!yearly ? "text-foreground" : "text-muted-foreground"}`}>
              {t("pricing.monthly")}
            </span>
            <button
              onClick={() => setYearly(!yearly)}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                yearly ? "bg-primary" : "bg-border"
              }`}
              aria-label="Toggle yearly pricing"
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                  yearly ? "translate-x-5.5 left-0.5" : "left-0.5"
                }`}
                style={{ transform: yearly ? "translateX(22px)" : "translateX(0)" }}
              />
            </button>
            <span className={`text-sm font-medium ${yearly ? "text-foreground" : "text-muted-foreground"}`}>
              {t("pricing.yearly")}
            </span>
            {yearly && (
              <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                {t("pricing.yearlyDiscount")}
              </span>
            )}
          </div>
        </ScrollReveal>

        {/* Plan Cards */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <div
                className={`relative flex flex-col rounded-2xl border p-8 shadow-sm transition-shadow hover:shadow-md ${
                  plan.popular
                    ? "border-primary bg-card shadow-lg shadow-primary/10"
                    : "border-border bg-card"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                    {t("pricing.popular")}
                  </span>
                )}
                <h3 className="text-xl font-bold text-card-foreground">{plan.name}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{plan.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tabular-nums text-card-foreground">
                    €{getPrice(plan.monthlyPrice)}
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
                      plan.popular
                        ? "bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                  >
                    {plan.popular ? t("pricing.choosePlan") : t("pricing.choosePlan")}
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
