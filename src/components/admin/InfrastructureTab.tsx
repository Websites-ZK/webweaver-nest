import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, FileText, Monitor, CalendarDays } from "lucide-react";
import ServerHealthTab from "./ServerHealthTab";
import ServerLogsTab from "./ServerLogsTab";
import ServerDailyDashboardTab from "./ServerDailyDashboardTab";
import ServerMonthlyDashboardTab from "./ServerMonthlyDashboardTab";

const InfrastructureTab = () => {
  return (
    <Tabs defaultValue="health" className="space-y-4">
      <TabsList className="bg-muted/50">
        <TabsTrigger value="health" className="gap-1.5"><Activity className="h-4 w-4" /> Health</TabsTrigger>
        <TabsTrigger value="daily" className="gap-1.5"><Monitor className="h-4 w-4" /> Daily</TabsTrigger>
        <TabsTrigger value="monthly" className="gap-1.5"><CalendarDays className="h-4 w-4" /> Monthly</TabsTrigger>
        <TabsTrigger value="logs" className="gap-1.5"><FileText className="h-4 w-4" /> Logs</TabsTrigger>
      </TabsList>
      <TabsContent value="health"><ServerHealthTab /></TabsContent>
      <TabsContent value="daily"><ServerDailyDashboardTab /></TabsContent>
      <TabsContent value="monthly"><ServerMonthlyDashboardTab /></TabsContent>
      <TabsContent value="logs"><ServerLogsTab /></TabsContent>
    </Tabs>
  );
};

export default InfrastructureTab;
