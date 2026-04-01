import { useState, useEffect, useCallback } from "react";

export function useParallax() {
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = useCallback(() => {
    requestAnimationFrame(() => setScrollY(window.scrollY));
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return scrollY;
}
