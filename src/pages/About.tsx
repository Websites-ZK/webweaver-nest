import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import { Mail, Phone, MapPin, Zap, Shield, Heart } from "lucide-react";

const About = () => {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);

  const values = [
    { icon: Zap, title: t("about.values.speed"), desc: t("about.values.speedDesc") },
    { icon: Shield, title: t("about.values.trust"), desc: t("about.values.trustDesc") },
    { icon: Heart, title: t("about.values.support"), desc: t("about.values.supportDesc") },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setError(false);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = (formData.get("name") as string)?.trim().slice(0, 100);
    const email = (formData.get("email") as string)?.trim().slice(0, 255);
    const subject = (formData.get("subject") as string)?.trim().slice(0, 200);
    const message = (formData.get("message") as string)?.trim().slice(0, 1000);

    if (!name || !email || !subject || !message) {
      setSending(false);
      return;
    }

    const { error: dbError } = await supabase
      .from("contact_messages")
      .insert({ name, email, subject, message });

    setSending(false);
    if (dbError) {
      setError(true);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="overflow-hidden">
      <SEOHead
        title="About WebWeaver - EU Web Hosting Company"
        description="Learn about WebWeaver, our mission to provide fast, affordable, GDPR-compliant hosting for businesses across Europe."
        path="/about"
      />

      {/* About Hero */}
      <section className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/6 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">{t("about.title")}</h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground" style={{ textWrap: "pretty" }}>
              {t("about.subtitle")}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Story & Mission */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2">
          <ScrollReveal direction="left">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-card-foreground">{t("about.story.title")}</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">{t("about.story.text")}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="right">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-card-foreground">{t("about.mission.title")}</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">{t("about.mission.text")}</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/30 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <ScrollReveal>
            <h2 className="text-center text-3xl font-bold text-foreground">{t("about.values.title")}</h2>
          </ScrollReveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {values.map((v, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <v.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold text-card-foreground">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground">{t("contact.title")}</h2>
              <p className="mt-3 text-muted-foreground">{t("contact.subtitle")}</p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid gap-10 lg:grid-cols-5">
            <ScrollReveal direction="left" className="lg:col-span-3">
              {sent ? (
                <div className="flex h-full items-center justify-center rounded-2xl border border-border bg-card p-10">
                  <p className="text-center text-lg font-medium text-primary">{t("contact.success")}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-8 shadow-sm">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-card-foreground">{t("contact.name")}</label>
                      <Input name="name" required maxLength={100} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-card-foreground">{t("contact.email")}</label>
                      <Input name="email" type="email" required maxLength={255} />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-card-foreground">{t("contact.subject")}</label>
                    <Input name="subject" required maxLength={200} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-card-foreground">{t("contact.message")}</label>
                    <Textarea name="message" required rows={5} maxLength={1000} />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive">{t("contact.error")}</p>
                  )}
                  <Button type="submit" size="lg" className="w-full active:scale-[0.97] transition-all" disabled={sending}>
                    {sending ? t("contact.sending") : t("contact.send")}
                  </Button>
                </form>
              )}
            </ScrollReveal>

            <ScrollReveal direction="right" className="lg:col-span-2">
              <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-card-foreground">{t("contact.info.title")}</h3>
                <ul className="mt-6 space-y-5">
                  <li className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">{t("contact.info.email")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">{t("contact.info.phone")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">{t("contact.info.address")}</span>
                  </li>
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
