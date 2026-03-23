import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">H</span>
              </div>
              <span className="text-lg font-bold text-foreground">HostPro</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("footer.description")}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">{t("footer.product")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/pricing" className="hover:text-primary transition-colors">{t("nav.pricing")}</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors">{t("nav.faq")}</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">{t("services.hosting.title")}</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">{t("services.vps.title")}</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">{t("footer.company")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">{t("nav.about")}</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">{t("contact.title")}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">{t("footer.legal")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">{t("footer.privacy")}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t("footer.terms")}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t("footer.cookies")}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} HostPro. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
