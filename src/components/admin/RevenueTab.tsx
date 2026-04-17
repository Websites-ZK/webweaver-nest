import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, DollarSign, TrendingUp, CreditCard } from "lucide-react";

const RevenueTab = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [invoiceBreakdown, setInvoiceBreakdown] = useState<{ paid: number; pending: number }>({ paid: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [{ data: statsData }, { data: invoices }] = await Promise.all([
        supabase.rpc("get_admin_stats"),
        supabase.from("invoices").select("status, amount"),
      ]);
      if (statsData) setStats(statsData);
      if (invoices) {
        const paid = invoices.filter((i) => i.status === "paid").length;
        const pending = invoices.filter((i) => i.status === "pending").length;
        setInvoiceBreakdown({ paid, pending });
      }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!stats) return null;

  const totalUsers = stats.total_users || 1;
  const arpu = stats.total_revenue / totalUsers;

  const cards = [
    { label: t("admin.totalRevenue"), value: `€${stats.total_revenue.toFixed(2)}`, icon: DollarSign, color: "text-emerald-500" },
    { label: t("admin.mrr"), value: `€${stats.mrr.toFixed(2)}`, icon: TrendingUp, color: "text-blue-500" },
    { label: t("admin.arpu"), value: `€${arpu.toFixed(2)}`, icon: CreditCard, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="border-border/50">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-lg bg-muted p-2.5 ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-2xl font-bold text-foreground">{c.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-lg">{t("admin.invoiceBreakdown")}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-8">
            <div>
              <p className="text-3xl font-bold text-green-500">{invoiceBreakdown.paid}</p>
              <p className="text-sm text-muted-foreground">{t("admin.paidInvoices")}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-500">{invoiceBreakdown.pending}</p>
              <p className="text-sm text-muted-foreground">{t("admin.pendingInvoices")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default RevenueTab;
