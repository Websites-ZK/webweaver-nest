import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cpu, MemoryStick, HardDrive, Wifi, FolderOpen, DatabaseBackup, Globe, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import UsageBar from "./UsageBar";
import { format } from "date-fns";

interface HostingTabProps {
  hostingPlans: any[];
}

const HostingTab = ({ hostingPlans }: HostingTabProps) => {
  const { t } = useLanguage();

  const statusColor = (s: string) =>
    s === "active" ? "bg-primary/10 text-primary" : s === "expired" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground";

  const quickActions = [
    { icon: FolderOpen, label: t("dash.fileManager") },
    { icon: DatabaseBackup, label: t("dash.backups") },
    { icon: Globe, label: "DNS" },
    { icon: Shield, label: "SSL" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("dash.hosting")}</h1>
        <p className="text-muted-foreground">{t("dash.hostingDesc")}</p>
      </div>

      {hostingPlans.map((plan) => (
        <Card key={plan.id} className="border-border/50">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {plan.domain || "-"} · {plan.server_location} · {plan.billing_period}
                </p>
              </div>
              <Badge className={statusColor(plan.status)}>{plan.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Resource gauges */}
            <div className="grid gap-4 sm:grid-cols-2">
              <UsageBar label={t("dash.storage")} used={Number(plan.storage_used_gb)} total={Number(plan.storage_limit_gb)} />
              <UsageBar label={t("dash.bandwidth")} used={Number(plan.bandwidth_used_gb)} total={Number(plan.bandwidth_limit_gb)} />
              <UsageBar label="RAM" used={Number(plan.ram_used_mb)} total={Number(plan.ram_mb)} unit="MB" />
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">CPU</span>
                  <span className="text-muted-foreground">{plan.cpu_cores} {t("dash.cores")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: plan.cpu_cores }).map((_, i) => (
                    <Cpu key={i} className="h-5 w-5 text-primary" />
                  ))}
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">{t("dash.quickActions")}</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <Button key={action.label} variant="outline" size="sm" className="gap-1.5">
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {t("dash.expires")}: {format(new Date(plan.expires_at), "MMM d, yyyy")}
            </p>
          </CardContent>
        </Card>
      ))}

      {hostingPlans.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("dash.noPlans")}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HostingTab;
