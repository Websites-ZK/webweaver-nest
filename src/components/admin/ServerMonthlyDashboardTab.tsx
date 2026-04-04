import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Clock, Cpu, MemoryStick, HardDrive, Network, AlertTriangle, Timer,
  DatabaseBackup, Thermometer, CircuitBoard, HardDriveDownload, Users,
  Euro, Gauge, Shield, Search, FileArchive, ServerCrash,
  Server as ServerIcon, RefreshCw, Save, Pencil, Loader2, CalendarDays
} from "lucide-react";

interface ServerRow { id: string; name: string; location: string; }

interface MetricRow {
  id: string; server_id: string; metric: string; value: number | null;
  status: string; notes: string | null; recorded_by: string | null; month: string;
}

interface MetricConfig {
  key: string; icon: React.ReactNode; unit: string;
  warnThreshold: string; critThreshold: string; isTextMetric?: boolean;
  evaluate: (val: number | null, textVal?: string) => "ok" | "warning" | "critical";
}

const MONTHLY_METRICS: MetricConfig[] = [
  {
    key: "monthly_uptime", icon: <Clock className="h-4 w-4" />, unit: "%",
    warnThreshold: "<99.9%", critThreshold: "<99.5%",
    evaluate: (v) => v == null ? "ok" : v < 99.5 ? "critical" : v < 99.9 ? "warning" : "ok",
  },
  {
    key: "avg_cpu_month", icon: <Cpu className="h-4 w-4" />, unit: "%",
    warnThreshold: ">55%", critThreshold: ">80%",
    evaluate: (v) => v == null ? "ok" : v > 80 ? "critical" : v > 55 ? "warning" : "ok",
  },
  {
    key: "avg_ram_month", icon: <MemoryStick className="h-4 w-4" />, unit: "%",
    warnThreshold: ">65%", critThreshold: ">85%",
    evaluate: (v) => v == null ? "ok" : v > 85 ? "critical" : v > 65 ? "warning" : "ok",
  },
  {
    key: "total_traffic_gb", icon: <Network className="h-4 w-4" />, unit: "GB",
    warnThreshold: "Track growth", critThreshold: "—",
    evaluate: () => "ok",
  },
  {
    key: "disk_growth_gb", icon: <HardDrive className="h-4 w-4" />, unit: "GB",
    warnThreshold: ">50 GB", critThreshold: ">100 GB",
    evaluate: (v) => v == null ? "ok" : v > 100 ? "critical" : v > 50 ? "warning" : "ok",
  },
  {
    key: "total_incidents", icon: <AlertTriangle className="h-4 w-4" />, unit: "",
    warnThreshold: ">0", critThreshold: ">2",
    evaluate: (v) => v == null ? "ok" : v > 2 ? "critical" : v > 0 ? "warning" : "ok",
  },
  {
    key: "avg_mttr_min", icon: <Timer className="h-4 w-4" />, unit: "min",
    warnThreshold: ">30 min", critThreshold: ">60 min",
    evaluate: (v) => v == null ? "ok" : v > 60 ? "critical" : v > 30 ? "warning" : "ok",
  },
  {
    key: "backup_restore_test", icon: <DatabaseBackup className="h-4 w-4" />, unit: "",
    warnThreshold: "—", critThreshold: "not PASSED", isTextMetric: true,
    evaluate: (_v, text) => text && text !== "PASSED" ? "critical" : "ok",
  },
  {
    key: "hw_temp_trend", icon: <Thermometer className="h-4 w-4" />, unit: "",
    warnThreshold: "Rising", critThreshold: "—", isTextMetric: true,
    evaluate: (_v, text) => text && text.toLowerCase() === "rising" ? "warning" : "ok",
  },
  {
    key: "ram_ecc_errors", icon: <CircuitBoard className="h-4 w-4" />, unit: "",
    warnThreshold: ">0", critThreshold: ">0",
    evaluate: (v) => v == null ? "ok" : v > 0 ? "critical" : "ok",
  },
  {
    key: "smart_status", icon: <HardDriveDownload className="h-4 w-4" />, unit: "",
    warnThreshold: "—", critThreshold: "not PASSED", isTextMetric: true,
    evaluate: (_v, text) => text && text !== "PASSED" ? "critical" : "ok",
  },
  {
    key: "active_clients", icon: <Users className="h-4 w-4" />, unit: "",
    warnThreshold: "Track growth", critThreshold: "—",
    evaluate: () => "ok",
  },
  {
    key: "hosting_revenue_eur", icon: <Euro className="h-4 w-4" />, unit: "€",
    warnThreshold: "—", critThreshold: "—",
    evaluate: () => "ok",
  },
  {
    key: "capacity_ram_pct", icon: <Gauge className="h-4 w-4" />, unit: "%",
    warnThreshold: ">70%", critThreshold: ">90%",
    evaluate: (v) => v == null ? "ok" : v > 90 ? "critical" : v > 70 ? "warning" : "ok",
  },
  {
    key: "capacity_disk_pct", icon: <HardDrive className="h-4 w-4" />, unit: "%",
    warnThreshold: ">75%", critThreshold: ">90%",
    evaluate: (v) => v == null ? "ok" : v > 90 ? "critical" : v > 75 ? "warning" : "ok",
  },
  {
    key: "ssl_cert_review", icon: <Shield className="h-4 w-4" />, unit: "",
    warnThreshold: "any <30 days", critThreshold: "any expired", isTextMetric: true,
    evaluate: (_v, text) => {
      if (!text) return "ok";
      const lower = text.toLowerCase();
      if (lower.includes("expired") || lower === "fail") return "critical";
      if (lower.includes("warning") || lower.includes("<30")) return "warning";
      return "ok";
    },
  },
  {
    key: "security_scan", icon: <Search className="h-4 w-4" />, unit: "",
    warnThreshold: "—", critThreshold: "open ports found", isTextMetric: true,
    evaluate: (_v, text) => text && text !== "PASSED" ? "critical" : "ok",
  },
  {
    key: "log_archive_review", icon: <FileArchive className="h-4 w-4" />, unit: "",
    warnThreshold: "—", critThreshold: "not done", isTextMetric: true,
    evaluate: (_v, text) => text && text !== "DONE" ? "warning" : "ok",
  },
  {
    key: "hw_upgrade_assessment", icon: <ServerCrash className="h-4 w-4" />, unit: "",
    warnThreshold: "RAM>70% or Disk>75%", critThreshold: "—", isTextMetric: true,
    evaluate: (_v, text) => text && text.toLowerCase().includes("needed") ? "warning" : "ok",
  },
];

