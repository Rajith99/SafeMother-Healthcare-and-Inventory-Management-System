import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Clock, CheckCircle2, XCircle, RefreshCw, AlertCircle,
  ArrowLeft, Thermometer, Activity, FileText, Brain,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAppointment, cancelAppointment, motherResponse } from "../../api/appointmentApiClient";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { MOTHER_NAV } from "../../config/navConfig";

const STATUS_CONFIG = {
  PENDING:               { label: "Pending",              color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: <Clock size={13} /> },
  APPROVED:              { label: "Approved",             color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",         icon: <CheckCircle2 size={13} /> },
  CONFIRMED:             { label: "Confirmed",            color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",     icon: <CheckCircle2 size={13} /> },
  REJECTED:              { label: "Rejected",             color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",             icon: <XCircle size={13} /> },
  CANCELLED:             { label: "Cancelled",            color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",             icon: <XCircle size={13} /> },
  RESCHEDULE_REQUESTED:  { label: "Reschedule Requested", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: <RefreshCw size={13} /> },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "bg-gray-100 text-gray-600", icon: <AlertCircle size={13} /> };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border dark:border-dark-border last:border-0">
      <span className="text-xs text-text-muted uppercase tracking-wide font-medium">{label}</span>
      <span className="text-sm font-semibold text-text-primary dark:text-dark-text">{value ?? "—"}</span>
    </div>
  );
}

export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appt, setAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");

  useEffect(() => {
    getAppointment(id)
      .then((res) => setAppt(res.data.data))
      .catch(() => setError("Failed to load appointment."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleConfirm = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await motherResponse(id, { status: "CONFIRMED" });
      setAppt(res.data.data);
    } catch (err) {
      setActionError(err.response?.data?.message ?? "Failed to confirm appointment.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await motherResponse(id, {
        status: "RESCHEDULE_REQUESTED",
        preferredDateTime: rescheduleDate,
        rescheduleReason,
      });
      setAppt(res.data.data);
      setShowReschedule(false);
    } catch (err) {
      setActionError(err.response?.data?.message ?? "Failed to request reschedule.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      await cancelAppointment(id, "Cancelled by mother");
      setShowCancelModal(false);
      navigate("/dashboard/appointments");
    } catch (err) {
      setActionError(err.response?.data?.message ?? "Failed to cancel appointment.");
      setShowCancelModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout navItems={MOTHER_NAV}>
      <div className="w-full max-w-2xl mx-auto">
        {}
        <button
          onClick={() => navigate("/dashboard/appointments")}
          className="flex items-center gap-1.5 text-sm text-text-secondary dark:text-text-muted hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back to Appointments
        </button>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-20 rounded-xl bg-border dark:bg-dark-border" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 p-5 text-center text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {!loading && appt && (
          <div className="space-y-5">
            {}
            <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-text-primary dark:text-dark-text">
                  Appointment Details
                </h1>
                <StatusBadge status={appt.status} />
              </div>
              <InfoRow label="Preferred Date" value={formatDate(appt.preferredDateTime)} />
              {appt.confirmedDateTime && (
                <InfoRow label="Confirmed Date" value={formatDate(appt.confirmedDateTime)} />
              )}
              {appt.rejectionReason && (
                <InfoRow label="Rejection Reason" value={appt.rejectionReason} />
              )}
              {appt.rescheduleReason && (
                <InfoRow label="Reschedule Reason" value={appt.rescheduleReason} />
              )}
              <InfoRow label="Created" value={formatDate(appt.createdAt)} />
            </div>

            {}
            {appt.isCompleted && (
              <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-6">
                <h2 className="text-base font-semibold text-text-primary dark:text-dark-text mb-4 flex items-center gap-2">
                  <Activity size={16} className="text-primary" /> Visit Information
                </h2>
                <InfoRow label="Pulse Rate" value={appt.pulseRate ? `${appt.pulseRate} bpm` : null} />
                <InfoRow label="Temperature" value={appt.temperature ? `${appt.temperature} °C` : null} />
                <InfoRow label="Blood Pressure" value={appt.bloodPressure} />
                <InfoRow
                  label="Special Conditions"
                  value={appt.specialMedicalConditions?.length ? appt.specialMedicalConditions.join(", ") : "None"}
                />
                {appt.appointmentNotes && (
                  <div className="mt-3">
                    <p className="text-xs text-text-muted uppercase tracking-wide font-medium mb-1">Notes</p>
                    <p className="text-sm text-text-secondary dark:text-text-muted bg-bg-soft dark:bg-dark-bg rounded-lg p-3">
                      {appt.appointmentNotes}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => navigate(`/dashboard/appointments/${id}/ai-status`)}
                  className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-colors"
                >
                  <Brain size={16} /> View AI Health Status
                </button>
              </div>
            )}

            {}
            {actionError && (
              <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400">
                {actionError}
              </div>
            )}

            {}
            {appt.status === "APPROVED" && !appt.isCompleted && (
              <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-6 space-y-4">
                <h2 className="text-base font-semibold text-text-primary dark:text-dark-text">
                  Midwife has approved this slot
                </h2>
                <p className="text-sm text-text-secondary dark:text-text-muted">
                  Confirmed for: <strong>{formatDate(appt.confirmedDateTime)}</strong>
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    disabled={actionLoading}
                    onClick={handleConfirm}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <CheckCircle2 size={15} /> Confirm Appointment
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => setShowReschedule((v) => !v)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] border border-border dark:border-dark-border text-text-secondary dark:text-text-muted text-sm font-semibold hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={15} /> Request Reschedule
                  </button>
                </div>

                {showReschedule && (
                  <form onSubmit={handleReschedule} className="space-y-3 pt-2 border-t border-border dark:border-dark-border">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary dark:text-text-muted mb-1">
                        New Preferred Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="w-full rounded-lg border border-border dark:border-dark-border bg-bg-main dark:bg-dark-bg text-text-primary dark:text-dark-text text-sm px-3 py-2 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary dark:text-text-muted mb-1">
                        Reason for Reschedule
                      </label>
                      <textarea
                        rows={2}
                        value={rescheduleReason}
                        onChange={(e) => setRescheduleReason(e.target.value)}
                        placeholder="Briefly explain why..."
                        className="w-full rounded-lg border border-border dark:border-dark-border bg-bg-main dark:bg-dark-bg text-text-primary dark:text-dark-text text-sm px-3 py-2 focus:outline-none focus:border-primary resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full px-4 py-2.5 rounded-[10px] bg-orange-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {actionLoading ? "Submitting…" : "Submit Reschedule Request"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {}
            {appt.status === "PENDING" && (
              <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-6">
                <p className="text-sm text-text-secondary dark:text-text-muted mb-4">
                  Your appointment request is waiting for your midwife to review it.
                </p>
                <button
                  disabled={actionLoading}
                  onClick={handleCancelClick}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] border border-red-300 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  <XCircle size={15} /> Cancel Appointment
                </button>
              </div>
            )}

            {}
            {appt.status === "RESCHEDULE_REQUESTED" && (
              <div className="rounded-xl border border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800 p-5">
                <p className="text-sm text-orange-700 dark:text-orange-400 font-medium">
                  Reschedule request sent. Waiting for midwife to review.
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                  New preferred date: {formatDate(appt.preferredDateTime)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showCancelModal}
        onConfirm={confirmCancel}
        onCancel={() => setShowCancelModal(false)}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmLabel="Yes, Cancel"
        cancelLabel="No, Keep It"
        isConfirming={actionLoading}
      />
    </DashboardLayout>
  );
}
