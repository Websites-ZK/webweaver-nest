import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cpu, FolderOpen, DatabaseBackup, Globe, Shield, RotateCcw, Power, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import UsageBar from "./UsageBar";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface HostingTabProps {
  hostingPlans: any[];
}

const HostingTab = ({ hostingPlans }: HostingTabProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [healingPlanId, setHealingPlanId] = useState<string | null>(null);
  const [healingAction, setHealingAction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentActions, setRecentActions] = useState<any[]>([]);

  const fetchRecentActions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("auto_heal_actions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);
    setRecentActions(data || []);
  }, [user]);

  useEffect(() => {
    fetchRecentActions();
  }, [fetchRecentActions]);

  const handleAutoHeal = async () => {
    if (!healingPlanId || !healingAction) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("auto-heal", {
        body: { hosting_plan_id: healingPlanId, action_type: healingAction },
      });
      if (res.error) throw res.error;
      toast.success(t("dash.actionSuccess"));
      fetchRecentActions();
    } catch (e: any) {
      toast.error(t("dash.actionFailed"));
    } finally {
      setLoading(false);
      setHealingPlanId(null);
      setHealingAction(null);
    }
  };

  const statusColor = (s: string) =>
    s === "active" ? "bg-primary/10 text-primary" : s === "expired" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground";

  const actionStatusColor = (s: string) =>
    s === "completed" ? "text-primary" : s === "failed" ? "text-destructive" : "text-muted-foreground";

  const quickActions = [
    { icon: FolderOpen, label: t("dash.fileManager") },
    { icon: DatabaseBackup, label: t("dash.backups") },
    { icon: Globe, label: "DNS" },
    { icon: Shield, label: "SSL" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("dash.hosting")}</h1>
        <p className="text-muted-foreground">{t("dash.hostingDesc")}</p>
      </div>

      {hostingPlans.map((plan) => (
        <Card key={plan.id} className="border-border/50">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {plan.domain || "-"} · {plan.server_location} · {plan.billing_period}
                </p>
              </div>
              <Badge className={statusColor(plan.status)}>{plan.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Resource gauges */}
            <div className="grid gap-4 sm:grid-cols-2">
              <UsageBar label={t("dash.storage")} used={Number(plan.storage_used_gb)} total={Number(plan.storage_limit_gb)} />
              <UsageBar label={t("dash.bandwidth")} used={Number(plan.bandwidth_used_gb)} total={Number(plan.bandwidth_limit_gb)} />
              <UsageBar label="RAM" used={Number(plan.ram_used_mb)} total={Number(plan.ram_mb)} unit="MB" />
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">CPU</span>
                  <span className="text-muted-foreground">{plan.cpu_cores} {t("dash.cores")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: plan.cpu_cores }).map((_, i) => (
                    <Cpu key={i} className="h-5 w-5 text-primary" />
                  ))}
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">{t("dash.quickActions")}</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <Button key={action.label} variant="outline" size="sm" className="gap-1.5">
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                  disabled={loading}
                  onClick={() => { setHealingPlanId(plan.id); setHealingAction("restart_service"); }}
                >
                  <RotateCcw className="h-4 w-4" />
                  {t("dash.restartService")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                  disabled={loading}
                  onClick={() => { setHealingPlanId(plan.id); setHealingAction("reboot_server"); }}
                >
                  <Power className="h-4 w-4" />
                  {t("dash.rebootServer")}
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {t("dash.expires")}: {format(new Date(plan.expires_at), "MMM d, yyyy")}
            </p>
          </CardContent>
        </Card>
      ))}

      {hostingPlans.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("dash.noPlans")}
          </CardContent>
        </Card>
      )}

      {/* Recent Auto-Heal Actions */}
      {recentActions.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">{t("dash.recentActions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActions.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    {a.action_type === "restart_service" ? (
                      <RotateCcw className="h-4 w-4 text-primary" />
                    ) : (
                      <Power className="h-4 w-4 text-destructive" />
                    )}
                    <span className="text-foreground">
                      {a.action_type === "restart_service" ? t("dash.restartService") : t("dash.rebootServer")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={actionStatusColor(a.status)}>{a.status}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(a.created_at), "MMM d, HH:mm")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={!!healingPlanId && !!healingAction} onOpenChange={(open) => { if (!open) { setHealingPlanId(null); setHealingAction(null); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {healingAction === "restart_service" ? t("dash.restartService") : t("dash.rebootServer")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {healingAction === "restart_service" ? t("dash.confirmRestart") : t("dash.confirmReboot")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>{t("dash.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAutoHeal}
              disabled={loading}
              className={healingAction === "reboot_server" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {healingAction === "restart_service" ? t("dash.restartService") : t("dash.rebootServer")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HostingTab;
