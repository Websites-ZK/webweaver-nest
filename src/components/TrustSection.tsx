import { Shield, Activity, Lock, Globe, ShieldCheck, Server, Eye, KeyRound } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import ScrollReveal from "@/components/ScrollReveal";

const TrustSection = () => {
  const { t } = useLanguage();

  const guaranteeCards = [
    {
      icon: Shield,
      title: t("guarantee.moneyBack.title"),
      desc: t("guarantee.moneyBack.desc"),
      accent: "border-l-emerald-500",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
    },
    {
      icon: Activity,
      title: t("guarantee.uptime.title"),
      desc: t("guarantee.uptime.desc"),
      accent: "border-l-blue-500",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
    {
      icon: Lock,
      title: t("guarantee.ssl.title"),
      desc: t("guarantee.ssl.desc"),
      accent: "border-l-violet-500",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-500",
    },
  ];

  const securityBadges = [
    { icon: ShieldCheck, label: t("security.ddos") },
    { icon: Globe, label: t("security.gdpr") },
    { icon: Server, label: t("security.euData") },
    { icon: Eye, label: t("security.monitoring") },
    { icon: KeyRound, label: t("security.encrypted") },
  ];

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Guarantee Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {guaranteeCards.map((card, i) => (
            <ScrollReveal key={i} delay={i * 80}>
              <div
                className={`rounded-2xl border border-border border-l-4 ${card.accent} bg-card p-7 shadow-sm transition-shadow hover:shadow-md`}
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg}`}>
                  <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-card-foreground">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Security Strip */}
        <ScrollReveal delay={300}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-xl border border-border bg-muted/30 px-6 py-4">
            {securityBadges.map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <badge.icon className="h-4 w-4 text-primary" />
                <span className="font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default TrustSection;
