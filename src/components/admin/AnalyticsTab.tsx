import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const AnalyticsTab = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.rpc("get_admin_stats");
      if (data) setStats(data);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!stats) return null;

  const planData = (stats.plan_distribution || []).map((p: any) => ({ name: p.plan, value: p.count }));
  const locationData = (stats.location_distribution || []).map((l: any) => ({ name: l.location, value: l.count }));

  const planConfig = Object.fromEntries(planData.map((p: any, i: number) => [p.name, { label: p.name, color: COLORS[i % COLORS.length] }]));
  const locationConfig = Object.fromEntries(locationData.map((l: any, i: number) => [l.name, { label: l.name, color: COLORS[i % COLORS.length] }]));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-lg">{t("admin.planDistribution")}</CardTitle></CardHeader>
        <CardContent>
          {planData.length > 0 ? (
            <ChartContainer config={planConfig} className="h-[250px] w-full">
              <PieChart>
                <Pie data={planData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {planData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">{t("admin.noData")}</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-lg">{t("admin.serverLocations")}</CardTitle></CardHeader>
        <CardContent>
          {locationData.length > 0 ? (
            <ChartContainer config={locationConfig} className="h-[250px] w-full">
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">{t("admin.noData")}</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50 lg:col-span-2">
        <CardHeader><CardTitle className="text-lg">{t("admin.quickStats")}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{stats.onboarding_completions}</p>
              <p className="text-xs text-muted-foreground">{t("admin.onboardingCompletions")}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-2xl font-bold text-foreground">€{stats.pending_revenue?.toFixed(2) || "0.00"}</p>
              <p className="text-xs text-muted-foreground">{t("admin.pendingRevenue")}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-2xl font-bold text-foreground">€{stats.total_referral_credits?.toFixed(2) || "0.00"}</p>
              <p className="text-xs text-muted-foreground">{t("admin.referralCreditsIssued")}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-2xl font-bold text-foreground">€{stats.total_referral_earnings?.toFixed(2) || "0.00"}</p>
              <p className="text-xs text-muted-foreground">{t("admin.totalReferralEarnings")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
