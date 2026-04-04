import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Activity, Users, BarChart3, Filter, Bell, DollarSign, Monitor, Loader2 } from "lucide-react";
import AdminOverviewTab from "@/components/admin/AdminOverviewTab";
import ServerHealthTab from "@/components/admin/ServerHealthTab";
import UsersTab from "@/components/admin/UsersTab";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import OnboardingFunnelTab from "@/components/admin/OnboardingFunnelTab";
import AlertsTab from "@/components/admin/AlertsTab";
import RevenueTab from "@/components/admin/RevenueTab";
import ServerDailyDashboardTab from "@/components/admin/ServerDailyDashboardTab";

const Admin = () => {
  const { user, isReady } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!user) { navigate("/login"); return; }

    const checkRole = async () => {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (error || !data) {
        navigate("/dashboard");
      } else {
        setIsAdmin(true);
      }
    };
    checkRole();
  }, [user, isReady, navigate]);

  if (!isReady || isAdmin === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t("admin.title")}</h1>
        <p className="text-muted-foreground">{t("admin.subtitle")}</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex flex-wrap gap-1 h-auto bg-muted/50 p-1">
          <TabsTrigger value="overview" className="gap-1.5"><LayoutDashboard className="h-4 w-4" /><span className="hidden sm:inline">{t("admin.overview")}</span></TabsTrigger>
          <TabsTrigger value="health" className="gap-1.5"><Activity className="h-4 w-4" /><span className="hidden sm:inline">{t("admin.serverHealth")}</span></TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5"><Users className="h-4 w-4" /><span className="hidden sm:inline">{t("admin.users")}</span></TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5"><BarChart3 className="h-4 w-4" /><span className="hidden sm:inline">{t("admin.analytics")}</span></TabsTrigger>
          <TabsTrigger value="funnel" className="gap-1.5"><Filter className="h-4 w-4" /><span className="hidden sm:inline">{t("admin.funnel")}</span></TabsTrigger>
          <TabsTrigger value="alerts" className="gap-1.5"><Bell className="h-4 w-4" /><span className="hidden sm:inline">{t("admin.alerts")}</span></TabsTrigger>
          <TabsTrigger value="revenue" className="gap-1.5"><DollarSign className="h-4 w-4" /><span className="hidden sm:inline">{t("admin.revenue")}</span></TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><AdminOverviewTab /></TabsContent>
        <TabsContent value="health"><ServerHealthTab /></TabsContent>
        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
        <TabsContent value="funnel"><OnboardingFunnelTab /></TabsContent>
        <TabsContent value="alerts"><AlertsTab /></TabsContent>
        <TabsContent value="revenue"><RevenueTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
