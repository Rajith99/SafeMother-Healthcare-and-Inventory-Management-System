import { useEffect, useMemo, useState } from "react";
import FormInput from "../ui/FormInput";

const BLOOD_GROUP_OPTIONS = [
  "",
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

function splitCsv(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function getDateInputBoundaries() {
  const today = new Date();
  const maxDateObj = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const minDateObj = new Date(maxDateObj);
  minDateObj.setMonth(minDateObj.getMonth() - 9);

  return {
    minDate: toDateInputValue(minDateObj),
    maxDate: toDateInputValue(maxDateObj),
  };
}

export function normalizePregnancyFormData(values) {
  return {
    lmpDate: values.lmpDate,
    cycleLength: Number(values.cycleLength),
    isFirstPregnancy: !!values.isFirstPregnancy,
    bloodGroup: values.bloodGroup || undefined,
    medicalConditions: splitCsv(values.medicalConditions),
    allergies: splitCsv(values.allergies),
    previousComplications: splitCsv(values.previousComplications),
    complicationNotes: values.complicationNotes?.trim() || undefined,
  };
}

export function mapPregnancyToFormValues(data) {
  return {
    lmpDate: toDateInputValue(data?.lmpDate),
    cycleLength: data?.cycleLength ?? 28,
    isFirstPregnancy: !!data?.isFirstPregnancy,
    bloodGroup: data?.bloodGroup || "",
    medicalConditions: (data?.medicalConditions || []).join(", "),
    allergies: (data?.allergies || []).join(", "),
    previousComplications: (data?.previousComplications || []).join(", "),
    complicationNotes: data?.complicationNotes || "",
  };
}

export default function PregnancyForm({
  initialValues,
  onSubmit,
  submitting = false,
  submitLabel = "Save",
  onCancel,
}) {
  const safeInitialValues = useMemo(
    () => ({
      lmpDate: initialValues?.lmpDate || "",
      cycleLength: initialValues?.cycleLength ?? 28,
      isFirstPregnancy: !!initialValues?.isFirstPregnancy,
      bloodGroup: initialValues?.bloodGroup || "",
      medicalConditions: initialValues?.medicalConditions || "",
      allergies: initialValues?.allergies || "",
      previousComplications: initialValues?.previousComplications || "",
      complicationNotes: initialValues?.complicationNotes || "",
    }),
    [initialValues],
  );

  const [values, setValues] = useState(safeInitialValues);
  const [errors, setErrors] = useState({});
  const { minDate, maxDate } = useMemo(() => getDateInputBoundaries(), []);

  useEffect(() => {
    setValues(safeInitialValues);
    setErrors({});
  }, [safeInitialValues]);

  const updateField = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!values.lmpDate) {
      nextErrors.lmpDate = "LMP date is required.";
    } else {
      const lmpDate = new Date(values.lmpDate);
      const minAllowed = new Date(minDate);
      const maxAllowed = new Date(maxDate);

      if (
        Number.isNaN(lmpDate.getTime()) ||
        lmpDate < minAllowed ||
        lmpDate > maxAllowed
      ) {
        nextErrors.lmpDate = "LMP date must be within the last 9 months.";
      }
    }

    const cycle = Number(values.cycleLength);
    if (!Number.isFinite(cycle) || cycle < 21 || cycle > 35) {
      nextErrors.cycleLength = "Cycle length must be between 21 and 35 days.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    await onSubmit(normalizePregnancyFormData(values));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          id="lmpDate"
          label="Last Menstrual Period"
          type="date"
          value={values.lmpDate}
          onChange={(e) => updateField("lmpDate", e.target.value)}
          min={minDate}
          max={maxDate}
          required
          error={errors.lmpDate}
        />

        <FormInput
          id="cycleLength"
          label="Cycle Length (days)"
          type="number"
          value={values.cycleLength}
          onChange={(e) => updateField("cycleLength", e.target.value)}
          required
          error={errors.cycleLength}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-dark-text mb-1.5">
            Blood Group
          </label>
          <select
            value={values.bloodGroup}
            onChange={(e) => updateField("bloodGroup", e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-sm bg-bg-main dark:bg-dark-bg text-text-primary dark:text-dark-text border border-border dark:border-dark-border focus:outline-none focus:border-primary transition-colors"
          >
            {BLOOD_GROUP_OPTIONS.map((option) => (
              <option key={option || "none"} value={option}>
                {option || "Select blood group"}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 mt-8 md:mt-7 text-sm text-text-primary dark:text-dark-text">
          <input
            type="checkbox"
            checked={values.isFirstPregnancy}
            onChange={(e) => updateField("isFirstPregnancy", e.target.checked)}
            className="h-4 w-4 rounded border-border dark:border-dark-border text-primary focus:ring-primary"
          />
          First pregnancy
        </label>
      </div>

      <FormInput
        id="medicalConditions"
        label="Medical Conditions"
        value={values.medicalConditions}
        onChange={(e) => updateField("medicalConditions", e.target.value)}
        placeholder="e.g., hypertension, thyroid"
      />

      <FormInput
        id="allergies"
        label="Allergies"
        value={values.allergies}
        onChange={(e) => updateField("allergies", e.target.value)}
        placeholder="e.g., penicillin, peanuts"
      />

      <FormInput
        id="previousComplications"
        label="Previous Complications"
        value={values.previousComplications}
        onChange={(e) => updateField("previousComplications", e.target.value)}
        placeholder="e.g., preeclampsia"
      />

      <div>
        <label
          htmlFor="complicationNotes"
          className="block text-sm font-medium text-text-primary dark:text-dark-text mb-1.5"
        >
          Complication Notes
        </label>
        <textarea
          id="complicationNotes"
          rows={3}
          value={values.complicationNotes}
          onChange={(e) => updateField("complicationNotes", e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg text-sm bg-bg-main dark:bg-dark-bg text-text-primary dark:text-dark-text border border-border dark:border-dark-border placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
          placeholder="Add any additional details"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Saving..." : submitLabel}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-border dark:border-dark-border text-sm font-medium text-text-secondary dark:text-dark-text hover:bg-bg-main dark:hover:bg-dark-bg transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
