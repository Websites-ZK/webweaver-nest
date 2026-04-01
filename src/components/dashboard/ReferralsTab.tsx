import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Gift, TrendingUp, Users, Wallet } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ReferralsTab = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    const init = async () => {
      setLoading(true);

      // Try to fetch existing referral profile
      let { data: rp } = await supabase
        .from("referral_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // If none exists, generate one
      if (!rp) {
        const { data: codeData } = await supabase.rpc("generate_referral_code");
        const code = codeData || Math.random().toString(36).substring(2, 10).toUpperCase();

        const { data: newProfile } = await supabase
          .from("referral_profiles")
          .insert({ user_id: user.id, referral_code: code })
          .select()
          .single();
        rp = newProfile;
      }

      setProfile(rp);

      // Fetch referrals and earnings
      const [refRes, earnRes] = await Promise.all([
        supabase.from("referrals").select("*").eq("referrer_id", user.id).order("created_at", { ascending: false }),
        supabase.from("referral_earnings").select("*").eq("referrer_id", user.id).order("created_at", { ascending: false }),
      ]);

      setReferrals(refRes.data || []);
      setEarnings(earnRes.data || []);
      setLoading(false);
    };
    init();
  }, [user]);

  const referralLink = profile
    ? `${window.location.origin}/?ref=${profile.referral_code}`
    : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: t("dash.referralCopied") });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const totalReferrals = profile?.total_referrals || 0;
  const totalRevenue = profile?.total_referred_revenue || 0;
  const commissionRate = profile?.commission_rate || 10;
  const credits = profile?.credits_balance || 0;
  const referralProgress = Math.min((totalReferrals / 10) * 100, 100);
  const revenueProgress = Math.min((totalRevenue / 1000) * 100, 100);
  const isUpgraded = commissionRate >= 15;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t("dash.referrals")}</h2>
        <p className="text-muted-foreground">{t("dash.referralsDesc")}</p>
      </div>

      {/* Referral Link Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gift className="h-5 w-5 text-primary" />
            {t("dash.referralCode")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm font-mono select-all">
              {referralLink}
            </code>
            <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("dash.referralShareDesc")}
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("dash.creditsBalance")}</p>
                <p className="text-2xl font-bold text-foreground">€{credits.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("dash.commissionRate")}</p>
                <p className="text-2xl font-bold text-foreground">
                  {commissionRate}%
                  {isUpgraded && (
                    <Badge variant="secondary" className="ml-2 text-xs">PRO</Badge>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("dash.totalReferrals")}</p>
                <p className="text-2xl font-bold text-foreground">{totalReferrals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("dash.totalRevenue")}</p>
                <p className="text-2xl font-bold text-foreground">€{totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress to Upgrade */}
      {!isUpgraded && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("dash.referralProgress")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">{t("dash.referralsProgress")}</span>
                <span className="font-medium text-foreground">{totalReferrals} / 10</span>
              </div>
              <Progress value={referralProgress} className="h-2" />
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">{t("dash.revenueProgress")}</span>
                <span className="font-medium text-foreground">€{totalRevenue.toFixed(2)} / €1,000</span>
              </div>
              <Progress value={revenueProgress} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground">{t("dash.upgradeHint")}</p>
          </CardContent>
        </Card>
      )}

      {/* Earnings History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("dash.earningsHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t("dash.noEarnings")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left font-medium text-muted-foreground">{t("dash.date")}</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">{t("dash.amount")}</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">{t("dash.commissionRate")}</th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">{t("dash.creditsEarned")}</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((e) => (
                    <tr key={e.id} className="border-b border-border/50">
                      <td className="py-3 text-foreground">{new Date(e.created_at).toLocaleDateString()}</td>
                      <td className="py-3 text-foreground">€{Number(e.amount).toFixed(2)}</td>
                      <td className="py-3 text-foreground">{e.commission_rate}%</td>
                      <td className="py-3 text-right font-medium text-primary">+€{Number(e.credits_earned).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralsTab;
