import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, BarChart3 } from "lucide-react";
import RevenueTab from "./RevenueTab";
import AnalyticsTab from "./AnalyticsTab";

const BillingGroupTab = () => {
  return (
    <Tabs defaultValue="revenue" className="space-y-4">
      <TabsList className="bg-muted/50">
        <TabsTrigger value="revenue" className="gap-1.5"><DollarSign className="h-4 w-4" /> Revenue</TabsTrigger>
        <TabsTrigger value="distribution" className="gap-1.5"><BarChart3 className="h-4 w-4" /> Distribution</TabsTrigger>
      </TabsList>
      <TabsContent value="revenue"><RevenueTab /></TabsContent>
      <TabsContent value="distribution"><AnalyticsTab /></TabsContent>
    </Tabs>
  );
};

export default BillingGroupTab;
