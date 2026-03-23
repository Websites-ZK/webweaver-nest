import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import AnimatedSpheres from "@/components/AnimatedSpheres";
import { Globe, Shield, Mail, Server, HardDrive, Cloud, ArrowRight, Zap, Users, Clock, CheckCircle2 } from "lucide-react";

const Index = () => {
  const { t } = useLanguage();

  const services = [
    { icon: Cloud, titleKey: "services.hosting.title", descKey: "services.hosting.desc", color: "from-violet-500 to-purple-600", glow: "group-hover:shadow-violet-500/20" },
    { icon: Globe, titleKey: "services.domains.title", descKey: "services.domains.desc", color: "from-pink-500 to-rose-600", glow: "group-hover:shadow-pink-500/20" },
    { icon: Shield, titleKey: "services.ssl.title", descKey: "services.ssl.desc", color: "from-emerald-500 to-teal-600", glow: "group-hover:shadow-emerald-500/20" },
    { icon: Mail, titleKey: "services.email.title", descKey: "services.email.desc", color: "from-amber-500 to-orange-600", glow: "group-hover:shadow-amber-500/20" },
    { icon: Server, titleKey: "services.vps.title", descKey: "services.vps.desc", color: "from-sky-500 to-blue-600", glow: "group-hover:shadow-sky-500/20" },
    { icon: HardDrive, titleKey: "services.dedicated.title", descKey: "services.dedicated.desc", color: "from-fuchsia-500 to-pink-600", glow: "group-hover:shadow-fuchsia-500/20" },
  ];

  const stats = [
    { icon: CheckCircle2, value: t("stats.uptime"), label: t("stats.uptimeDesc") },
    { icon: Clock, value: t("stats.support"), label: t("stats.supportDesc") },
    { icon: Zap, value: t("stats.speed"), label: t("stats.speedDesc") },
    { icon: Users, value: t("stats.customers"), label: t("stats.customersDesc") },
  ];

  const testimonials = [
    { text: t("testimonials.1.text"), name: t("testimonials.1.name"), role: t("testimonials.1.role") },
    { text: t("testimonials.2.text"), name: t("testimonials.2.name"), role: t("testimonials.2.role") },
    { text: t("testimonials.3.text"), name: t("testimonials.3.name"), role: t("testimonials.3.role") },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8">
        <AnimatedSpheres />
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
              <Link to="/pricing">
                <Button size="lg" className="gap-2 bg-primary px-8 text-base font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all shadow-lg shadow-primary/25">
                  {t("hero.cta")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="px-8 text-base font-semibold active:scale-[0.97] transition-all">
                  {t("hero.ctaSecondary")}
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      {/* Stats */}
      <section className="relative border-y border-border bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <ScrollReveal key={i} delay={i * 80}>
              <div className="flex items-center gap-3 rounded-xl bg-background p-4 shadow-sm transition-shadow duration-300 hover:shadow-md">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-lg font-bold tabular-nums text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/15 to-transparent" />

      {/* Services */}
      <section className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        {/* Dot pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl" style={{ textWrap: "balance" }}>
                {t("services.title")}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("services.subtitle")}</p>
            </div>
          </ScrollReveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <ScrollReveal key={i} delay={i * 70}>
                <div className={`group relative rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg ${service.glow}`}>
                  <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${service.color}`}>
                    <service.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground">{t(service.titleKey)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(service.descKey)}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-secondary/15 to-transparent" />

      {/* Testimonials */}
      <section className="relative bg-muted/30 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        {/* Wavy background in testimonials */}
        <AnimatedSpheres />
        <div className="relative mx-auto max-w-5xl">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl" style={{ textWrap: "balance" }}>
                {t("testimonials.title")}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("testimonials.subtitle")}</p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {testimonials.map((item, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground italic">"{item.text}"</p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-card-foreground">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.role}</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <ScrollReveal>
          <div
            className="mx-auto max-w-3xl rounded-3xl px-8 py-14 text-center shadow-xl shadow-primary/20 sm:px-14"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.85), hsl(262 83% 52%))",
              backgroundSize: "200% 200%",
              animation: "gradient-shift 8s ease infinite",
            }}
          >
            <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl" style={{ textWrap: "balance" }}>
              {t("hero.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-primary-foreground/80">
              {t("hero.subtitle")}
            </p>
            <Link to="/pricing">
              <Button size="lg" className="mt-8 bg-white px-8 text-base font-semibold text-primary hover:bg-white/90 active:scale-[0.97] transition-all">
                {t("hero.cta")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
};

export default Index;
