import { useState, useMemo } from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/useAuth";
import { useUnreadBadge } from "../../hooks/useUnreadBadge";

export default function DashboardLayout({ navItems = [], children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "true"
  );
  const { userId } = useAuth();

  const handleToggleCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebarCollapsed", String(next));
      return next;
    });
  };
  const hasAnyUnread = useUnreadBadge(userId);

  
  const badgedNavItems = useMemo(
    () =>
      navItems.map((item) =>
        item.label === "Messages" ? { ...item, badge: hasAnyUnread } : item
      ),
    [navItems, hasAnyUnread]
  );

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        navItems={badgedNavItems}
        isOpen={sidebarOpen}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {}
      <main
        className="flex-1 overflow-y-auto bg-bg-main dark:bg-dark-bg"
        id="main-content"
      >
        {}
        <div className="sticky top-0 z-20 flex items-center h-14 px-4 border-b border-border dark:border-dark-border bg-bg-main dark:bg-dark-bg md:hidden">
          <button
            className="
              flex items-center justify-center w-9 h-9 rounded-lg
              border border-border dark:border-dark-border
              bg-bg-card dark:bg-dark-surface
              text-text-primary dark:text-dark-text
              transition-colors hover:bg-primary-soft hover:text-primary
            "
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={sidebarOpen}
            aria-controls="dashboard-sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
