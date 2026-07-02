import { Link } from "react-router-dom";
import { Baby, ShieldCheck, Clock, UserCheck, ArrowRight } from "lucide-react";
import landingimg1 from "../../assets/landing-img-1.jpeg";
import landingimg2 from "../../assets/landing-img-2.jpg";
import landingimg3 from "../../assets/landing-img-3.jpeg";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-bg-main to-bg-card dark:from-dark-bg dark:to-dark-surface py-20 md:py-28 px-6">
      {}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-32 w-md h-112 rounded-full opacity-40"
        style={{
          background: "radial-gradient(circle, #C94A6A20 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, #5F8F2E25 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {}
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 dark:bg-primary/20 px-3 py-1.5 rounded-full mb-6 tracking-wide uppercase">
              SafeMother
            </span>

            <h1 className="text-4xl sm:text-5xl font-bold text-text-primary dark:text-dark-text leading-tight">
              Your Pregnancy,{" "}
              <span className="text-primary">Expertly Guided</span> Every Step
            </h1>

            <p className="mt-6 text-lg text-text-secondary dark:text-text-muted max-w-lg leading-relaxed">
              SafeMother connects expecting mothers with verified doctors and
              midwives, delivers AI‑powered health insights, and keeps your
              entire pregnancy journey in one safe, private place.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                Get Started Free
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface text-text-primary dark:text-dark-text text-sm font-semibold hover:border-primary hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                Sign In
              </Link>
            </div>

            {}
            <div className="mt-10 flex flex-wrap items-center gap-6">
              {[
                { Icon: ShieldCheck, label: "Secure & Private" },
                { Icon: UserCheck, label: "Verified Professionals" },
                { Icon: Clock, label: "24/7 Access" },
              ].map(({ Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 text-sm text-text-secondary dark:text-text-muted"
                >
                  <Icon size={15} className="text-accent" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {}
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-3">
              <img
                src={landingimg1}
                alt="Midwife consulting a mother"
                className="rounded-2xl object-cover w-full h-52 shadow-md"
              />
              <img
                src={landingimg2}
                alt="Healthcare professional"
                className="rounded-2xl object-cover object-top w-full h-52 shadow-md mt-7"
              />
              <img
                src={landingimg3}
                alt="Pregnancy journey"
                className="rounded-2xl object-cover object-top w-full h-44 shadow-md col-span-2 row-span-5"
              />
            </div>

            {}
            <div className="absolute -left-6 top-6 bg-bg-card dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl px-4 py-3 shadow-lg animate-scale-in">
              <p className="text-2xl font-bold text-primary leading-none">
                98%
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                Satisfaction rate
              </p>
            </div>
            <div className="absolute -right-4 bottom-4 bg-bg-card dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl px-4 py-3 shadow-lg animate-scale-in">
              <p className="text-2xl font-bold text-accent leading-none">AI</p>
              <p className="text-xs text-text-muted mt-0.5">Powered insights</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
