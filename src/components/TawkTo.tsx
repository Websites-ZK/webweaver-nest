import { useEffect } from "react";

const TawkTo = () => {
  useEffect(() => {
    // Replace with your actual Tawk.to property ID
    const s = document.createElement("script");
    s.src = "https://embed.tawk.to/YOUR_PROPERTY_ID/default";
    s.async = true;
    s.charset = "utf-8";
    s.setAttribute("crossorigin", "*");
    document.head.appendChild(s);

    return () => {
      document.head.removeChild(s);
    };
  }, []);

  return null;
};

export default TawkTo;
