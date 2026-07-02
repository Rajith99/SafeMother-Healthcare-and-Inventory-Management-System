import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isConfirming = false,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !isConfirming) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, isConfirming, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[1px] animate-fade-in"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isConfirming) {
          onCancel();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-message"
    >
      <div className="w-full max-w-md rounded-2xl border border-border dark:border-dark-border bg-bg-card dark:bg-dark-surface shadow-xl p-6 animate-scale-in">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h2
                id="confirm-modal-title"
                className="text-base font-semibold text-text-primary dark:text-dark-text"
              >
                {title}
              </h2>
              <p
                id="confirm-modal-message"
                className="mt-1 text-sm text-text-secondary dark:text-text-muted"
              >
                {message}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isConfirming}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border dark:border-dark-border text-text-muted hover:text-text-primary dark:hover:text-dark-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close confirmation dialog"
          >
            <X size={15} />
          </button>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isConfirming}
            className="px-4 py-2 rounded-lg border border-border dark:border-dark-border text-sm font-medium text-text-secondary dark:text-dark-text hover:bg-bg-main dark:hover:bg-dark-bg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-red-200 dark:border-red-500/40 bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isConfirming ? "Cancelling..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
