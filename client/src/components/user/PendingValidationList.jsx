import { Search } from "lucide-react";
import { CheckCircle } from "lucide-react";
import Loader from "../ui/Loader";
import SpinnerIcon from "../ui/SpinnerIcon";
import Pagination from "../ui/Pagination";

const ROLE_OPTIONS = [
  { value: "", label: "All" },
  { value: "DOCTOR", label: "Doctors" },
  { value: "MIDWIFE", label: "Midwives" },
];

const INPUT_CLASS = `
  w-full pl-8 pr-3 py-2 text-sm rounded-lg
  border border-border dark:border-dark-border
  bg-bg-main dark:bg-dark-bg text-text-primary dark:text-dark-text
  placeholder:text-text-muted
  focus:outline-none focus:border-primary transition-colors
`;

export default function PendingValidationList({
  users = [],
  loading = false,
  onActivate,
  activatingId,
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  page,
  totalPages,
  total,
  onPageChange,
}) {
  return (
    <div>
      {}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        {}
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or email…"
            className={INPUT_CLASS}
            aria-label="Search pending users"
          />
        </div>

        {}
        <div className="flex rounded-lg border border-border dark:border-dark-border overflow-hidden shrink-0">
          {ROLE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onRoleFilterChange(value)}
              className={`
                px-3 py-2 text-xs font-medium transition-colors
                ${
                  roleFilter === value
                    ? "bg-primary text-white"
                    : "bg-bg-main dark:bg-dark-bg text-text-secondary dark:text-dark-text hover:bg-primary/8 hover:text-primary"
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {}
      {loading ? (
        <div className="py-8">
          <Loader />
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-6 text-center">
          <p className="text-sm text-text-muted">No pending validations.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((user) => {
            const isActivating = activatingId === user._id;

            return (
              <div
                key={user._id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface px-5 py-4"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-text-primary dark:text-dark-text truncate">
                    {user.fullName}
                  </span>
                  <span className="text-xs text-text-muted truncate">
                    {user.email}
                  </span>
                  <span className="mt-1 text-xs font-medium text-text-secondary dark:text-text-muted">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={() => onActivate(user._id)}
                  disabled={isActivating}
                  className="
                    flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg
                    bg-accent text-white hover:bg-accent/90 transition-colors
                    disabled:opacity-60 disabled:cursor-not-allowed shrink-0
                  "
                >
                  {isActivating ? <SpinnerIcon /> : <CheckCircle size={14} />}
                  {isActivating ? "Activating..." : "Activate"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {}
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />

      {!loading && total > 0 && (
        <p className="mt-2 text-xs text-text-muted">{total} total pending</p>
      )}
    </div>
  );
}
