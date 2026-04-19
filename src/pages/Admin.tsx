import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Server, Users, DollarSign, Settings, Loader2 } from "lucide-react";
import AdminOverviewTab from "@/components/admin/AdminOverviewTab";
import InfrastructureTab from "@/components/admin/InfrastructureTab";
import CustomersTab from "@/components/admin/CustomersTab";
import BillingGroupTab from "@/components/admin/BillingGroupTab";
import SystemTab from "@/components/admin/SystemTab";

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
          <TabsTrigger value="overview" className="gap-2"><LayoutDashboard className="h-4 w-4" /><span>Overview</span></TabsTrigger>
          <TabsTrigger value="infrastructure" className="gap-2"><Server className="h-4 w-4" /><span>Infrastructure</span></TabsTrigger>
          <TabsTrigger value="customers" className="gap-2"><Users className="h-4 w-4" /><span>Customers</span></TabsTrigger>
          <TabsTrigger value="billing" className="gap-2"><DollarSign className="h-4 w-4" /><span>Billing</span></TabsTrigger>
          <TabsTrigger value="system" className="gap-2"><Settings className="h-4 w-4" /><span>System</span></TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><AdminOverviewTab /></TabsContent>
        <TabsContent value="infrastructure"><InfrastructureTab /></TabsContent>
        <TabsContent value="customers"><CustomersTab /></TabsContent>
        <TabsContent value="billing"><BillingGroupTab /></TabsContent>
        <TabsContent value="system"><SystemTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
