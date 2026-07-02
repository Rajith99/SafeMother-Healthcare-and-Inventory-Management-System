import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";

export default function CtaSection() {
  return (
    <section id="cta" aria-labelledby="cta-heading" className="py-24 px-6 bg-bg-soft dark:bg-dark-bg">
      <div className="mx-auto max-w-3xl text-center">
        <div className="rounded-3xl border border-border dark:border-dark-border bg-linear-to-br from-bg-card via-primary-soft/10 to-bg-card dark:from-dark-surface dark:via-primary/5 dark:to-dark-surface p-10 sm:p-14 shadow-sm">

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary mb-6">
            <Heart size={28} />
          </div>

          <h2
            id="cta-heading"
            className="text-3xl sm:text-4xl font-bold text-text-primary dark:text-dark-text leading-snug"
          >
            Begin your supported pregnancy journey today
          </h2>
          <p className="mt-4 text-text-secondary dark:text-text-muted max-w-lg mx-auto leading-relaxed">
            Join mothers who trust SafeMother to stay informed, stay connected, and
            stay healthy throughout every stage of their pregnancy.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              Create Free Account
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border dark:border-dark-border text-text-primary dark:text-dark-text text-sm font-semibold hover:border-primary hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              Already have an account?
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
