import { AlertCircle, CheckCircle, Info } from "lucide-react";

const VARIANTS = {
  error: {
    container: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30",
    Icon: AlertCircle,
  },
  success: {
    container: "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30",
    Icon: CheckCircle,
  },
  info: {
    container: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
    Icon: Info,
  },
};

export default function Alert({ type = "error", children }) {
  if (!children) return null;

  const { container, Icon } = VARIANTS[type] ?? VARIANTS.error;

  return (
    <div
      className={`mb-6 flex items-start gap-2 px-4 py-3 rounded-lg text-sm border ${container}`}
    >
      <Icon className="h-4 w-4 shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}
