import { Users, Target, HeartHandshake } from "lucide-react";

const PILLARS = [
  {
    Icon: Target,
    title: "Our Mission",
    desc: "To make expert maternal healthcare accessible to every expecting mother — regardless of location — through technology, compassion, and verified professional care.",
    color: "#C94A6A",
  },
  {
    Icon: HeartHandshake,
    title: "Our Values",
    desc: "We believe every pregnancy deserves dignity, privacy, and professional support. SafeMother is built on trust, transparency, and a deep commitment to maternal wellbeing.",
    color: "#5F8F2E",
  },
  {
    Icon: Users,
    title: "Our Team",
    desc: "SafeMother was created by a passionate team of healthcare professionals, technologists, and parents who understand the journey first-hand.",
    color: "#3B82F6",
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="py-24 px-6 bg-bg-card dark:bg-dark-surface"
    >
      <div className="mx-auto max-w-6xl">

        {}
        <div className="text-center mb-14">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">
            About Us
          </span>
          <h2
            id="about-heading"
            className="mt-2 text-3xl sm:text-4xl font-bold text-text-primary dark:text-dark-text"
          >
            Built for mothers, by people who care
          </h2>
          <p className="mt-3 text-text-secondary dark:text-text-muted max-w-xl mx-auto leading-relaxed">
            SafeMother was born from a simple belief — that every expecting mother
            deserves a safe, connected, and informed pregnancy journey, no matter where she is.
          </p>
        </div>

        {}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {PILLARS.map(({ Icon, title, desc, color }) => (
            <div
              key={title}
              className="group flex flex-col gap-4 rounded-2xl border border-border dark:border-dark-border bg-bg-main dark:bg-dark-bg p-7 hover:border-primary/40 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl"
                style={{ backgroundColor: `${color}18`, color }}
              >
                <Icon size={24} />
              </div>
              <h3 className="text-base font-semibold text-text-primary dark:text-dark-text">
                {title}
              </h3>
              <p className="text-sm text-text-secondary dark:text-text-muted leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>

        {}
        <div className="rounded-3xl border border-border dark:border-dark-border bg-linear-to-br from-primary/5 via-bg-card to-accent/5 dark:from-primary/10 dark:via-dark-surface dark:to-accent/10 p-8 sm:p-12 text-center">
          <p className="text-lg sm:text-xl font-medium text-text-primary dark:text-dark-text leading-relaxed max-w-3xl mx-auto">
            &ldquo;We started SafeMother after seeing how fragmented and stressful the pregnancy
            experience could be. We set out to change that — one mother, one journey at a time.&rdquo;
          </p>
          <p className="mt-5 text-sm font-semibold text-primary tracking-wide uppercase">
            — The SafeMother Team
          </p>
        </div>

      </div>
    </section>
  );
}
