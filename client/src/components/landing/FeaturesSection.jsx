import {
  Baby,
  Stethoscope,
  CalendarDays,
  Brain,
  MessageCircle,
  Lightbulb,
} from "lucide-react";

const FEATURES = [
  {
    Icon:  Baby,
    title: "Pregnancy Tracking",
    desc:  "Follow your week‑by‑week journey with trimester breakdowns, gestational age, and an always‑accurate estimated due date.",
    color: "#C94A6A",
  },
  {
    Icon:  Stethoscope,
    title: "Expert Care Team",
    desc:  "Get connected with verified doctors and midwives assigned exclusively to your pregnancy for personalised, consistent care.",
    color: "#5F8F2E",
  },
  {
    Icon:  CalendarDays,
    title: "Appointment Booking",
    desc:  "Book, reschedule, and confirm prenatal appointments with ease. Your midwife reviews every request and responds promptly.",
    color: "#3B82F6",
  },
  {
    Icon:  Brain,
    title: "AI Health Insights",
    desc:  "After every visit, receive an AI‑generated summary highlighting key observations and personalised health recommendations.",
    color: "#A78BFA",
  },
  {
    Icon:  MessageCircle,
    title: "Secure Messaging",
    desc:  "Private conversations with your doctor or midwife, ask questions and share updates between appointments, anytime.",
    color: "#F59E0B",
  },
  {
    Icon:  Lightbulb,
    title: "Daily Health Tips",
    desc:  "Receive AI‑curated, continuously refreshed pregnancy health tips so you always have reliable, up‑to‑date guidance.",
    color: "#EC4899",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" aria-labelledby="features-heading" className="py-24 px-6 bg-bg-main dark:bg-dark-bg">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Features</span>
          <h2
            id="features-heading"
            className="mt-2 text-3xl sm:text-4xl font-bold text-text-primary dark:text-dark-text"
          >
            Everything your pregnancy needs
          </h2>
          <p className="mt-3 text-text-secondary dark:text-text-muted max-w-md mx-auto">
            From tracking milestones to connecting with your care team, it's all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ Icon, title, desc, color }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div
                className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4"
                style={{ backgroundColor: `${color}18`, color }}
              >
                <Icon size={22} />
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
