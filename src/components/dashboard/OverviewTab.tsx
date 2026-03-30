import { Server, Globe, HardDrive, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import UsageBar from "./UsageBar";
import { format } from "date-fns";

interface OverviewTabProps {
  user: { user_metadata?: { full_name?: string }; email?: string } | null;
  hostingPlans: any[];
  domains: any[];
  invoices: any[];
  onTabChange: (tab: string) => void;
}

const OverviewTab = ({ user, hostingPlans, domains, invoices, onTabChange }: OverviewTabProps) => {
  const { t } = useLanguage();

  const activePlans = hostingPlans.filter((p) => p.status === "active").length;
  const activeDomains = domains.filter((d) => d.status === "active").length;
  const totalStorage = hostingPlans.reduce((a, p) => a + Number(p.storage_limit_gb), 0);
  const usedStorage = hostingPlans.reduce((a, p) => a + Number(p.storage_used_gb), 0);
  const storagePct = totalStorage > 0 ? Math.round((usedStorage / totalStorage) * 100) : 0;
  const pendingInvoices = invoices.filter((i) => i.status === "pending").length;

  const stats = [
    { icon: Server, label: t("dash.activePlans"), value: activePlans, color: "text-primary" },
    { icon: Globe, label: t("dash.activeDomains"), value: activeDomains, color: "text-secondary" },
    { icon: HardDrive, label: t("dash.storageUsed"), value: `${storagePct}%`, color: "text-accent" },
    { icon: Receipt, label: t("dash.pendingInvoices"), value: pendingInvoices, color: "text-destructive" },
  ];

  const statusColor = (s: string) =>
    s === "active" ? "bg-primary/10 text-primary" : s === "expired" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground";

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("dash.welcome")}, {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"} 👋
        </h1>
        <p className="text-muted-foreground">{t("dash.welcomeSub")}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-xl bg-muted p-3 ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hosting Plans */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("dash.yourPlans")}</h2>
          <Button variant="outline" size="sm" onClick={() => onTabChange("hosting")}>
            {t("dash.viewAll")}
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {hostingPlans.map((plan) => (
            <Card key={plan.id} className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{plan.plan_name}</CardTitle>
                  <Badge className={statusColor(plan.status)}>{plan.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.domain || "-"} · {plan.server_location}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <UsageBar label={t("dash.storage")} used={Number(plan.storage_used_gb)} total={Number(plan.storage_limit_gb)} />
                <UsageBar label={t("dash.bandwidth")} used={Number(plan.bandwidth_used_gb)} total={Number(plan.bandwidth_limit_gb)} />
                <p className="text-xs text-muted-foreground">
                  {t("dash.expires")}: {format(new Date(plan.expires_at), "MMM d, yyyy")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
