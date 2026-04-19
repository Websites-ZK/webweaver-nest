import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ShoppingCart, Filter, Radio } from "lucide-react";
import UsersTab from "./UsersTab";
import OnboardingFunnelTab from "./OnboardingFunnelTab";
import { useServerMonitor } from "@/hooks/useServerMonitor";
import { usePresenceSessions } from "@/hooks/usePresence";

interface FBClient {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  status?: string;
}
interface FBStats {
  total: number;
  list: FBClient[];
}

const FossbillingClientsCard = () => {
  const { data: fbStats } = useServerMonitor<FBStats>("fossbilling_stats");
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingCart className="h-4 w-4 text-amber-500" /> FOSSBilling Clients
        </CardTitle>
      </CardHeader>
      <CardContent>
        {fbStats ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Total clients: <span className="font-bold text-foreground">{fbStats.total}</span>
            </p>
            {fbStats.list.length > 0 ? (
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">ID</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Email</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fbStats.list.map((c) => (
                      <tr key={c.id} className="border-t border-border/30">
                        <td className="px-3 py-2 text-foreground">{c.id}</td>
                        <td className="px-3 py-2 text-foreground">{c.first_name} {c.last_name}</td>
                        <td className="px-3 py-2 text-foreground">{c.email}</td>
                        <td className="px-3 py-2">
                          <Badge variant={c.status === "active" ? "default" : "secondary"}>
                            {c.status || "unknown"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No clients yet.</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Loading FOSSBilling data…</p>
        )}
      </CardContent>
    </Card>
  );
};

const LiveSessionsCard = () => {
  const sessions = usePresenceSessions();
  const unique = new Set(sessions.map((s) => s.user_id)).size;
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Radio className="h-4 w-4 animate-pulse text-green-500" /> Live Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-6">
          <div>
            <p className="text-2xl font-bold text-foreground">{unique}</p>
            <p className="text-xs text-muted-foreground">Unique visitors</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{sessions.length}</p>
            <p className="text-xs text-muted-foreground">Active sessions</p>
          </div>
        </div>
        {sessions.length > 0 && (
          <div className="space-y-2">
            {sessions.map((s, i) => (
              <div key={`${s.user_id}-${i}`} className="flex items-center justify-between rounded-lg border border-border/50 p-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  <div>
                    <p className="font-mono text-xs font-medium text-foreground">{s.user_id.slice(0, 8)}…</p>
                    <p className="text-xs text-muted-foreground">{s.page}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">{new Date(s.joined_at).toLocaleTimeString()}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const CustomersTab = () => {
  return (
    <Tabs defaultValue="users" className="space-y-4">
      <TabsList className="bg-muted/50">
        <TabsTrigger value="users" className="gap-1.5"><Users className="h-4 w-4" /> Users</TabsTrigger>
        <TabsTrigger value="fossbilling" className="gap-1.5"><ShoppingCart className="h-4 w-4" /> FOSSBilling</TabsTrigger>
        <TabsTrigger value="funnel" className="gap-1.5"><Filter className="h-4 w-4" /> Onboarding Funnel</TabsTrigger>
        <TabsTrigger value="live" className="gap-1.5"><Radio className="h-4 w-4" /> Live</TabsTrigger>
      </TabsList>
      <TabsContent value="users"><UsersTab /></TabsContent>
      <TabsContent value="fossbilling"><FossbillingClientsCard /></TabsContent>
      <TabsContent value="funnel"><OnboardingFunnelTab /></TabsContent>
      <TabsContent value="live"><LiveSessionsCard /></TabsContent>
    </Tabs>
  );
};

export default CustomersTab;
