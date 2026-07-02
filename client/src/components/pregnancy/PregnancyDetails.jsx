function formatDate(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}

function formatList(items) {
  if (!Array.isArray(items) || items.length === 0) return "-";
  return items.join(", ");
}

function personLabel(person) {
  if (!person) return "Not assigned";
  if (typeof person === "object") {
    return person.fullName || person.email || "Not assigned";
  }
  return "Assigned";
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-text-muted">{label}</p>
      <p className="text-sm text-text-primary dark:text-dark-text mt-1">
        {value}
      </p>
    </div>
  );
}

export default function PregnancyDetails({ pregnancy }) {
  if (!pregnancy) {
    return (
      <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-6 text-sm text-text-muted">
        Select a pregnancy card to view full details.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text">
          Pregnancy Details
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
          {pregnancy.status}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailRow label="LMP Date" value={formatDate(pregnancy.lmpDate)} />
        <DetailRow label="EDD Date" value={formatDate(pregnancy.eddDate)} />
        <DetailRow
          label="Gestational Age"
          value={`${pregnancy.gestationalAgeWeeks ?? "-"}w ${pregnancy.gestationalAgeDays ?? "-"}d`}
        />
        <DetailRow label="Trimester" value={pregnancy.trimester || "-"} />
        <DetailRow
          label="Pregnancy Week"
          value={pregnancy.pregnancyWeekNumber ?? "-"}
        />
        <DetailRow
          label="Progress"
          value={
            pregnancy.percentageComplete !== undefined
              ? `${pregnancy.percentageComplete}%`
              : "-"
          }
        />
        <DetailRow
          label="Cycle Length"
          value={pregnancy.cycleLength ? `${pregnancy.cycleLength} days` : "-"}
        />
        <DetailRow label="Blood Group" value={pregnancy.bloodGroup || "-"} />
        <DetailRow
          label="First Pregnancy"
          value={pregnancy.isFirstPregnancy ? "Yes" : "No"}
        />
        <DetailRow
          label="Medical Conditions"
          value={formatList(pregnancy.medicalConditions)}
        />
        <DetailRow label="Allergies" value={formatList(pregnancy.allergies)} />
        <DetailRow
          label="Previous Complications"
          value={formatList(pregnancy.previousComplications)}
        />
        <DetailRow
          label="Complication Notes"
          value={pregnancy.complicationNotes || "-"}
        />
        <DetailRow label="Doctor" value={personLabel(pregnancy.doctor)} />
        <DetailRow label="Midwife" value={personLabel(pregnancy.midwife)} />
      </div>
    </div>
  );
}
