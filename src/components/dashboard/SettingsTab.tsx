import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const SettingsTab = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
    if (!error) {
      await supabase.from("profiles").update({ full_name: fullName }).eq("user_id", user!.id);
      toast({ title: t("dash.saved") });
    } else {
      toast({ title: t("auth.error"), description: error.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      toast({ title: t("auth.error"), description: t("dash.passwordMin"), variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) {
      toast({ title: t("dash.passwordChanged") });
      setNewPassword("");
    } else {
      toast({ title: t("auth.error"), description: error.message, variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("dash.settings")}</h1>
        <p className="text-muted-foreground">{t("dash.settingsDesc")}</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">{t("dash.profile")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("auth.fullName")}</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("auth.email")}</Label>
            <Input value={user?.email || ""} disabled className="opacity-60" />
          </div>
          <Button onClick={handleProfileSave} disabled={saving} size="sm">
            {t("dash.saveChanges")}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">{t("dash.changePassword")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("dash.newPassword")}</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <Button onClick={handlePasswordChange} disabled={saving} size="sm" variant="outline">
            {t("dash.updatePassword")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
