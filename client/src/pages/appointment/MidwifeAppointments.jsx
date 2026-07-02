import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays, Clock, CheckCircle2, XCircle, RefreshCw, AlertCircle, Search
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { listAppointments, getUpcomingAppointments, getCompletedAppointments } from "../../api/appointmentApiClient";
import { MIDWIFE_NAV } from "../../config/navConfig";

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
  return new Date(dateStr).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

const TABS = [
  { key: "requests",  label: "Requests",  desc: "PENDING / RESCHEDULE_REQUESTED" },
  { key: "upcoming",  label: "Upcoming",  desc: "CONFIRMED appointments" },
  { key: "completed", label: "Completed", desc: "Finished visits" },
];

export default function MidwifeAppointments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("requests");
  const [data, setData] = useState({ requests: [], upcoming: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDate, setSearchDate] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      listAppointments(),
      getUpcomingAppointments(),
      getCompletedAppointments(),
    ])
      .then(([allRes, upcomingRes, completedRes]) => {
        const all = allRes.data.data ?? [];
        
        const requests = all.filter(
          (a) => a.status === "PENDING" || a.status === "RESCHEDULE_REQUESTED"
        );
        setData({
          requests,
          upcoming: upcomingRes.data.data ?? [],
          completed: completedRes.data.data ?? [],
        });
      })
      .catch((err) => {
        if (err.response?.status === 403 && err.response?.data?.message === "Account pending validation") {
          setError("INACTIVE");
        } else {
          setError("Failed to load appointments.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const currentList = data[activeTab] ?? [];

  const filteredList = currentList.filter((appt) => {
    const motherName = appt.mother?.fullName?.toLowerCase() || "";
    const matchesSearch = motherName.includes(searchQuery.toLowerCase());

    let matchesDate = true;
    if (searchDate) {
      
      const getLocalDateStr = (dStr) => {
        if (!dStr) return "";
        const d = new Date(dStr);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const prefDate = getLocalDateStr(appt.preferredDateTime);
      const confDate = getLocalDateStr(appt.confirmedDateTime);
      matchesDate = prefDate === searchDate || confDate === searchDate;
    }

    return matchesSearch && matchesDate;
  });

  return (
    <DashboardLayout navItems={MIDWIFE_NAV}>
      <div className="w-full max-w-3xl mx-auto">
        {}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text">
            Appointments
          </h1>
        </div>

        {}
        <div className="h-1 w-12 rounded-full bg-primary mb-8" />

        {}
        <div className="mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {}
          <div className="relative group flex-1 md:flex-none md:min-w-[280px]">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search mother..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 h-11 text-sm bg-bg-card dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-text-primary dark:text-dark-text shadow-sm placeholder:text-text-muted/50"
            />
          </div>

          {}
          <div className="relative group flex-1 md:flex-none md:min-w-[200px]">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none">
              <CalendarDays size={18} />
            </div>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full pl-11 pr-10 h-11 text-sm bg-bg-card dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-text-primary dark:text-dark-text appearance-none cursor-pointer shadow-sm"
            />
            {searchDate && (
              <button
                onClick={() => setSearchDate("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                title="Clear date"
              >
                <XCircle size={14} />
              </button>
            )}
          </div>
        </div>

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
          <div className={`rounded-xl border p-8 text-center shadow-sm ${
            error === "INACTIVE" 
              ? "border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900/50" 
              : "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900/50"
          }`}>
            <div className="flex flex-col items-center gap-4">
              <div className={`h-14 w-14 rounded-full flex items-center justify-center ${
                error === "INACTIVE" ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600" : "bg-red-100 dark:bg-red-900/40 text-red-600"
              }`}>
                <AlertCircle size={30} />
              </div>
              <div className="max-w-md">
                <h3 className={`text-lg font-bold mb-1 ${
                  error === "INACTIVE" ? "text-amber-800 dark:text-amber-400" : "text-red-800 dark:text-red-400"
                }`}>
                  {error === "INACTIVE" ? "Account Pending Activation" : "Fetch Error"}
                </h3>
                <p className={`text-sm ${
                  error === "INACTIVE" ? "text-amber-700/80 dark:text-amber-400/80" : "text-red-700/80 dark:text-red-400/80"
                }`}>
                  {error === "INACTIVE" 
                    ? "Your account is currently pending administrative activation. Please contact the administrator to gain access to appointment records."
                    : error}
                </p>
              </div>
            </div>
          </div>
        )}

        {}
        {!loading && !error && filteredList.length === 0 && (
          <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-10 text-center">
            <CalendarDays size={38} className="mx-auto text-text-muted mb-3" />
            <p className="text-text-secondary dark:text-text-muted text-sm">
              {searchQuery || searchDate
                ? "No matching appointments found."
                : `No ${TABS.find((t) => t.key === activeTab)?.label.toLowerCase()} appointments.`}
            </p>
          </div>
        )}

        {}
        {!loading && !error && filteredList.length > 0 && (
          <ul className="space-y-3">
            {filteredList.map((appt) => {
              const detailPath = `/midwife/appointments/${appt._id}`;
              return (
                <li
                  key={appt._id}
                  onClick={() => navigate(detailPath)}
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
                    <p className="text-base font-bold text-text-primary dark:text-dark-text mt-1">
                      {appt.mother?.fullName ?? "Mother"}
                    </p>
                    <div className="flex flex-col gap-1 mt-1">
                      <p className="text-[13px] font-medium text-text-secondary dark:text-text-muted flex items-center gap-1.5">
                        <CalendarDays size={14} className="opacity-70" />
                        Preferred: {formatDate(appt.preferredDateTime)}
                      </p>
                      {appt.confirmedDateTime && (
                        <p className="text-[13px] font-medium text-text-secondary dark:text-text-muted flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="opacity-70" />
                          Confirmed: <span className="text-text-primary dark:text-dark-text font-semibold">{formatDate(appt.confirmedDateTime)}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <CalendarDays size={20} className="shrink-0 text-text-muted dark:text-dark-border" />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
