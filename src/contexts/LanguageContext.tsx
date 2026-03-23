import React, { createContext, useContext, useState, useCallback } from "react";

type Language = "en" | "hr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    "nav.home": "Home",
    "nav.pricing": "Pricing",
    "nav.about": "About",
    "nav.faq": "Knowledge Base",
    "nav.login": "Log In",
    "nav.register": "Sign Up",
    "nav.getStarted": "Get Started",

    // Hero
    "hero.badge": "Trusted by 15,000+ websites worldwide",
    "hero.title": "Launch Your Website with Lightning Speed",
    "hero.subtitle": "Blazing-fast hosting, instant domain registration, SSL certificates, and everything you need to get online — all in one place.",
    "hero.cta": "View Plans",
    "hero.ctaSecondary": "Learn More",

    // Stats
    "stats.uptime": "99.9% Uptime",
    "stats.uptimeDesc": "Enterprise-grade reliability",
    "stats.support": "24/7 Support",
    "stats.supportDesc": "Always here to help",
    "stats.speed": "< 200ms",
    "stats.speedDesc": "Average response time",
    "stats.customers": "15,000+",
    "stats.customersDesc": "Happy customers",

    // Services
    "services.title": "Everything You Need to Go Online",
    "services.subtitle": "From domain registration to dedicated servers — we've got you covered.",
    "services.hosting.title": "Web Hosting",
    "services.hosting.desc": "High-performance shared hosting with SSD storage, free SSL, and one-click installs.",
    "services.domains.title": "Domain Registration",
    "services.domains.desc": "Search and register your perfect domain from hundreds of extensions.",
    "services.ssl.title": "SSL Certificates",
    "services.ssl.desc": "Protect your site and visitors with enterprise-grade SSL encryption.",
    "services.email.title": "Email Hosting",
    "services.email.desc": "Professional email addresses with your domain, spam protection included.",
    "services.vps.title": "VPS Servers",
    "services.vps.desc": "Full root access with scalable resources for growing projects.",
    "services.dedicated.title": "Dedicated Servers",
    "services.dedicated.desc": "Maximum power and control with fully dedicated hardware.",

    // Testimonials
    "testimonials.title": "What Our Customers Say",
    "testimonials.subtitle": "Join thousands of satisfied customers who trust us with their online presence.",
    "testimonials.1.text": "Migrating was seamless. Our site loads twice as fast now and the support team is incredibly responsive.",
    "testimonials.1.name": "Marko Petrović",
    "testimonials.1.role": "CTO, TechStart",
    "testimonials.2.text": "The best hosting experience I've had in 10 years of web development. Simple, fast, reliable.",
    "testimonials.2.name": "Ana Kovačević",
    "testimonials.2.role": "Freelance Developer",
    "testimonials.3.text": "We switched our entire infrastructure over. The VPS performance is outstanding for the price.",
    "testimonials.3.name": "Ivan Horvat",
    "testimonials.3.role": "Founder, WebShop.hr",

    // Pricing
    "pricing.title": "Simple, Transparent Pricing",
    "pricing.subtitle": "No hidden fees. Pick a plan that fits your needs and scale as you grow.",
    "pricing.monthly": "Monthly",
    "pricing.yearly": "Yearly",
    "pricing.yearlyDiscount": "Save 20%",
    "pricing.starter": "Starter",
    "pricing.business": "Business",
    "pricing.enterprise": "Enterprise",
    "pricing.starter.desc": "Perfect for personal sites and small projects.",
    "pricing.business.desc": "For growing businesses and agencies.",
    "pricing.enterprise.desc": "Maximum power for demanding applications.",
    "pricing.mo": "/mo",
    "pricing.popular": "Most Popular",
    "pricing.choosePlan": "Choose Plan",
    "pricing.contactSales": "Contact Sales",
    "pricing.features": "What's Included",
    "pricing.feature.storage": "SSD Storage",
    "pricing.feature.bandwidth": "Bandwidth",
    "pricing.feature.domains": "Domains",
    "pricing.feature.email": "Email Accounts",
    "pricing.feature.ssl": "Free SSL",
    "pricing.feature.backups": "Daily Backups",
    "pricing.feature.support": "Priority Support",
    "pricing.feature.vps": "VPS Resources",
    "pricing.starter.storage": "10 GB SSD",
    "pricing.starter.bandwidth": "100 GB",
    "pricing.starter.domains": "1 Domain",
    "pricing.starter.email": "5 Email Accounts",
    "pricing.business.storage": "50 GB SSD",
    "pricing.business.bandwidth": "Unlimited",
    "pricing.business.domains": "10 Domains",
    "pricing.business.email": "25 Email Accounts",
    "pricing.enterprise.storage": "200 GB SSD",
    "pricing.enterprise.bandwidth": "Unlimited",
    "pricing.enterprise.domains": "Unlimited",
    "pricing.enterprise.email": "Unlimited",
    "pricing.comparisonTitle": "Detailed Feature Comparison",

    // About
    "about.title": "About Us",
    "about.subtitle": "We're a team of developers and hosting enthusiasts on a mission to make the web faster and more accessible.",
    "about.story.title": "Our Story",
    "about.story.text": "Founded in 2020, we started with a simple idea: hosting should be fast, affordable, and stress-free. What began as a small project serving local businesses has grown into a platform trusted by thousands across Europe.",
    "about.mission.title": "Our Mission",
    "about.mission.text": "To empower individuals and businesses to build their online presence without the technical headaches. We handle the infrastructure so you can focus on what matters.",
    "about.values.title": "Our Values",
    "about.values.speed": "Speed First",
    "about.values.speedDesc": "Every millisecond counts. We optimize relentlessly.",
    "about.values.trust": "Trust & Transparency",
    "about.values.trustDesc": "No hidden fees. No surprises. Ever.",
    "about.values.support": "Human Support",
    "about.values.supportDesc": "Real people, real help, real fast.",

    // Contact
    "contact.title": "Get in Touch",
    "contact.subtitle": "Have a question or need help? We'd love to hear from you.",
    "contact.name": "Your Name",
    "contact.email": "Email Address",
    "contact.subject": "Subject",
    "contact.message": "Message",
    "contact.send": "Send Message",
    "contact.success": "Message sent! We'll get back to you within 24 hours.",
    "contact.info.title": "Contact Information",
    "contact.info.email": "support@hostpro.com",
    "contact.info.phone": "+385 1 234 5678",
    "contact.info.address": "Zagreb, Croatia",

    // FAQ
    "faq.title": "Knowledge Base",
    "faq.subtitle": "Find answers to common questions about our services.",
    "faq.search": "Search articles...",
    "faq.cat.hosting": "Hosting",
    "faq.cat.domains": "Domains",
    "faq.cat.billing": "Billing",
    "faq.cat.security": "Security",
    "faq.cat.all": "All",
    "faq.q1": "How do I migrate my existing website?",
    "faq.a1": "We offer free migration for all plans. Simply contact our support team and we'll handle the entire process, usually within 24 hours with zero downtime.",
    "faq.q2": "What uptime guarantee do you provide?",
    "faq.a2": "We guarantee 99.9% uptime across all plans. If we fail to meet this, you'll receive credit on your account proportional to the downtime.",
    "faq.q3": "Can I register a .hr domain?",
    "faq.a3": "Yes! We support .hr domains along with hundreds of other extensions including .com, .eu, .net, .org, and many more.",
    "faq.q4": "How does domain transfer work?",
    "faq.a4": "Unlock your domain at your current registrar, obtain the EPP/auth code, and initiate the transfer through our dashboard. Most transfers complete within 5-7 days.",
    "faq.q5": "What payment methods do you accept?",
    "faq.a5": "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for annual plans.",
    "faq.q6": "Can I upgrade my plan at any time?",
    "faq.a6": "Absolutely. You can upgrade or downgrade at any time. When upgrading, you'll only pay the prorated difference for the remaining billing period.",
    "faq.q7": "Is SSL included free with hosting?",
    "faq.a7": "Yes, all hosting plans include free Let's Encrypt SSL certificates that auto-renew. Premium Wildcard and EV certificates are also available.",
    "faq.q8": "Do you provide DDoS protection?",
    "faq.a8": "All plans include basic DDoS mitigation. Business and Enterprise plans feature advanced protection with real-time threat monitoring.",

    // Auth
    "auth.login": "Log In",
    "auth.register": "Create Account",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.name": "Full Name",
    "auth.forgotPassword": "Forgot password?",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    "auth.orContinue": "Or continue with",
    "auth.google": "Google",
    "auth.github": "GitHub",

    // Footer
    "footer.description": "Fast, reliable, and affordable web hosting for everyone.",
    "footer.product": "Product",
    "footer.company": "Company",
    "footer.legal": "Legal",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.cookies": "Cookie Policy",
    "footer.rights": "All rights reserved.",
  },
  hr: {
    // Nav
    "nav.home": "Početna",
    "nav.pricing": "Cijene",
    "nav.about": "O nama",
    "nav.faq": "Baza znanja",
    "nav.login": "Prijava",
    "nav.register": "Registracija",
    "nav.getStarted": "Započni",

    // Hero
    "hero.badge": "Povjerenje 15.000+ web stranica širom svijeta",
    "hero.title": "Pokrenite svoju web stranicu munjevitom brzinom",
    "hero.subtitle": "Brzi hosting, trenutna registracija domena, SSL certifikati i sve što trebate za online prisutnost — sve na jednom mjestu.",
    "hero.cta": "Pogledaj planove",
    "hero.ctaSecondary": "Saznaj više",

    // Stats
    "stats.uptime": "99.9% Dostupnost",
    "stats.uptimeDesc": "Pouzdanost poslovne razine",
    "stats.support": "24/7 Podrška",
    "stats.supportDesc": "Uvijek tu za vas",
    "stats.speed": "< 200ms",
    "stats.speedDesc": "Prosječno vrijeme odgovora",
    "stats.customers": "15.000+",
    "stats.customersDesc": "Zadovoljnih korisnika",

    // Services
    "services.title": "Sve što trebate za online prisutnost",
    "services.subtitle": "Od registracije domene do dedicirane infrastrukture — pokrivamo sve.",
    "services.hosting.title": "Web Hosting",
    "services.hosting.desc": "Brzi dijeljeni hosting s SSD pohranom, besplatnim SSL-om i instalacijom jednim klikom.",
    "services.domains.title": "Registracija domena",
    "services.domains.desc": "Pretražite i registrirajte savršenu domenu iz stotina ekstenzija.",
    "services.ssl.title": "SSL Certifikati",
    "services.ssl.desc": "Zaštitite svoju stranicu i posjetitelje enkripcijom poslovne razine.",
    "services.email.title": "Email Hosting",
    "services.email.desc": "Profesionalne email adrese s vašom domenom, zaštita od spama uključena.",
    "services.vps.title": "VPS Serveri",
    "services.vps.desc": "Puni root pristup sa skalabilnim resursima za rastuće projekte.",
    "services.dedicated.title": "Dedicirani Serveri",
    "services.dedicated.desc": "Maksimalna snaga i kontrola s potpuno posvećenim hardverom.",

    // Testimonials
    "testimonials.title": "Što kažu naši korisnici",
    "testimonials.subtitle": "Pridružite se tisućama zadovoljnih korisnika koji nam povjeravaju svoju online prisutnost.",
    "testimonials.1.text": "Migracija je bila besprijekorna. Naša stranica se sada učitava duplo brže, a tim za podršku je nevjerojatno brz.",
    "testimonials.1.name": "Marko Petrović",
    "testimonials.1.role": "CTO, TechStart",
    "testimonials.2.text": "Najbolje iskustvo hostinga u 10 godina web razvoja. Jednostavno, brzo, pouzdano.",
    "testimonials.2.name": "Ana Kovačević",
    "testimonials.2.role": "Freelance programerka",
    "testimonials.3.text": "Prebacili smo cijelu infrastrukturu. VPS performanse su izvrsne za tu cijenu.",
    "testimonials.3.name": "Ivan Horvat",
    "testimonials.3.role": "Osnivač, WebShop.hr",

    // Pricing
    "pricing.title": "Jednostavne, transparentne cijene",
    "pricing.subtitle": "Bez skrivenih naknada. Odaberite plan koji vam odgovara i rastite.",
    "pricing.monthly": "Mjesečno",
    "pricing.yearly": "Godišnje",
    "pricing.yearlyDiscount": "Uštedite 20%",
    "pricing.starter": "Starter",
    "pricing.business": "Business",
    "pricing.enterprise": "Enterprise",
    "pricing.starter.desc": "Idealno za osobne stranice i male projekte.",
    "pricing.business.desc": "Za rastuće tvrtke i agencije.",
    "pricing.enterprise.desc": "Maksimalna snaga za zahtjevne aplikacije.",
    "pricing.mo": "/mj",
    "pricing.popular": "Najpopularniji",
    "pricing.choosePlan": "Odaberi plan",
    "pricing.contactSales": "Kontaktiraj prodaju",
    "pricing.features": "Što je uključeno",
    "pricing.feature.storage": "SSD Pohrana",
    "pricing.feature.bandwidth": "Promet",
    "pricing.feature.domains": "Domene",
    "pricing.feature.email": "Email računi",
    "pricing.feature.ssl": "Besplatni SSL",
    "pricing.feature.backups": "Dnevne sigurnosne kopije",
    "pricing.feature.support": "Prioritetna podrška",
    "pricing.feature.vps": "VPS resursi",
    "pricing.starter.storage": "10 GB SSD",
    "pricing.starter.bandwidth": "100 GB",
    "pricing.starter.domains": "1 Domena",
    "pricing.starter.email": "5 Email računa",
    "pricing.business.storage": "50 GB SSD",
    "pricing.business.bandwidth": "Neograničeno",
    "pricing.business.domains": "10 Domena",
    "pricing.business.email": "25 Email računa",
    "pricing.enterprise.storage": "200 GB SSD",
    "pricing.enterprise.bandwidth": "Neograničeno",
    "pricing.enterprise.domains": "Neograničeno",
    "pricing.enterprise.email": "Neograničeno",
    "pricing.comparisonTitle": "Detaljno usporedba značajki",

    // About
    "about.title": "O nama",
    "about.subtitle": "Tim programera i hosting entuzijasta s misijom da web učinimo bržim i dostupnijim.",
    "about.story.title": "Naša priča",
    "about.story.text": "Osnovani 2020. godine, krenuli smo s jednostavnom idejom: hosting treba biti brz, pristupačan i bez stresa. Ono što je počelo kao mali projekt za lokalne tvrtke izraslo je u platformu kojoj vjeruju tisuće korisnika diljem Europe.",
    "about.mission.title": "Naša misija",
    "about.mission.text": "Osnažiti pojedince i tvrtke da izgrade svoju online prisutnost bez tehničkih glavobolja. Mi brinemo o infrastrukturi kako biste se vi mogli fokusirati na ono što je važno.",
    "about.values.title": "Naše vrijednosti",
    "about.values.speed": "Brzina na prvom mjestu",
    "about.values.speedDesc": "Svaka milisekunda je važna. Optimiziramo bez prestanka.",
    "about.values.trust": "Povjerenje i transparentnost",
    "about.values.trustDesc": "Bez skrivenih naknada. Bez iznenađenja. Nikada.",
    "about.values.support": "Ljudska podrška",
    "about.values.supportDesc": "Stvarni ljudi, stvarna pomoć, stvarno brzo.",

    // Contact
    "contact.title": "Kontaktirajte nas",
    "contact.subtitle": "Imate pitanje ili trebate pomoć? Rado ćemo vas čuti.",
    "contact.name": "Vaše ime",
    "contact.email": "Email adresa",
    "contact.subject": "Predmet",
    "contact.message": "Poruka",
    "contact.send": "Pošalji poruku",
    "contact.success": "Poruka poslana! Odgovorit ćemo vam u roku od 24 sata.",
    "contact.info.title": "Kontakt informacije",
    "contact.info.email": "podrska@hostpro.com",
    "contact.info.phone": "+385 1 234 5678",
    "contact.info.address": "Zagreb, Hrvatska",

    // FAQ
    "faq.title": "Baza znanja",
    "faq.subtitle": "Pronađite odgovore na česta pitanja o našim uslugama.",
    "faq.search": "Pretraži članke...",
    "faq.cat.hosting": "Hosting",
    "faq.cat.domains": "Domene",
    "faq.cat.billing": "Naplata",
    "faq.cat.security": "Sigurnost",
    "faq.cat.all": "Sve",
    "faq.q1": "Kako mogu migrirati postojeću web stranicu?",
    "faq.a1": "Nudimo besplatnu migraciju za sve planove. Kontaktirajte naš tim za podršku i mi ćemo obaviti cijeli proces, obično unutar 24 sata bez prekida rada.",
    "faq.q2": "Kakvu garanciju dostupnosti pružate?",
    "faq.a2": "Garantiramo 99.9% dostupnost za sve planove. Ako ne ispunimo ovaj standard, dobit ćete kredit na račun razmjeran vremenu nedostupnosti.",
    "faq.q3": "Mogu li registrirati .hr domenu?",
    "faq.a3": "Da! Podržavamo .hr domene zajedno sa stotinama drugih ekstenzija uključujući .com, .eu, .net, .org i mnoge druge.",
    "faq.q4": "Kako funkcionira transfer domene?",
    "faq.a4": "Otključajte domenu kod trenutnog registra, pribavite EPP/auth kod i pokrenite transfer putem naše upravljačke ploče. Većina transfera se završi u 5-7 dana.",
    "faq.q5": "Koje načine plaćanja prihvaćate?",
    "faq.a5": "Prihvaćamo sve veće kreditne kartice (Visa, Mastercard, American Express), PayPal i bankovne transfere za godišnje planove.",
    "faq.q6": "Mogu li nadograditi plan u bilo kojem trenutku?",
    "faq.a6": "Apsolutno. Možete nadograditi ili sniziti plan u bilo kojem trenutku. Kod nadogradnje plaćate samo proporcionalni iznos za preostalo obračunsko razdoblje.",
    "faq.q7": "Je li SSL uključen besplatno s hostingom?",
    "faq.a7": "Da, svi hosting planovi uključuju besplatne Let's Encrypt SSL certifikate koji se automatski obnavljaju. Premium Wildcard i EV certifikati su također dostupni.",
    "faq.q8": "Pružate li DDoS zaštitu?",
    "faq.a8": "Svi planovi uključuju osnovnu DDoS zaštitu. Business i Enterprise planovi imaju naprednu zaštitu s praćenjem prijetnji u stvarnom vremenu.",

    // Auth
    "auth.login": "Prijava",
    "auth.register": "Kreiraj račun",
    "auth.email": "Email",
    "auth.password": "Lozinka",
    "auth.confirmPassword": "Potvrdi lozinku",
    "auth.name": "Puno ime",
    "auth.forgotPassword": "Zaboravili ste lozinku?",
    "auth.noAccount": "Nemate račun?",
    "auth.hasAccount": "Već imate račun?",
    "auth.orContinue": "Ili nastavite s",
    "auth.google": "Google",
    "auth.github": "GitHub",

    // Footer
    "footer.description": "Brz, pouzdan i pristupačan web hosting za sve.",
    "footer.product": "Proizvod",
    "footer.company": "Tvrtka",
    "footer.legal": "Pravno",
    "footer.privacy": "Pravila privatnosti",
    "footer.terms": "Uvjeti korištenja",
    "footer.cookies": "Pravila kolačića",
    "footer.rights": "Sva prava pridržana.",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = useCallback(
    (key: string): string => {
      return translations[language][key] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
