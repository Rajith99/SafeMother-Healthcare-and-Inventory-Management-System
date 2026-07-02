import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ClipboardList, AlertCircle, HeartHandshake } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { MIDWIFE_NAV } from "../config/navConfig";
import { useAuth } from "../context/useAuth";
import MidwifeStatCard from "../components/ui/MidwifeStatCard";
import MidwifeUpcomingAppointmentCard from "../components/ui/MidwifeUpcomingAppointmentCard";
import MidwifeMessagesPreviewCard from "../components/ui/MidwifeMessagesPreviewCard";
import { listAppointments } from "../api/appointmentApiClient";
import { pregnancyService } from "../api/pregnancyApi";

function Midwife() {
  const { userFullName } = useAuth();
  const navigate = useNavigate();

  const displayName = userFullName ? userFullName.split(" ")[0] : "Midwife";

  
  const [status, setStatus] = useState(null);
  const [stats, setStats] = useState({ upcoming: 0, pending: 0, mothers: 0 });

  const loadDashboard = useCallback(async () => {
    setStatus(null);
    try {
      const [apptRes, pregnancyRes] = await Promise.all([
        listAppointments(),
        pregnancyService.listMine(),
      ]);

      const all = apptRes.data.data ?? [];
      const upcoming = all.filter(
        (a) => ["APPROVED", "CONFIRMED"].includes(a.status) && !a.isCompleted
      ).length;
      const pending = all.filter(
        (a) => ["PENDING", "RESCHEDULE_REQUESTED"].includes(a.status) && !a.isCompleted
      ).length;

      const mothers = (pregnancyRes.data?.data ?? []).length;

      setStats({ upcoming, pending, mothers });
      setStatus("OK");
    } catch (err) {
      if (
        err.response?.status === 403 &&
        err.response?.data?.message === "Account pending validation"
      ) {
        setStatus("INACTIVE");
      } else {
        setStatus("ERROR");
      }
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const isLoading = status === null;

  return (
    <DashboardLayout navItems={MIDWIFE_NAV}>
      <div className="w-full mx-auto max-w-3xl">
        {}
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary dark:text-dark-text">
            Welcome back, {displayName}
          </h1>
          <p className="mt-2 text-sm md:text-base text-text-secondary dark:text-text-muted">
            Here's a quick look at your care assignments today.
          </p>
          <div className="mt-4 flex justify-center">
            <span className="h-1 w-20 rounded-full bg-primary" />
          </div>
        </header>

        {/* ── Inactive / not approved ──────────────────── */}
        {status === "INACTIVE" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900/50 p-10 text-center shadow-sm">
            <div className="flex flex-col items-center gap-5">
              <div className="h-16 w-16 rounded-full flex items-center justify-center bg-amber-100 dark:bg-amber-900/40 text-amber-600">
                <AlertCircle size={36} />
              </div>
              <div className="max-w-md">
                <h3 className="text-xl font-bold mb-2 text-amber-800 dark:text-amber-400">
                  Account Pending Activation
                </h3>
                <p className="text-base text-amber-700/80 dark:text-amber-400/80">
                  Your account is pending administrative activation. Please
                  contact the medical administrator to gain access to the
                  dashboard.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Fetch error ───────────────────────────────── */}
        {status === "ERROR" && (
          <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900/50 p-10 text-center shadow-sm">
            <div className="flex flex-col items-center gap-5">
              <div className="h-16 w-16 rounded-full flex items-center justify-center bg-red-100 dark:bg-red-900/40 text-red-600">
                <AlertCircle size={36} />
              </div>
              <div className="max-w-md">
                <h3 className="text-xl font-bold mb-2 text-red-800 dark:text-red-400">
                  Access Error
                </h3>
                <p className="text-base text-red-700/80 dark:text-red-400/80">
                  Failed to load dashboard data. Please refresh the page or
                  check your connection.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Dashboard content (approved only) ─────────── */}
        {(isLoading || status === "OK") && (
          <>
            {/* Stat summary row */}
            <section aria-label="Midwife overview stats">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MidwifeStatCard
                  icon={<HeartHandshake size={13} />}
                  label="Assigned Mothers"
                  value={isLoading ? undefined : stats.mothers}
                  loading={isLoading}
                  onClick={isLoading ? undefined : () => navigate("/midwife/mothers")}
                />
                <MidwifeStatCard
                  icon={<CalendarDays size={13} />}
                  label="Upcoming Appointments"
                  value={isLoading ? undefined : stats.upcoming}
                  loading={isLoading}
                  onClick={isLoading ? undefined : () => navigate("/midwife/appointments")}
                />
                <MidwifeStatCard
                  icon={<ClipboardList size={13} />}
                  label="Pending Requests"
                  value={isLoading ? undefined : stats.pending}
                  loading={isLoading}
                  onClick={isLoading ? undefined : () => navigate("/midwife/appointments")}
                />
              </div>

              {/* Quick hint */}
              {!isLoading && (
                <p className="mt-6 text-center text-xs text-text-muted dark:text-text-muted">
                  Click any card to navigate to the relevant section.
                </p>
              )}
            </section>

            {/* ── Live appointment + messages cards ──────── */}
            <section aria-label="Appointments and messages" className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MidwifeUpcomingAppointmentCard />
                <MidwifeMessagesPreviewCard />
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Midwife;
