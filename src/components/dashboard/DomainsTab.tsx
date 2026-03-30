import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, ShieldOff, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";

interface DomainsTabProps {
  domains: any[];
}

const DomainsTab = ({ domains }: DomainsTabProps) => {
  const { t } = useLanguage();

  const statusColor = (s: string) =>
    s === "active" ? "bg-primary/10 text-primary" : s === "pending" ? "bg-[hsl(45,93%,47%)]/10 text-[hsl(45,93%,47%)]" : "bg-destructive/10 text-destructive";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("dash.domains")}</h1>
          <p className="text-muted-foreground">{t("dash.domainsDesc")}</p>
        </div>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          {t("dash.addDomain")}
        </Button>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("dash.domainName")}</TableHead>
                <TableHead>{t("dash.status")}</TableHead>
                <TableHead>SSL</TableHead>
                <TableHead>DNS</TableHead>
                <TableHead>{t("dash.expires")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium text-foreground">{d.domain_name}</TableCell>
                  <TableCell>
                    <Badge className={statusColor(d.status)}>{d.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {d.ssl_enabled ? (
                      <Shield className="h-4 w-4 text-primary" />
                    ) : (
                      <ShieldOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{d.dns_provider}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(d.expires_at), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
              {domains.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {t("dash.noDomains")}
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

export default DomainsTab;
