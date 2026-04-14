import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, ShieldOff, Plus, Search, Globe, Loader2, CheckCircle2, XCircle, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface DomainsTabProps {
  domains: any[];
}

interface DomainCheckResult {
  available: boolean;
  domain: string;
  pricing: {
    tld: string;
    price_registration: number;
    price_renew: number;
    price_transfer: number;
  } | null;
}

const DomainsTab = ({ domains }: DomainsTabProps) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [checkResult, setCheckResult] = useState<DomainCheckResult | null>(null);

  const statusColor = (s: string) =>
    s === "active" ? "bg-primary/10 text-primary" : s === "pending" ? "bg-[hsl(45,93%,47%)]/10 text-[hsl(45,93%,47%)]" : "bg-destructive/10 text-destructive";

  const handleCheckDomain = async () => {
    const domain = searchQuery.trim().toLowerCase();
    if (!domain) return;

    // Basic validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(domain)) {
      toast({ title: "Invalid domain", description: "Please enter a valid domain (e.g. example.com)", variant: "destructive" });
      return;
    }

    setIsChecking(true);
    setCheckResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("check-domain", {
        body: { domain },
      });

      if (error) throw error;
      setCheckResult(data as DomainCheckResult);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to check domain", variant: "destructive" });
    } finally {
      setIsChecking(false);
    }
  };

  const handleRegisterDomain = async () => {
    if (!checkResult?.available || !checkResult.domain) return;

    setIsRegistering(true);
    try {
      const parts = checkResult.domain.split(".");
      const sld = parts[0];
      const tld = parts.slice(1).join(".");

      const { data, error } = await supabase.functions.invoke("fossbilling-proxy", {
        body: {
          action: "register_domain",
          domain: sld,
          tld,
          product_id: 1, // Default domain product — configure as needed
          period: "1Y",
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({ title: "Domain registered!", description: `${checkResult.domain} has been registered successfully.` });
        setCheckResult(null);
        setSearchQuery("");
      } else {
        throw new Error(data?.error || "Registration failed");
      }
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message || "Could not register domain", variant: "destructive" });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("dash.domains")}</h1>
          <p className="text-muted-foreground">{t("dash.domainsDesc")}</p>
        </div>
      </div>

      {/* Domain Search & Register */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-primary" />
            Search & Register Domain
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g. mywebsite.com"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCheckDomain()}
              className="flex-1"
            />
            <Button onClick={handleCheckDomain} disabled={isChecking || !searchQuery.trim()}>
              {isChecking ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Search className="mr-1.5 h-4 w-4" />}
              Check
            </Button>
          </div>

          {checkResult && (
            <div className={`rounded-lg border p-4 ${checkResult.available ? "border-primary/30 bg-primary/5" : "border-destructive/30 bg-destructive/5"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {checkResult.available ? (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  ) : (
                    <XCircle className="h-6 w-6 text-destructive" />
                  )}
                  <div>
                    <p className="font-semibold text-foreground text-lg">{checkResult.domain}</p>
                    <p className={checkResult.available ? "text-primary text-sm" : "text-destructive text-sm"}>
                      {checkResult.available ? "Available for registration!" : "Already taken"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {checkResult.pricing && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">
                        €{checkResult.pricing.price_registration?.toFixed(2) ?? "—"}
                        <span className="text-sm font-normal text-muted-foreground">/yr</span>
                      </p>
                      {checkResult.pricing.price_renew && (
                        <p className="text-xs text-muted-foreground">
                          Renewal: €{checkResult.pricing.price_renew.toFixed(2)}/yr
                        </p>
                      )}
                    </div>
                  )}

                  {checkResult.available && (
                    <Button onClick={handleRegisterDomain} disabled={isRegistering}>
                      {isRegistering ? (
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      ) : (
                        <ShoppingCart className="mr-1.5 h-4 w-4" />
                      )}
                      Register
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Domains Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">{t("dash.domains")}</CardTitle>
        </CardHeader>
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
