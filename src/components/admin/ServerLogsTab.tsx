import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useServerMonitor } from "@/hooks/useServerMonitor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, Loader2, FileText } from "lucide-react";

const DOMAINS = ["serverus.cloud", "api.serverus.cloud"];

const ServerLogsTab = () => {
  const { t } = useLanguage();
  const [domain, setDomain] = useState(DOMAINS[0]);

  const { data, loading, refetch } = useServerMonitor<{ logs?: string | string[] }>(
    "nginx_logs",
    { domain, lines: 50 }
  );

  const rawLogs = data?.logs;
  const logs: string[] = Array.isArray(rawLogs) ? rawLogs : rawLogs ? rawLogs.split("\n") : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">{t("admin.serverLogs") || "Server Logs"}</h2>
        <div className="flex items-center gap-3">
          <Select value={domain} onValueChange={setDomain}>
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOMAINS.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={refetch} className="gap-1.5">
            <RefreshCw className="h-4 w-4" /> {t("admin.refresh") || "Refresh"}
          </Button>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Nginx Logs — {domain} (last 50 lines)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No logs available. Ensure your API is reachable.</p>
          ) : (
            <ScrollArea className="h-[500px] w-full rounded-lg border border-border/50 bg-muted/30 p-4">
              <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-all leading-relaxed">
                {logs.join("\n")}
              </pre>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ServerLogsTab;
