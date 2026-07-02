import { useAuth } from "../context/useAuth";
import DashboardLayout from "../components/layout/DashboardLayout";
import { MOTHER_NAV } from "../config/navConfig";
import PregnancyTipCard from "../components/ui/PregnancyTipCard";
import UpcomingAppointmentCard from "../components/ui/UpcomingAppointmentCard";
import MessagesPreviewCard from "../components/ui/MessagesPreviewCard";

function MotherDashboard() {
  const { userFullName, userRole } = useAuth();

  const displayName = userFullName
    ? userFullName.split(" ")[0]
    : "Mama";

  return (
    <DashboardLayout navItems={MOTHER_NAV}>
      <div className="w-full mx-auto max-w-3xl">
        {}
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary dark:text-dark-text">
            Welcome back, {displayName}
          </h1>
          <p className="mt-2 text-sm md:text-base text-text-secondary dark:text-text-muted">
            You are logged in as{" "}
            <span className="font-semibold text-primary">{userRole}</span>.
          </p>
          <div className="mt-4 flex justify-center">
            <span className="h-1 w-20 rounded-full bg-primary" />
          </div>
        </header>

        {}
        {}
        {}
        <section aria-label="Daily pregnancy tip" className="mb-6">
          <PregnancyTipCard />
        </section>

        {}
        <section aria-label="Dashboard overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {}
            <UpcomingAppointmentCard />

            {}
            <MessagesPreviewCard />
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default MotherDashboard;
