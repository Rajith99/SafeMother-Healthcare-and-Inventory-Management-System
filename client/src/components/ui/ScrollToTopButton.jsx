import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Scroll to top"
      className={[
        
        "fixed bottom-20 right-6 z-50",
        "h-12 w-12 rounded-full shadow-lg",
        "flex items-center justify-center",
        "bg-primary text-white",
        "border border-primary/30",
        "hover:scale-105 hover:shadow-xl hover:bg-primary/90 hover:cursor-pointer",
        "transition-all duration-200",
        
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none",
      ].join(" ")}
    >
      <ArrowUp size={20} strokeWidth={2.5} />
    </button>
  );
}
