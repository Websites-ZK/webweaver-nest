import { Shield, RefreshCcw, Lock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TrustBadges = ({ className = "" }: { className?: string }) => {
  const { t } = useLanguage();

  const badges = [
    { icon: RefreshCcw, label: t("trust.moneyBack") },
    { icon: Lock, label: t("trust.sslCheckout") },
    { icon: Shield, label: t("trust.gdprBadge") },
  ];

  return (
    <div className={`flex flex-wrap items-center justify-center gap-6 ${className}`}>
      {badges.map((b, i) => (
        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <b.icon className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">{b.label}</span>
        </div>
      ))}
    </div>
  );
};

export default TrustBadges;
