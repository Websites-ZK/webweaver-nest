import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useServerMonitor } from "@/hooks/useServerMonitor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, RefreshCw, Cpu, MemoryStick, HardDrive, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

interface HealthCheck {
  id: string;
  target_url: string;
  status_code: number;
  response_time_ms: number;
  is_up: boolean;
  checked_at: string;
}

interface SystemHealthRaw {
  cpu?: string;
  mem?: string;
  disk?: string;
}

interface SystemHealth {
  cpu_percent?: number;
  ram_percent?: number;
  ram_used_mb?: number;
  ram_total_mb?: number;
  disk_percent?: number;
  disk_used_gb?: number;
  disk_total_gb?: number;
}

interface ServiceStatusRaw {
  [key: string]: string; // e.g. nginx: "running"
}

const parseSystemHealth = (raw: SystemHealthRaw | null): SystemHealth | null => {
  if (!raw) return null;
  const cpuPercent = parseFloat(raw.cpu || "0");
  const diskPercent = parseFloat((raw.disk || "0").replace("%", ""));
  const memParts = (raw.mem || "0/1").split("/");
  const ramUsedMb = parseFloat(memParts[0]);
  const ramTotalMb = parseFloat(memParts[1] || "1");
  const ramPercent = (ramUsedMb / ramTotalMb) * 100;
  return {
    cpu_percent: cpuPercent,
    ram_percent: ramPercent,
    ram_used_mb: ramUsedMb,
    ram_total_mb: ramTotalMb,
    disk_percent: diskPercent,
  };
};

const parseServices = (raw: ServiceStatusRaw | null): { name: string; running: boolean }[] => {
  if (!raw) return [];
  return Object.entries(raw)
    .filter(([key]) => key !== "error")
    .map(([name, status]) => ({ name, running: status === "running" }));
};

const ServerHealthTab = () => {
  const { t } = useLanguage();
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: sysRaw, loading: sysLoading, refetch: refetchSys } = useServerMonitor<SystemHealthRaw>("system_health", undefined, 30000);
  const { data: svcRaw, loading: svcLoading, refetch: refetchSvc } = useServerMonitor<ServiceStatusRaw>("services_status", undefined, 30000);

  const sysHealth = parseSystemHealth(sysRaw);
  const services = parseServices(svcRaw);

  const fetchChecks = async () => {
    const { data } = await supabase
      .from("server_health_checks")
      .select("*")
      .order("checked_at", { ascending: false })
      .limit(200);
    if (data) setChecks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchChecks();
    const interval = setInterval(fetchChecks, 30000);
    return () => clearInterval(interval);
  }, []);

  const refreshAll = () => {
    fetchChecks();
    refetchSys();
    refetchSvc();
  };

  if (loading && sysLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const urls = [...new Set(checks.map((c) => c.target_url))];

  const getUptimePercent = (url: string, hours: number) => {
    const since = new Date(Date.now() - hours * 3600000);
    const relevant = checks.filter((c) => c.target_url === url && new Date(c.checked_at) >= since);
    if (relevant.length === 0) return null;
    const up = relevant.filter((c) => c.is_up).length;
    return ((up / relevant.length) * 100).toFixed(2);
  };

  const chartConfig = { response_time: { label: "Response Time (ms)", color: "hsl(var(--primary))" } };

  const gaugeColor = (pct: number) => pct >= 90 ? "text-destructive" : pct >= 70 ? "text-amber-500" : "text-green-500";
  const progressColor = (pct: number) => pct >= 90 ? "[&>div]:bg-destructive" : pct >= 70 ? "[&>div]:bg-amber-500" : "[&>div]:bg-green-500";

  const services = svcStatus?.services || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">{t("admin.serverHealth")}</h2>
        <Button variant="outline" size="sm" onClick={refreshAll} className="gap-1.5">
          <RefreshCw className="h-4 w-4" /> {t("admin.refresh")}
        </Button>
      </div>

      {/* System Resources */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "CPU", icon: Cpu, pct: sysHealth?.cpu_percent ?? 0, detail: `${(sysHealth?.cpu_percent ?? 0).toFixed(1)}%` },
          { label: "RAM", icon: MemoryStick, pct: sysHealth?.ram_percent ?? 0, detail: sysHealth?.ram_used_mb ? `${(sysHealth.ram_used_mb / 1024).toFixed(1)} / ${((sysHealth.ram_total_mb ?? 0) / 1024).toFixed(1)} GB` : "—" },
          { label: "Disk", icon: HardDrive, pct: sysHealth?.disk_percent ?? 0, detail: sysHealth?.disk_used_gb ? `${sysHealth.disk_used_gb.toFixed(1)} / ${(sysHealth.disk_total_gb ?? 0).toFixed(1)} GB` : "—" },
        ].map((g) => (
          <Card key={g.label} className="border-border/50">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <g.icon className={`h-5 w-5 ${gaugeColor(g.pct)}`} />
                  <span className="font-medium text-foreground">{g.label}</span>
                </div>
                <span className={`text-lg font-bold ${gaugeColor(g.pct)}`}>{g.pct.toFixed(1)}%</span>
              </div>
              <Progress value={g.pct} className={`h-3 ${progressColor(g.pct)}`} />
              <p className="text-xs text-muted-foreground">{g.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Services Status */}
      {services.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Services Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {services.map((svc) => (
                <div key={svc.name} className="flex items-center gap-2 rounded-lg border border-border/50 px-4 py-2.5">
                  {svc.running ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span className="text-sm font-medium text-foreground">{svc.name}</span>
                  <Badge variant={svc.running ? "default" : "destructive"} className="text-xs">
                    {svc.running ? "UP" : "DOWN"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing health checks per URL */}
      {urls.map((url) => {
        const urlChecks = checks.filter((c) => c.target_url === url);
        const latest = urlChecks[0];
        const chartData = urlChecks
          .slice(0, 50)
          .reverse()
          .map((c) => ({
            time: new Date(c.checked_at).toLocaleTimeString(),
            response_time: c.response_time_ms,
          }));

        return (
          <Card key={url} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">{url}</CardTitle>
                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                  <span>24h: {getUptimePercent(url, 24) ?? "N/A"}%</span>
                  <span>7d: {getUptimePercent(url, 168) ?? "N/A"}%</span>
                  <span>30d: {getUptimePercent(url, 720) ?? "N/A"}%</span>
                </div>
              </div>
              <Badge variant={latest?.is_up ? "default" : "destructive"}>
                {latest?.is_up ? "UP" : "DOWN"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex gap-4 text-sm">
                <span className="text-muted-foreground">Status: <strong className="text-foreground">{latest?.status_code}</strong></span>
                <span className="text-muted-foreground">Response: <strong className="text-foreground">{latest?.response_time_ms}ms</strong></span>
              </div>
              {chartData.length > 1 && (
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="time" className="text-xs" tick={{ fontSize: 10 }} />
                    <YAxis className="text-xs" tick={{ fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="response_time" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        );
      })}

      {urls.length === 0 && !sysHealth && (
        <p className="text-center text-muted-foreground py-8">{t("admin.noHealthData")}</p>
      )}
    </div>
  );
};

export default ServerHealthTab;
