import { useEffect, useState, useCallback } from "react";
import Logo from "../../assets/Logoimg.png";
import AuthButton from "./AuthButton";

const NAV_LINKS = [
  { label: "About",       id: "about"       },
  { label: "Features",    id: "features"    },
  { label: "Steps",       id: "how-it-works" },
  { label: "Why Us",      id: "benefits"    },
  { label: "Get Started", id: "cta"         },
  { label: "Contact",     id: "contact"     },
];

function smoothScrollTo(id) {
  return (e) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };
}

function scrollToTop(e) {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function LandingHeader() {
  const [activeId, setActiveId] = useState("");

  
  const handleIntersect = useCallback((entries) => {
    
    const visible = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

    if (visible.length > 0) {
      setActiveId(visible[0].target.id);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      
      threshold: 0.3,
    });

    NAV_LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [handleIntersect]);

  return (
    <header className="sticky top-0 z-50 bg-surface-light dark:bg-surface-dark border-b border-border dark:border-dark-border backdrop-blur-sm transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">

          {}
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="flex items-center shrink-0 cursor-pointer"
          >
            <img src={Logo} alt="SafeMother Logo" className="h-15 w-auto" />
          </button>

          {}
          <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, id }) => {
              const isActive = activeId === id;
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  id={`nav-${id}`}
                  onClick={smoothScrollTo(id)}
                  className={[
                    "relative px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 group",
                    isActive
                      ? "text-primary bg-primary/10 dark:bg-primary/15"
                      : "text-text-secondary dark:text-text-muted hover:text-primary dark:hover:text-primary hover:bg-primary/5",
                  ].join(" ")}
                >
                  {label}
                  {}
                  <span
                    aria-hidden="true"
                    className={[
                      "absolute bottom-0.5 left-3 right-3 h-0.5 bg-primary rounded-full transition-all duration-300",
                      isActive
                        ? "w-[calc(100%-1.5rem)]"
                        : "w-0 group-hover:w-[calc(100%-1.5rem)]",
                    ].join(" ")}
                  />
                </a>
              );
            })}
          </nav>

          {}
          <div className="flex items-center shrink-0">
            <AuthButton />
          </div>

        </div>
      </div>
    </header>
  );
}
