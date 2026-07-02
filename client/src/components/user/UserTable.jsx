import { useState } from "react";
import { UserX, UserCheck, Trash2 } from "lucide-react";
import Loader from "../ui/Loader";
import SpinnerIcon from "../ui/SpinnerIcon";

const ROLE_COLORS = {
  ADMIN:   "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  DOCTOR:  "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  MIDWIFE: "bg-primary/10 text-primary dark:bg-primary/5 dark:text-primary-soft",
  MOTHER:  "bg-bg-soft text-accent dark:bg-accent/10 dark:text-accent",
};

const STATUS_COLORS = {
  true:  "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  false: "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

const COLUMNS = ["Name", "Email", "Role", "Status", "Action"];

export default function UserTable({
  users = [],
  loading = false,
  onToggleStatus,
  togglingId,
  onDelete,
  deletingId,
}) {
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  if (loading) {
    return (
      <div className="py-12">
        <Loader />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface p-8 text-center">
        <p className="text-sm text-text-muted">No users found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border dark:border-dark-border">
      <table className="min-w-full divide-y divide-border dark:divide-dark-border text-sm">
        <thead className="bg-bg-card dark:bg-dark-surface">
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-bg-main dark:bg-dark-bg divide-y divide-border dark:divide-dark-border">
          {users.map((user) => {
            const isToggling = togglingId === user._id;

            return (
              <tr
                key={user._id}
                className="hover:bg-bg-card dark:hover:bg-dark-surface transition-colors"
              >
                <td className="px-4 py-3 font-medium text-text-primary dark:text-dark-text whitespace-nowrap">
                  {user.fullName}
                </td>
                <td className="px-4 py-3 text-text-secondary dark:text-text-muted whitespace-nowrap">
                  {user.email}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      ROLE_COLORS[user.role] ?? ""
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      STATUS_COLORS[String(user.isActive)] ?? ""
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {onToggleStatus && ["DOCTOR", "MIDWIFE"].includes(user.role) && (
                      <button
                        onClick={() => onToggleStatus(user._id, user.isActive)}
                        disabled={isToggling}
                        title={user.isActive ? "Deactivate user" : "Activate user"}
                        className={`
                          flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg
                          transition-colors disabled:opacity-60 disabled:cursor-not-allowed
                          ${
                            user.isActive
                              ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                              : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20"
                          }
                        `}
                      >
                        {isToggling ? (
                          <SpinnerIcon />
                        ) : user.isActive ? (
                          <UserX size={13} />
                        ) : (
                          <UserCheck size={13} />
                        )}
                        {isToggling
                          ? "..."
                          : user.isActive
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                    )}

                    {onDelete && user.role !== "ADMIN" && (
                      pendingDeleteId === user._id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setPendingDeleteId(null);
                              onDelete(user._id);
                            }}
                            disabled={deletingId === user._id}
                            className="
                              flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg
                              bg-red-500 text-white hover:bg-red-600 transition-colors
                              disabled:opacity-60 disabled:cursor-not-allowed
                            "
                          >
                            {deletingId === user._id ? <SpinnerIcon /> : null}
                            Confirm
                          </button>
                          <button
                            onClick={() => setPendingDeleteId(null)}
                            className="
                              px-2.5 py-1.5 text-xs font-semibold rounded-lg
                              bg-bg-soft dark:bg-dark-surface text-text-muted
                              hover:text-text-secondary transition-colors
                            "
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setPendingDeleteId(user._id)}
                          title="Delete user"
                          className="
                            flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg
                            bg-bg-soft dark:bg-dark-surface text-text-muted
                            hover:bg-red-100 hover:text-red-600
                            dark:hover:bg-red-500/10 dark:hover:text-red-400
                            transition-colors
                          "
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
