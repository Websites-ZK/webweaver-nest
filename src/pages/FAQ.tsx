import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ScrollReveal from "@/components/ScrollReveal";
import { Search } from "lucide-react";

type FaqCategory = "all" | "hosting" | "domains" | "billing" | "security";

const FAQ = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<FaqCategory>("all");

  const faqs: { q: string; a: string; cat: FaqCategory }[] = [
    { q: t("faq.q1"), a: t("faq.a1"), cat: "hosting" },
    { q: t("faq.q2"), a: t("faq.a2"), cat: "hosting" },
    { q: t("faq.q3"), a: t("faq.a3"), cat: "domains" },
    { q: t("faq.q4"), a: t("faq.a4"), cat: "domains" },
    { q: t("faq.q5"), a: t("faq.a5"), cat: "billing" },
    { q: t("faq.q6"), a: t("faq.a6"), cat: "billing" },
    { q: t("faq.q7"), a: t("faq.a7"), cat: "security" },
    { q: t("faq.q8"), a: t("faq.a8"), cat: "security" },
  ];

  const categories: { key: FaqCategory; label: string }[] = [
    { key: "all", label: t("faq.cat.all") },
    { key: "hosting", label: t("faq.cat.hosting") },
    { key: "domains", label: t("faq.cat.domains") },
    { key: "billing", label: t("faq.cat.billing") },
    { key: "security", label: t("faq.cat.security") },
  ];

  const filtered = useMemo(() => {
    return faqs.filter((f) => {
      const matchCat = category === "all" || f.cat === category;
      const matchSearch = !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [category, search, faqs]);

  return (
    <div className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">{t("faq.title")}</h1>
            <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">{t("faq.subtitle")}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="relative mt-10">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("faq.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              maxLength={100}
            />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors active:scale-[0.97] ${
                  category === cat.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="mt-8">
            {filtered.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">No results found.</p>
            ) : (
              <Accordion type="single" collapsible className="space-y-3">
                {filtered.map((faq, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="rounded-xl border border-border bg-card px-5 shadow-sm">
                    <AccordionTrigger className="text-left text-sm font-medium text-card-foreground hover:no-underline">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default FAQ;
