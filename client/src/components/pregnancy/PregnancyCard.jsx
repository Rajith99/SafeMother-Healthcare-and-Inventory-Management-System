function formatDate(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}

export default function PregnancyCard({
  pregnancy,
  onClick,
  showOwner = false,
}) {
  const statusClass =
    pregnancy?.status === "COMPLETED"
      ? "bg-accent/10 text-accent dark:bg-accent/15 dark:text-accent"
      : pregnancy?.status === "CANCELLED"
        ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
        : "bg-primary/10 text-primary";

  const ownerName =
    typeof pregnancy?.user === "object"
      ? pregnancy.user.fullName || pregnancy.user.email || "-"
      : "-";

  return (
    <button
      type="button"
      onClick={() => onClick?.(pregnancy)}
      className="w-full text-left rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-text-primary dark:text-dark-text">
          Week {pregnancy?.pregnancyWeekNumber ?? "-"}
        </h3>
        <span
          className={`text-xs px-2 py-1 rounded-full font-semibold ${statusClass}`}
        >
          {pregnancy?.status || "-"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted">
            LMP Date
          </p>
          <p className="text-sm text-text-primary dark:text-dark-text mt-1">
            {formatDate(pregnancy?.lmpDate)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted">
            EDD Date
          </p>
          <p className="text-sm text-text-primary dark:text-dark-text mt-1">
            {formatDate(pregnancy?.eddDate)}
          </p>
        </div>
      </div>

      {showOwner && (
        <div className="mt-3">
          <p className="text-xs uppercase tracking-wide text-text-muted">
            Mother
          </p>
          <p className="text-sm text-text-primary dark:text-dark-text mt-1">
            {ownerName}
          </p>
        </div>
      )}
    </button>
  );
}
