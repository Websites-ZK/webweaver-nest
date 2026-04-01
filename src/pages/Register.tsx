import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import ScrollReveal from "@/components/ScrollReveal";
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
  const { t } = useLanguage();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const refCode = searchParams.get("ref");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: t("auth.error") || "Error", description: t("auth.passwordMismatch") || "Passwords do not match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: t("auth.error") || "Error", description: t("auth.passwordTooShort") || "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);

    if (error) {
      toast({ title: t("auth.error") || "Error", description: error.message, variant: "destructive" });
    } else {
      // If there's a referral code, store the referral after signup
      if (refCode) {
        try {
          // Get the newly created user's ID from auth
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) {
            // Find the referrer by code
            const { data: referrerProfile } = await supabase
              .from("referral_profiles")
              .select("user_id")
              .eq("referral_code", refCode)
              .maybeSingle();

            if (referrerProfile) {
              await supabase.from("referrals").insert({
                referrer_id: referrerProfile.user_id,
                referred_user_id: authData.user.id,
                status: "active",
              });
              // Increment total_referrals on the referrer's profile
              await supabase.rpc("process_referral_signup" as any, { p_referrer_id: referrerProfile.user_id });
            }
          }
        } catch (e) {
          // Silently fail - don't block registration
          console.error("Referral tracking error:", e);
        }
      }
      toast({ title: t("auth.registerSuccess") || "Account created!", description: t("auth.checkEmail") || "Check your email to confirm your account." });
      navigate("/login");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <ScrollReveal>
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-card-foreground">{t("auth.register")}</h1>
          </div>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-card-foreground">{t("auth.name")}</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-card-foreground">{t("auth.email")}</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-card-foreground">{t("auth.password")}</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-card-foreground">{t("auth.confirmPassword")}</label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <Button type="submit" size="lg" className="w-full active:scale-[0.97] transition-all" disabled={loading}>
              {loading ? "..." : t("auth.register")}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {t("auth.hasAccount")}{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              {t("nav.login")}
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default Register;
