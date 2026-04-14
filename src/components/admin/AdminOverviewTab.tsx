import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePresenceSessions } from "@/hooks/usePresence";
import { useServerMonitor } from "@/hooks/useServerMonitor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Server, Globe, TrendingUp, DollarSign, UserPlus, Loader2, Radio, Eye, ShoppingCart, CloudCog } from "lucide-react";

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

interface FBClient {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  status?: string;
  created_at?: string;
}

interface FBStats {
  total: number;
  list: FBClient[];
  page: number;
  pages: number;
}

interface BackupStatus {
  last_backup_at?: string;
  size_mb?: number;
  status?: string;
  bucket?: string;
}

const AdminOverviewTab = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const activeSessions = usePresenceSessions();

  const { data: fbStats } = useServerMonitor<FBStats>("fossbilling_stats");
  const { data: backupStatus } = useServerMonitor<BackupStatus>("backup_status");

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: statsData }, { data: alertsData }] = await Promise.all([
        supabase.rpc("get_admin_stats"),
        supabase.from("admin_alerts").select("*").eq("is_resolved", false).order("created_at", { ascending: false }).limit(5),
      ]);
      if (statsData) setStats(statsData as unknown as AdminStats);
      if (alertsData) setAlerts(alertsData);
      setLoading(false);
    };
    fetchData();
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

  const uniqueVisitors = new Set(activeSessions.map((session) => session.user_id)).size;

  return (
    <div className="space-y-6">
      {/* Live visitors */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-green-500/10 p-2.5 text-green-500">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("admin.activeVisitors")}</p>
              <p className="text-2xl font-bold text-foreground">{uniqueVisitors}</p>
              <p className="text-xs text-green-500">● Live</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-500">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("admin.activeSessions")}</p>
              <p className="text-2xl font-bold text-foreground">{activeSessions.length}</p>
              <p className="text-xs text-muted-foreground">{t("admin.acrossPages")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPIs */}
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

      {/* FOSSBilling Stats + Backup Status */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-4 w-4 text-amber-500" />
              FOSSBilling Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fbStats ? (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-foreground">{fbStats.total_clients ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">Clients</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{fbStats.active_orders ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">Active Orders</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{fbStats.total_revenue != null ? `€${fbStats.total_revenue.toFixed(2)}` : "—"}</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Loading FOSSBilling data…</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-sky-500/30 bg-sky-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CloudCog className="h-4 w-4 text-sky-500" />
              Backblaze B2 Backup
            </CardTitle>
          </CardHeader>
          <CardContent>
            {backupStatus ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={backupStatus.status === "success" ? "default" : "destructive"}>
                    {backupStatus.status || "unknown"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Backup</span>
                  <span className="text-sm font-medium text-foreground">
                    {backupStatus.last_backup_at ? new Date(backupStatus.last_backup_at).toLocaleString() : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Size</span>
                  <span className="text-sm font-medium text-foreground">
                    {backupStatus.size_mb != null ? `${(backupStatus.size_mb / 1024).toFixed(2)} GB` : "—"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Loading backup status…</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Live sessions detail */}
      {activeSessions.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Radio className="h-4 w-4 animate-pulse text-green-500" />
              {t("admin.liveSessionsDetail")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeSessions.map((session, index) => (
                <div key={`${session.user_id}-${index}`} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                    <div>
                      <p className="font-mono text-sm font-medium text-foreground">
                        {session.user_id.slice(0, 8)}…
                      </p>
                      <p className="text-xs text-muted-foreground">{session.page}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {new Date(session.joined_at).toLocaleTimeString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
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
