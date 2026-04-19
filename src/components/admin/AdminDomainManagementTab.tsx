import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Globe, CheckCircle2, AlertTriangle, Copy, Loader2, ShieldAlert, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminDomainManagementTab = () => {
  const [domain, setDomain] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientName, setClientName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ domain: string; email: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ added: number; updated: number; total: number } | null>(null);

  const nameservers = ["grant.ns.cloudflare.com", "sonia.ns.cloudflare.com"];

  const handleSyncAapanel = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("sync-aapanel-domains");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSyncResult({ added: data.added, updated: data.updated, total: data.total });
      toast.success(`Synced ${data.total} sites · +${data.added} new, ${data.updated} updated`);
    } catch (e: any) {
      toast.error(e.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleAddDomain = async () => {
    if (!domain.trim() || !clientEmail.trim() || !clientName.trim()) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const adminSecret = import.meta.env.VITE_ADMIN_SECRET;
      const res = await fetch("https://api.serverus.cloud/api/admin/add-domain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminSecret ? { "x-api-secret": adminSecret } : {}),
        },
        body: JSON.stringify({
          domain: domain.trim(),
          client_email: clientEmail.trim(),
          client_name: clientName.trim(),
        }),
      });

      if (res.ok) {
        setSuccess({ domain: domain.trim(), email: clientEmail.trim(), name: clientName.trim() });
        setDomain("");
        setClientEmail("");
        setClientName("");
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

  return (
    <div className="space-y-6 max-w-2xl">
      <Alert className="border-amber-500/50 bg-amber-500/10">
        <ShieldAlert className="h-4 w-4 text-amber-500" />
        <AlertTitle className="text-amber-500">Admin Bypass</AlertTitle>
        <AlertDescription>No package check performed. Domains added here bypass all client restrictions.</AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <RefreshCw className="h-5 w-5" />
            Sync from aaPanel
          </CardTitle>
          <CardDescription>
            Pull all sites from aaPanel and add any that are missing from the database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleSyncAapanel} disabled={syncing} variant="secondary" className="w-full">
            {syncing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Sync Now
          </Button>
          {syncResult && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-500">Sync Complete</AlertTitle>
              <AlertDescription>
                {syncResult.total} sites pulled · <strong>{syncResult.added}</strong> added,{" "}
                <strong>{syncResult.updated}</strong> updated.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5" />
            Add Domain Manually
          </CardTitle>
          <CardDescription>Add a domain for any client. This bypasses hosting package checks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-domain">Domain Name</Label>
            <Input id="admin-domain" placeholder="example.com" value={domain} onChange={(e) => setDomain(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-email">Client Email</Label>
            <Input id="admin-email" type="email" placeholder="client@example.com" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-name">Client Name</Label>
            <Input id="admin-name" placeholder="John Doe" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleAddDomain} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Globe className="h-4 w-4 mr-2" />}
            Add Domain
          </Button>
        </CardContent>
      </Card>

      {success && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <AlertTitle className="text-green-500 text-lg">Domain Added!</AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            <p className="text-foreground">
              <strong>{success.domain}</strong> added for {success.name} ({success.email}).
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
            <p className="text-muted-foreground text-sm">Instruct the client to update their nameservers. Propagation takes 24–48 hours.</p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AdminDomainManagementTab;
