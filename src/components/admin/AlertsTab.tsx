import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, AlertTriangle, Info, XCircle, Settings2, Cpu, HardDrive, Wifi, MemoryStick } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  message: string;
  is_resolved: boolean;
  created_at: string;
  resolved_at: string | null;
}

interface Threshold {
  id: string;
  metric: string;
  threshold_percent: number;
  severity: string;
  is_enabled: boolean;
}

const severityIcon = (s: string) => {
  if (s === "critical") return <XCircle className="h-4 w-4 text-destructive" />;
  if (s === "warning") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  return <Info className="h-4 w-4 text-blue-500" />;
};

const metricIcon = (m: string) => {
  if (m === "cpu") return <Cpu className="h-4 w-4" />;
  if (m === "ram") return <MemoryStick className="h-4 w-4" />;
  if (m === "disk") return <HardDrive className="h-4 w-4" />;
  if (m === "bandwidth") return <Wifi className="h-4 w-4" />;
  return <Settings2 className="h-4 w-4" />;
};

const AlertsTab = () => {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [checkingResources, setCheckingResources] = useState(false);

  const fetchAlerts = async () => {
    const query = supabase.from("admin_alerts").select("*").order("created_at", { ascending: false }).limit(100);
    const { data } = filter === "active"
      ? await query.eq("is_resolved", false)
      : filter === "resolved"
        ? await query.eq("is_resolved", true)
        : await query;
    if (data) setAlerts(data);
    setLoading(false);
  };

  const fetchThresholds = async () => {
    const { data } = await supabase
      .from("alert_thresholds")
      .select("*")
      .order("metric", { ascending: true });
    if (data) setThresholds(data as Threshold[]);
  };

  useEffect(() => { fetchAlerts(); }, [filter]);
  useEffect(() => { fetchThresholds(); }, []);

  const resolveAlert = async (id: string) => {
    await supabase.from("admin_alerts").update({ is_resolved: true, resolved_at: new Date().toISOString() }).eq("id", id);
    fetchAlerts();
  };

  const toggleThreshold = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("alert_thresholds")
      .update({ is_enabled: !currentValue, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (!error) {
      setThresholds(prev => prev.map(t => t.id === id ? { ...t, is_enabled: !currentValue } : t));
      toast.success(t("admin.thresholdUpdated"));
    }
  };

  const saveThresholdPercent = async (id: string) => {
    if (editValue < 1 || editValue > 100) {
      toast.error(t("admin.thresholdInvalid"));
      return;
    }
    const { error } = await supabase
      .from("alert_thresholds")
      .update({ threshold_percent: editValue, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (!error) {
      setThresholds(prev => prev.map(t => t.id === id ? { ...t, threshold_percent: editValue } : t));
      setEditingId(null);
      toast.success(t("admin.thresholdUpdated"));
    }
  };

  const runResourceCheck = async () => {
    setCheckingResources(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-resource-alerts");
      if (error) throw error;
      toast.success(`${t("admin.resourceCheckDone")}: ${data?.alerts_created || 0} ${t("admin.alertsCreated")}`);
      fetchAlerts();
    } catch (e) {
      toast.error(t("admin.resourceCheckFailed"));
    } finally {
      setCheckingResources(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      {/* Threshold Configuration */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                {t("admin.thresholdSettings")}
              </CardTitle>
              <CardDescription>{t("admin.thresholdSettingsDesc")}</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={runResourceCheck}
              disabled={checkingResources}
            >
              {checkingResources && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              {t("admin.runResourceCheck")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.metric")}</TableHead>
                <TableHead>{t("admin.thresholdPercent")}</TableHead>
                <TableHead>{t("admin.severity")}</TableHead>
                <TableHead>{t("admin.enabled")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {thresholds.map((th) => (
                <TableRow key={th.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {metricIcon(th.metric)}
                      <span className="font-medium uppercase">{th.metric}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingId === th.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          value={editValue}
                          onChange={(e) => setEditValue(Number(e.target.value))}
                          className="w-20 h-8"
                        />
                        <Button size="sm" variant="outline" onClick={() => saveThresholdPercent(th.id)}>
                          ✓
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          ✗
                        </Button>
                      </div>
                    ) : (
                      <button
                        className="text-sm font-mono hover:underline cursor-pointer"
                        onClick={() => { setEditingId(th.id); setEditValue(th.threshold_percent); }}
                      >
                        {th.threshold_percent}%
                      </button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={th.severity === "critical" ? "destructive" : "secondary"}>
                      {th.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={th.is_enabled}
                      onCheckedChange={() => toggleThreshold(th.id, th.is_enabled)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="active">{t("admin.activeAlerts")}</TabsTrigger>
          <TabsTrigger value="resolved">{t("admin.resolvedAlerts")}</TabsTrigger>
          <TabsTrigger value="all">{t("admin.allAlerts")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {alerts.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center text-muted-foreground">
            <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
            {t("admin.noAlerts")}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <Card key={alert.id} className="border-border/50">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-start gap-3">
                  {severityIcon(alert.severity)}
                  <div>
                    <p className="text-sm font-medium text-foreground">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{alert.alert_type}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                {!alert.is_resolved && (
                  <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>
                    {t("admin.resolve")}
                  </Button>
                )}
                {alert.is_resolved && (
                  <Badge variant="secondary">{t("admin.resolved")}</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsTab;
