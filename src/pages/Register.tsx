import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ScrollReveal from "@/components/ScrollReveal";

const Register = () => {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
            <Button type="submit" size="lg" className="w-full active:scale-[0.97] transition-all">
              {t("auth.register")}
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
