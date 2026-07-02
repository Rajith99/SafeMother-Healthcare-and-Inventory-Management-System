import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Baby,
  CalendarDays,
  MessageCircle,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
  Activity,
  ArrowRight,
} from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { ADMIN_NAV } from "../config/navConfig";
import { analyticsService } from "../api/analyticsApi";


const ROLE_COLORS = {
  MOTHER:  "#C94A6A",
  DOCTOR:  "#5F8F2E",
  MIDWIFE: "#E8AEBB",
  ADMIN:   "#9A9A9A",
};

const TRIMESTER_COLORS = {
  FIRST:  "#E8AEBB",
  SECOND: "#C94A6A",
  THIRD:  "#8B2B49",
};

const APPOINTMENT_COLORS = {
  PENDING:              "#F59E0B",
  APPROVED:             "#5F8F2E",
  CONFIRMED:            "#3B82F6",
  REJECTED:             "#EF4444",
  CANCELLED:            "#9A9A9A",
  RESCHEDULE_REQUESTED: "#A78BFA",
};


function DonutChart({ segments, size = 160, thickness = 36, label, sublabel }) {
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  const total = segments.reduce((s, seg) => s + seg.value, 0);

  let offset = 0;
  const slices = segments.map((seg) => {
    const fraction = total > 0 ? seg.value / total : 0;
    const dash = fraction * circumference;
    const gap = circumference - dash;
    const slice = { ...seg, dash, gap, offset: offset * circumference };
    offset += fraction;
    return slice;
  });

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" style={{ transform: "rotate(-90deg)" }}>
        {}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="currentColor"
          className="text-border dark:text-dark-border"
          strokeWidth={thickness}
        />
        {slices.map((s, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      {}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {total === 0 ? (
          <span className="text-xs text-text-muted text-center px-2">No data yet</span>
        ) : (
          <>
            <span className="text-2xl font-bold text-text-primary dark:text-dark-text leading-none">{label}</span>
            {sublabel && (
              <span className="text-xs text-text-muted mt-1">{sublabel}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}


function BarChart({ bars, maxValue }) {
  const max = maxValue || Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className="space-y-3">
      {bars.map((bar, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-24 text-xs text-text-secondary dark:text-text-muted text-right shrink-0 truncate">
            {bar.label}
          </span>
          <div className="flex-1 h-6 rounded-full bg-border dark:bg-dark-border overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${max > 0 ? (bar.value / max) * 100 : 0}%`,
                backgroundColor: bar.color,
                minWidth: bar.value > 0 ? "6px" : "0px",
              }}
            />
          </div>
          <span className="w-7 text-xs font-semibold text-text-primary dark:text-dark-text text-right shrink-0">
            {bar.value}
          </span>
        </div>
      ))}
    </div>
  );
}


function StatCard({ icon: Icon, label, value, sub, accent, loading, actionTo, actionLabel }) {
  return (
    <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface shadow-sm p-5 flex items-start gap-4">
      <div
        className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
        style={{ backgroundColor: `${accent}18`, color: accent }}
      >
        <Icon size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-text-secondary dark:text-text-muted leading-none mb-1">{label}</p>
        {loading ? (
          <div className="h-7 w-16 rounded-md bg-border dark:bg-dark-border animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold text-text-primary dark:text-dark-text leading-none">{value}</p>
        )}
        {sub && !loading && (
          <p className="text-xs text-text-muted mt-1">{sub}</p>
        )}
        {actionTo && !loading && (
          <Link
            to={actionTo}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            {actionLabel ?? "Review"}
            <ArrowRight size={11} />
          </Link>
        )}
      </div>
    </div>
  );
}


function LegendItem({ color, label, value, percent }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="text-sm text-text-secondary dark:text-text-muted flex-1 truncate">{label}</span>
      <span className="text-sm font-semibold text-text-primary dark:text-dark-text">{value}</span>
      {percent !== undefined && (
        <span className="text-xs text-text-muted w-10 text-right">{percent}%</span>
      )}
    </div>
  );
}


function ChartSkeleton({ height = "h-40" }) {
  return (
    <div className={`${height} rounded-xl bg-border dark:bg-dark-border animate-pulse`} />
  );
}


export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getStats();
      setStats(res.data.data);
      setLastUpdated(new Date());
    } catch {
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  
  const userSegments = stats
    ? Object.entries(ROLE_COLORS).map(([role, color]) => ({
        label: role,
        value: stats.userStats.byRole[role] ?? 0,
        color,
      }))
    : [];

  const trimesterBars = stats
    ? [
        { label: "1st Trimester", value: stats.pregnancyStats.byTrimester.FIRST,  color: TRIMESTER_COLORS.FIRST },
        { label: "2nd Trimester", value: stats.pregnancyStats.byTrimester.SECOND, color: TRIMESTER_COLORS.SECOND },
        { label: "3rd Trimester", value: stats.pregnancyStats.byTrimester.THIRD,  color: TRIMESTER_COLORS.THIRD },
      ]
    : [];

  const apptBars = stats
    ? [
        { label: "Pending",     value: stats.appointmentStats.byStatus.PENDING,              color: APPOINTMENT_COLORS.PENDING },
        { label: "Approved",    value: stats.appointmentStats.byStatus.APPROVED,             color: APPOINTMENT_COLORS.APPROVED },
        { label: "Confirmed",   value: stats.appointmentStats.byStatus.CONFIRMED,            color: APPOINTMENT_COLORS.CONFIRMED },
        { label: "Reschedule",  value: stats.appointmentStats.byStatus.RESCHEDULE_REQUESTED, color: APPOINTMENT_COLORS.RESCHEDULE_REQUESTED },
        { label: "Rejected",    value: stats.appointmentStats.byStatus.REJECTED,             color: APPOINTMENT_COLORS.REJECTED },
        { label: "Cancelled",   value: stats.appointmentStats.byStatus.CANCELLED,            color: APPOINTMENT_COLORS.CANCELLED },
      ]
    : [];

  const pregnancySegments = stats
    ? [
        { label: "Active",    value: stats.pregnancyStats.byStatus.ACTIVE,    color: "#C94A6A" },
        { label: "Completed", value: stats.pregnancyStats.byStatus.COMPLETED, color: "#5F8F2E" },
        { label: "Cancelled", value: stats.pregnancyStats.byStatus.CANCELLED, color: "#9A9A9A" },
      ]
    : [];

  const pct = (part, total) =>
    total > 0 ? Math.round((part / total) * 100) : 0;

  const completionRate = stats
    ? pct(stats.appointmentStats.completed, stats.appointmentStats.total)
    : 0;

  return (
    <DashboardLayout navItems={ADMIN_NAV}>
      <div className="w-full max-w-5xl mx-auto space-y-8">

        {}
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-textW-primary dark:text-dark-text">
              System Overview
            </h1>
            <p className="mt-1 text-sm text-text-secondary dark:text-text-muted">
              Live overview of platform activity and user engagement.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-text-muted hidden sm:block">
                Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button
              onClick={fetchStats}
              disabled={loading}
              className="
                inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                border border-border dark:border-dark-border
                bg-bg-card dark:bg-dark-surface
                text-text-primary dark:text-dark-text
                hover:border-primary hover:text-primary
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
              "
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </header>

        {}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm border bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30">
            <Activity size={14} className="shrink-0" />
            {error}
          </div>
        )}

        {}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats?.userStats.total ?? "–"}
            sub={`${stats?.userStats.newUsersLast30Days ?? 0} new this month`}
            accent="#C94A6A"
            loading={loading}
          />
          <StatCard
            icon={Baby}
            label="Active Pregnancies"
            value={stats?.pregnancyStats.byStatus.ACTIVE ?? "–"}
            sub={`${stats?.pregnancyStats.byStatus.COMPLETED ?? 0} completed total`}
            accent="#5F8F2E"
            loading={loading}
          />
          <StatCard
            icon={CalendarDays}
            label="Appointments"
            value={stats?.appointmentStats.total ?? "–"}
            sub={`${completionRate}% completion rate`}
            accent="#3B82F6"
            loading={loading}
          />
          <StatCard
            icon={ShieldAlert}
            label="Pending Approvals"
            value={stats?.userStats.pendingValidation ?? "–"}
            sub="Doctors & midwives"
            accent="#F59E0B"
            loading={loading}
            actionTo="/admin/users"
            actionLabel="Review users"
          />
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {}
          <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={16} className="text-primary" />
              <h2 className="text-sm font-semibold text-text-primary dark:text-dark-text">User Distribution</h2>
            </div>

            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <ChartSkeleton height="h-40" />
                <div className="w-full space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 rounded bg-border dark:bg-dark-border animate-pulse" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-5">
                <DonutChart
                  segments={userSegments}
                  size={160}
                  thickness={32}
                  label={stats?.userStats.total}
                  sublabel="users"
                />
                <div className="w-full space-y-2">
                  {userSegments.map((s) => (
                    <LegendItem
                      key={s.label}
                      color={s.color}
                      label={s.label.charAt(0) + s.label.slice(1).toLowerCase()}
                      value={s.value}
                      percent={pct(s.value, stats?.userStats.total)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {}
          <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <Baby size={16} className="text-primary" />
              <h2 className="text-sm font-semibold text-text-primary dark:text-dark-text">Pregnancy Status</h2>
            </div>

            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <ChartSkeleton height="h-40" />
                <div className="w-full space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 rounded bg-border dark:bg-dark-border animate-pulse" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-5">
                <DonutChart
                  segments={pregnancySegments}
                  size={160}
                  thickness={32}
                  label={stats?.pregnancyStats.total}
                  sublabel="total"
                />
                <div className="w-full space-y-2">
                  {pregnancySegments.map((s) => (
                    <LegendItem
                      key={s.label}
                      color={s.color}
                      label={s.label}
                      value={s.value}
                      percent={pct(s.value, stats?.pregnancyStats.total)}
                    />
                  ))}
                </div>
                {stats?.pregnancyStats.unassignedDoctor > 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                    {stats.pregnancyStats.unassignedDoctor} active{" "}
                    {stats.pregnancyStats.unassignedDoctor === 1 ? "pregnancy has" : "pregnancies have"} no doctor assigned
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {}
          <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface shadow-sm p-6">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-primary" />
                <h2 className="text-sm font-semibold text-text-primary dark:text-dark-text">Appointments by Status</h2>
              </div>
              {!loading && stats && (
                <span className="text-xs text-text-muted">
                  {stats.appointmentStats.completed} completed
                </span>
              )}
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-6 rounded-full bg-border dark:bg-dark-border animate-pulse" />
                ))}
              </div>
            ) : (
              <BarChart bars={apptBars} />
            )}
          </div>

          {}
          <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <Activity size={16} className="text-primary" />
              <h2 className="text-sm font-semibold text-text-primary dark:text-dark-text">Active Pregnancies by Trimester</h2>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-6 rounded-full bg-border dark:bg-dark-border animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <BarChart bars={trimesterBars} />

                {}
                <div className="pt-2 border-t border-border dark:border-dark-border">
                  <p className="text-xs text-text-muted mb-3 uppercase tracking-wide">Trimester Journey</p>
                  <div className="flex rounded-full overflow-hidden h-4" style={{ gap: "2px" }}>
                    {trimesterBars.map((b, i) => {
                      const total = trimesterBars.reduce((s, t) => s + t.value, 0);
                      const w = total > 0 ? (b.value / total) * 100 : 33.33;
                      return (
                        <div
                          key={i}
                          title={`${b.label}: ${b.value}`}
                          style={{ width: `${w}%`, backgroundColor: b.color, minWidth: b.value > 0 ? "4px" : "0px" }}
                          className="h-full transition-all duration-700"
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2">
                    {trimesterBars.map((b) => (
                      <div key={b.label} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                        <span className="text-xs text-text-muted">{b.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {}
        {!loading && stats && (
          <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <MessageCircle size={16} className="text-primary" />
              <h2 className="text-sm font-semibold text-text-primary dark:text-dark-text">Platform Activity</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

              {}
              <div className="text-center p-4 rounded-xl bg-bg-main dark:bg-dark-bg border border-border dark:border-dark-border">
                <p className="text-2xl font-bold text-text-primary dark:text-dark-text">
                  {(stats.userStats.byRole.DOCTOR ?? 0) + (stats.userStats.byRole.MIDWIFE ?? 0)}
                </p>
                <p className="text-xs text-text-muted mt-1">Medical Staff</p>
              </div>

              {}
              <div className="text-center p-4 rounded-xl bg-bg-main dark:bg-dark-bg border border-border dark:border-dark-border">
                <p className="text-2xl font-bold text-text-primary dark:text-dark-text">
                  {stats.chatStats.totalChats}
                </p>
                <p className="text-xs text-text-muted mt-1">Conversations</p>
              </div>

              {}
              <div className="text-center p-4 rounded-xl bg-bg-main dark:bg-dark-bg border border-border dark:border-dark-border">
                <p
                  className="text-2xl font-bold"
                  style={{ color: completionRate >= 70 ? "#5F8F2E" : completionRate >= 40 ? "#F59E0B" : "#EF4444" }}
                >
                  {completionRate}%
                </p>
                <p className="text-xs text-text-muted mt-1">Appt. Completion</p>
              </div>

              {}
              <div className="text-center p-4 rounded-xl bg-bg-main dark:bg-dark-bg border border-border dark:border-dark-border">
                <p className="text-2xl font-bold text-text-primary dark:text-dark-text">
                  {stats.userStats.totalActive}
                  <span className="text-sm font-normal text-text-muted"> / {stats.userStats.total}</span>
                </p>
                <p className="text-xs text-text-muted mt-1">Active Users</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
