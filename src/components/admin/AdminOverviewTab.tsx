import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Server, Globe, TrendingUp, DollarSign, UserPlus, Loader2 } from "lucide-react";

interface AdminStats {
  total_users: number;
  active_plans: number;
  total_domains: number;
  total_revenue: number;
  pending_revenue: number;
  mrr: number;
  total_referral_credits: number;
  total_referral_earnings: number;
  onboarding_completions: number;
  recent_signups_7d: number;
  plan_distribution: { plan: string; count: number }[];
  location_distribution: { location: string; count: number }[];
}

const AdminOverviewTab = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [{ data: statsData }, { data: alertsData }] = await Promise.all([
        supabase.rpc("get_admin_stats"),
        supabase.from("admin_alerts").select("*").eq("is_resolved", false).order("created_at", { ascending: false }).limit(5),
      ]);
      if (statsData) setStats(statsData as unknown as AdminStats);
      if (alertsData) setAlerts(alertsData);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!stats) return <p className="text-muted-foreground">Failed to load stats.</p>;

  const kpis = [
    { label: t("admin.totalUsers"), value: stats.total_users, icon: Users, color: "text-blue-500" },
    { label: t("admin.activePlans"), value: stats.active_plans, icon: Server, color: "text-green-500" },
    { label: t("admin.totalDomains"), value: stats.total_domains, icon: Globe, color: "text-purple-500" },
    { label: t("admin.mrr"), value: `€${stats.mrr.toFixed(2)}`, icon: TrendingUp, color: "text-amber-500" },
    { label: t("admin.totalRevenue"), value: `€${stats.total_revenue.toFixed(2)}`, icon: DollarSign, color: "text-emerald-500" },
    { label: t("admin.recentSignups"), value: stats.recent_signups_7d, icon: UserPlus, color: "text-pink-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-border/50">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-lg bg-muted p-2.5 ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {alerts.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-lg">{t("admin.recentAlerts")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</p>
                </div>
                <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>
                  {alert.severity}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminOverviewTab;
