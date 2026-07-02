const STEPS = [
  {
    step: "01",
    title: "Create Your Account",
    desc:  "Register as a mother in under two minutes. Your profile is private and encrypted from day one.",
  },
  {
    step: "02",
    title: "Set Up Your Pregnancy",
    desc:  "Enter your LMP date and health details. SafeMother instantly calculates your gestational age and due date.",
  },
  {
    step: "03",
    title: "Connect with Your Care Team",
    desc:  "Assign your preferred doctor. Your doctor then appoints a qualified midwife to support your journey.",
  },
  {
    step: "04",
    title: "Stay Connected",
    desc:  "Book appointments, receive AI‑powered post‑visit summaries, and message your care team anytime.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="py-24 px-6 bg-bg-card dark:bg-dark-surface">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">How It Works</span>
          <h2
            id="how-heading"
            className="mt-2 text-3xl sm:text-4xl font-bold text-text-primary dark:text-dark-text"
          >
            Up and running in minutes
          </h2>
          <p className="mt-3 text-text-secondary dark:text-text-muted max-w-md mx-auto">
            A simple onboarding flow designed to connect you with expert care as quickly as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map(({ step, title, desc }, i) => (
            <div key={step} className="relative flex flex-col items-start">
              {}
              {i < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className="hidden lg:block absolute top-6 left-12 -right-8 h-px bg-border dark:bg-dark-border"
                />
              )}

              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary font-bold text-sm mb-4 shrink-0">
                {step}
              </div>
              <h3 className="text-base font-semibold text-text-primary dark:text-dark-text mb-2">
                {title}
              </h3>
              <p className="text-sm text-text-secondary dark:text-text-muted leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
