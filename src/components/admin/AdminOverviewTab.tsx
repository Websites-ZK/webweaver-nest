import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useServerMonitor } from "@/hooks/useServerMonitor";
import SysStatusWidget from "./SysStatusWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity, AlertTriangle, CloudCog, Server,
  Users, TrendingUp, UserPlus, Globe, Loader2,
} from "lucide-react";

interface AdminStats {
  total_users: number;
  active_plans: number;
  total_domains: number;
  total_revenue: number;
  mrr: number;
  recent_signups_7d: number;
}

interface BackupStatus { last_backup_at?: string; status?: string; }
interface ServiceStatusRaw { [key: string]: string; }

const ageOf = (iso?: string): string => {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return `${Math.floor(diff / 60_000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const AdminOverviewTab = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activeAlertCount, setActiveAlertCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const { data: rawHealth } = useServerMonitor<SystemHealthRaw>("system_health", undefined, 5000);
  const { data: services } = useServerMonitor<ServiceStatusRaw>("services_status", undefined, 10000);
  const { data: backupStatus } = useServerMonitor<BackupStatus>("backup_status");

  const health: SystemHealth = {
    cpu_percent: parsePercent(rawHealth?.cpu),
    ram_percent: parsePercent(rawHealth?.mem),
    disk_percent: parsePercent(rawHealth?.disk),
  };

  const servicesUp = services ? Object.values(services).filter((s) => s === "running" || s === "active").length : 0;
  const servicesTotal = services ? Object.keys(services).length : 0;
  const allServicesUp = servicesTotal > 0 && servicesUp === servicesTotal;

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: statsData }, { data: alertsData }, { count }] = await Promise.all([
        supabase.rpc("get_admin_stats"),
        supabase.from("admin_alerts").select("*").eq("is_resolved", false).order("created_at", { ascending: false }).limit(5),
        supabase.from("admin_alerts").select("*", { count: "exact", head: true }).eq("is_resolved", false),
      ]);
      if (statsData) setStats(statsData as unknown as AdminStats);
      if (alertsData) setAlerts(alertsData);
      setActiveAlertCount(count ?? 0);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!stats) return <p className="text-muted-foreground">Failed to load stats.</p>;

  const pulseCards = [
    {
      label: "Server Status",
      value: allServicesUp ? "Online" : servicesTotal > 0 ? `${servicesUp}/${servicesTotal} up` : "Checking…",
      icon: Activity,
      tone: allServicesUp ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-500" : "border-amber-500/30 bg-amber-500/5 text-amber-500",
    },
    {
      label: "Active Alerts",
      value: activeAlertCount,
      icon: AlertTriangle,
      tone: activeAlertCount > 0 ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-emerald-500/30 bg-emerald-500/5 text-emerald-500",
    },
    {
      label: "Last Backup",
      value: ageOf(backupStatus?.last_backup_at),
      icon: CloudCog,
      tone: "border-sky-500/30 bg-sky-500/5 text-sky-500",
    },
    {
      label: "Active Plans",
      value: stats.active_plans,
      icon: Server,
      tone: "border-primary/30 bg-primary/5 text-primary",
    },
  ];

  const businessStrip = [
    { label: t("admin.totalUsers"), value: stats.total_users, icon: Users },
    { label: t("admin.mrr"), value: `€${stats.mrr.toFixed(2)}`, icon: TrendingUp },
    { label: t("admin.recentSignups"), value: stats.recent_signups_7d, icon: UserPlus },
    { label: t("admin.totalDomains"), value: stats.total_domains, icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* Health pulse */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Ops Pulse</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pulseCards.map((c) => (
            <Card key={c.label} className={c.tone}>
              <CardContent className="flex items-center gap-3 p-4">
                <c.icon className="h-5 w-5" />
                <div>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  <p className="text-xl font-bold text-foreground">{c.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Live resource gauges */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Live Server Resources <span className="ml-2 text-xs normal-case text-emerald-500">● refreshes every 5s</span>
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <ResourceGauge icon={Cpu} label="CPU" value={health.cpu_percent} />
          <ResourceGauge icon={MemoryStick} label="RAM" value={health.ram_percent} />
          <ResourceGauge icon={HardDrive} label="Disk" value={health.disk_percent} />
        </div>
      </div>

      {/* Secondary business strip */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Business</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {businessStrip.map((b) => (
            <Card key={b.label} className="border-border/50">
              <CardContent className="flex items-center gap-3 p-4">
                <b.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{b.label}</p>
                  <p className="text-lg font-semibold text-foreground">{b.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent alerts */}
      {alerts.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base">{t("admin.recentAlerts")}</CardTitle>
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
