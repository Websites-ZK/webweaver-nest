import { useEffect, useState, useMemo, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, endOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Clock, Cpu, MemoryStick, HardDrive, Network, AlertTriangle, Timer,
  DatabaseBackup, Thermometer, CircuitBoard, HardDriveDownload, Users,
  Euro, Gauge, Shield, Search, FileArchive, ServerCrash,
  RefreshCw, Save, Pencil, Loader2, CalendarDays, Zap, Download
} from "lucide-react";

interface ServerRow { id: string; name: string; location: string; }

interface MetricRow {
  id: string; server_id: string; metric: string; value: number | null;
  status: string; notes: string | null; recorded_by: string | null; month: string;
}

interface DailyMetricRow {
  metric: string; value: number | null; date: string; notes: string | null;
}

interface MetricConfig {
  key: string; icon: React.ReactNode; unit: string;
  warnThreshold: string; critThreshold: string; isTextMetric?: boolean;
  autoFromDaily?: string; // daily metric key to aggregate from
  aggregation?: "avg" | "sum" | "delta" | "count_below" | "trend" | "last";
  countBelowValue?: number;
  evaluate: (val: number | null, textVal?: string) => "ok" | "warning" | "critical";
}

const MONTHLY_METRICS: MetricConfig[] = [
  {
    key: "monthly_uptime", icon: <Clock className="h-4 w-4" />, unit: "%",
    warnThreshold: "<99.9%", critThreshold: "<99.5%",
    autoFromDaily: "uptime", aggregation: "avg",
    evaluate: (v) => v == null ? "ok" : v < 99.5 ? "critical" : v < 99.9 ? "warning" : "ok",
  },
  {
    key: "avg_cpu_month", icon: <Cpu className="h-4 w-4" />, unit: "%",
    warnThreshold: ">55%", critThreshold: ">80%",
    autoFromDaily: "cpu_usage", aggregation: "avg",
    evaluate: (v) => v == null ? "ok" : v > 80 ? "critical" : v > 55 ? "warning" : "ok",
  },
  {
    key: "avg_ram_month", icon: <MemoryStick className="h-4 w-4" />, unit: "%",
    warnThreshold: ">65%", critThreshold: ">85%",
    autoFromDaily: "ram_usage", aggregation: "avg",
    evaluate: (v) => v == null ? "ok" : v > 85 ? "critical" : v > 65 ? "warning" : "ok",
  },
  {
    key: "total_traffic_gb", icon: <Network className="h-4 w-4" />, unit: "GB",
    warnThreshold: "Track growth", critThreshold: "—",
    autoFromDaily: "network_traffic_gb", aggregation: "sum",
    evaluate: () => "ok",
  },
  {
    key: "disk_growth_gb", icon: <HardDrive className="h-4 w-4" />, unit: "GB",
    warnThreshold: ">50 GB", critThreshold: ">100 GB",
    autoFromDaily: "disk_usage", aggregation: "delta",
    evaluate: (v) => v == null ? "ok" : v > 100 ? "critical" : v > 50 ? "warning" : "ok",
  },
  {
    key: "total_incidents", icon: <AlertTriangle className="h-4 w-4" />, unit: "",
    warnThreshold: ">0", critThreshold: ">2",
    autoFromDaily: "uptime", aggregation: "count_below", countBelowValue: 100,
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
    autoFromDaily: "cpu_temp", aggregation: "trend",
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
    autoFromDaily: "ram_usage", aggregation: "last",
    evaluate: (v) => v == null ? "ok" : v > 90 ? "critical" : v > 70 ? "warning" : "ok",
  },
  {
    key: "capacity_disk_pct", icon: <HardDrive className="h-4 w-4" />, unit: "%",
    warnThreshold: ">75%", critThreshold: ">90%",
    autoFromDaily: "disk_usage", aggregation: "last",
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

// Aggregate daily metrics into a single computed value
function aggregateDaily(
  dailyRows: DailyMetricRow[],
  config: MetricConfig
): { value: number | null; textValue?: string } {
  const key = config.autoFromDaily!;
  const rows = dailyRows.filter(r => r.metric === key && r.value != null);
  if (rows.length === 0) return { value: null };

  const values = rows.map(r => r.value!);

  switch (config.aggregation) {
    case "avg": {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return { value: Math.round(avg * 100) / 100 };
    }
    case "sum": {
      return { value: Math.round(values.reduce((a, b) => a + b, 0) * 100) / 100 };
    }
    case "delta": {
      return { value: Math.round((Math.max(...values) - Math.min(...values)) * 100) / 100 };
    }
    case "count_below": {
      const threshold = config.countBelowValue ?? 100;
      return { value: values.filter(v => v < threshold).length };
    }
    case "trend": {
      const half = Math.floor(rows.length / 2);
      if (half === 0) return { value: null, textValue: "STABLE" };
      const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
      const firstHalf = sorted.slice(0, half).map(r => r.value!);
      const secondHalf = sorted.slice(half).map(r => r.value!);
      const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      const diff = avg2 - avg1;
      const trend = diff > 2 ? "RISING" : diff < -2 ? "FALLING" : "STABLE";
      return { value: null, textValue: trend };
    }
    case "last": {
      const sorted = [...rows].sort((a, b) => b.date.localeCompare(a.date));
      return { value: sorted[0].value };
    }
    default:
      return { value: null };
  }
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const ServerMonthlyDashboardTab = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [servers, setServers] = useState<ServerRow[]>([]);
  const [selectedServerId, setSelectedServerId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [manualMetrics, setManualMetrics] = useState<MetricRow[]>([]);
  const [dailyRows, setDailyRows] = useState<DailyMetricRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingMetric, setEditingMetric] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, { value: string; notes: string }>>({});
  const [saving, setSaving] = useState(false);

  const monthDate = format(new Date(selectedYear, selectedMonth, 1), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(new Date(selectedYear, selectedMonth, 1)), "yyyy-MM-dd");

  // Load servers
  useEffect(() => {
    supabase.from("servers").select("*").order("name").then(({ data }) => {
      if (data) {
        setServers(data);
        if (data.length > 0 && !selectedServerId) setSelectedServerId(data[0].id);
      }
    });
  }, []);

  // Load manual metrics + daily metrics in parallel
  useEffect(() => {
    if (!selectedServerId) return;
    setLoading(true);

    const fetchManual = supabase
      .from("server_monthly_metrics")
      .select("*")
      .eq("server_id", selectedServerId)
      .eq("month", monthDate);

    const fetchDaily = supabase
      .from("server_daily_metrics")
      .select("metric, value, date, notes")
      .eq("server_id", selectedServerId)
      .gte("date", monthDate)
      .lte("date", monthEnd);

    Promise.all([fetchManual, fetchDaily]).then(([manualRes, dailyRes]) => {
      setManualMetrics((manualRes.data as MetricRow[]) || []);
      setDailyRows((dailyRes.data as DailyMetricRow[]) || []);
      setLoading(false);
    });
  }, [selectedServerId, monthDate, monthEnd]);

  // Compute auto-aggregated values from daily data
  const autoValues = useMemo(() => {
    const result: Record<string, { value: number | null; textValue?: string; status: string }> = {};
    for (const config of MONTHLY_METRICS) {
      if (!config.autoFromDaily) continue;
      const agg = aggregateDaily(dailyRows, config);
      const status = config.evaluate(agg.value, agg.textValue);
      result[config.key] = { ...agg, status };
    }
    // Auto-compute hw_upgrade_assessment from capacity values
    const ramPct = result["capacity_ram_pct"]?.value;
    const diskPct = result["capacity_disk_pct"]?.value;
    if (ramPct != null || diskPct != null) {
      const needed = (ramPct != null && ramPct > 70) || (diskPct != null && diskPct > 75);
      const text = needed ? "UPGRADE NEEDED" : "OK";
      const hwConfig = MONTHLY_METRICS.find(m => m.key === "hw_upgrade_assessment")!;
      result["hw_upgrade_assessment"] = {
        value: null,
        textValue: text,
        status: hwConfig.evaluate(null, text),
      };
    }
    return result;
  }, [dailyRows]);

  const getManualData = (key: string) => manualMetrics.find((m) => m.metric === key);

  const isAutoMetric = (key: string) => key in autoValues;
  const hasAutoData = (key: string) => {
    const av = autoValues[key];
    return av && (av.value != null || av.textValue != null);
  };

  const handleEdit = (key: string) => {
    const existing = getManualData(key);
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
    const existing = getManualData(metricKey);
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
    setManualMetrics((data as MetricRow[]) || []);
    setEditingMetric(null);
    setSaving(false);
    toast.success(t("admin.metricSaved"));
  };

  // For display: auto metrics use computed values, manual metrics use DB values
  const getDisplayValue = (config: MetricConfig): string => {
    if (isAutoMetric(config.key) && hasAutoData(config.key)) {
      const av = autoValues[config.key];
      if (config.isTextMetric || config.aggregation === "trend") return av.textValue || "—";
      return av.value != null ? `${av.value} ${config.unit}` : "—";
    }
    const row = getManualData(config.key);
    if (!row) return "—";
    if (config.isTextMetric) return row.notes?.split(" | ")[0] || "—";
    return row.value != null ? `${row.value} ${config.unit}` : "—";
  };

  const getDisplayStatus = (config: MetricConfig): string => {
    if (isAutoMetric(config.key) && hasAutoData(config.key)) {
      return autoValues[config.key].status;
    }
    return getManualData(config.key)?.status || "ok";
  };

  const getDisplayNotes = (config: MetricConfig): string => {
    if (isAutoMetric(config.key) && hasAutoData(config.key)) {
      // For auto metrics, show how many daily data points were used
      const key = config.autoFromDaily!;
      const count = dailyRows.filter(r => r.metric === key && r.value != null).length;
      return count > 0 ? `${count} daily records` : "";
    }
    const row = getManualData(config.key);
    if (!row?.notes) return "";
    if (config.isTextMetric) {
      const parts = row.notes.split(" | ");
      return parts.length > 1 ? parts.slice(1).join(" | ") : "";
    }
    return row.notes;
  };

  const getRecordedBy = (config: MetricConfig): string => {
    if (isAutoMetric(config.key) && hasAutoData(config.key)) return "auto";
    return getManualData(config.key)?.recorded_by || "—";
  };

  // Summary counts
  const statusList = MONTHLY_METRICS.map(c => getDisplayStatus(c));
  const okCount = statusList.filter(s => s === "ok").length;
  const warnCount = statusList.filter(s => s === "warning").length;
  const critCount = statusList.filter(s => s === "critical").length;

  const autoFilledCount = MONTHLY_METRICS.filter(c => isAutoMetric(c.key) && hasAutoData(c.key)).length;
  const manualFilledCount = MONTHLY_METRICS.filter(c => !isAutoMetric(c.key) && getManualData(c.key)).length;
  const filledCount = autoFilledCount + manualFilledCount;

  const refresh = () => {
    if (!selectedServerId) return;
    setLoading(true);
    const fetchManual = supabase
      .from("server_monthly_metrics").select("*")
      .eq("server_id", selectedServerId).eq("month", monthDate);
    const fetchDaily = supabase
      .from("server_daily_metrics").select("metric, value, date, notes")
      .eq("server_id", selectedServerId).gte("date", monthDate).lte("date", monthEnd);
    Promise.all([fetchManual, fetchDaily]).then(([manualRes, dailyRes]) => {
      setManualMetrics((manualRes.data as MetricRow[]) || []);
      setDailyRows((dailyRes.data as DailyMetricRow[]) || []);
      setLoading(false);
    });
  };

  const exportPDF = useCallback(() => {
    const serverName = servers.find(s => s.id === selectedServerId)?.name || "Server";
    const serverLoc = servers.find(s => s.id === selectedServerId)?.location || "";
    const monthLabel = `${monthNames[selectedMonth]} ${selectedYear}`;

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Monthly Server Report", 14, 18);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Server: ${serverName}${serverLoc ? ` (${serverLoc})` : ""}`, 14, 26);
    doc.text(`Period: ${monthLabel}`, 14, 32);
    doc.text(`Generated: ${format(new Date(), "yyyy-MM-dd HH:mm")}`, 14, 38);

    // Summary line
    doc.setFontSize(10);
    doc.text(
      `OK: ${okCount}  |  Warning: ${warnCount}  |  Critical: ${critCount}  |  Filled: ${filledCount}/${MONTHLY_METRICS.length}`,
      14, 46
    );

    // Table data
    const tableRows = MONTHLY_METRICS.map((config) => {
      const status = getDisplayStatus(config);
      const value = getDisplayValue(config);
      const notes = getDisplayNotes(config);
      const source = (isAutoMetric(config.key) && hasAutoData(config.key)) ? "Auto" : "Manual";
      const recordedBy = getRecordedBy(config);
      return [
        t(`admin.monthly.${config.key}`),
        `W: ${config.warnThreshold} / C: ${config.critThreshold}`,
        value,
        status.toUpperCase(),
        source,
        notes,
        recordedBy,
      ];
    });

    autoTable(doc, {
      startY: 50,
      head: [["Metric", "Thresholds", "Value", "Status", "Source", "Notes", "Recorded By"]],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [88, 80, 236], fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 7.5 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 42 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: 16 },
        5: { cellWidth: 70 },
        6: { cellWidth: 30 },
      },
      didParseCell: (data: any) => {
        if (data.section === "body" && data.column.index === 3) {
          const val = data.cell.raw as string;
          if (val === "CRITICAL") {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = "bold";
          } else if (val === "WARNING") {
            data.cell.styles.textColor = [202, 138, 4];
            data.cell.styles.fontStyle = "bold";
          } else if (val === "OK") {
            data.cell.styles.textColor = [22, 163, 74];
          }
        }
      },
      margin: { left: 14, right: 14 },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(`Page ${i} of ${pageCount}`, pageW - 30, doc.internal.pageSize.getHeight() - 8);
      doc.text("WebWeaver Monthly Report", 14, doc.internal.pageSize.getHeight() - 8);
    }

    doc.save(`monthly-report-${serverName}-${monthLabel.replace(" ", "-")}.pdf`);
    toast.success("PDF exported");
  }, [servers, selectedServerId, selectedMonth, selectedYear, okCount, warnCount, critCount, filledCount, autoValues, manualMetrics, dailyRows, t]);

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

            <Button variant="outline" size="sm" onClick={refresh}>
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
                    const status = getDisplayStatus(config);
                    const isAuto = isAutoMetric(config.key) && hasAutoData(config.key);
                    const isEditing = editingMetric === config.key;
                    const isManualOnly = !config.autoFromDaily && config.key !== "hw_upgrade_assessment";

                    return (
                      <TableRow key={config.key} className={rowBg(status)}>
                        <TableCell>
                          <div className="flex items-center gap-2 font-medium">
                            {config.icon}
                            {t(`admin.monthly.${config.key}`)}
                            {isAuto && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 gap-0.5 border-primary/30 text-primary">
                                <Zap className="h-2.5 w-2.5" />
                                {t("admin.autoCalculated")}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <div>W: {config.warnThreshold}</div>
                          <div>C: {config.critThreshold}</div>
                        </TableCell>
                        <TableCell>
                          {isEditing && isManualOnly ? (
                            <Input
                              value={editValues[config.key]?.value ?? ""}
                              onChange={(e) => setEditValues((p) => ({ ...p, [config.key]: { ...p[config.key], value: e.target.value } }))}
                              className="h-8 w-[120px]"
                              placeholder={config.isTextMetric ? "PASSED" : "0"}
                            />
                          ) : (
                            <span className="font-mono text-sm">{getDisplayValue(config)}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColor(status)}>{status.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>
                          {isEditing && isManualOnly ? (
                            <Input
                              value={editValues[config.key]?.notes ?? ""}
                              onChange={(e) => setEditValues((p) => ({ ...p, [config.key]: { ...p[config.key], notes: e.target.value } }))}
                              className="h-8" placeholder={t("admin.notes")}
                            />
                          ) : (
                            <span className="text-sm text-muted-foreground">{getDisplayNotes(config)}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{getRecordedBy(config)}</TableCell>
                        <TableCell>
                          {isManualOnly && !isEditing && (
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(config.key)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {isManualOnly && isEditing && (
                            <Button size="sm" variant="ghost" onClick={() => handleSave(config.key)} disabled={saving}>
                              <Save className="h-4 w-4" />
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
