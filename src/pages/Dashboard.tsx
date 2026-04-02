import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import OverviewTab from "@/components/dashboard/OverviewTab";
import HostingTab from "@/components/dashboard/HostingTab";
import DomainsTab from "@/components/dashboard/DomainsTab";
import BillingTab from "@/components/dashboard/BillingTab";
import SettingsTab from "@/components/dashboard/SettingsTab";
import ReferralsTab from "@/components/dashboard/ReferralsTab";
import KPITab from "@/components/dashboard/KPITab";
import NotificationBell from "@/components/dashboard/NotificationBell";

const Dashboard = () => {
  const { user, isReady } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const [hostingPlans, setHostingPlans] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isReady && !user) {
      navigate("/login");
    }
  }, [isReady, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      const [h, d, i] = await Promise.all([
        supabase.from("hosting_plans").select("*").eq("user_id", user.id),
        supabase.from("domains").select("*").eq("user_id", user.id),
        supabase.from("invoices").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      setHostingPlans(h.data || []);
      setDomains(d.data || []);
      setInvoices(i.data || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  if (!isReady || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case "hosting":
        return <HostingTab hostingPlans={hostingPlans} />;
      case "domains":
        return <DomainsTab domains={domains} />;
      case "billing":
        return <BillingTab invoices={invoices} />;
      case "referrals":
        return <ReferralsTab />;
      case "kpi":
        return <KPITab hostingPlans={hostingPlans} invoices={invoices} domains={domains} />;
      case "settings":
        return <SettingsTab />;
      default:
        return (
          <OverviewTab
            user={user}
            hostingPlans={hostingPlans}
            domains={domains}
            invoices={invoices}
            onTabChange={handleTabChange}
          />
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-[calc(100vh-4rem)] w-full">
        <DashboardSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="flex-1 flex flex-col">
          <header className="flex h-12 items-center justify-between border-b border-border/50 px-4">
            <SidebarTrigger className="mr-2" />
            <NotificationBell />
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            {loading ? (
              <div className="flex min-h-[40vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              renderTab()
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
