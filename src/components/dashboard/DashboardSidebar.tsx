import { LayoutDashboard, Server, Globe, Receipt, Settings, Users, BarChart3 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardSidebar = ({ activeTab, onTabChange }: DashboardSidebarProps) => {
  const { t } = useLanguage();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const items = [
    { id: "overview", icon: LayoutDashboard, label: t("dash.overview") },
    { id: "hosting", icon: Server, label: t("dash.hosting") },
    { id: "domains", icon: Globe, label: t("dash.domains") },
    { id: "billing", icon: Receipt, label: t("dash.billing") },
    { id: "referrals", icon: Users, label: t("dash.referrals") },
    { id: "kpi", icon: BarChart3, label: t("dash.kpi") },
    { id: "settings", icon: Settings, label: t("dash.settings") },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("dash.title")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                    tooltip={item.label}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span>{item.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
