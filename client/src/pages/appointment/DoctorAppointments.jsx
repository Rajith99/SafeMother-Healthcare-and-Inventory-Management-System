import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays, Clock, CheckCircle2, XCircle, RefreshCw, AlertCircle,
  Stethoscope, Users, ClipboardList, MessageCircle, Settings, AlertOctagon, Search, Filter, Phone, Activity, Thermometer, FileText, ChevronDown, ChevronUp
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { listAppointments } from "../../api/appointmentApiClient";
import { DOCTOR_NAV } from "../../config/navConfig";

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
  { key: "requests",  label: "Requests" },
  { key: "upcoming",  label: "Upcoming" },
  { key: "completed", label: "Completed" },
];

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [data, setData] = useState({ requests: [], upcoming: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [showHighRiskOnly, setShowHighRiskOnly] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

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
      .catch((err) => {
        if (err.response?.status === 403 && err.response?.data?.message === "Account pending validation") {
          setError("INACTIVE");
        } else {
          setError("Failed to load appointments. Please check your connection.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const currentList = data[activeTab] ?? [];

  
  const checkHighRisk = (appt) => {
    const p = appt.pregnancy || {};
    const hasMedConditions = p.medicalConditions?.length > 0;
    const hasPrevComplications = p.previousComplications?.length > 0;
    const hasAbnormalPulse = appt.pulseRate ? (appt.pulseRate > 100 || appt.pulseRate < 60) : false;
    const hasSpecialNotes = appt.specialMedicalConditions?.length > 0;
    
    return hasMedConditions || hasPrevComplications || hasAbnormalPulse || hasSpecialNotes;
  };

  const filteredList = currentList.filter(appt => {
    const motherName = appt.mother?.fullName?.toLowerCase() || "";
    const matchesSearch = motherName.includes(searchQuery.toLowerCase());
    const matchesRisk = showHighRiskOnly ? checkHighRisk(appt) : true;
    
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

    return matchesSearch && matchesRisk && matchesDate;
  });

  return (
    <DashboardLayout navItems={DOCTOR_NAV}>
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
          
          {}
          <button
            onClick={() => setShowHighRiskOnly(!showHighRiskOnly)}
            className={`h-11 px-5 flex items-center justify-center gap-2.5 text-sm font-bold rounded-xl transition-all border shadow-sm ${
              showHighRiskOnly 
                ? "bg-red-500 text-white border-red-600 ring-4 ring-red-500/10 shadow-lg" 
                : "bg-bg-card text-text-secondary border-border hover:border-primary/40 hover:text-primary dark:bg-dark-surface dark:text-muted dark:border-dark-border"
            }`}
          >
            <AlertOctagon size={18} className={showHighRiskOnly ? "animate-pulse" : ""} />
            <span className="whitespace-nowrap">High Risk</span>
          </button>
        </div>

        {}
        <div className="flex gap-1 mb-6 bg-bg-card dark:bg-dark-surface rounded-xl p-1 border border-border dark:border-dark-border">
          {TABS.map((tab) => {
            const count = data[tab.key]?.length ?? 0;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setExpandedId(null);
                }}
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
                  {error === "INACTIVE" ? "Professional Activation Required" : "Access Error"}
                </h3>
                <p className={`text-base ${
                  error === "INACTIVE" ? "text-amber-700/80 dark:text-amber-400/80" : "text-red-700/80 dark:text-red-400/80"
                }`}>
                  {error === "INACTIVE" 
                    ? "Your account is currently pending administrative activation. Please contact the medical administrator to gain access to your appointment dashboard."
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
              No matching appointments found.
            </p>
          </div>
        )}

        {}
        {!loading && !error && filteredList.length > 0 && (
          <ul className="space-y-3">
            {filteredList.map((appt) => {
              const isHighRisk = checkHighRisk(appt);
              const isExpanded = expandedId === appt._id;

              return (
                <li
                  key={appt._id}
                  className={`
                    relative rounded-xl border bg-bg-card dark:bg-dark-surface
                    cursor-pointer transition-all flex flex-col gap-3 overflow-hidden
                    ${isHighRisk 
                      ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)] hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]" 
                      : "border-border dark:border-dark-border hover:border-primary/40 hover:shadow-md"}
                  `}
                >
                  <div 
                    className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full"
                    onClick={() => setExpandedId(isExpanded ? null : appt._id)}
                  >
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={appt.status} />
                        {appt.isCompleted && (
                          <span className="text-xs text-accent font-medium">✓ Completed</span>
                        )}
                        {isHighRisk && (
                          <div className="group relative">
                            <span className="inline-flex items-center gap-1.5 bg-rose-500 text-white font-bold px-3 py-1 rounded-full text-[11px] uppercase tracking-wider shadow-md cursor-help ring-1 ring-inset ring-rose-600/20">
                              <AlertOctagon size={12} /> HIGH RISK
                            </span>
                            {}
                            <div className="absolute top-full left-0 mt-1 hidden group-hover:flex items-center gap-1 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl z-10 whitespace-nowrap font-medium">
                              <Phone size={12} /> Call Mother: {appt.mother?.contactNumber || "N/A"}
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-base font-bold text-text-primary dark:text-dark-text mt-2 mb-1">
                        {appt.mother?.fullName ?? "Mother"}
                      </p>
                      <div className="flex flex-col gap-1">
                        <p className="text-[13px] font-medium text-text-secondary dark:text-text-muted flex items-center gap-1.5">
                          <CalendarDays size={14} className="opacity-70" />
                          Preferred: {formatDate(appt.preferredDateTime)}
                        </p>
                        {appt.confirmedDateTime && (
                          <p className="text-[13px] font-medium text-text-secondary dark:text-text-muted flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="opacity-70" />
                            Confirmed: <span className="font-semibold text-text-primary dark:text-dark-text">{formatDate(appt.confirmedDateTime)}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {isExpanded ? <ChevronUp size={24} className="text-text-muted" /> : <ChevronDown size={24} className="text-text-muted" />}
                    </div>
                  </div>

                  {}
                  {isExpanded && appt.isCompleted && (
                    <div className="px-5 pb-5 border-t border-border dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 pt-4 animate-in slide-in-from-top-2 duration-300">
                      <h4 className="text-sm font-bold text-text-primary dark:text-dark-text mb-3">Visit Details & Vitals</h4>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        <div className="flex flex-col gap-1 p-2 bg-white dark:bg-dark-surface rounded-lg border border-border dark:border-dark-border shadow-sm">
                          <span className="text-xs text-text-secondary dark:text-text-muted flex items-center gap-1"><Activity size={12}/> Pulse Rate</span>
                          <span className={`text-sm font-semibold ${(appt.pulseRate > 100 || appt.pulseRate < 60) ? "text-red-500" : "text-text-primary dark:text-dark-text"}`}>
                            {appt.pulseRate ? `${appt.pulseRate} bpm` : "N/A"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 p-2 bg-white dark:bg-dark-surface rounded-lg border border-border dark:border-dark-border shadow-sm">
                          <span className="text-xs text-text-secondary dark:text-text-muted flex items-center gap-1"><Thermometer size={12}/> Temperature</span>
                          <span className="text-sm font-semibold text-text-primary dark:text-dark-text">
                            {appt.temperature ? `${appt.temperature}°` : "N/A"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 p-2 bg-white dark:bg-dark-surface rounded-lg border border-border dark:border-dark-border shadow-sm">
                          <span className="text-xs text-text-secondary dark:text-text-muted flex items-center gap-1"><Activity size={12}/> Blood Pressure</span>
                          <span className="text-sm font-semibold text-text-primary dark:text-dark-text">
                            {appt.bloodPressure || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className="text-xs text-text-secondary dark:text-text-muted flex items-center gap-1 mb-1"><FileText size={12}/> Appointment Notes</span>
                        <p className="text-sm text-text-primary dark:text-dark-text bg-white dark:bg-dark-surface p-3 rounded-lg border border-border dark:border-dark-border shadow-sm">
                          {appt.appointmentNotes || "No notes provided."}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <a 
                          href={`tel:${appt.mother?.contactNumber}`} 
                          className="inline-flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                          onClick={(e) => e.stopPropagation()} 
                        >
                          <Phone size={16} /> 
                          Contact Mother ({appt.mother?.contactNumber})
                        </a>
                        <span className="text-xs text-text-secondary dark:text-text-muted ml-2">
                          Provides instant instruction line.
                        </span>
                      </div>
                    </div>
                  )}

                  {isExpanded && !appt.isCompleted && (
                     <div className="px-5 pb-5 pt-2">
                       <p className="text-sm text-text-secondary dark:text-text-muted">
                         This appointment has not been completed yet. Vitals will appear here after the midwife visit.
                       </p>
                     </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
