import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";

interface BillingTabProps {
  invoices: any[];
}

const BillingTab = ({ invoices }: BillingTabProps) => {
  const { t } = useLanguage();

  const statusColor = (s: string) =>
    s === "paid" ? "bg-primary/10 text-primary" : s === "pending" ? "bg-[hsl(45,93%,47%)]/10 text-[hsl(45,93%,47%)]" : "bg-destructive/10 text-destructive";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("dash.billing")}</h1>
        <p className="text-muted-foreground">{t("dash.billingDesc")}</p>
      </div>

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
