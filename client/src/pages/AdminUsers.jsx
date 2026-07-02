import { useState, useEffect, useCallback, useRef } from "react";
import { Users, RefreshCw, Search } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import UserTable from "../components/user/UserTable";
import PendingValidationList from "../components/user/PendingValidationList";
import Pagination from "../components/ui/Pagination";
import { userService } from "../api/userApi";
import Alert from "../components/ui/Alert";
import { ADMIN_NAV } from "../config/navConfig";

const ROLE_OPTIONS = ["ALL", "MOTHER", "DOCTOR", "MIDWIFE", "ADMIN"];

const STATUS_OPTIONS = [
  { value: "",      label: "All Status" },
  { value: "true",  label: "Active" },
  { value: "false", label: "Inactive" },
];

const PAGE_LIMIT = 10;

const SELECT_CLASS = `
  text-sm rounded-lg border border-border dark:border-dark-border
  bg-bg-main dark:bg-dark-bg text-text-primary dark:text-dark-text
  px-3 py-2 focus:outline-none focus:border-primary transition-colors
`;

const INPUT_CLASS = `
  w-full pl-8 pr-3 py-2 text-sm rounded-lg
  border border-border dark:border-dark-border
  bg-bg-main dark:bg-dark-bg text-text-primary dark:text-dark-text
  placeholder:text-text-muted
  focus:outline-none focus:border-primary transition-colors
`;

function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function AdminUsers() {
  
  const [users, setUsers] = useState([]);
  const [usersPagination, setUsersPagination] = useState({ total: 0, totalPages: 1 });
  const [usersPage, setUsersPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("");
  const [usersSearch, setUsersSearch] = useState("");
  const debouncedUsersSearch = useDebounce(usersSearch);
  const [loadingUsers, setLoadingUsers] = useState(true);

  
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingPagination, setPendingPagination] = useState({ total: 0, totalPages: 1 });
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingRoleFilter, setPendingRoleFilter] = useState("");
  const [pendingSearch, setPendingSearch] = useState("");
  const debouncedPendingSearch = useDebounce(pendingSearch);
  const [loadingPending, setLoadingPending] = useState(true);

  
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activatingId, setActivatingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setError(null);
    try {
      const params = { page: usersPage, limit: PAGE_LIMIT, search: debouncedUsersSearch };
      if (roleFilter !== "ALL") params.role = roleFilter;
      if (statusFilter !== "") params.isActive = statusFilter;

      const res = await userService.getAllUsers(params);
      setUsers(res.data.data);
      setUsersPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoadingUsers(false);
    }
  }, [usersPage, roleFilter, statusFilter, debouncedUsersSearch]);

  
  const fetchPending = useCallback(async () => {
    setLoadingPending(true);
    try {
      const params = { page: pendingPage, limit: PAGE_LIMIT, search: debouncedPendingSearch };
      if (pendingRoleFilter) params.role = pendingRoleFilter;

      const res = await userService.getPendingValidation(params);
      setPendingUsers(res.data.data);
      setPendingPagination(res.data.pagination);
    } catch {
      
    } finally {
      setLoadingPending(false);
    }
  }, [pendingPage, pendingRoleFilter, debouncedPendingSearch]);

  
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) return;
    setUsersPage(1);
  }, [roleFilter, statusFilter, debouncedUsersSearch]);

  useEffect(() => {
    if (isFirstRender.current) return;
    setPendingPage(1);
  }, [pendingRoleFilter, debouncedPendingSearch]);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchPending(); }, [fetchPending]);

  
  const handleActivate = async (userId) => {
    setActivatingId(userId);
    setError(null);
    setSuccessMessage(null);

    try {
      await userService.activateUser(userId);
      setPendingUsers((prev) => prev.filter((u) => u._id !== userId));
      setPendingPagination((prev) => ({ ...prev, total: prev.total - 1 }));
  
      fetchUsers();
      setSuccessMessage("User activated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to activate user.");
    } finally {
      setActivatingId(null);
    }
  };

  const handleToggleStatus = async (userId, currentlyActive) => {
    setTogglingId(userId);
    setError(null);
    setSuccessMessage(null);

    try {
      if (currentlyActive) {
        await userService.deactivateUser(userId);
    
        if (statusFilter === "true") {
          setUsers((prev) => prev.filter((u) => u._id !== userId));
        } else {
          setUsers((prev) =>
            prev.map((u) => (u._id === userId ? { ...u, isActive: false } : u))
          );
        }
        setSuccessMessage("User deactivated successfully.");
      } else {
        await userService.activateUser(userId);
       
        if (statusFilter === "false") {
          setUsers((prev) => prev.filter((u) => u._id !== userId));
        } else {
          setUsers((prev) =>
            prev.map((u) => (u._id === userId ? { ...u, isActive: true } : u))
          );
        }
        setSuccessMessage("User activated successfully.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user status.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (userId) => {
    setDeletingId(userId);
    setError(null);
    setSuccessMessage(null);

    try {
      await userService.adminDeleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setPendingUsers((prev) => prev.filter((u) => u._id !== userId));
      setSuccessMessage("User deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRefresh = () => {
    fetchUsers();
    fetchPending();
    setSuccessMessage(null);
  };

  return (
    <DashboardLayout navItems={ADMIN_NAV}>
      <div className="w-full mx-auto max-w-5xl">
        {}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text">
              User Management
            </h1>
            <p className="mt-1 text-sm text-text-secondary dark:text-text-muted">
              View, filter, and manage all registered users.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            className="
              flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
              border border-border dark:border-dark-border
              text-text-secondary dark:text-dark-text
              hover:bg-primary/8 hover:text-primary transition-colors
              self-start sm:self-auto
            "
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </header>

        {error && <Alert type="error">{error}</Alert>}
        {successMessage && <Alert type="success">{successMessage}</Alert>}

        {}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base font-semibold text-text-primary dark:text-dark-text">
              Pending Validation
            </h2>
            {pendingPagination.total > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                {pendingPagination.total}
              </span>
            )}
          </div>

          <PendingValidationList
            users={pendingUsers}
            loading={loadingPending}
            onActivate={handleActivate}
            activatingId={activatingId}
            search={pendingSearch}
            onSearchChange={setPendingSearch}
            roleFilter={pendingRoleFilter}
            onRoleFilterChange={setPendingRoleFilter}
            page={pendingPage}
            totalPages={pendingPagination.totalPages}
            total={pendingPagination.total}
            onPageChange={setPendingPage}
          />
        </section>

        <div className="h-px bg-border dark:bg-dark-border mb-8" />

        {}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-text-muted" />
              <h2 className="text-base font-semibold text-text-primary dark:text-dark-text">
                All Users
              </h2>
              {usersPagination.total > 0 && (
                <span className="text-sm text-text-muted">
                  ({usersPagination.total})
                </span>
              )}
            </div>

            {}
            <div className="flex flex-wrap items-center gap-2">
              {}
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                />
                <input
                  type="text"
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  placeholder="Search…"
                  className={`${INPUT_CLASS} w-44`}
                  aria-label="Search users"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={SELECT_CLASS}
                aria-label="Filter by role"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r === "ALL" ? "All Roles" : r}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={SELECT_CLASS}
                aria-label="Filter by status"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <UserTable
            users={users}
            loading={loadingUsers}
            onToggleStatus={handleToggleStatus}
            togglingId={togglingId}
            onDelete={handleDelete}
            deletingId={deletingId}
          />

          <Pagination
            page={usersPage}
            totalPages={usersPagination.totalPages}
            onPageChange={setUsersPage}
          />
        </section>
      </div>
    </DashboardLayout>
  );
}
