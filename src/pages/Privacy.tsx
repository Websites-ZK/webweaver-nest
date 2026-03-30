import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ScrollReveal from "@/components/ScrollReveal";
import { Shield, Cookie, FileText, Scale } from "lucide-react";

const Privacy = () => {
  const { t } = useLanguage();

  const accordionItems = [
    { key: "whereData", value: "where-data" },
    { key: "whatCollect", value: "what-collect" },
    { key: "howUsed", value: "how-used" },
  ];

  const cards = [
    { icon: FileText, key: "dataRequests" },
    { icon: Cookie, key: "cookies" },
    { icon: Shield, key: "security" },
    { icon: Scale, key: "gdprRights" },
  ];

  return (
    <div className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      {/* Hero */}
      <ScrollReveal>
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            {t("privacy.overline")}
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {t("privacy.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {t("privacy.subtitle")}
          </p>
        </div>
      </ScrollReveal>

      {/* Accordion summaries */}
      <ScrollReveal delay={100}>
        <div className="mx-auto mt-14 max-w-3xl">
          <Accordion type="single" collapsible className="space-y-3">
            {accordionItems.map((item) => (
              <AccordionItem
                key={item.value}
                value={item.value}
                className="rounded-xl border border-border bg-card px-5 shadow-sm"
              >
                <AccordionTrigger className="text-left text-sm font-medium text-card-foreground hover:no-underline">
                  {t(`privacy.accordion.${item.key}.q`)}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {t(`privacy.accordion.${item.key}.a`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </ScrollReveal>

      {/* Cards grid */}
      <ScrollReveal delay={200}>
        <div className="mx-auto mt-14 grid max-w-4xl gap-5 sm:grid-cols-2">
          {cards.map((card) => (
            <Card key={card.key} className="border-border bg-card shadow-sm">
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <card.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">{t(`privacy.card.${card.key}.title`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{t(`privacy.card.${card.key}.desc`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollReveal>

      {/* Full privacy notice */}
      <ScrollReveal delay={250}>
        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground">{t("privacy.full.title")}</h2>
          <div className="prose prose-sm mt-6 max-w-none text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary">
            <h3>{t("privacy.full.collection.title")}</h3>
            <p>{t("privacy.full.collection.p1")}</p>

            <h3>{t("privacy.full.sharing.title")}</h3>
            <p>{t("privacy.full.sharing.p1")}</p>

            <h3>{t("privacy.full.cookies.title")}</h3>
            <p>{t("privacy.full.cookies.p1")}</p>

            <h3>{t("privacy.full.security.title")}</h3>
            <p>{t("privacy.full.security.p1")}</p>

            <h3>{t("privacy.full.rights.title")}</h3>
            <p>{t("privacy.full.rights.p1")}</p>

            <h3>{t("privacy.full.retention.title")}</h3>
            <p>{t("privacy.full.retention.p1")}</p>

            <h3>{t("privacy.full.children.title")}</h3>
            <p>{t("privacy.full.children.p1")}</p>

            <h3>{t("privacy.full.contact.title")}</h3>
            <p>{t("privacy.full.contact.p1")}</p>
          </div>

          <div className="mt-8 rounded-xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
            {t("privacy.full.termsLink")}{" "}
            <Link to="/terms" className="font-medium text-primary hover:underline">
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default Privacy;
