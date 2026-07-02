import { Mail, Phone, MapPin } from "lucide-react";

const CONTACT_ITEMS = [
  {
    Icon: Mail,
    label: "Email Us",
    value: "support@safemotherapp.com",
    href: "mailto:support@safemotherapp.com",
    color: "#C94A6A",
    desc: "Drop us an email anytime and we'll get back to you within 24 hours.",
  },
  {
    Icon: Phone,
    label: "Call Us",
    value: "+94 11 234 5678",
    href: "tel:+94112345678",
    color: "#5F8F2E",
    desc: "Available Monday – Friday, 8 am to 6 pm Sri Lanka Standard Time.",
  },
  {
    Icon: MapPin,
    label: "Our Office",
    value: "Colombo, Sri Lanka",
    href: null,
    color: "#3B82F6",
    desc: "Visit us at our head office. Walk-ins welcome during business hours.",
  },
];

export default function ContactSection() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="py-24 px-6 bg-bg-soft dark:bg-dark-bg"
    >
      <div className="mx-auto max-w-6xl">
        {}
        <div className="text-center mb-14">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">
            Contact Us
          </span>
          <h2
            id="contact-heading"
            className="mt-2 text-3xl sm:text-4xl font-bold text-text-primary dark:text-dark-text"
          >
            We&apos;re here whenever you need us
          </h2>
          <p className="mt-3 text-text-secondary dark:text-text-muted max-w-lg mx-auto leading-relaxed">
            Have a question about SafeMother, or need support on your pregnancy
            journey? Reach out — our team is always happy to help.
          </p>
        </div>

        {}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {CONTACT_ITEMS.map(({ Icon, label, value, href, color, desc }) => (
            <div
              key={label}
              className="group flex flex-col items-center text-center gap-4 rounded-2xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-8 hover:border-primary/40 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              {}
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl"
                style={{ backgroundColor: `${color}18`, color }}
              >
                <Icon size={26} />
              </div>

              {}
              <p className="text-xs font-semibold text-text-muted dark:text-text-muted uppercase tracking-widest">
                {label}
              </p>

              {}
              {href ? (
                <a
                  href={href}
                  className="text-base font-semibold text-text-primary dark:text-dark-text hover:text-primary transition-colors duration-150 -mt-2"
                >
                  {value}
                </a>
              ) : (
                <p className="text-base font-semibold text-text-primary dark:text-dark-text -mt-2">
                  {value}
                </p>
              )}

              {}
              <p className="text-sm text-text-secondary dark:text-text-muted leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>

        {}
        <p className="mt-12 text-center text-sm text-text-muted dark:text-text-muted">
          Prefer email?{" "}
          <a
            href="mailto:support@safemotherapp.com"
            className="font-semibold text-primary hover:underline underline-offset-2 transition"
          >
            support@safemotherapp.com
          </a>{" "}
          — we respond to every message.
        </p>
      </div>
    </section>
  );
}
