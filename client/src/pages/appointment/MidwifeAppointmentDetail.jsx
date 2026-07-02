import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Clock, CheckCircle2, XCircle, RefreshCw,
  AlertCircle, Activity, Brain,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  getAppointment,
  respondToAppointment,
  fillAppointmentInfo,
  cancelAppointment,
} from "../../api/appointmentApiClient";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { MIDWIFE_NAV } from "../../config/navConfig";

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

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border dark:border-dark-border last:border-0">
      <span className="text-xs text-text-muted uppercase tracking-wide font-medium">{label}</span>
      <span className="text-sm font-semibold text-text-primary dark:text-dark-text">{value ?? "—"}</span>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary dark:text-text-muted mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border dark:border-dark-border bg-bg-main dark:bg-dark-bg text-text-primary dark:text-dark-text text-sm px-3 py-2.5 focus:outline-none focus:border-primary";

export default function MidwifeAppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appt, setAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [confirmedDateTime, setConfirmedDateTime] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  
  const [showFillForm, setShowFillForm] = useState(false);
  const [visitData, setVisitData] = useState({
    pulseRate: "",
    temperature: "",
    bloodPressure: "",
    specialMedicalConditions: "",
    appointmentNotes: "",
  });

  useEffect(() => {
    getAppointment(id)
      .then((res) => setAppt(res.data.data))
      .catch((err) => {
        if (err.response?.status === 403 && err.response?.data?.message === "Account pending validation") {
          setError("INACTIVE");
        } else {
          setError("Failed to load appointment.");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await respondToAppointment(id, { status: "APPROVED", confirmedDateTime });
      setAppt(res.data.data);
      setShowApprove(false);
    } catch (err) {
      setActionError(err.response?.data?.message ?? "Failed to approve.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await respondToAppointment(id, { status: "REJECTED", rejectionReason });
      setAppt(res.data.data);
      setShowReject(false);
    } catch (err) {
      setActionError(err.response?.data?.message ?? "Failed to reject.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFillInfo = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);

    const validationMsg = validateVisitData(visitData);
    if (validationMsg) {
      setActionError(validationMsg);
      setActionLoading(false);
      return;
    }

    try {
      const conditions = visitData.specialMedicalConditions
        ? visitData.specialMedicalConditions.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      const res = await fillAppointmentInfo(id, {
        pulseRate: visitData.pulseRate,
        temperature: visitData.temperature,
        bloodPressure: visitData.bloodPressure,
        specialMedicalConditions: conditions,
        appointmentNotes: visitData.appointmentNotes,
      });
      setAppt(res.data.data);
      setShowFillForm(false);
    } catch (err) {
      setActionError(err.response?.data?.message ?? "Failed to fill appointment info.");
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
      await cancelAppointment(id, "Cancelled by midwife");
      setShowCancelModal(false);
      navigate("/midwife/appointments");
    } catch (err) {
      setActionError(err.response?.data?.message ?? "Failed to cancel.");
      setShowCancelModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTemperatureChange = (e) => {
    let val = e.target.value;
    const prevVal = visitData.temperature;

    
    val = val.replace(/[^0-9.]/g, "");
    
    
    const dots = val.split(".").length - 1;
    if (dots > 1) return;

    
    if (val.length === 2 && !val.includes(".") && val.length > prevVal.length) {
      val += ".";
    }

    setVisitData((v) => ({ ...v, temperature: val }));
  };

  const handleBloodPressureChange = (e) => {
    let val = e.target.value;
    const prevVal = visitData.bloodPressure;

    
    val = val.replace(/[^0-9/]/g, "");

    
    const slashes = val.split("/").length - 1;
    if (slashes > 1) return;

    
    if (val.length === 3 && !val.includes("/") && val.length > prevVal.length) {
      val += "/";
    }

    setVisitData((v) => ({ ...v, bloodPressure: val }));
  };

  const validateVisitData = (data) => {
    const p = parseInt(data.pulseRate);
    if (p < 20 || p > 300) return "Pulse rate must be between 20 and 300 bpm.";

    if (data.temperature) {
      const t = parseFloat(data.temperature);
      if (t < 30 || t > 45) return "Temperature must be between 30.0°C and 45.0°C.";
    }

    if (data.bloodPressure) {
      if (!data.bloodPressure.includes("/")) {
        return "Blood pressure must be in 'systolic/diastolic' format (e.g., 120/80).";
      }
      const [sys, dia] = data.bloodPressure.split("/").map((v) => parseInt(v));
      if (isNaN(sys) || isNaN(dia)) return "Invalid blood pressure values.";
      if (sys < 50 || sys > 250) return "Systolic blood pressure (first number) should be between 50 and 250.";
      if (dia < 30 || dia > 150) return "Diastolic blood pressure (second number) should be between 30 and 150.";
    }

    return null;
  };

  const canReview = appt && (appt.status === "PENDING" || appt.status === "RESCHEDULE_REQUESTED");
  const canFill = appt && appt.status === "CONFIRMED" && !appt.isCompleted;

  return (
    <DashboardLayout navItems={MIDWIFE_NAV}>
      <div className="w-full max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/midwife/appointments")}
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
          <div className={`rounded-xl border p-10 text-center shadow-sm ${
            error === "INACTIVE" 
              ? "border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900/50" 
              : "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900/50"
          }`}>
            <div className="flex flex-col items-center gap-5">
              <div className={`h-16 w-16 rounded-full flex items-center justify-center ${
                error === "INACTIVE" ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600" : "bg-red-100 dark:bg-red-900/40 text-red-600"
              }`}>
                <AlertCircle size={36} />
              </div>
              <div className="max-w-md">
                <h3 className={`text-xl font-bold mb-2 ${
                  error === "INACTIVE" ? "text-amber-800 dark:text-amber-400" : "text-red-800 dark:text-red-400"
                }`}>
                  {error === "INACTIVE" ? "Account Pending Activation" : "Access Error"}
                </h3>
                <p className={`text-base ${
                  error === "INACTIVE" ? "text-amber-700/80 dark:text-amber-400/80" : "text-red-700/80 dark:text-red-400/80"
                }`}>
                  {error === "INACTIVE" 
                    ? "Your account is currently pending administrative activation. You cannot view specific appointment details until activated."
                    : error}
                </p>
                <button
                  onClick={() => navigate("/midwife/appointments")}
                  className="mt-6 px-6 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
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
              <InfoRow label="Mother"          value={appt.mother?.fullName ?? "—"} />
              <InfoRow label="Preferred Date"  value={formatDate(appt.preferredDateTime)} />
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
                <InfoRow label="Pulse Rate"    value={appt.pulseRate ? `${appt.pulseRate} bpm` : null} />
                <InfoRow label="Temperature"   value={appt.temperature ? `${appt.temperature} °C` : null} />
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
                  onClick={() => navigate(`/midwife/appointments/${id}/ai-status`)}
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
            {canReview && (
              <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-6 space-y-4">
                <h2 className="text-base font-semibold text-text-primary dark:text-dark-text">
                  Review Request
                </h2>
                {appt.status === "RESCHEDULE_REQUESTED" && (
                  <div className="rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-900/20 px-4 py-3 text-sm text-orange-700 dark:text-orange-400">
                    Mother has requested a reschedule. New preferred date: <strong>{formatDate(appt.preferredDateTime)}</strong>
                    {appt.rescheduleReason && <span className="block text-xs mt-0.5">Reason: {appt.rescheduleReason}</span>}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowApprove((v) => !v); setShowReject(false); }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <CheckCircle2 size={15} /> Approve
                  </button>
                  <button
                    onClick={() => { setShowReject((v) => !v); setShowApprove(false); }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] border border-red-300 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <XCircle size={15} /> Reject
                  </button>
                </div>

                {}
                {showApprove && (
                  <form onSubmit={handleApprove} className="space-y-3 pt-3 border-t border-border dark:border-dark-border">
                    <Field label="Confirm Date & Time">
                      <input
                        type="datetime-local"
                        required
                        value={confirmedDateTime}
                        onChange={(e) => setConfirmedDateTime(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full px-4 py-2.5 rounded-[10px] bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      {actionLoading ? "Approving…" : "Confirm Approval"}
                    </button>
                  </form>
                )}

                {}
                {showReject && (
                  <form onSubmit={handleReject} className="space-y-3 pt-3 border-t border-border dark:border-dark-border">
                    <Field label="Rejection Reason">
                      <textarea
                        rows={3}
                        required
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Please provide a reason…"
                        className={`${inputCls} resize-none`}
                      />
                    </Field>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full px-4 py-2.5 rounded-[10px] bg-red-500 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      {actionLoading ? "Rejecting…" : "Confirm Rejection"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {}
            {canFill && (
              <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-6 space-y-4">
                <h2 className="text-base font-semibold text-text-primary dark:text-dark-text flex items-center gap-2">
                  <Activity size={16} className="text-primary" /> Fill Visit Information
                </h2>
                <p className="text-sm text-text-secondary dark:text-text-muted">
                  This appointment is confirmed. Record the visit details below.
                </p>

                {!showFillForm ? (
                  <button
                    onClick={() => setShowFillForm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    Record Visit Details
                  </button>
                ) : (
                  <form onSubmit={handleFillInfo} className="space-y-4 pt-3 border-t border-border dark:border-dark-border">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Pulse Rate (bpm) *">
                        <input
                          type="number"
                          required
                          min={20}
                          max={300}
                          placeholder="e.g. 75"
                          value={visitData.pulseRate}
                          onChange={(e) => setVisitData((v) => ({ ...v, pulseRate: e.target.value }))}
                          className={inputCls}
                        />
                        <p className="text-[10px] text-text-muted mt-0.5">Range: 20 - 300 bpm</p>
                      </Field>
                      <Field label="Temperature (°C)">
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="e.g. 36.6"
                          value={visitData.temperature}
                          onChange={handleTemperatureChange}
                          className={inputCls}
                        />
                        <p className="text-[10px] text-text-muted mt-0.5">Range: 30.0 - 45.0 °C</p>
                      </Field>
                    </div>
                    <Field label="Blood Pressure">
                      <input
                        type="text"
                        placeholder="e.g. 120/80"
                        value={visitData.bloodPressure}
                        onChange={handleBloodPressureChange}
                        className={inputCls}
                      />
                      <p className="text-[10px] text-text-muted mt-0.5">Format: systolic/diastolic (e.g. 120/80)</p>
                    </Field>
                    <Field label="Special Medical Conditions (comma-separated)">
                      <input
                        type="text"
                        placeholder="e.g. Gestational diabetes, Anaemia"
                        value={visitData.specialMedicalConditions}
                        onChange={(e) => setVisitData((v) => ({ ...v, specialMedicalConditions: e.target.value }))}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Appointment Notes">
                      <textarea
                        rows={3}
                        placeholder="Any observations or recommendations…"
                        value={visitData.appointmentNotes}
                        onChange={(e) => setVisitData((v) => ({ ...v, appointmentNotes: e.target.value }))}
                        className={`${inputCls} resize-none`}
                      />
                    </Field>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="flex-1 px-4 py-2.5 rounded-[10px] bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                      >
                        {actionLoading ? "Saving…" : "Save Visit Info"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowFillForm(false)}
                        className="px-4 py-2.5 rounded-[10px] border border-border dark:border-dark-border text-text-secondary dark:text-text-muted text-sm font-medium hover:border-primary hover:text-primary transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {}
            {appt.status === "APPROVED" && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 p-5">
                <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                  ✓ Approved. Waiting for mother to confirm the slot.
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  Confirmed slot: {formatDate(appt.confirmedDateTime)}
                </p>
              </div>
            )}

            {}
            {!appt.isCompleted && appt.status !== "CANCELLED" && appt.status !== "REJECTED" && (
              <div className="flex justify-end">
                <button
                  disabled={actionLoading}
                  onClick={handleCancelClick}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] border border-red-300 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  <XCircle size={14} /> Cancel Appointment
                </button>
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
        message="Are you sure you want to cancel this appointment request? This action cannot be revoked."
        confirmLabel="Yes, Cancel"
        cancelLabel="No, Keep It"
        isConfirming={actionLoading}
      />
    </DashboardLayout>
  );
}
