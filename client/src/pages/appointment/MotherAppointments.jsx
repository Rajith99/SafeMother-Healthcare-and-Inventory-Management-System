import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Plus, Clock, CheckCircle2, XCircle, RefreshCw, AlertCircle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { listAppointments } from "../../api/appointmentApiClient";
import { MOTHER_NAV } from "../../config/navConfig";

const STATUS_CONFIG = {
  PENDING:               { label: "Pending",              color: "bg-amber-500 text-white shadow-md ring-1 ring-inset ring-amber-600/20", icon: <Clock size={13} /> },
  APPROVED:              { label: "Approved",             color: "bg-blue-500 text-white shadow-md ring-1 ring-inset ring-blue-600/20",         icon: <CheckCircle2 size={13} /> },
  CONFIRMED:             { label: "Confirmed",            color: "bg-emerald-500 text-white shadow-md ring-1 ring-inset ring-emerald-600/20",     icon: <CheckCircle2 size={13} /> },
  REJECTED:              { label: "Rejected",             color: "bg-rose-500 text-white shadow-md ring-1 ring-inset ring-rose-600/20",             icon: <XCircle size={13} /> },
  CANCELLED:             { label: "Cancelled",            color: "bg-slate-500 text-white shadow-md ring-1 ring-inset ring-slate-600/20",             icon: <XCircle size={13} /> },
  RESCHEDULE_REQUESTED:  { label: "Reschedule Req",       color: "bg-orange-500 text-white shadow-md ring-1 ring-inset ring-orange-600/20", icon: <RefreshCw size={13} /> },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "bg-gray-500 text-white", icon: <AlertCircle size={13} /> };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${cfg.color} shadow-sm tracking-wide`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const TABS = [
  { key: "requests",  label: "Requests" },
  { key: "upcoming",  label: "Upcoming" },
  { key: "completed", label: "Completed" },
];

export default function MotherAppointments() {
  const [activeTab, setActiveTab] = useState("requests");
  const [data, setData] = useState({ requests: [], upcoming: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    listAppointments()
      .then((res) => {
        const all = res.data.data ?? [];
        
        const requests = all.filter(
          (a) => ["PENDING", "RESCHEDULE_REQUESTED", "REJECTED", "CANCELLED"].includes(a.status) && !a.isCompleted
        );
        const upcoming = all.filter(
          (a) => ["APPROVED", "CONFIRMED"].includes(a.status) && !a.isCompleted
        );
        const completed = all.filter((a) => a.isCompleted || a.status === "COMPLETED");

        setData({ requests, upcoming, completed });
      })
      .catch(() => setError("Failed to load appointments. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const currentList = data[activeTab] ?? [];

  return (
    <DashboardLayout navItems={MOTHER_NAV}>
      <div className="w-full max-w-3xl mx-auto">
        {}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text">
              My Appointments
            </h1>
            <p className="text-sm text-text-secondary dark:text-text-muted mt-1">
              Track and manage your midwife appointments
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard/appointments/new")}
            className="
              inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px]
              bg-primary text-white text-sm font-semibold
              hover:opacity-90 transition-opacity shadow-sm
            "
          >
            <Plus size={16} /> Book Appointment
          </button>
        </div>

        {}
        <span className="block h-1 w-16 rounded-full bg-primary mb-6" />

        {}
        <div className="flex gap-1 mb-6 bg-bg-card dark:bg-dark-surface rounded-xl p-1 border border-border dark:border-dark-border">
          {TABS.map((tab) => {
            const count = data[tab.key]?.length ?? 0;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={[
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.key
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-secondary dark:text-text-muted hover:text-primary",
                ].join(" ")}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    activeTab === tab.key ? "bg-white/25 text-white" : "bg-primary/10 text-primary"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-24 rounded-xl bg-border dark:bg-dark-border" />
            ))}
          </div>
        )}

        {}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-5 text-center text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {}
        {!loading && !error && currentList.length === 0 && (
          <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-10 text-center">
            <CalendarDays size={40} className="mx-auto text-text-muted mb-3" />
            <p className="text-text-secondary dark:text-text-muted text-sm">
              No {TABS.find((t) => t.key === activeTab)?.label.toLowerCase()} appointments.
            </p>
            {activeTab === "requests" && (
              <button
                onClick={() => navigate("/dashboard/appointments/new")}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Plus size={15} /> Book your first appointment
              </button>
            )}
          </div>
        )}

        {}
        {!loading && !error && currentList.length > 0 && (
          <ul className="space-y-3">
            {currentList.map((appt) => (
              <li
                key={appt._id}
                onClick={() => navigate(`/dashboard/appointments/${appt._id}`)}
                className="
                  rounded-xl border border-border dark:border-dark-border
                  bg-bg-card dark:bg-dark-surface
                  p-5 cursor-pointer
                  hover:border-primary/40 hover:shadow-md transition-all
                  flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3
                "
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={appt.status} />
                    {appt.isCompleted && (
                      <span className="text-xs text-accent font-medium">✓ Completed</span>
                    )}
                  </div>
                  <p className="text-base font-bold text-text-primary dark:text-dark-text mt-1 truncate">
                    Preferred: {formatDate(appt.preferredDateTime)}
                  </p>
                  {appt.confirmedDateTime && (
                    <p className="text-sm font-medium text-text-secondary dark:text-text-muted">
                      Confirmed: <span className="font-semibold text-text-primary dark:text-dark-text">{formatDate(appt.confirmedDateTime)}</span>
                    </p>
                  )}
                  {appt.rejectionReason && appt.status === "REJECTED" && (
                    <p className="text-xs text-red-500 mt-0.5">Reason: {appt.rejectionReason}</p>
                  )}
                </div>
                <span className="shrink-0 text-text-muted dark:text-dark-border">
                  <CalendarDays size={20} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
