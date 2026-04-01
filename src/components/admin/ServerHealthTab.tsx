import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

interface HealthCheck {
  id: string;
  target_url: string;
  status_code: number;
  response_time_ms: number;
  is_up: boolean;
  checked_at: string;
}

const ServerHealthTab = () => {
  const { t } = useLanguage();
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChecks = async () => {
    const { data } = await supabase
      .from("server_health_checks")
      .select("*")
      .order("checked_at", { ascending: false })
      .limit(200);
    if (data) setChecks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchChecks();
    const interval = setInterval(fetchChecks, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  // Group by URL
  const urls = [...new Set(checks.map((c) => c.target_url))];

  const getUptimePercent = (url: string, hours: number) => {
    const since = new Date(Date.now() - hours * 3600000);
    const relevant = checks.filter((c) => c.target_url === url && new Date(c.checked_at) >= since);
    if (relevant.length === 0) return null;
    const up = relevant.filter((c) => c.is_up).length;
    return ((up / relevant.length) * 100).toFixed(2);
  };

  const chartConfig = { response_time: { label: "Response Time (ms)", color: "hsl(var(--primary))" } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">{t("admin.serverHealth")}</h2>
        <Button variant="outline" size="sm" onClick={fetchChecks} className="gap-1.5">
          <RefreshCw className="h-4 w-4" /> {t("admin.refresh")}
        </Button>
      </div>

      {urls.map((url) => {
        const urlChecks = checks.filter((c) => c.target_url === url);
        const latest = urlChecks[0];
        const chartData = urlChecks
          .slice(0, 50)
          .reverse()
          .map((c) => ({
            time: new Date(c.checked_at).toLocaleTimeString(),
            response_time: c.response_time_ms,
          }));

        return (
          <Card key={url} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">{url}</CardTitle>
                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                  <span>24h: {getUptimePercent(url, 24) ?? "N/A"}%</span>
                  <span>7d: {getUptimePercent(url, 168) ?? "N/A"}%</span>
                  <span>30d: {getUptimePercent(url, 720) ?? "N/A"}%</span>
                </div>
              </div>
              <Badge variant={latest?.is_up ? "default" : "destructive"}>
                {latest?.is_up ? "UP" : "DOWN"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex gap-4 text-sm">
                <span className="text-muted-foreground">Status: <strong className="text-foreground">{latest?.status_code}</strong></span>
                <span className="text-muted-foreground">Response: <strong className="text-foreground">{latest?.response_time_ms}ms</strong></span>
              </div>
              {chartData.length > 1 && (
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="time" className="text-xs" tick={{ fontSize: 10 }} />
                    <YAxis className="text-xs" tick={{ fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="response_time" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        );
      })}

      {urls.length === 0 && (
        <p className="text-center text-muted-foreground py-8">{t("admin.noHealthData")}</p>
      )}
    </div>
  );
};

export default ServerHealthTab;
