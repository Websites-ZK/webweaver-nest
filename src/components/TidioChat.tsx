import { useEffect } from "react";

const TidioChat = () => {
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "//code.tidio.co/vbtiwytlxrwoxh4ob2ay2if7iefhsa5y.js";
    s.async = true;
    document.head.appendChild(s);

    return () => {
      try {
        document.head.removeChild(s);
      } catch {}
    };
  }, []);

  return null;
};

export default TidioChat;
