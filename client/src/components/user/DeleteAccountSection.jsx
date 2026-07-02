import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, X } from "lucide-react";
import { userService } from "../../api/userApi";
import { useAuth } from "../../context/useAuth";
import FormInput from "../ui/FormInput";
import Alert from "../ui/Alert";
import SpinnerIcon from "../ui/SpinnerIcon";

const CONFIRM_KEYWORD = "DELETE";

function DeleteConfirmModal({ onClose, onConfirm, isSubmitting, error }) {
  const [confirmText, setConfirmText] = useState("");
  const isConfirmed = confirmText === CONFIRM_KEYWORD;

  
  useEffect(() => {
    document.getElementById("confirmDeleteInput")?.focus();
  }, []);

  
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, isSubmitting]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isConfirmed) return;
    onConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) onClose(); }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        className="relative w-full max-w-md bg-bg-main dark:bg-dark-surface rounded-xl shadow-xl border border-border dark:border-dark-border p-6 space-y-5"
      >
        {}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary dark:hover:text-dark-text transition-colors disabled:opacity-40 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {}
        <div className="flex items-start gap-3 pr-6">
          <div className="shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-red-100 dark:bg-red-500/15">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h2
              id="delete-dialog-title"
              className="text-base font-semibold text-text-primary dark:text-dark-text"
            >
              Delete account
            </h2>
            <p className="mt-1 text-sm text-text-secondary dark:text-text-muted">
              This action is{" "}
              <span className="font-medium text-red-500">
                permanent and cannot be undone
              </span>
              . All your data will be removed.
            </p>
          </div>
        </div>

        <div className="h-px bg-border dark:bg-dark-border" />

        {}
        <Alert type="error">{error}</Alert>

        {}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            id="confirmDeleteInput"
            label={
              <>
                Type{" "}
                <span className="font-semibold text-red-500">
                  {CONFIRM_KEYWORD}
                </span>{" "}
                to confirm
              </>
            }
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={CONFIRM_KEYWORD}
            autoComplete="off"
          />

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary dark:text-text-muted hover:bg-bg-soft dark:hover:bg-dark-bg transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isConfirmed || isSubmitting}
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold
                flex items-center gap-2 transition-all
                ${
                  isConfirmed && !isSubmitting
                    ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                    : "bg-bg-soft dark:bg-dark-bg text-text-muted cursor-not-allowed opacity-60"
                }
              `}
            >
              {isSubmitting && <SpinnerIcon />}
              {isSubmitting ? "Deleting…" : "Delete account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DeleteAccountSection({ userId }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleDelete = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await userService.deleteUser(userId);
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete account.");
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setModalOpen(false);
    setError(null);
  };

  return (
    <>
      <p className="text-sm text-text-secondary dark:text-text-muted mb-4">
        Permanently remove your account and all associated data. This action
        cannot be undone.
      </p>

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"
      >
        Delete My Account
      </button>

      {modalOpen && (
        <DeleteConfirmModal
          onClose={handleClose}
          onConfirm={handleDelete}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}
    </>
  );
}
