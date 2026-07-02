import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

export default function Sidebar({ navItems = [], isOpen, onClose, collapsed = false, onToggleCollapse }) {
  const { userFullName, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const initials = userFullName
    ? userFullName
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  const displayRole = userRole
    ? userRole.charAt(0) + userRole.slice(1).toLowerCase()
    : "";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {}
      <div
        className={`
          fixed inset-0 z-19 bg-black/40
          transition-opacity duration-300
          hidden max-md:block
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        aria-hidden="true"
        onClick={onClose}
      />

      {}
      <aside
        id="dashboard-sidebar"
        aria-label="Dashboard navigation"
        className={`
          w-60 shrink-0 z-40
          flex flex-col h-screen
          bg-bg-card dark:bg-dark-surface
          border-r border-border dark:border-dark-border
          overflow-hidden
          transition-all duration-300 ease-in-out
          ${collapsed ? "md:w-16" : "md:w-60"}
          max-md:fixed max-md:inset-y-0 max-md:left-0
          max-md:shadow-[4px_0_24px_rgba(201,74,106,0.12)]
          ${isOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"}
        `}
      >
        {}
        <div
          className={`
            flex items-center h-16 px-4 shrink-0
            border-b border-border dark:border-dark-border
            ${collapsed ? "md:justify-center md:px-2" : ""}
          `}
        >
          {}
          <span
            className={`flex-1 text-3xl leading-none text-primary whitespace-nowrap ${collapsed ? "md:hidden" : ""}`}
            style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700 }}
          >
            Safe Mother
          </span>

          {}
          <button
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="
              hidden md:flex items-center justify-center
              w-8 h-8 rounded-lg shrink-0
              border border-border dark:border-dark-border
              bg-transparent text-text-secondary dark:text-dark-text
              transition-colors hover:bg-primary/8 hover:text-primary
              dark:hover:bg-primary-soft/10 dark:hover:text-primary-soft
            "
          >
            {collapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            )}
          </button>

          {}
          <button
            className="
              flex items-center justify-center w-8 h-8 rounded-lg
              border border-border dark:border-dark-border
              bg-transparent text-text-secondary dark:text-dark-text
              transition-colors hover:bg-primary-soft hover:text-primary
              md:hidden
            "
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {}
        <div
          className={`
            flex items-center px-4 py-4 shrink-0
            border-b border-border dark:border-dark-border
            ${collapsed ? "md:justify-center md:px-2 gap-0" : "gap-3"}
          `}
        >
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0 select-none"
            title={collapsed ? `${userFullName ?? ""} · ${displayRole}` : undefined}
          >
            {initials}
          </div>
          <div className={`flex flex-col min-w-0 ${collapsed ? "md:hidden" : ""}`}>
            <span className="text-sm font-semibold text-text-primary dark:text-dark-text truncate leading-tight">
              {userFullName ?? "—"}
            </span>
            <span className="text-xs text-text-muted mt-0.5 leading-tight">
              {displayRole}
            </span>
          </div>
        </div>

        {}
        <nav className="flex-1 overflow-y-auto py-3 px-3" aria-label="Sidebar navigation">
          <ul className="list-none m-0 p-0 flex flex-col gap-1" role="list">
            {navItems.map(({ label, path, icon, badge }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  end
                  onClick={onClose}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    [
                      "flex items-center py-2.5 rounded-[10px]",
                      "text-sm font-medium no-underline transition-colors whitespace-nowrap",
                      collapsed
                        ? "gap-2.5 px-3.5 md:justify-center md:px-0 md:gap-0"
                        : "gap-2.5 px-3.5",
                      isActive
                        ? "bg-primary text-white font-semibold hover:opacity-90"
                        : "text-text-secondary dark:text-dark-text hover:bg-primary/8 hover:text-primary dark:hover:bg-primary-soft/10 dark:hover:text-primary-soft",
                    ].join(" ")
                  }
                >
                  {}
                  <span className="relative flex items-center justify-center shrink-0 w-4.5 h-4.5" aria-hidden="true">
                    {icon}
                    {badge && (
                      <span
                        className={`absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary ${collapsed ? "hidden md:block" : "hidden"}`}
                        aria-hidden="true"
                      />
                    )}
                  </span>
                  {}
                  <span className={`flex-1 truncate ${collapsed ? "md:hidden" : ""}`}>
                    {label}
                  </span>
                  {}
                  {badge && (
                    <span
                      className={`w-2 h-2 rounded-full bg-primary shrink-0 ${collapsed ? "md:hidden" : ""}`}
                      aria-label="Unread messages"
                    />
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {}
        <div
          className={`py-4 border-t border-border dark:border-dark-border shrink-0 ${collapsed ? "md:px-2 px-3" : "px-3"}`}
        >
          <button
            onClick={handleLogout}
            title={collapsed ? "Log Out" : undefined}
            className={`
              group w-full flex items-center py-2.5 rounded-[10px]
              text-sm font-medium transition-colors whitespace-nowrap
              text-text-secondary dark:text-dark-text
              hover:bg-primary/8 hover:text-primary
              dark:hover:bg-primary-soft/10 dark:hover:text-primary-soft cursor-pointer
              ${collapsed ? "gap-2.5 px-3.5 md:justify-center md:px-0 md:gap-0" : "gap-2.5 px-3.5"}
            `}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4.5 w-4.5 shrink-0 transition-transform group-hover:-translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className={`${collapsed ? "md:hidden" : ""}`}>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
