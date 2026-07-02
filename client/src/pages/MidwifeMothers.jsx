import DashboardLayout from "../components/layout/DashboardLayout";
import { MIDWIFE_NAV } from "../config/navConfig";
import PregnancyRolePanel from "../components/pregnancy/PregnancyRolePanel";

export default function MidwifeMothers() {
  return (
    <DashboardLayout navItems={MIDWIFE_NAV}>
      <div className="w-full mx-auto max-w-6xl">
        <PregnancyRolePanel
          title="My Mothers"
          description="Track all pregnancies where you are assigned as the care midwife."
        />
      </div>
    </DashboardLayout>
  );
}
