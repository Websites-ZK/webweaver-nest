import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { ArrowRightLeft, CheckCircle2, AlertTriangle, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

const TransferDomainTab = () => {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameservers = ["grant.ns.cloudflare.com", "sonia.ns.cloudflare.com"];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleTransfer = async () => {
    if (!domain.trim()) {
      setError("Please enter a domain name.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem("fossbilling_token");
      const res = await fetch("https://api.serverus.cloud/api/client/transfer-domain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "x-client-token": token } : {}),
        },
        body: JSON.stringify({ domain: domain.trim() }),
      });

      if (res.ok) {
        setSuccess(true);
      } else if (res.status === 403) {
        setError("You don't have an active hosting package. Please purchase one.");
      } else if (res.status === 402) {
        setError("You already have one domain on your package. Additional domains cost €1. Please contact support.");
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.message || data?.error || `Error ${res.status}: ${res.statusText}`);
      }
    } catch (e: any) {
      setError(e.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <AlertTitle className="text-green-500 text-lg">Domain Transfer Initiated!</AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            <p className="text-foreground">
              Your domain <strong>{domain}</strong> has been added. Now update your nameservers at your domain registrar:
            </p>
            <div className="space-y-2">
              {nameservers.map((ns) => (
                <div key={ns} className="flex items-center gap-2 rounded-md bg-muted p-3 font-mono text-sm">
                  <span className="flex-1">{ns}</span>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(ns)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-sm">
              Go to your domain registrar and change your nameservers to the above. Changes take 24–48 hours to propagate.
            </p>
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => { setSuccess(false); setDomain(""); }}>
          Transfer Another Domain
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Transfer Domain</h2>
        <p className="text-muted-foreground">Point your existing domain to our hosting servers.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowRightLeft className="h-5 w-5" />
            Enter Your Domain
          </CardTitle>
          <CardDescription>
            Enter the domain you want to point to our servers. We'll set up DNS for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Domain Name</Label>
            <Input
              id="domain"
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTransfer()}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleTransfer} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRightLeft className="h-4 w-4 mr-2" />}
            Transfer Domain
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransferDomainTab;
