import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Wallet } from "lucide-react";

interface BillingTabProps {
  invoices: any[];
}

const BillingTab = ({ invoices }: BillingTabProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [credits, setCredits] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    const fetchCredits = async () => {
      const { data } = await supabase
        .from("referral_profiles")
        .select("credits_balance")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setCredits(Number(data.credits_balance));
    };
    fetchCredits();
  }, [user]);

  const statusColor = (s: string) =>
    s === "paid" ? "bg-primary/10 text-primary" : s === "pending" ? "bg-[hsl(45,93%,47%)]/10 text-[hsl(45,93%,47%)]" : "bg-destructive/10 text-destructive";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("dash.billing")}</h1>
        <p className="text-muted-foreground">{t("dash.billingDesc")}</p>
      </div>

      {/* Referral Credits Banner */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("dash.creditsBalance")}</p>
            <p className="text-2xl font-bold text-foreground">€{credits.toFixed(2)}</p>
          </div>
          <p className="ml-auto text-xs text-muted-foreground max-w-[200px] text-right">
            {t("dash.creditsHint")}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("dash.description")}</TableHead>
                <TableHead>{t("dash.amount")}</TableHead>
                <TableHead>{t("dash.status")}</TableHead>
                <TableHead>{t("dash.date")}</TableHead>
                <TableHead>{t("dash.dueDate")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium text-foreground">{inv.description}</TableCell>
                  <TableCell className="text-foreground">
                    €{Number(inv.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColor(inv.status)}>{inv.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(inv.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(inv.due_date), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {t("dash.noInvoices")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingTab;
