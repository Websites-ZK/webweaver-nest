import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import ScrollReveal from "@/components/ScrollReveal";

const SocialProof = () => {
  const { t } = useLanguage();

  const testimonials = [
    {
      name: "Marko P.",
      role: t("social.role.agency"),
      text: t("social.testimonial1"),
      rating: 5,
    },
    {
      name: "Sarah K.",
      role: t("social.role.freelancer"),
      text: t("social.testimonial2"),
      rating: 5,
    },
    {
      name: "Luka M.",
      role: t("social.role.startup"),
      text: t("social.testimonial3"),
      rating: 5,
    },
  ];

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-lg font-bold text-foreground">
              4.8/5 {t("social.from")} 2,000+ {t("social.reviews")}
            </p>
            <p className="text-sm text-muted-foreground">{t("social.trusted")}</p>
          </div>
        </ScrollReveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {testimonials.map((item, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(item.rating)].map((_, si) => (
                    <Star key={si} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground italic">
                  "{item.text}"
                </p>
                <div className="mt-4 border-t border-border pt-3">
                  <p className="text-sm font-semibold text-card-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
