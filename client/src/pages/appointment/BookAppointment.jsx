import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { createAppointment } from "../../api/appointmentApiClient";
import { pregnancyService } from "../../api/pregnancyApi";
import { MOTHER_NAV } from "../../config/navConfig";

export default function BookAppointment() {
  const navigate = useNavigate();
  const [pregnancies, setPregnancies] = useState([]);
  const [loadingPregs, setLoadingPregs] = useState(true);
  const [pregnancyId, setPregnancyId] = useState("");
  const [preferredDateTime, setPreferredDateTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  
  const minDate = new Date().toISOString().slice(0, 16);

  useEffect(() => {
    pregnancyService.listMine()
      .then((res) => {
        const active = (res.data.data ?? []).filter((p) => p.status === "ACTIVE");
        setPregnancies(active);
        if (active.length === 1) setPregnancyId(active[0]._id);
      })
      .catch(() => setError("Failed to load pregnancies. Please try again."))
      .finally(() => setLoadingPregs(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createAppointment({ pregnancyId, preferredDateTime });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard/appointments"), 1500);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to book appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPreg = pregnancies.find((p) => p._id === pregnancyId);
  const hasMidwife = selectedPreg?.midwife;

  return (
    <DashboardLayout navItems={MOTHER_NAV}>
      <div className="w-full max-w-lg mx-auto">
        {}
        <button
          onClick={() => navigate("/dashboard/appointments")}
          className="flex items-center gap-1.5 text-sm text-text-secondary dark:text-text-muted hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back to Appointments
        </button>

        <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-text-primary dark:text-dark-text">
              Book an Appointment
            </h1>
            <p className="text-sm text-text-secondary dark:text-text-muted mt-1">
              Request a visit with your assigned midwife.
            </p>
            <span className="block h-1 w-12 rounded-full bg-primary mt-3" />
          </div>

          {}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {}
          {success && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 px-4 py-3 text-sm text-green-600 dark:text-green-400 font-medium">
              ✓ Appointment booked! Redirecting…
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {}
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-dark-text mb-1.5">
                Pregnancy
              </label>
              {loadingPregs ? (
                <div className="animate-pulse h-10 rounded-lg bg-border dark:bg-dark-border" />
              ) : pregnancies.length === 0 ? (
                <p className="text-sm text-text-muted bg-bg-soft dark:bg-dark-bg rounded-lg p-3">
                  You have no active pregnancies. Please add one first.
                </p>
              ) : (
                <select
                  required
                  value={pregnancyId}
                  onChange={(e) => setPregnancyId(e.target.value)}
                  className="w-full rounded-lg border border-border dark:border-dark-border bg-bg-main dark:bg-dark-bg text-text-primary dark:text-dark-text text-sm px-3 py-2.5 focus:outline-none focus:border-primary"
                >
                  <option value="">Select a pregnancy…</option>
                  {pregnancies.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.babyName ? `Baby: ${p.babyName}` : `Pregnancy (${new Date(p.createdAt).toLocaleDateString()})`}
                      {p.midwife ? " ✓ Midwife assigned" : " ⚠ No midwife"}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {}
            {pregnancyId && !hasMidwife && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800 px-4 py-3 text-sm text-orange-700 dark:text-orange-400">
                ⚠ This pregnancy does not have an assigned midwife yet. A midwife must be assigned before booking.
              </div>
            )}

            {}
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-dark-text mb-1.5">
                Preferred Date & Time
              </label>
              <input
                type="datetime-local"
                required
                min={minDate}
                value={preferredDateTime}
                onChange={(e) => setPreferredDateTime(e.target.value)}
                className="w-full rounded-lg border border-border dark:border-dark-border bg-bg-main dark:bg-dark-bg text-text-primary dark:text-dark-text text-sm px-3 py-2.5 focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-text-muted mt-1">
                Your midwife will confirm or propose a different time.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || !pregnancyId || !preferredDateTime || !hasMidwife || pregnancies.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Booking…" : "Request Appointment"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
