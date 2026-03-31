import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Clock } from "lucide-react";

const COOKIE_KEY = "ww_offer_exp";
const OFFER_HOURS = 24;

const getExpiry = (): number => {
  const stored = localStorage.getItem(COOKIE_KEY);
  if (stored) {
    const ts = parseInt(stored, 10);
    if (ts > Date.now()) return ts;
  }
  const exp = Date.now() + OFFER_HOURS * 60 * 60 * 1000;
  localStorage.setItem(COOKIE_KEY, String(exp));
  return exp;
};

const CountdownBanner = () => {
  const { t } = useLanguage();
  const [expiry] = useState(getExpiry);
  const [remaining, setRemaining] = useState(expiry - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const diff = expiry - Date.now();
      if (diff <= 0) {
        clearInterval(id);
        setRemaining(0);
      } else {
        setRemaining(diff);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [expiry]);

  if (remaining <= 0) return null;

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="mb-6 flex items-center justify-center gap-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm">
      <Clock className="h-4 w-4 text-accent shrink-0" />
      <span className="text-foreground font-medium">{t("countdown.label")}</span>
      <span className="tabular-nums font-bold text-accent">
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </span>
    </div>
  );
};

export default CountdownBanner;
