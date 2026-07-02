import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronRight, Clock, CheckCircle2, RefreshCw, AlertCircle, XCircle } from "lucide-react";
import { listAppointments } from "../../api/appointmentApiClient";

const STATUS_CONFIG = {
  PENDING:              { label: "Pending",         color: "bg-amber-500",  icon: <Clock size={11} /> },
  APPROVED:             { label: "Approved",        color: "bg-blue-500",   icon: <CheckCircle2 size={11} /> },
  CONFIRMED:            { label: "Confirmed",       color: "bg-emerald-500",icon: <CheckCircle2 size={11} /> },
  REJECTED:             { label: "Rejected",        color: "bg-rose-500",   icon: <XCircle size={11} /> },
  CANCELLED:            { label: "Cancelled",       color: "bg-slate-500",  icon: <XCircle size={11} /> },
  RESCHEDULE_REQUESTED: { label: "Reschedule Req.", color: "bg-orange-500", icon: <RefreshCw size={11} /> },
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    weekday: "short",
    month:   "short",
    day:     "numeric",
    hour:    "numeric",
    minute:  "2-digit",
  });
}

export default function UpcomingAppointmentCard() {
  const [appts, setAppts]     = useState([]);    
  const [total, setTotal]     = useState(0);       
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const navigate = useNavigate();

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAppointments();
      const all = res.data.data ?? [];
      const upcoming = all.filter(
        (a) => ["APPROVED", "CONFIRMED", "PENDING", "RESCHEDULE_REQUESTED"].includes(a.status) && !a.isCompleted
      );
      
      upcoming.sort(
        (x, y) => new Date(x.preferredDateTime) - new Date(y.preferredDateTime)
      );
      setAppts(upcoming.slice(0, 2));
      setTotal(upcoming.length);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  
  if (loading) {
    return (
      <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface shadow-sm p-5 animate-pulse">
        <div className="h-3 w-24 rounded-full bg-border dark:bg-dark-border mb-3" />
        <div className="h-4 w-40 rounded-full bg-border dark:bg-dark-border mb-2" />
        <div className="h-3 w-32 rounded-full bg-border dark:bg-dark-border" />
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate("/dashboard/appointments")}
      className="
        group rounded-xl border border-border dark:border-dark-border
        bg-bg-card dark:bg-dark-surface shadow-sm p-5 cursor-pointer
        hover:border-primary/40 hover:shadow-md transition-all duration-200
      "
    >
      {}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
          <CalendarDays size={13} className="text-primary" />
          Appointments
        </p>
        {total > 0 && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {total} pending
          </span>
        )}
      </div>

      {}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={13} /> Couldn't load appointments
        </p>
      )}

      {/* No appointments */}
      {!error && appts.length === 0 && (
        <div className="flex flex-col items-start gap-2">
          <p className="text-sm text-text-secondary dark:text-text-muted">
            No upcoming appointments.
          </p>
          <span className="text-xs text-primary font-medium flex items-center gap-0.5 group-hover:underline">
            Book one <ChevronRight size={13} />
          </span>
        </div>
      )}

      {/* Up to 2 appointments */}
      {!error && appts.length > 0 && (
        <div className="flex flex-col gap-3">
          {appts.map((appt, idx) => {
            const cfg = STATUS_CONFIG[appt.status] ?? { label: appt.status, color: "bg-gray-500", icon: <AlertCircle size={11} /> };
            const dateToShow = appt.confirmedDateTime || appt.preferredDateTime;
            return (
              <div key={appt._id ?? idx}>
                {idx > 0 && <div className="border-t border-border dark:border-dark-border mb-3" />}
                <div className="flex flex-col gap-1.5">
                  {/* Status badge */}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold text-white w-fit ${cfg.color}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                  {/* Date/time */}
                  <p className="text-sm font-semibold text-text-primary dark:text-dark-text leading-tight">
                    {formatDate(dateToShow)}
                  </p>
                  {/* If confirmed differs from preferred */}
                  {appt.confirmedDateTime && appt.preferredDateTime !== appt.confirmedDateTime && (
                    <p className="text-xs text-text-muted">
                      Preferred: {formatDate(appt.preferredDateTime)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          {/* CTA */}
          <span className="mt-1 text-xs text-primary font-medium flex items-center gap-0.5 group-hover:underline">
            View all appointments <ChevronRight size={13} />
          </span>
        </div>
      )}
    </div>
  );
}