const statusColor = (s: string) => {
  if (s === "critical") return "destructive" as const;
  if (s === "warning") return "secondary" as const;
  return "default" as const;
};

const rowBg = (s: string) => {
  if (s === "critical") return "bg-destructive/10";
  if (s === "warning") return "bg-yellow-500/10";
  return "";
};

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i);

const ServerMonthlyDashboardTab = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [servers, setServers] = useState<ServerRow[]>([]);
  const [selectedServerId, setSelectedServerId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingMetric, setEditingMetric] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, { value: string; notes: string }>>({});
  const [saving, setSaving] = useState(false);

  const monthDate = format(new Date(selectedYear, selectedMonth, 1), "yyyy-MM-dd");

  useEffect(() => {
    supabase.from("servers").select("*").order("name").then(({ data }) => {
      if (data) {
        setServers(data);
        if (data.length > 0 && !selectedServerId) setSelectedServerId(data[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedServerId) return;
    const fetchMetrics = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("server_monthly_metrics")
        .select("*")
        .eq("server_id", selectedServerId)
        .eq("month", monthDate);
      setMetrics((data as MetricRow[]) || []);
      setLoading(false);
    };
    fetchMetrics();
  }, [selectedServerId, monthDate]);

  const getMetricData = (key: string) => metrics.find((m) => m.metric === key);

  const handleEdit = (key: string) => {
    const existing = getMetricData(key);
    setEditValues((prev) => ({
      ...prev,
      [key]: { value: existing?.value?.toString() ?? "", notes: existing?.notes ?? "" },
    }));
    setEditingMetric(key);
  };

  const handleSave = async (metricKey: string) => {
    if (!selectedServerId || !user) return;
    setSaving(true);
    const ev = editValues[metricKey];
    const existing = getMetricData(metricKey);
    const config = MONTHLY_METRICS.find((m) => m.key === metricKey)!;
    const numVal = config.isTextMetric ? null : parseFloat(ev.value);
    const textVal = config.isTextMetric ? ev.value : undefined;
    const computedStatus = config.evaluate(numVal, textVal);

    const payload = {
      server_id: selectedServerId,
      metric: metricKey,
      value: config.isTextMetric ? null : (isNaN(numVal!) ? null : numVal),
      status: computedStatus,
      notes: config.isTextMetric ? ev.value + (ev.notes ? ` | ${ev.notes}` : "") : (ev.notes || null),
      recorded_by: user.email || "admin",
      month: monthDate,
    };

    if (existing) {
      await supabase.from("server_monthly_metrics").update(payload).eq("id", existing.id);
    } else {
      await supabase.from("server_monthly_metrics").insert(payload);
    }

    const { data } = await supabase
      .from("server_monthly_metrics").select("*")
      .eq("server_id", selectedServerId).eq("month", monthDate);
    setMetrics((data as MetricRow[]) || []);
    setEditingMetric(null);
    setSaving(false);
    toast.success(t("admin.metricSaved"));
  };

  const displayValue = (config: MetricConfig, row?: MetricRow) => {
    if (!row) return "—";
    if (config.isTextMetric) return row.notes?.split(" | ")[0] || "—";
    return row.value != null ? `${row.value} ${config.unit}` : "—";
  };

  const displayNotes = (config: MetricConfig, row?: MetricRow) => {
    if (!row?.notes) return "";
    if (config.isTextMetric) {
      const parts = row.notes.split(" | ");
      return parts.length > 1 ? parts.slice(1).join(" | ") : "";
    }
    return row.notes;
  };

  // Summary counts
  const okCount = MONTHLY_METRICS.filter(c => (getMetricData(c.key)?.status || "ok") === "ok").length;
  const warnCount = MONTHLY_METRICS.filter(c => getMetricData(c.key)?.status === "warning").length;
  const critCount = MONTHLY_METRICS.filter(c => getMetricData(c.key)?.status === "critical").length;
  const filledCount = MONTHLY_METRICS.filter(c => getMetricData(c.key)).length;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {t("admin.monthlyDashboard")}
          </CardTitle>
          <CardDescription>{t("admin.monthlyDashboardDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">{t("admin.selectServer")}</label>
              <Select value={selectedServerId} onValueChange={setSelectedServerId}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder={t("admin.selectServer")} />
                </SelectTrigger>
                <SelectContent>
                  {servers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} {s.location && `(${s.location})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">{t("admin.selectMonth")}</label>
              <div className="flex gap-2">
                <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m} value={m.toString()}>{monthNames[m]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={() => {
              setLoading(true);
              supabase.from("server_monthly_metrics").select("*")
                .eq("server_id", selectedServerId).eq("month", monthDate)
                .then(({ data }) => { setMetrics((data as MetricRow[]) || []); setLoading(false); });
            }}>
              <RefreshCw className="h-4 w-4 mr-1" />{t("admin.refresh")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-green-500">{okCount}</div>
            <div className="text-xs text-muted-foreground">OK</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-yellow-500">{warnCount}</div>
            <div className="text-xs text-muted-foreground">Warning</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-destructive">{critCount}</div>
            <div className="text-xs text-muted-foreground">Critical</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold">{filledCount}/{MONTHLY_METRICS.length}</div>
            <div className="text-xs text-muted-foreground">{t("admin.metricsFilled")}</div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : servers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("admin.noServers")}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[240px]">{t("admin.metric")}</TableHead>
                    <TableHead className="w-[180px]">{t("admin.thresholds")}</TableHead>
                    <TableHead className="w-[140px]">{t("admin.recordedValue")}</TableHead>
                    <TableHead className="w-[100px]">{t("dash.status")}</TableHead>
                    <TableHead>{t("admin.notes")}</TableHead>
                    <TableHead className="w-[120px]">{t("admin.recordedBy")}</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MONTHLY_METRICS.map((config) => {
                    const row = getMetricData(config.key);
                    const status = row?.status || "ok";
                    const isEditing = editingMetric === config.key;

                    return (
                      <TableRow key={config.key} className={rowBg(status)}>
                        <TableCell>
                          <div className="flex items-center gap-2 font-medium">
                            {config.icon}
                            {t(`admin.monthly.${config.key}`)}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <div>W: {config.warnThreshold}</div>
                          <div>C: {config.critThreshold}</div>
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editValues[config.key]?.value ?? ""}
                              onChange={(e) => setEditValues((p) => ({ ...p, [config.key]: { ...p[config.key], value: e.target.value } }))}
                              className="h-8 w-[120px]"
                              placeholder={config.isTextMetric ? "PASSED" : "0"}
                            />
                          ) : (
                            <span className="font-mono text-sm">{displayValue(config, row)}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColor(status)}>{status.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editValues[config.key]?.notes ?? ""}
                              onChange={(e) => setEditValues((p) => ({ ...p, [config.key]: { ...p[config.key], notes: e.target.value } }))}
                              className="h-8" placeholder={t("admin.notes")}
                            />
                          ) : (
                            <span className="text-sm text-muted-foreground">{displayNotes(config, row)}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{row?.recorded_by || "—"}</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Button size="sm" variant="ghost" onClick={() => handleSave(config.key)} disabled={saving}>
                              <Save className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(config.key)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServerMonthlyDashboardTab;
