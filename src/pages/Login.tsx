import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ScrollReveal from "@/components/ScrollReveal";

const Login = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <ScrollReveal>
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-card-foreground">{t("auth.login")}</h1>
          </div>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-card-foreground">{t("auth.email")}</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-card-foreground">{t("auth.password")}</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="text-right">
              <a href="#" className="text-sm text-primary hover:underline">{t("auth.forgotPassword")}</a>
            </div>
            <Button type="submit" size="lg" className="w-full active:scale-[0.97] transition-all">
              {t("auth.login")}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              {t("nav.register")}
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default Login;
