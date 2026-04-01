import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage, LANGUAGES, type Language } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Check, ChevronDown, LayoutDashboard, Server, Globe, Receipt, Settings, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getInitials = (user: { user_metadata?: { full_name?: string }; email?: string } | null) => {
  const name = user?.user_metadata?.full_name;
  if (name) {
    return name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  }
  return (user?.email?.[0] ?? "U").toUpperCase();
};

const Navbar = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const [isTransparent, setIsTransparent] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    if (!isHomePage) {
      setIsTransparent(false);
      return;
    }

    const handleScroll = () => {
      setIsTransparent(window.scrollY < 500);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const currentLang = LANGUAGES.find((l) => l.code === language)!;

  const links = [
    { to: "/", label: t("nav.hosting") },
    { to: "/pricing", label: t("nav.pricing") },
    { to: "/about", label: t("nav.about") },
    { to: "/faq", label: t("nav.support") },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${isTransparent ? "border-b border-white/10 bg-background/40 backdrop-blur-md" : "border-b border-border/50 bg-background/80 backdrop-blur-lg"}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">W</span>
          </div>
          <span className={`text-lg font-bold tracking-tight ${isTransparent ? "text-foreground" : "text-foreground"}`}>WebWeaver</span>
        </Link>

        {/* Desktop Links - centered */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                isActive(link.to)
                  ? "bg-primary/15 text-primary"
                  : isTransparent ? "text-foreground/80 hover:bg-primary/10 hover:text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Language Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 ${isTransparent ? "border-border/40 bg-background/50 text-foreground hover:bg-background/70" : "border-border/60 bg-muted/50 text-foreground hover:bg-muted hover:border-border"}`}
                aria-label="Select language"
              >
                <span className="inline-block origin-left text-base leading-none animate-flag-wave">{currentLang.flag}</span>
                <span className="font-semibold">{currentLang.code.toUpperCase()}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 p-1.5">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                    language === lang.code
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="inline-block origin-left text-lg leading-none animate-flag-wave">{lang.flag}</span>
                  <span className="flex-1">{lang.nativeName}</span>
                  {language === lang.code && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/register">
            <Button size="sm" className="bg-primary hover:bg-primary/90 active:scale-[0.97] transition-all">
              {t("nav.getStarted")}
            </Button>
          </Link>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label="User menu"
                >
                  {getInitials(user)}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  {t("dash.overview")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard?tab=hosting")} className="cursor-pointer">
                  <Server className="mr-2 h-4 w-4" />
                  {t("dash.hosting")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard?tab=domains")} className="cursor-pointer">
                  <Globe className="mr-2 h-4 w-4" />
                  {t("dash.domains")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard?tab=billing")} className="cursor-pointer">
                  <Receipt className="mr-2 h-4 w-4" />
                  {t("dash.billing")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard?tab=settings")} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  {t("dash.settings")}
                </DropdownMenuItem>
                <div className="my-1 h-px bg-border" />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("auth.logout") || "Log out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className={`rounded-md p-2 text-foreground md:hidden`}
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
            {/* Mobile language selector */}
            <button
              onClick={() => setMobileLangOpen(!mobileLangOpen)}
              className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              <span className="flex items-center gap-2">
                <span className="inline-block origin-left text-base animate-flag-wave">{currentLang.flag}</span>
                {currentLang.nativeName}
              </span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${mobileLangOpen ? "rotate-180" : ""}`} />
            </button>
            {mobileLangOpen && (
              <div className="ml-2 flex flex-col gap-0.5 rounded-md border border-border/50 bg-muted/30 p-1.5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setMobileLangOpen(false);
                    }}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      language === lang.code
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="inline-block origin-left text-base leading-none animate-flag-wave">{lang.flag}</span>
                    <span className="flex-1 text-left">{lang.nativeName}</span>
                    {language === lang.code && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
            <Link to="/register" onClick={() => setMobileOpen(false)}>
              <Button size="sm" className="w-full">
                {t("nav.getStarted")}
              </Button>
            </Link>
            {user && (
              <div className="flex flex-col gap-1 border-t border-border pt-2">
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
                  <LayoutDashboard className="h-4 w-4" /> {t("dash.overview")}
                </Link>
                <Link to="/dashboard?tab=hosting" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
                  <Server className="h-4 w-4" /> {t("dash.hosting")}
                </Link>
                <Link to="/dashboard?tab=domains" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
                  <Globe className="h-4 w-4" /> {t("dash.domains")}
                </Link>
                <button
                  onClick={() => { handleSignOut(); setMobileOpen(false); }}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-muted"
                >
                  <LogOut className="h-4 w-4" />
                  {t("auth.logout") || "Log out"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
