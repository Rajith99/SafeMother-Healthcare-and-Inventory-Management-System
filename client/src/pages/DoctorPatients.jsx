import DashboardLayout from "../components/layout/DashboardLayout";
import { DOCTOR_NAV } from "../config/navConfig";
import PregnancyRolePanel from "../components/pregnancy/PregnancyRolePanel";

export default function DoctorPatients() {
  return (
    <DashboardLayout navItems={DOCTOR_NAV}>
      <div className="w-full mx-auto max-w-6xl">
        <PregnancyRolePanel
          title="My Patients"
          description="Review all pregnancies assigned to you and manage care assignments."
          allowAssignMidwife
        />
      </div>
    </DashboardLayout>
  );
}
