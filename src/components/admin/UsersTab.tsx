import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search } from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  created_at: string;
}

const UsersTab = () => {
  const { t } = useLanguage();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [planCounts, setPlanCounts] = useState<Record<string, number>>({});
  const [domainCounts, setDomainCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetch = async () => {
      // We need admin-level access. Since RLS on profiles only allows own, we use get_admin_stats for counts.
      // For user listing, we'll read via the admin RPC or directly if we add a policy.
      // For now let's use what we have - profiles are restricted, so we'll show what the admin can access.
      const { data: profilesData } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      
      // These will only work if we have admin view policies (we'll add them)
      const { data: plans } = await supabase.from("hosting_plans").select("user_id");
      const { data: domains } = await supabase.from("domains").select("user_id");

      if (profilesData) setProfiles(profilesData);
      
      if (plans) {
        const counts: Record<string, number> = {};
        plans.forEach((p) => { counts[p.user_id] = (counts[p.user_id] || 0) + 1; });
        setPlanCounts(counts);
      }
      if (domains) {
        const counts: Record<string, number> = {};
        domains.forEach((d) => { counts[d.user_id] = (counts[d.user_id] || 0) + 1; });
        setDomainCounts(counts);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = profiles.filter((p) =>
    !search || (p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.user_id.includes(search))
  );

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("admin.searchUsers")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Badge variant="secondary">{profiles.length} {t("admin.users")}</Badge>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.userName")}</TableHead>
                <TableHead>{t("admin.userId")}</TableHead>
                <TableHead>{t("admin.plans")}</TableHead>
                <TableHead>{t("admin.domains")}</TableHead>
                <TableHead>{t("admin.joined")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.full_name || "—"}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{p.user_id.slice(0, 8)}…</TableCell>
                  <TableCell><Badge variant="secondary">{planCounts[p.user_id] || 0}</Badge></TableCell>
                  <TableCell><Badge variant="secondary">{domainCounts[p.user_id] || 0}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">{t("admin.noUsers")}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersTab;
