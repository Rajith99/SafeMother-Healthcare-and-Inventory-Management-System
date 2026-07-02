



export default function MidwifeStatCard({ icon, label, value, loading, onClick }) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface shadow-sm p-5 animate-pulse">
        <div className="h-3 w-20 rounded-full bg-border dark:bg-dark-border mb-3" />
        <div className="h-7 w-12 rounded-full bg-border dark:bg-dark-border" />
      </div>
    );
  }

  const base =
    "rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface shadow-sm p-5 flex flex-col gap-3";
  const interactive = onClick
    ? "cursor-pointer hover:border-primary/40 hover:shadow-md transition-all duration-200"
    : "";

  return (
    <div className={`${base} ${interactive}`} onClick={onClick}>
      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
        <span className="text-primary">{icon}</span>
        {label}
      </p>
      <p className="text-3xl font-bold text-text-primary dark:text-dark-text leading-none">
        {value ?? "—"}
      </p>
    </div>
  );
}
