import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  message: string;
  is_resolved: boolean;
  created_at: string;
  resolved_at: string | null;
}

const severityIcon = (s: string) => {
  if (s === "critical") return <XCircle className="h-4 w-4 text-destructive" />;
  if (s === "warning") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  return <Info className="h-4 w-4 text-blue-500" />;
};

const AlertsTab = () => {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");

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

  useEffect(() => { fetchAlerts(); }, [filter]);

  const resolveAlert = async (id: string) => {
    await supabase.from("admin_alerts").update({ is_resolved: true, resolved_at: new Date().toISOString() }).eq("id", id);
    fetchAlerts();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
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
