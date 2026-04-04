import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  CalendarIcon, Cpu, MemoryStick, HardDrive, Thermometer, Clock, Globe,
  Network, ShieldAlert, DatabaseBackup, Activity, Wifi, Search, Shield,
  Server as ServerIcon, Database, Mail, RefreshCw, Plus, Save, Pencil, Loader2
} from "lucide-react";

interface ServerRow {
  id: string;
  name: string;
  location: string;
}

interface MetricRow {
  id: string;
  server_id: string;
  metric: string;
  value: number | null;
  status: string;
  notes: string | null;
  recorded_by: string | null;
  date: string;
}

interface MetricConfig {
  key: string;
  icon: React.ReactNode;
  unit: string;
  warnThreshold: string;
  critThreshold: string;
  isTextMetric?: boolean;
  evaluate: (val: number | null, textVal?: string) => "ok" | "warning" | "critical";
}

const METRICS: MetricConfig[] = [
  {
    key: "cpu_usage", icon: <Cpu className="h-4 w-4" />, unit: "%",
    warnThreshold: ">70%", critThreshold: ">90%",
    evaluate: (v) => v == null ? "ok" : v > 90 ? "critical" : v > 70 ? "warning" : "ok",
  },
  {
    key: "ram_usage", icon: <MemoryStick className="h-4 w-4" />, unit: "%",
    warnThreshold: ">75%", critThreshold: ">90%",
    evaluate: (v) => v == null ? "ok" : v > 90 ? "critical" : v > 75 ? "warning" : "ok",
  },
  {
    key: "disk_usage", icon: <HardDrive className="h-4 w-4" />, unit: "%",
    warnThreshold: ">80%", critThreshold: ">95%",
    evaluate: (v) => v == null ? "ok" : v > 95 ? "critical" : v > 80 ? "warning" : "ok",
  },
  {
    key: "cpu_temp", icon: <Thermometer className="h-4 w-4" />, unit: "°C",
    warnThreshold: ">70°C", critThreshold: ">85°C",
    evaluate: (v) => v == null ? "ok" : v > 85 ? "critical" : v > 70 ? "warning" : "ok",
  },
  {
    key: "uptime", icon: <Clock className="h-4 w-4" />, unit: "%",
    warnThreshold: "<100%", critThreshold: "<100%",
    evaluate: (v) => v == null ? "ok" : v < 100 ? "critical" : "ok",
  },
  {
    key: "active_sites", icon: <Globe className="h-4 w-4" />, unit: "",
    warnThreshold: "any offline", critThreshold: "—",
    evaluate: () => "ok", // status set manually
  },
  {
    key: "network_traffic_gb", icon: <Network className="h-4 w-4" />, unit: "GB",
    warnThreshold: ">50 GB/day", critThreshold: "—",
    evaluate: (v) => v == null ? "ok" : v > 50 ? "warning" : "ok",
  },
  {
    key: "failed_logins", icon: <ShieldAlert className="h-4 w-4" />, unit: "",
    warnThreshold: ">50", critThreshold: ">200",
    evaluate: (v) => v == null ? "ok" : v > 200 ? "critical" : v > 50 ? "warning" : "ok",
  },
  {
    key: "backup_status", icon: <DatabaseBackup className="h-4 w-4" />, unit: "",
    warnThreshold: "—", critThreshold: "not SUCCESS", isTextMetric: true,
    evaluate: (_v, text) => text && text !== "SUCCESS" ? "critical" : "ok",
  },
  {
    key: "load_average", icon: <Activity className="h-4 w-4" />, unit: "",
    warnThreshold: ">8", critThreshold: ">14",
    evaluate: (v) => v == null ? "ok" : v > 14 ? "critical" : v > 8 ? "warning" : "ok",
  },
  {
    key: "ping_latency_ms", icon: <Wifi className="h-4 w-4" />, unit: "ms",
    warnThreshold: ">50ms", critThreshold: ">100ms",
    evaluate: (v) => v == null ? "ok" : v > 100 ? "critical" : v > 50 ? "warning" : "ok",
  },
  {
    key: "dns_resolution", icon: <Search className="h-4 w-4" />, unit: "",
    warnThreshold: "—", critThreshold: "fail", isTextMetric: true,
    evaluate: (_v, text) => text && text.toLowerCase() === "fail" ? "critical" : "ok",
  },
  {
    key: "ssl_days_remaining", icon: <Shield className="h-4 w-4" />, unit: "days",
    warnThreshold: "<14 days", critThreshold: "—",
    evaluate: (v) => v == null ? "ok" : v < 14 ? "warning" : "ok",
  },
  {
    key: "apache_status", icon: <ServerIcon className="h-4 w-4" />, unit: "",
    warnThreshold: "—", critThreshold: "not RUNNING", isTextMetric: true,
    evaluate: (_v, text) => text && text !== "RUNNING" ? "critical" : "ok",
  },
  {
    key: "mysql_status", icon: <Database className="h-4 w-4" />, unit: "",
    warnThreshold: "—", critThreshold: "not RUNNING", isTextMetric: true,
    evaluate: (_v, text) => text && text !== "RUNNING" ? "critical" : "ok",
  },
  {
    key: "mail_status", icon: <Mail className="h-4 w-4" />, unit: "",
    warnThreshold: "—", critThreshold: "not RUNNING", isTextMetric: true,
    evaluate: (_v, text) => text && text !== "RUNNING" ? "critical" : "ok",
  },
  {
    key: "free_ram_gb", icon: <MemoryStick className="h-4 w-4" />, unit: "GB",
    warnThreshold: "<50 GB", critThreshold: "<20 GB",
    evaluate: (v) => v == null ? "ok" : v < 20 ? "critical" : v < 50 ? "warning" : "ok",
  },
  {
    key: "swap_usage", icon: <Activity className="h-4 w-4" />, unit: "%",
    warnThreshold: ">30%", critThreshold: ">60%",
    evaluate: (v) => v == null ? "ok" : v > 60 ? "critical" : v > 30 ? "warning" : "ok",
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

const ServerDailyDashboardTab = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [servers, setServers] = useState<ServerRow[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingMetric, setEditingMetric] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, { value: string; notes: string }>>({});
  const [saving, setSaving] = useState(false);
  const [addingServer, setAddingServer] = useState(false);
  const [newServerName, setNewServerName] = useState("");
  const [newServerLocation, setNewServerLocation] = useState("");

  // Fetch servers
  useEffect(() => {
    const fetchServers = async () => {
      const { data } = await supabase.from("servers").select("*").order("name");
      if (data) {
        setServers(data);
        if (data.length > 0 && !selectedServerId) setSelectedServerId(data[0].id);
      }
    };
    fetchServers();
  }, []);

  // Fetch metrics for selected server + date
  useEffect(() => {
    if (!selectedServerId) return;
    const fetchMetrics = async () => {
      setLoading(true);
      const dateStr = format(date, "yyyy-MM-dd");
      const { data } = await supabase
        .from("server_daily_metrics")
        .select("*")
        .eq("server_id", selectedServerId)
        .eq("date", dateStr);
      setMetrics((data as MetricRow[]) || []);
      setLoading(false);
    };
    fetchMetrics();
  }, [selectedServerId, date]);

  const getMetricData = (key: string): MetricRow | undefined =>
    metrics.find((m) => m.metric === key);

  const handleEdit = (key: string) => {
    const existing = getMetricData(key);
    setEditValues((prev) => ({
      ...prev,
      [key]: {
        value: existing?.value?.toString() ?? "",
        notes: existing?.notes ?? "",
      },
    }));
    setEditingMetric(key);
  };

  const handleSave = async (metricKey: string) => {
    if (!selectedServerId || !user) return;
    setSaving(true);
    const ev = editValues[metricKey];
    const existing = getMetricData(metricKey);
    const config = METRICS.find((m) => m.key === metricKey)!;
    const numVal = config.isTextMetric ? null : parseFloat(ev.value);
    const textVal = config.isTextMetric ? ev.value : undefined;
    const computedStatus = config.evaluate(numVal, textVal);
    const dateStr = format(date, "yyyy-MM-dd");

    const payload = {
      server_id: selectedServerId,
      metric: metricKey,
      value: config.isTextMetric ? null : (isNaN(numVal!) ? null : numVal),
      status: computedStatus,
      notes: config.isTextMetric ? ev.value + (ev.notes ? ` | ${ev.notes}` : "") : (ev.notes || null),
      recorded_by: user.email || "admin",
      date: dateStr,
    };

    if (existing) {
      await supabase.from("server_daily_metrics").update(payload).eq("id", existing.id);
    } else {
      await supabase.from("server_daily_metrics").insert(payload);
    }

    // Refresh
    const { data } = await supabase
      .from("server_daily_metrics")
      .select("*")
      .eq("server_id", selectedServerId)
      .eq("date", dateStr);
    setMetrics((data as MetricRow[]) || []);
    setEditingMetric(null);
    setSaving(false);
    toast.success(t("admin.metricSaved"));
  };

  const handleAddServer = async () => {
    if (!newServerName.trim()) return;
    const { error } = await supabase.from("servers").insert({
      name: newServerName.trim(),
      location: newServerLocation.trim(),
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    const { data } = await supabase.from("servers").select("*").order("name");
    if (data) {
      setServers(data);
      const added = data.find((s) => s.name === newServerName.trim());
      if (added) setSelectedServerId(added.id);
    }
    setNewServerName("");
    setNewServerLocation("");
    setAddingServer(false);
    toast.success(t("admin.serverAdded"));
  };

  const displayValue = (config: MetricConfig, row?: MetricRow) => {
    if (!row) return "—";
    if (config.isTextMetric) {
      // For text metrics, value stored in notes
      return row.notes?.split(" | ")[0] || "—";
    }
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

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ServerIcon className="h-5 w-5" />
            {t("admin.serverDashboard")}
          </CardTitle>
          <CardDescription>{t("admin.serverDashboardDesc")}</CardDescription>
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
              <label className="text-sm font-medium text-muted-foreground">{t("admin.selectDate")}</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[200px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button variant="outline" size="sm" onClick={() => setAddingServer(!addingServer)}>
              <Plus className="h-4 w-4 mr-1" />{t("admin.addServer")}
            </Button>

            <Button variant="outline" size="sm" onClick={() => {
              setLoading(true);
              supabase
                .from("server_daily_metrics")
                .select("*")
                .eq("server_id", selectedServerId)
                .eq("date", format(date, "yyyy-MM-dd"))
                .then(({ data }) => {
                  setMetrics((data as MetricRow[]) || []);
                  setLoading(false);
                });
            }}>
              <RefreshCw className="h-4 w-4 mr-1" />{t("admin.refresh")}
            </Button>
          </div>

          {addingServer && (
            <div className="mt-4 flex flex-wrap gap-2 items-end p-4 border rounded-lg bg-muted/30">
              <div className="space-y-1">
                <label className="text-xs font-medium">{t("admin.serverName")}</label>
                <Input value={newServerName} onChange={(e) => setNewServerName(e.target.value)} placeholder="EU-Frankfurt-01" className="w-[200px]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">{t("admin.serverLocation")}</label>
                <Input value={newServerLocation} onChange={(e) => setNewServerLocation(e.target.value)} placeholder="Frankfurt, DE" className="w-[200px]" />
              </div>
              <Button size="sm" onClick={handleAddServer}><Plus className="h-4 w-4 mr-1" />{t("admin.addServer")}</Button>
            </div>
          )}
        </CardContent>
      </Card>

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
                    <TableHead className="w-[220px]">{t("admin.metric")}</TableHead>
                    <TableHead className="w-[180px]">{t("admin.thresholds")}</TableHead>
                    <TableHead className="w-[140px]">{t("admin.recordedValue")}</TableHead>
                    <TableHead className="w-[100px]">{t("dash.status")}</TableHead>
                    <TableHead>{t("admin.notes")}</TableHead>
                    <TableHead className="w-[120px]">{t("admin.recordedBy")}</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {METRICS.map((config) => {
                    const row = getMetricData(config.key);
                    const status = row?.status || "ok";
                    const isEditing = editingMetric === config.key;

                    return (
                      <TableRow key={config.key} className={rowBg(status)}>
                        <TableCell>
                          <div className="flex items-center gap-2 font-medium">
                            {config.icon}
                            {t(`admin.metric.${config.key}`)}
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
                              placeholder={config.isTextMetric ? "RUNNING" : "0"}
                            />
                          ) : (
                            <span className="font-mono text-sm">{displayValue(config, row)}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColor(status)}>
                            {status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editValues[config.key]?.notes ?? ""}
                              onChange={(e) => setEditValues((p) => ({ ...p, [config.key]: { ...p[config.key], notes: e.target.value } }))}
                              className="h-8"
                              placeholder={t("admin.notes")}
                            />
                          ) : (
                            <span className="text-sm text-muted-foreground">{displayNotes(config, row)}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {row?.recorded_by || "—"}
                        </TableCell>
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

export default ServerDailyDashboardTab;
