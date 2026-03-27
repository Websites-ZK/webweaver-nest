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
    "nav.hosting": "Hosting",
    "nav.pricing": "Pricing",
    "nav.about": "About",
    "nav.support": "Support",
    "nav.getStarted": "Get started",

    // Hero
    "hero.badge": "Servers in Croatia · Built for the Balkans",
    "hero.title": "Fast, affordable hosting for Central & Southeast Europe",
    "hero.subtitle": "Up to 50% cheaper than Bluehost. Your data stays in the EU. Faster load times for your local customers.",
    "hero.cta": "Start for €1.49/mo",
    "hero.ctaSecondary": "See all plans",

    // Hero stats
    "hero.stat1.value": "€1.49",
    "hero.stat1.label": "Starting price/mo",
    "hero.stat2.value": "99.9%",
    "hero.stat2.label": "Uptime SLA",
    "hero.stat3.value": "50%",
    "hero.stat3.label": "Cheaper than Bluehost",
    "hero.stat4.value": "<20ms",
    "hero.stat4.label": "Latency in Balkans",

    // Trust bar
    "trust.ssl": "Free SSL on all plans",
    "trust.monitoring": "24/7 monitoring",
    "trust.gdpr": "GDPR compliant · EU data",
    "trust.cpanel": "cPanel included free",
    "trust.backups": "Daily backups",

    // Features
    "features.title": "Everything you need to host with confidence",
    "features.subtitle": "Built for small businesses, agencies, and developers across the region",
    "features.datacenter.title": "Croatian data center",
    "features.datacenter.desc": "Your data stays in the EU. Faster speeds for customers in HR, RS, BA, SI, and DE.",
    "features.uptime.title": "99.9% uptime SLA",
    "features.uptime.desc": "Redundant power, UPS backup, and 24/7 monitoring keep your sites online.",
    "features.ssl.title": "Free SSL + GDPR",
    "features.ssl.desc": "Every plan includes SSL certificates and full GDPR compliance for EU businesses.",
    "features.cpanel.title": "cPanel control panel",
    "features.cpanel.desc": "Industry-standard cPanel on every plan. Manage files, databases, and email easily.",
    "features.ssd.title": "SSD storage",
    "features.ssd.desc": "All plans run on fast SSD drives. No spinning disks — significantly faster page loads.",
    "features.wordpress.title": "1-click WordPress",
    "features.wordpress.desc": "Install WordPress, Joomla, or Drupal in one click via the Softaculous installer.",

    // Pricing
    "pricing.title": "Simple, transparent pricing",
    "pricing.subtitle": "No hidden fees. No surprise renewals. What you see is what you pay.",
    "pricing.monthly": "Monthly",
    "pricing.12months": "12 Months",
    "pricing.24months": "24 Months",
    "pricing.save15": "Save 15%",
    "pricing.save25": "Save 25%",
    "pricing.basic": "Basic",
    "pricing.basic.desc": "Perfect for small sites and personal projects.",
    "pricing.standard": "Standard",
    "pricing.standard.desc": "The most popular choice for growing websites.",
    "pricing.business": "Business",
    "pricing.business.desc": "For growing companies that need more power.",
    "pricing.agency": "Agency",
    "pricing.agency.desc": "For resellers and agencies managing multiple sites.",
    "pricing.mo": "/mo",
    "pricing.mostPopular": "Most popular",
    "pricing.getStarted": "Get started",
    "pricing.unlimited": "Unlimited",
    "pricing.feature.websites": "Websites",
    "pricing.feature.storage": "SSD Storage",
    "pricing.feature.visits": "Visits/mo",
    "pricing.feature.ssl": "Free SSL",
    "pricing.feature.cpanel": "cPanel",
    "pricing.feature.backup": "Daily backup",
    "pricing.feature.support": "Support",
    "pricing.feature.cpu": "CPU",
    "pricing.support.standard": "Email support",
    "pricing.support.priority": "Priority support",
    "pricing.support.phone": "Phone + chat support",
    "pricing.support.dedicated": "Dedicated support line",

    // Why choose us
    "why.title": "Why businesses choose WebWeaver",
    "why.subtitle": "Local hosting with a real advantage",
    "why.1.title": "Servers physically in Croatia",
    "why.1.desc": "Your website loads faster for visitors in Zagreb, Belgrade, Sarajevo, and Ljubljana — because the data doesn't travel to Texas and back.",
    "why.2.title": "Half the price of global providers",
    "why.2.desc": "We pass our low infrastructure costs directly to you. No VC investors to satisfy — just fair pricing for the region.",
    "why.3.title": "Support in your language",
    "why.3.desc": "Croatian, Serbian, Bosnian, Slovenian — our team speaks your language and understands local business needs.",
    "why.4.title": "GDPR by default",
    "why.4.desc": "All data stored in the EU. No cross-Atlantic transfers. No compliance headaches for your clients or customers.",

    // Country pills
    "country.croatia": "Croatia",
    "country.serbia": "Serbia",
    "country.bosnia": "Bosnia",
    "country.slovenia": "Slovenia",
    "country.germany": "Germany",
    "country.austria": "Austria",
    "country.hungary": "Hungary",

    // CTA band
    "cta.title": "Ready to switch to faster, cheaper hosting?",
    "cta.subtitle": "Start today. Free migration from your current host included on Business and Agency plans.",
    "cta.button": "Start for €1.49/mo",

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
    "contact.info.email": "support@webweaver.hr",
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
    "auth.error": "Error",
    "auth.loginSuccess": "Welcome back!",
    "auth.registerSuccess": "Account created!",
    "auth.checkEmail": "Check your email to confirm your account.",
    "auth.passwordMismatch": "Passwords do not match",
    "auth.passwordTooShort": "Password must be at least 6 characters",
    "auth.logout": "Log out",

    // Onboarding
    "onboarding.step1": "Choose your plan",
    "onboarding.step2": "Set up your domain",
    "onboarding.step3": "Add extras",
    "onboarding.step4": "Review & confirm",
    "onboarding.step1.desc": "Select the plan that fits your needs.",
    "onboarding.step2.desc": "Connect your existing domain or register a new one.",
    "onboarding.step3.desc": "Enhance your hosting with optional add-ons.",
    "onboarding.step4.desc": "Review your selections before confirming.",
    "onboarding.selected": "Selected",
    "onboarding.next": "Continue",
    "onboarding.back": "Back",
    "onboarding.confirm": "Confirm & activate",
    "onboarding.existingDomain": "I have a domain",
    "onboarding.existingDomain.desc": "Connect a domain you already own.",
    "onboarding.newDomain": "Register a new domain",
    "onboarding.newDomain.desc": "Search and register a new domain name.",
    "onboarding.enterDomain": "Enter your domain name",
    "onboarding.searchDomain": "Search for a domain",
    "onboarding.domainHint": "You can always change this later in your dashboard.",
    "onboarding.plan": "Plan",
    "onboarding.domain": "Domain",
    "onboarding.extras": "Add-ons",
    "onboarding.total": "Total",
    "onboarding.extra.backup": "Automatic backups",
    "onboarding.extra.backup.desc": "Daily automated backups with one-click restore.",
    "onboarding.extra.email": "Professional email",
    "onboarding.extra.email.desc": "Custom email addresses with your domain.",
    "onboarding.extra.priority": "Priority support",
    "onboarding.extra.priority.desc": "Skip the queue with dedicated support agents.",
    "onboarding.extra.ddos": "DDoS protection",
    "onboarding.extra.ddos.desc": "Advanced protection against DDoS attacks.",

    // Footer
    "footer.description": "Fast, reliable, and affordable web hosting for everyone.",
    "footer.copyright": "© 2026 WebWeaver · Hosted in Croatia, EU",
    "footer.privacy": "Privacy",
    "footer.terms": "Terms",
    "footer.support": "Support",
  },
  hr: {
    // Nav
    "nav.hosting": "Hosting",
    "nav.pricing": "Cijene",
    "nav.about": "O nama",
    "nav.support": "Podrška",
    "nav.getStarted": "Započni",

    // Hero
    "hero.badge": "Serveri u Hrvatskoj · Napravljeno za Balkan",
    "hero.title": "Brz, pristupačan hosting za srednju i jugoistočnu Europu",
    "hero.subtitle": "Do 50% jeftinije od Bluehosta. Vaši podaci ostaju u EU. Brže učitavanje za vaše lokalne korisnike.",
    "hero.cta": "Započni za €1,49/mj",
    "hero.ctaSecondary": "Pogledaj sve planove",

    // Hero stats
    "hero.stat1.value": "€1,49",
    "hero.stat1.label": "Početna cijena/mj",
    "hero.stat2.value": "99,9%",
    "hero.stat2.label": "SLA dostupnost",
    "hero.stat3.value": "50%",
    "hero.stat3.label": "Jeftinije od Bluehosta",
    "hero.stat4.value": "<20ms",
    "hero.stat4.label": "Latencija na Balkanu",

    // Trust bar
    "trust.ssl": "Besplatni SSL na svim planovima",
    "trust.monitoring": "24/7 nadzor",
    "trust.gdpr": "GDPR sukladan · EU podaci",
    "trust.cpanel": "cPanel uključen besplatno",
    "trust.backups": "Dnevne sigurnosne kopije",

    // Features
    "features.title": "Sve što trebate za hosting s povjerenjem",
    "features.subtitle": "Napravljeno za male tvrtke, agencije i programere diljem regije",
    "features.datacenter.title": "Podatkovni centar u Hrvatskoj",
    "features.datacenter.desc": "Vaši podaci ostaju u EU. Brže brzine za korisnike u HR, RS, BA, SI i DE.",
    "features.uptime.title": "99,9% SLA dostupnost",
    "features.uptime.desc": "Redundantno napajanje, UPS i 24/7 nadzor drže vaše stranice online.",
    "features.ssl.title": "Besplatni SSL + GDPR",
    "features.ssl.desc": "Svaki plan uključuje SSL certifikate i potpunu GDPR sukladnost za EU tvrtke.",
    "features.cpanel.title": "cPanel upravljačka ploča",
    "features.cpanel.desc": "Industrijski standard cPanel na svakom planu. Upravljajte datotekama, bazama i emailom.",
    "features.ssd.title": "SSD pohrana",
    "features.ssd.desc": "Svi planovi rade na brzim SSD diskovima. Bez mehaničkih diskova — značajno brže učitavanje.",
    "features.wordpress.title": "WordPress jednim klikom",
    "features.wordpress.desc": "Instalirajte WordPress, Joomla ili Drupal jednim klikom putem Softaculous instalera.",

    // Pricing
    "pricing.title": "Jednostavne, transparentne cijene",
    "pricing.subtitle": "Bez skrivenih naknada. Bez iznenađenja pri obnovi. Što vidite, to i plaćate.",
    "pricing.monthly": "Mjesečno",
    "pricing.12months": "12 Mjeseci",
    "pricing.24months": "24 Mjeseca",
    "pricing.save15": "Uštedite 15%",
    "pricing.save25": "Uštedite 25%",
    "pricing.basic": "Basic",
    "pricing.basic.desc": "Idealno za male stranice i osobne projekte.",
    "pricing.standard": "Standard",
    "pricing.standard.desc": "Najpopularniji izbor za rastuće web stranice.",
    "pricing.business": "Business",
    "pricing.business.desc": "Za rastuće tvrtke kojima treba više snage.",
    "pricing.agency": "Agency",
    "pricing.agency.desc": "Za preprodavače i agencije koje upravljaju višestrukim stranicama.",
    "pricing.mo": "/mj",
    "pricing.mostPopular": "Najpopularnije",
    "pricing.getStarted": "Započni",
    "pricing.unlimited": "Neograničeno",
    "pricing.feature.websites": "Web stranice",
    "pricing.feature.storage": "SSD Pohrana",
    "pricing.feature.visits": "Posjeta/mj",
    "pricing.feature.ssl": "Besplatni SSL",
    "pricing.feature.cpanel": "cPanel",
    "pricing.feature.backup": "Dnevna kopija",
    "pricing.feature.support": "Podrška",
    "pricing.feature.cpu": "CPU",
    "pricing.support.standard": "Email podrška",
    "pricing.support.priority": "Prioritetna podrška",
    "pricing.support.phone": "Telefon + chat podrška",
    "pricing.support.dedicated": "Dedicirani kanal podrške",

    // Why choose us
    "why.title": "Zašto tvrtke biraju WebWeaver",
    "why.subtitle": "Lokalni hosting s pravom prednošću",
    "why.1.title": "Serveri fizički u Hrvatskoj",
    "why.1.desc": "Vaša web stranica se brže učitava za posjetitelje u Zagrebu, Beogradu, Sarajevu i Ljubljani — jer podaci ne putuju do Teksasa i natrag.",
    "why.2.title": "Upola jeftinije od globalnih pružatelja",
    "why.2.desc": "Naše niske troškove infrastrukture prenosimo izravno na vas. Bez VC investitora — samo fer cijene za regiju.",
    "why.3.title": "Podrška na vašem jeziku",
    "why.3.desc": "Hrvatski, srpski, bosanski, slovenski — naš tim govori vaš jezik i razumije lokalne poslovne potrebe.",
    "why.4.title": "GDPR po defaultu",
    "why.4.desc": "Svi podaci pohranjeni u EU. Bez transatlantskih prijenosa. Bez problema s uskladnošću za vaše klijente.",

    // Country pills
    "country.croatia": "Hrvatska",
    "country.serbia": "Srbija",
    "country.bosnia": "Bosna",
    "country.slovenia": "Slovenija",
    "country.germany": "Njemačka",
    "country.austria": "Austrija",
    "country.hungary": "Mađarska",

    // CTA band
    "cta.title": "Spremni za prelazak na brži, jeftiniji hosting?",
    "cta.subtitle": "Započnite danas. Besplatna migracija s vašeg trenutnog hosta uključena na Business i Agency planovima.",
    "cta.button": "Započni za €1,49/mj",

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
    "contact.info.email": "podrska@webweaver.hr",
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
    "auth.error": "Greška",
    "auth.loginSuccess": "Dobrodošli natrag!",
    "auth.registerSuccess": "Račun kreiran!",
    "auth.checkEmail": "Provjerite email za potvrdu računa.",
    "auth.passwordMismatch": "Lozinke se ne podudaraju",
    "auth.passwordTooShort": "Lozinka mora imati najmanje 6 znakova",
    "auth.logout": "Odjava",

    // Onboarding
    "onboarding.step1": "Odaberite plan",
    "onboarding.step2": "Postavite domenu",
    "onboarding.step3": "Dodajte dodatke",
    "onboarding.step4": "Pregled i potvrda",
    "onboarding.step1.desc": "Odaberite plan koji odgovara vašim potrebama.",
    "onboarding.step2.desc": "Povežite postojeću domenu ili registrirajte novu.",
    "onboarding.step3.desc": "Poboljšajte hosting s opcionalnim dodacima.",
    "onboarding.step4.desc": "Pregledajte odabire prije potvrde.",
    "onboarding.selected": "Odabrano",
    "onboarding.next": "Nastavi",
    "onboarding.back": "Natrag",
    "onboarding.confirm": "Potvrdi i aktiviraj",
    "onboarding.existingDomain": "Imam domenu",
    "onboarding.existingDomain.desc": "Povežite domenu koju već posjedujete.",
    "onboarding.newDomain": "Registriraj novu domenu",
    "onboarding.newDomain.desc": "Pretražite i registrirajte novi naziv domene.",
    "onboarding.enterDomain": "Unesite naziv domene",
    "onboarding.searchDomain": "Pretražite domenu",
    "onboarding.domainHint": "Uvijek možete ovo promijeniti u svom nadzornom panelu.",
    "onboarding.plan": "Plan",
    "onboarding.domain": "Domena",
    "onboarding.extras": "Dodaci",
    "onboarding.total": "Ukupno",
    "onboarding.extra.backup": "Automatske sigurnosne kopije",
    "onboarding.extra.backup.desc": "Dnevne automatske kopije s vraćanjem jednim klikom.",
    "onboarding.extra.email": "Profesionalni email",
    "onboarding.extra.email.desc": "Prilagođene email adrese s vašom domenom.",
    "onboarding.extra.priority": "Prioritetna podrška",
    "onboarding.extra.priority.desc": "Preskočite red s posvećenim agentima.",
    "onboarding.extra.ddos": "DDoS zaštita",
    "onboarding.extra.ddos.desc": "Napredna zaštita od DDoS napada.",

    // Footer
    "footer.description": "Brz, pouzdan i pristupačan web hosting za sve.",
    "footer.copyright": "© 2026 WebWeaver · Hosted in Croatia, EU",
    "footer.privacy": "Privatnost",
    "footer.terms": "Uvjeti",
    "footer.support": "Podrška",
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
