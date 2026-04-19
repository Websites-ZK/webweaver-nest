import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CloudCog, Globe } from "lucide-react";
import AlertsTab from "./AlertsTab";
import AdminDomainManagementTab from "./AdminDomainManagementTab";
import { useServerMonitor } from "@/hooks/useServerMonitor";

interface BackupStatus {
  last_backup_at?: string;
  size_mb?: number;
  status?: string;
  bucket?: string;
}

const BackupCard = () => {
  const { data: backupStatus } = useServerMonitor<BackupStatus>("backup_status");
  return (
    <Card className="border-sky-500/30 bg-sky-500/5 max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CloudCog className="h-4 w-4 text-sky-500" /> Backblaze B2 Backup
        </CardTitle>
      </CardHeader>
      <CardContent>
        {backupStatus ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={backupStatus.status === "success" ? "default" : "destructive"}>
                {backupStatus.status || "unknown"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Backup</span>
              <span className="text-sm font-medium text-foreground">
                {backupStatus.last_backup_at ? new Date(backupStatus.last_backup_at).toLocaleString() : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Size</span>
              <span className="text-sm font-medium text-foreground">
                {backupStatus.size_mb != null ? `${(backupStatus.size_mb / 1024).toFixed(2)} GB` : "—"}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Loading backup status…</p>
        )}
      </CardContent>
    </Card>
  );
};

const SystemTab = () => {
  return (
    <Tabs defaultValue="alerts" className="space-y-4">
      <TabsList className="bg-muted/50">
        <TabsTrigger value="alerts" className="gap-1.5"><Bell className="h-4 w-4" /> Alerts</TabsTrigger>
        <TabsTrigger value="backups" className="gap-1.5"><CloudCog className="h-4 w-4" /> Backups</TabsTrigger>
        <TabsTrigger value="domains" className="gap-1.5"><Globe className="h-4 w-4" /> Domains</TabsTrigger>
      </TabsList>
      <TabsContent value="alerts"><AlertsTab /></TabsContent>
      <TabsContent value="backups"><BackupCard /></TabsContent>
      <TabsContent value="domains"><AdminDomainManagementTab /></TabsContent>
    </Tabs>
  );
};

export default SystemTab;
