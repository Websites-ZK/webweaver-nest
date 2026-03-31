import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, Globe, CreditCard } from "lucide-react";

const Footer = () => {
  const { t } = useLanguage();

  const productLinks = [
    { to: "/#pricing", label: t("footer.col.plans") },
    { to: "/pricing", label: t("footer.col.compare") },
    { to: "/faq", label: t("footer.col.features") },
  ];

  const companyLinks = [
    { to: "/about", label: t("nav.about") },
    { to: "/faq", label: t("footer.col.blog") },
  ];

  const supportLinks = [
    { to: "/faq", label: t("footer.support") },
    { to: "/about#contact", label: t("footer.col.contact") },
  ];

  const legalLinks = [
    { to: "/privacy", label: t("footer.privacy") },
    { to: "/terms", label: t("footer.terms") },
  ];

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Columns */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <span className="text-xs font-bold text-primary-foreground">W</span>
              </div>
              <span className="text-sm font-bold text-foreground">WebWeaver</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t("footer.description")}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">{t("footer.col.product")}</h4>
            <ul className="mt-3 space-y-2">
              {productLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">{t("footer.col.company")}</h4>
            <ul className="mt-3 space-y-2">
              {companyLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">{t("footer.col.supportTitle")}</h4>
            <ul className="mt-3 space-y-2">
              {supportLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">{t("footer.col.legal")}</h4>
            <ul className="mt-3 space-y-2">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Badges row */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 border-t border-border pt-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            <span>Visa / Mastercard / PayPal</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>{t("trust.sslCheckout")}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="h-4 w-4 text-primary" />
            <span>{t("trust.gdprBadge")}</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
