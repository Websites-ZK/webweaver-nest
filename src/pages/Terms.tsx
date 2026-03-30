import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import ScrollReveal from "@/components/ScrollReveal";

const sidebarLinks = [
  { id: "user-agreement", key: "terms.sidebar.userAgreement" },
  { id: "acceptable-use", key: "terms.sidebar.acceptableUse" },
  { id: "privacy-notice", key: "terms.sidebar.privacyNotice" },
  { id: "domain-registration", key: "terms.sidebar.domainRegistration" },
  { id: "anti-spam", key: "terms.sidebar.antiSpam" },
  { id: "refund-policy", key: "terms.sidebar.refundPolicy" },
];

const Terms = () => {
  const { t } = useLanguage();
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hash]);

  return (
    <div className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      {/* Hero */}
      <ScrollReveal>
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            {t("terms.overline")}
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {t("terms.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {t("terms.lastUpdated")}
          </p>
        </div>
      </ScrollReveal>

      {/* Two-column layout */}
      <div className="mx-auto mt-14 grid max-w-6xl gap-10 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <ScrollReveal delay={100} direction="left">
          <nav className="sticky top-24 space-y-1 rounded-xl border border-border bg-card p-4 shadow-sm lg:self-start">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("terms.sidebar.title")}
            </p>
            {sidebarLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {t(link.key)}
              </a>
            ))}
            <div className="my-3 border-t border-border" />
            <Link
              to="/privacy"
              className="block rounded-lg px-3 py-2 text-sm text-primary hover:bg-muted"
            >
              {t("terms.sidebar.privacyLink")}
            </Link>
          </nav>
        </ScrollReveal>

        {/* Content */}
        <ScrollReveal delay={150}>
          <div className="prose prose-sm max-w-none text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary">
            <section id="user-agreement">
              <h2>{t("terms.section.userAgreement.title")}</h2>
              <p>{t("terms.section.userAgreement.p1")}</p>
              <p>{t("terms.section.userAgreement.p2")}</p>
            </section>

            <section id="acceptable-use" className="mt-10">
              <h2>{t("terms.section.acceptableUse.title")}</h2>
              <p>{t("terms.section.acceptableUse.p1")}</p>
              <ul>
                <li>{t("terms.section.acceptableUse.li1")}</li>
                <li>{t("terms.section.acceptableUse.li2")}</li>
                <li>{t("terms.section.acceptableUse.li3")}</li>
                <li>{t("terms.section.acceptableUse.li4")}</li>
              </ul>
            </section>

            <section id="privacy-notice" className="mt-10">
              <h2>{t("terms.section.privacyNotice.title")}</h2>
              <p>{t("terms.section.privacyNotice.p1")}</p>
            </section>

            <section id="domain-registration" className="mt-10">
              <h2>{t("terms.section.domainRegistration.title")}</h2>
              <p>{t("terms.section.domainRegistration.p1")}</p>
              <p>{t("terms.section.domainRegistration.p2")}</p>
            </section>

            <section id="anti-spam" className="mt-10">
              <h2>{t("terms.section.antiSpam.title")}</h2>
              <p>{t("terms.section.antiSpam.p1")}</p>
            </section>

            <section id="refund-policy" className="mt-10">
              <h2>{t("terms.section.refundPolicy.title")}</h2>
              <p>{t("terms.section.refundPolicy.p1")}</p>
              <p>{t("terms.section.refundPolicy.p2")}</p>
            </section>

            <section className="mt-10">
              <h2>{t("terms.section.payment.title")}</h2>
              <p>{t("terms.section.payment.p1")}</p>
              <p>{t("terms.section.payment.p2")}</p>
            </section>

            <section className="mt-10">
              <h2>{t("terms.section.termination.title")}</h2>
              <p>{t("terms.section.termination.p1")}</p>
            </section>

            <section className="mt-10">
              <h2>{t("terms.section.liability.title")}</h2>
              <p>{t("terms.section.liability.p1")}</p>
            </section>

            <section className="mt-10">
              <h2>{t("terms.section.gdpr.title")}</h2>
              <p>{t("terms.section.gdpr.p1")}</p>
            </section>

            <section className="mt-10">
              <h2>{t("terms.section.governing.title")}</h2>
              <p>{t("terms.section.governing.p1")}</p>
            </section>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default Terms;
