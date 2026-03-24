import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <span className="text-xs font-bold text-primary-foreground">W</span>
          </div>
          <span className="text-sm font-bold text-foreground">WebWeaver</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/pricing" className="hover:text-foreground transition-colors">{t("nav.pricing")}</Link>
          <Link to="/faq" className="hover:text-foreground transition-colors">{t("footer.support")}</Link>
          <a href="#" className="hover:text-foreground transition-colors">{t("footer.privacy")}</a>
          <a href="#" className="hover:text-foreground transition-colors">{t("footer.terms")}</a>
        </div>

        {/* Copyright */}
        <p className="text-sm text-muted-foreground">{t("footer.copyright")}</p>
      </div>
    </footer>
  );
};

export default Footer;
