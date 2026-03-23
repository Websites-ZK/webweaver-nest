import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe } from "lucide-react";

const Navbar = () => {
  const { t, language, setLanguage } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/pricing", label: t("nav.pricing") },
    { to: "/about", label: t("nav.about") },
    { to: "/faq", label: t("nav.faq") },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">H</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">HostPro</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={() => setLanguage(language === "en" ? "hr" : "en")}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Switch language"
          >
            <Globe className="h-4 w-4" />
            {language === "en" ? "HR" : "EN"}
          </button>
          <Link to="/login">
            <Button variant="ghost" size="sm">
              {t("nav.login")}
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm" className="bg-primary hover:bg-primary/90 active:scale-[0.97] transition-all">
              {t("nav.getStarted")}
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-md p-2 text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
            <button
              onClick={() => setLanguage(language === "en" ? "hr" : "en")}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <Globe className="h-4 w-4" />
              {language === "en" ? "Hrvatski" : "English"}
            </button>
            <Link to="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" size="sm" className="w-full">
                {t("nav.login")}
              </Button>
            </Link>
            <Link to="/register" onClick={() => setMobileOpen(false)}>
              <Button size="sm" className="w-full">
                {t("nav.getStarted")}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
