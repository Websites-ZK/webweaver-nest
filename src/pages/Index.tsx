import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

import ScrollReveal from "@/components/ScrollReveal";
import SocialProof from "@/components/SocialProof";
import CountdownBanner from "@/components/CountdownBanner";
import TrustBadges from "@/components/TrustBadges";
import SEOHead from "@/components/SEOHead";
import { Check, X, ArrowRight, Shield, Activity, Globe, Monitor, Database, Server, Lock, HardDrive, MousePointerClick, MapPin, Zap } from "lucide-react";

type BillingPeriod = "monthly" | "12mo" | "24mo" | "36mo";
type Tier = "standard" | "highPerformance";

const Index = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    const checkReturning = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setIsReturning(false); return; }
      const { count } = await supabase
        .from("hosting_plans")
        .select("id", { count: "exact", head: true })
        .eq("user_id", authUser.id);
      setIsReturning((count ?? 0) > 0);
    };
    checkReturning();
  }, []);

  const getCtaLink = (planId?: string) => {
    if (user) {
      const params = new URLSearchParams();
      if (planId) params.set("plan", planId);
      params.set("period", period);
      return `/onboarding?${params.toString()}`;
    }
    return "/register";
  };
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [tier, setTier] = useState<Tier>("standard");

  const heroStats = [
    { value: t("hero.stat1.value"), label: t("hero.stat1.label") },
    { value: t("hero.stat2.value"), label: t("hero.stat2.label") },
    { value: t("hero.stat3.value"), label: t("hero.stat3.label") },
    { value: t("hero.stat4.value"), label: t("hero.stat4.label") },
  ];

  const trustItems = [
    { icon: Shield, label: t("trust.ssl") },
    { icon: Activity, label: t("trust.monitoring") },
    { icon: Globe, label: t("trust.gdpr") },
    { icon: Monitor, label: t("trust.cpanel") },
    { icon: Database, label: t("trust.backups") },
  ];

  const features = [
    { icon: MapPin, title: t("features.datacenter.title"), desc: t("features.datacenter.desc") },
    { icon: Activity, title: t("features.uptime.title"), desc: t("features.uptime.desc") },
    { icon: Lock, title: t("features.ssl.title"), desc: t("features.ssl.desc") },
    { icon: Monitor, title: t("features.cpanel.title"), desc: t("features.cpanel.desc") },
    { icon: HardDrive, title: t("features.ssd.title"), desc: t("features.ssd.desc") },
    { icon: MousePointerClick, title: t("features.wordpress.title"), desc: t("features.wordpress.desc") },
  ];

  const standardPlans = [
    { id: "basic", base: 1.49, popular: false, websites: "1", storage: "10 GB SSD", visits: "~30k", cpu: "1 vCPU", backup: false },
    { id: "standard", base: 2.49, popular: true, websites: "5", storage: "30 GB SSD", visits: "~100k", cpu: "2 vCPUs", backup: true },
    { id: "business", base: 4.99, popular: false, websites: "20", storage: "60 GB SSD", visits: "~200k", cpu: "4 vCPUs", backup: true },
    { id: "agency", base: 8.99, popular: false, websites: t("pricing.unlimited"), storage: "120 GB SSD", visits: "~400k", cpu: "8 vCPUs", backup: true },
  ];

  const highPerformancePlans = [
    { id: "basic", base: 2.99, popular: false, websites: "5", storage: "20 GB NVMe", visits: "~50k", cpu: "2 vCPUs", backup: true },
    { id: "standard", base: 4.99, popular: true, websites: "25", storage: "60 GB NVMe", visits: "~200k", cpu: "4 vCPUs", backup: true },
    { id: "business", base: 8.99, popular: false, websites: "100", storage: "120 GB NVMe", visits: "~400k", cpu: "8 vCPUs", backup: true },
    { id: "agency", base: 14.99, popular: false, websites: t("pricing.unlimited"), storage: "250 GB NVMe", visits: "~800k", cpu: "16 vCPUs", backup: true },
  ];

  const plans = tier === "standard" ? standardPlans : highPerformancePlans;

  const whyCards = [
    { num: "01", title: t("why.1.title"), desc: t("why.1.desc") },
    { num: "02", title: t("why.2.title"), desc: t("why.2.desc") },
    { num: "03", title: t("why.3.title"), desc: t("why.3.desc") },
    { num: "04", title: t("why.4.title"), desc: t("why.4.desc") },
  ];

  const periods: { key: BillingPeriod; label: string }[] = [
    { key: "monthly", label: t("pricing.monthly") },
    { key: "12mo", label: t("pricing.12months") },
    { key: "24mo", label: t("pricing.24months") },
    { key: "36mo", label: t("pricing.36months") },
  ];

  const getPrice = (base: number) => {
    const multiplier = period === "12mo" ? 1 : period === "24mo" ? 0.85 : period === "36mo" ? 0.75 : 1.15;
    const price = base * multiplier;
    return isReturning ? (price * 1.20).toFixed(2) : price.toFixed(2);
  };

  const getDiscountPct = (planIndex: number) => {
    const standardMatrix: Record<BillingPeriod, number[]> = {
      "monthly": [20, 22, 23, 25],
      "12mo":    [35, 37, 38, 40],
      "24mo":    [45, 47, 48, 50],
      "36mo":    [55, 57, 58, 60],
    };
    const hpMatrix: Record<BillingPeriod, number[]> = {
      "monthly": [18, 20, 21, 23],
      "12mo":    [32, 34, 36, 38],
      "24mo":    [42, 44, 46, 48],
      "36mo":    [52, 54, 56, 58],
    };
    const matrix = tier === "highPerformance" ? hpMatrix : standardMatrix;
    return matrix[period][planIndex % 4];
  };

  const getOriginalPrice = (base: number, planIndex: number) => {
    const current = parseFloat(getPrice(base));
    const pct = getDiscountPct(planIndex);
    return (current / (1 - pct / 100)).toFixed(2);
  };

  const discountLabel = period === "24mo" ? t("pricing.save26") : period === "36mo" ? t("pricing.save35") : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "WebWeaver",
    url: "https://webweaver-nest.lovable.app",
    description: "Fast, affordable EU-based web hosting from €1.49/mo",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://webweaver-nest.lovable.app/pricing",
    },
  };

  return (
    <div className="overflow-hidden">
      <SEOHead
        title="WebWeaver - Fast, Affordable EU Hosting from €1.49/mo"
        description="EU-based web hosting with 99.9% uptime, free SSL, cPanel, and GDPR compliance. Up to 50% cheaper than competitors. Start from €1.49/mo."
        path="/"
        jsonLd={jsonLd}
      />

      {/* ===== HERO ===== */}
      <section className="relative px-4 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
        <div className="relative mx-auto max-w-4xl text-center">
          <ScrollReveal>
            <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium tracking-wide text-primary">
              {t("hero.badge")}
            </span>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <h1 className="mt-2 text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl" style={{ textWrap: "balance" }}>
              {t("hero.title")}
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={160}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground" style={{ textWrap: "pretty" }}>
              {t("hero.subtitle")}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={240}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to={getCtaLink()}>
                <Button size="lg" className="gap-2 bg-primary px-8 text-base font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all shadow-lg shadow-primary/25">
                  {t("hero.cta")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#pricing">
                <Button variant="outline" size="lg" className="px-8 text-base font-semibold active:scale-[0.97] transition-all">
                  {t("hero.ctaSecondary")}
                </Button>
              </a>
            </div>
          </ScrollReveal>

          {/* Stats row */}
          <ScrollReveal delay={320}>
            <div className="mx-auto mt-14 flex max-w-2xl flex-wrap items-center justify-center gap-y-4">
              {heroStats.map((stat, i) => (
                <div key={i} className="flex items-center">
                  {i > 0 && <div className="mx-6 hidden h-10 w-px bg-border sm:block" />}
                  <div className="px-2 text-center">
                    <div className="text-2xl font-extrabold tabular-nums text-foreground">{stat.value}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section className="border-y border-border bg-muted/30 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {trustItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <item.icon className="h-4 w-4 text-primary" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SOCIAL PROOF ===== */}
      <SocialProof />

      {/* ===== FEATURES GRID ===== */}
      <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl" style={{ textWrap: "balance" }}>
                {t("features.title")}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("features.subtitle")}</p>
            </div>
          </ScrollReveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <ScrollReveal key={i} delay={i * 70}>
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="bg-muted/30 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl" style={{ textWrap: "balance" }}>
                {t("pricing.title")}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("pricing.subtitle")}</p>
            </div>
          </ScrollReveal>

          {/* Countdown for first-time users */}
          {!isReturning && (
            <ScrollReveal delay={60}>
              <div className="mt-8">
                <CountdownBanner />
              </div>
            </ScrollReveal>
          )}

          {/* Tier toggle */}
          <ScrollReveal delay={80}>
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setTier("standard")}
                className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  tier === "standard"
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("pricing.tier.standard")}
              </button>
              <button
                onClick={() => setTier("highPerformance")}
                className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  tier === "highPerformance"
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <Zap className="h-4 w-4" />
                {t("pricing.tier.highPerformance")}
              </button>
            </div>
          </ScrollReveal>

          {/* Period toggle */}
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

          {/* Cards */}
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
                  <h3 className="text-xl font-bold text-card-foreground">{t(`pricing.${plan.id}`)}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{t(`pricing.${plan.id}.desc`)}</p>

                  <div className="mt-6">
                    {!isReturning && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base line-through tabular-nums text-muted-foreground">
                          €{getOriginalPrice(plan.base, i)}
                        </span>
                        <span className="rounded-full bg-emerald-500/90 px-2 py-0.5 text-[11px] font-bold text-white">
                          -{getDiscountPct(i)}%
                        </span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold tabular-nums text-card-foreground">
                        €{getPrice(plan.base)}
                      </span>
                      <span className="text-sm text-muted-foreground">{t("pricing.mo")}</span>
                    </div>
                  </div>

                  <ul className="mt-8 flex-1 space-y-3">
                    <li className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      <span className="text-card-foreground">{t("pricing.feature.websites")}: {plan.websites}</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      <span className="text-card-foreground">{t("pricing.feature.storage")}: {plan.storage}</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      <span className="text-card-foreground">{t("pricing.feature.visits")}: {plan.visits}</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      <span className="text-card-foreground">{plan.cpu}</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      <span className="text-card-foreground">{t("pricing.feature.ssl")}</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-sm">
                      {plan.backup ? (
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                      ) : (
                        <X className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                      )}
                      <span className={plan.backup ? "text-card-foreground" : "text-muted-foreground/50"}>{t("pricing.feature.backup")}</span>
                    </li>
                  </ul>

                  <Link to={getCtaLink(plan.id)} className="mt-8">
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

          {/* Trust badges + Compare link */}
          <ScrollReveal delay={350}>
            <div className="mt-10 space-y-4">
              <TrustBadges />
              <div className="text-center">
                <Link to="/pricing#compare" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  {t("pricing.compareAll")} →
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl" style={{ textWrap: "balance" }}>
                {t("why.title")}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("why.subtitle")}</p>
            </div>
          </ScrollReveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {whyCards.map((card, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
                  <span className="text-3xl font-extrabold text-primary/20">{card.num}</span>
                  <h3 className="mt-2 text-lg font-bold text-card-foreground">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BAND ===== */}
      <section className="bg-muted/30 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl" style={{ textWrap: "balance" }}>
              {t("cta.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              {t("cta.subtitle")}
            </p>
            <Link to={getCtaLink()}>
              <Button size="lg" className="mt-8 gap-2 bg-primary px-8 text-base font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all shadow-lg shadow-primary/25">
                {t("cta.button")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <TrustBadges className="mt-6" />
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
};

export default Index;
