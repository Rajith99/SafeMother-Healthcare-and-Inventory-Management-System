import { useState, useEffect } from "react";
import { User, Lock, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/useAuth";
import DashboardLayout from "../components/layout/DashboardLayout";
import ProfileForm from "../components/user/ProfileForm";
import ChangePasswordForm from "../components/user/ChangePasswordForm";
import DeleteAccountSection from "../components/user/DeleteAccountSection";
import { userService } from "../api/userApi";
import Alert from "../components/ui/Alert";
import Loader from "../components/ui/Loader";
import { ADMIN_NAV, MOTHER_NAV, DOCTOR_NAV, MIDWIFE_NAV } from "../config/navConfig";

const NAV_BY_ROLE = {
  ADMIN:   ADMIN_NAV,
  MOTHER:  MOTHER_NAV,
  DOCTOR:  DOCTOR_NAV,
  MIDWIFE: MIDWIFE_NAV,
};

const SECTIONS = [
  { id: "profile",  label: "Profile",     icon: User },
  { id: "security", label: "Security",    icon: Lock },
  { id: "danger",   label: "Danger Zone", icon: AlertTriangle },
];

export default function ProfileSettings() {
  const { userId, userRole } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [activeSection, setActiveSection] = useState("profile");

  const navItems = NAV_BY_ROLE[userRole] ?? [];

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    userService
      .getUserById(userId)
      .then((res) => setUserData(res.data.data))
      .catch((err) =>
        setFetchError(err.response?.data?.message || "Failed to load profile.")
      )
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <DashboardLayout navItems={navItems}>
      <div className="w-full mx-auto max-w-2xl">
        {}
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text">
            Settings
          </h1>
          <p className="mt-1 text-sm text-text-secondary dark:text-text-muted">
            Manage your account information and security.
          </p>
          <div className="mt-4 h-px bg-border dark:bg-dark-border" />
        </header>

        {fetchError && <Alert type="error">{fetchError}</Alert>}

        {}
        <div className="flex gap-1 mb-6 bg-bg-card dark:bg-dark-surface rounded-lg p-1 border border-border dark:border-dark-border">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`
                flex items-center gap-2 flex-1 justify-center py-2 px-3 rounded-md
                text-sm font-medium transition-colors
                ${
                  activeSection === id
                    ? "bg-bg-main dark:bg-dark-bg text-text-primary dark:text-dark-text shadow-sm"
                    : "text-text-muted hover:text-text-secondary"
                }
              `}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {}
        <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-6">
          {}
          {activeSection === "profile" && (
            <>
              <h2 className="text-base font-semibold text-text-primary dark:text-dark-text mb-1">
                Profile Information
              </h2>
              <p className="text-sm text-text-muted mb-5">
                Update your name, contact number, and address.
              </p>

              {loading ? (
                <div className="py-8">
                  <Loader />
                </div>
              ) : (
                <>
                  {}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-text-primary dark:text-dark-text mb-1.5">
                      Email Address
                    </label>
                    <div className="w-full px-4 py-2.5 rounded-lg text-sm bg-bg-soft dark:bg-dark-surface text-text-muted border border-border dark:border-dark-border select-none">
                      {userData?.email ?? "—"}
                    </div>
                    <p className="mt-1 text-xs text-text-muted">
                      Email cannot be changed.
                    </p>
                  </div>

                  <ProfileForm
                    userId={userId}
                    initialData={userData}
                    onSave={(saved) =>
                      setUserData((prev) => ({ ...prev, ...saved }))
                    }
                  />
                </>
              )}
            </>
          )}

          {}
          {activeSection === "security" && (
            <>
              <h2 className="text-base font-semibold text-text-primary dark:text-dark-text mb-1">
                Change Password
              </h2>
              <p className="text-sm text-text-muted mb-5">
                Ensure your account uses a strong, unique password.
              </p>
              <ChangePasswordForm userId={userId} />
            </>
          )}

          {}
          {activeSection === "danger" && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={16} className="text-red-500" />
                <h2 className="text-base font-semibold text-red-500">
                  Danger Zone
                </h2>
              </div>
              <p className="text-sm text-text-muted mb-5">
                Permanently delete your account and all associated data.
              </p>
              <div className="rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/5 p-5">
                <DeleteAccountSection userId={userId} />
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
