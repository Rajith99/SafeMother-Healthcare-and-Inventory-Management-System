import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const BENEFITS = [
  {
    value: "One Platform",
    label: "Track, connect, and communicate, no juggling multiple apps or scattered paper records.",
  },
  {
    value: "Verified Experts",
    label: "Every doctor and midwife is individually reviewed and activated by the SafeMother admin team.",
  },
  {
    value: "AI‑Assisted",
    label: "Post‑visit AI summaries give you clear, plain‑language insights from every appointment.",
  },
  {
    value: "Private by Design",
    label: "Health data and conversations are protected with end‑to‑end encryption and never shared without your consent.",
  },
];

export default function BenefitsSection() {
  return (
    <section id="benefits" aria-labelledby="benefits-heading" className="py-24 px-6 bg-bg-main dark:bg-dark-bg">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {}
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Why SafeMother</span>
            <h2
              id="benefits-heading"
              className="mt-2 text-3xl sm:text-4xl font-bold text-text-primary dark:text-dark-text leading-snug"
            >
              Peace of mind, from first trimester to delivery
            </h2>
            <p className="mt-4 text-text-secondary dark:text-text-muted leading-relaxed">
              Pregnancy is one of life's most significant journeys. SafeMother exists to make
              sure you never navigate it alone, giving you expert care, smart tools, and
              constant reassurance every day.
            </p>
            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              Start Your Journey
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Right: benefit cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BENEFITS.map(({ value, label }) => (
              <div
                key={value}
                className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-5 hover:border-primary/40 hover:shadow-sm transition-all duration-200"
              >
                <p className="text-base font-bold text-primary mb-1.5">{value}</p>
                <p className="text-sm text-text-secondary dark:text-text-muted leading-relaxed">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
