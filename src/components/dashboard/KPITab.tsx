import { useMemo, useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, AlertTriangle, Download, Activity, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, isAfter, addDays, parseISO, formatDistanceToNow, subDays } from "date-fns";

interface KPITabProps {
  hostingPlans: any[];
  invoices: any[];
  domains: any[];
}

const KPITab = ({ hostingPlans, invoices, domains }: KPITabProps) => {
  const { t } = useLanguage();
  const [healthChecks, setHealthChecks] = useState<any[]>([]);
  const [healthLoading, setHealthLoading] = useState(true);
  const [historyChecks, setHistoryChecks] = useState<any[]>([]);

  // Fetch recent health checks (for live status)
  const fetchHealth = useCallback(async () => {
    if (domains.length === 0) {
      setHealthChecks([]);
      setHealthLoading(false);
      return;
    }
    const domainNames = domains.map((d) => d.domain_name);
    const { data } = await supabase
      .from("server_health_checks")
      .select("*")
      .in("target_url", domainNames)
      .order("checked_at", { ascending: false })
      .limit(200);
    setHealthChecks(data || []);
    setHealthLoading(false);
  }, [domains]);

  // Fetch 7-day history for charts
  const fetchHistory = useCallback(async () => {
    if (domains.length === 0) {
      setHistoryChecks([]);
      return;
    }
    const domainNames = domains.map((d) => d.domain_name);
    const sevenDaysAgo = subDays(new Date(), 7).toISOString();
    const { data } = await supabase
      .from("server_health_checks")
      .select("*")
      .in("target_url", domainNames)
      .gte("checked_at", sevenDaysAgo)
      .order("checked_at", { ascending: true })
      .limit(1000);
    setHistoryChecks(data || []);
  }, [domains]);

  useEffect(() => {
    fetchHealth();
    fetchHistory();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth, fetchHistory]);

  // Group latest health check per domain
  const domainStatus = useMemo(() => {
    const map: Record<string, { latest: any; checks: any[] }> = {};
    for (const d of domains) {
      const checks = healthChecks.filter((h) => h.target_url === d.domain_name);
      map[d.domain_name] = {
        latest: checks[0] || null,
        checks: checks.slice(0, 20),
      };
    }
    return map;
  }, [domains, healthChecks]);

  // Overall uptime percentage
  const overallUptime = useMemo(() => {
    if (healthChecks.length === 0) return null;
    const upCount = healthChecks.filter((h) => h.is_up).length;
    return Math.round((upCount / healthChecks.length) * 100 * 10) / 10;
  }, [healthChecks]);

  // Average response time
  const avgResponseTime = useMemo(() => {
    const withTime = healthChecks.filter((h) => h.response_time_ms != null);
    if (withTime.length === 0) return null;
    return Math.round(withTime.reduce((s, h) => s + h.response_time_ms, 0) / withTime.length);
  }, [healthChecks]);

  const activePlans = useMemo(
    () => hostingPlans.filter((p) => p.status === "active").length,
    [hostingPlans]
  );

  const totalRevenue = useMemo(
    () =>
      invoices
        .filter((i) => i.status === "paid")
        .reduce((sum: number, i: any) => sum + Number(i.amount), 0),
    [invoices]
  );

  // Revenue over time (group by month)
  const revenueChartData = useMemo(() => {
    const map: Record<string, number> = {};
    invoices
      .filter((i) => i.status === "paid")
      .forEach((i) => {
        const month = format(parseISO(i.created_at), "yyyy-MM");
        map[month] = (map[month] || 0) + Number(i.amount);
      });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({ month: format(parseISO(month + "-01"), "MMM yyyy"), amount: Number(amount.toFixed(2)) }));
  }, [invoices]);

  // Expiring plans (within 30 days)
  const expiringPlans = useMemo(() => {
    const threshold = addDays(new Date(), 30);
    return hostingPlans.filter(
      (p) => p.status === "active" && isAfter(threshold, parseISO(p.expires_at)) && isAfter(parseISO(p.expires_at), new Date())
    );
  }, [hostingPlans]);

  // Renewal rate
  const renewalRate = useMemo(() => {
    const total = hostingPlans.length;
    if (total === 0) return 100;
    const active = hostingPlans.filter((p) => p.status === "active").length;
    return Math.round((active / total) * 100);
  }, [hostingPlans]);

  // Conversion tracking: unique plan names from invoices
  // Response time trend data (7 days, grouped by hour)
  const responseTimeChartData = useMemo(() => {
    if (historyChecks.length === 0) return [];
    const domainNames = [...new Set(historyChecks.map((h) => h.target_url))];
    // Group by 4-hour buckets
    const bucketMap: Record<string, Record<string, number[]>> = {};
    historyChecks.forEach((h) => {
      if (h.response_time_ms == null) return;
      const date = parseISO(h.checked_at);
      const bucketHour = Math.floor(date.getHours() / 4) * 4;
      const key = format(date, "yyyy-MM-dd") + `-${String(bucketHour).padStart(2, "0")}`;
      if (!bucketMap[key]) bucketMap[key] = {};
      if (!bucketMap[key][h.target_url]) bucketMap[key][h.target_url] = [];
      bucketMap[key][h.target_url].push(h.response_time_ms);
    });
    return Object.entries(bucketMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key]) => {
        const [datePart, hour] = key.split("-").length > 3
          ? [key.slice(0, 10), key.slice(11)]
          : [key.substring(0, 10), key.substring(11)];
        const label = format(parseISO(datePart), "MMM d") + ` ${hour}:00`;
        const row: Record<string, any> = { time: label };
        domainNames.forEach((d) => {
          const vals = bucketMap[key]?.[d] || [];
          row[d] = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
        });
        return row;
      });
  }, [historyChecks]);

  // Daily uptime percentage per domain
  const uptimePerDayData = useMemo(() => {
    if (historyChecks.length === 0) return [];
    const domainNames = [...new Set(historyChecks.map((h) => h.target_url))];
    const dayMap: Record<string, Record<string, { up: number; total: number }>> = {};
    historyChecks.forEach((h) => {
      const day = format(parseISO(h.checked_at), "yyyy-MM-dd");
      if (!dayMap[day]) dayMap[day] = {};
      if (!dayMap[day][h.target_url]) dayMap[day][h.target_url] = { up: 0, total: 0 };
      dayMap[day][h.target_url].total++;
      if (h.is_up) dayMap[day][h.target_url].up++;
    });
    return Object.entries(dayMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day]) => {
        const label = format(parseISO(day), "MMM d");
        const row: Record<string, any> = { day: label };
        domainNames.forEach((d) => {
          const stats = dayMap[day]?.[d];
          row[d] = stats ? Math.round((stats.up / stats.total) * 100 * 10) / 10 : null;
        });
        return row;
      });
  }, [historyChecks]);

  const domainColors = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

  const planConversions = useMemo(() => {
    const descriptions = invoices
      .filter((i) => i.status === "paid")
      .map((i) => i.description)
      .filter(Boolean);
    const unique = [...new Set(descriptions)];
    return unique.map((desc) => ({
      name: desc,
      count: descriptions.filter((d) => d === desc).length,
    }));
  }, [invoices]);

  const downloadCSV = () => {
    const rows: string[][] = [
      ["Metric", "Value"],
      ["Active Plans", String(activePlans)],
      ["Total Revenue (EUR)", totalRevenue.toFixed(2)],
      ["Renewal Rate", `${renewalRate}%`],
      ["Expiring Plans (30d)", String(expiringPlans.length)],
      [],
      ["Plan", "Status", "Storage Used", "Bandwidth Used", "Expires"],
      ...hostingPlans.map((p) => [
        p.plan_name,
        p.status,
        `${p.storage_used_gb}/${p.storage_limit_gb} GB`,
        `${p.bandwidth_used_gb}/${p.bandwidth_limit_gb} GB`,
        format(parseISO(p.expires_at), "dd/MM/yyyy"),
      ]),
      [],
      ["Invoice", "Amount", "Status", "Date"],
      ...invoices.map((i) => [
        i.description,
        `€${Number(i.amount).toFixed(2)}`,
        i.status,
        format(parseISO(i.created_at), "dd/MM/yyyy"),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kpi-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            {t("dash.kpi")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{t("dash.kpiDesc")}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("dash.kpiActivePlans")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activePlans}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("dash.kpiTotalRevenue")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">€{totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("dash.renewalRate")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{renewalRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Uptime Monitoring Widget */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wifi className="h-5 w-5" />
              {t("dash.uptimeMonitoring")}
            </CardTitle>
            <div className="flex items-center gap-3">
              {overallUptime !== null && (
                <Badge variant={overallUptime >= 99 ? "default" : overallUptime >= 95 ? "secondary" : "destructive"}>
                  {overallUptime}% {t("dash.kpiUptimeAvg")}
                </Badge>
              )}
              {avgResponseTime !== null && (
                <span className="text-xs text-muted-foreground">
                  {t("dash.uptimeAvgResponse")}: {avgResponseTime}ms
                </span>
              )}
              <Button variant="ghost" size="icon" onClick={fetchHealth} className="h-8 w-8">
                <RefreshCw className={`h-4 w-4 ${healthLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {healthLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : domains.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">{t("dash.uptimeNoData")}</p>
          ) : (
            <div className="space-y-4">
              {domains.map((domain) => {
                const status = domainStatus[domain.domain_name];
                const latest = status?.latest;
                const isUp = latest?.is_up ?? null;
                const responseTime = latest?.response_time_ms;
                const lastChecked = latest?.checked_at;
                const recentChecks = status?.checks || [];

                return (
                  <div key={domain.id} className="flex items-center gap-4 rounded-lg border border-border/50 p-3">
                    {/* Status indicator */}
                    <div className="relative flex-shrink-0">
                      {isUp === null ? (
                        <div className="h-3 w-3 rounded-full bg-muted" />
                      ) : isUp ? (
                        <>
                          <div className="h-3 w-3 rounded-full bg-green-500" />
                          <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-green-500 opacity-30" />
                        </>
                      ) : (
                        <>
                          <div className="h-3 w-3 rounded-full bg-destructive" />
                          <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-destructive opacity-30" />
                        </>
                      )}
                    </div>

                    {/* Domain info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{domain.domain_name}</p>
                      {lastChecked && (
                        <p className="text-xs text-muted-foreground">
                          {t("dash.uptimeLastChecked")}: {formatDistanceToNow(parseISO(lastChecked), { addSuffix: true })}
                        </p>
                      )}
                    </div>

                    {/* Mini uptime bar (last 20 checks) */}
                    {recentChecks.length > 0 && (
                      <div className="hidden sm:flex items-center gap-0.5">
                        {recentChecks.slice().reverse().map((check: any, i: number) => (
                          <div
                            key={i}
                            className={`h-5 w-1.5 rounded-full ${check.is_up ? "bg-green-500/80" : "bg-destructive/80"}`}
                            title={`${format(parseISO(check.checked_at), "HH:mm")} - ${check.is_up ? "Up" : "Down"}${check.response_time_ms ? ` (${check.response_time_ms}ms)` : ""}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Response time & status badge */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {responseTime != null && (
                        <span className="text-xs text-muted-foreground">{responseTime}ms</span>
                      )}
                      {isUp !== null && (
                        <Badge variant={isUp ? "default" : "destructive"} className="text-xs">
                          {isUp ? (
                            <><Wifi className="h-3 w-3 mr-1" />{t("dash.uptimeUp")}</>
                          ) : (
                            <><WifiOff className="h-3 w-3 mr-1" />{t("dash.uptimeDown")}</>
                          )}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
              {Object.values(domainStatus).every((s) => s.latest?.is_up) && domains.length > 0 && (
                <p className="text-center text-xs text-muted-foreground pt-1">
                  ✅ {t("dash.uptimeAllOperational")}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            {t("dash.revenueOverTime")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {revenueChartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                  <YAxis className="text-xs fill-muted-foreground" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm py-8 text-center">No revenue data yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Conversion Tracking & Churn side by side */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Conversion Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5" />
              {t("dash.conversionTracking")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {planConversions.length > 0 ? (
              planConversions.map((pc) => (
                <div key={pc.name} className="flex items-center justify-between">
                  <span className="text-sm">{pc.name}</span>
                  <Badge variant="secondary">{pc.count}×</Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No conversion data yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Churn Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5" />
              {t("dash.churnAnalysis")}
            </CardTitle>
            <CardDescription>{t("dash.expiringPlans")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {expiringPlans.length > 0 ? (
              expiringPlans.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{p.plan_name}</span>
                  <Badge variant="destructive">
                    {t("dash.expiresOn")} {format(parseISO(p.expires_at), "dd/MM/yyyy")}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">{t("dash.noExpiringPlans")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Automated Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("dash.automatedReports")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={downloadCSV} className="gap-2">
            <Download className="h-4 w-4" />
            {t("dash.downloadReport")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default KPITab;
