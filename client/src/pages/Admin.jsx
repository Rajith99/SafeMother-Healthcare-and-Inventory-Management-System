import { useAuth } from "../context/useAuth";
import DashboardLayout from "../components/layout/DashboardLayout";
import { ADMIN_NAV } from "../config/navConfig";

function Admin() {
  const { userRole } = useAuth();

  return (
    <DashboardLayout navItems={ADMIN_NAV}>
      <div className="w-full mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary dark:text-dark-text">
            Welcome
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-sm md:text-base text-text-secondary dark:text-text-muted">
            You are logged in as <span className="font-semibold">{userRole}</span>.
          </p>
          <div className="mt-5 flex justify-center">
            <span className="h-1 w-20 rounded-full bg-primary" />
          </div>
        </header>

        <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface shadow-sm p-6 text-center">
          <p className="text-text-secondary dark:text-text-muted">
            Placeholder page for Admins.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Admin;
