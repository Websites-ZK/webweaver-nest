import { useEffect } from "react";

interface CrispChatProps {
  websiteId: string;
}

const CrispChat = ({ websiteId }: CrispChatProps) => {
  useEffect(() => {
    if (!websiteId || websiteId === "YOUR_CRISP_WEBSITE_ID") return;

    // Set Crisp website ID
    (window as any).$crisp = [];
    (window as any).CRISP_WEBSITE_ID = websiteId;

    // Load Crisp script
    const s = document.createElement("script");
    s.src = "https://client.crisp.chat/l.js";
    s.async = true;
    document.head.appendChild(s);

    return () => {
      // Cleanup
      try {
        document.head.removeChild(s);
        delete (window as any).$crisp;
        delete (window as any).CRISP_WEBSITE_ID;
      } catch {}
    };
  }, [websiteId]);

  return null;
};

export default CrispChat;
