import { useState } from "react";
import { userService } from "../../api/userApi";
import FormInput from "../ui/FormInput";
import PasswordStrengthBar from "../ui/PasswordStrengthBar";
import Alert from "../ui/Alert";
import SpinnerIcon from "../ui/SpinnerIcon";

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&#]/.test(password)) score++;
  if (score <= 2) return "Weak";
  if (score === 3) return "Medium";
  return "Strong";
}

export default function ChangePasswordForm({ userId }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const passwordStrength = newPassword ? getPasswordStrength(newPassword) : null;

  const isValid =
    currentPassword.length > 0 &&
    newPassword.length >= 6 &&
    confirmPassword === newPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await userService.changePassword(userId, currentPassword, newPassword);
      setSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Alert type="error">{error}</Alert>
      <Alert type="success">{success}</Alert>

      <FormInput
        id="currentPassword"
        label="Current Password"
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        placeholder="••••••••"
        required
        autoComplete="current-password"
      />

      <div>
        <FormInput
          id="newPassword"
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="new-password"
        />
        <PasswordStrengthBar strength={passwordStrength} />
      </div>

      <FormInput
        id="confirmPassword"
        label="Confirm New Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="••••••••"
        required
        autoComplete="new-password"
        error={
          confirmPassword && confirmPassword !== newPassword
            ? "Passwords do not match"
            : undefined
        }
      />

      <div className="pt-2">
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={`
            px-5 py-2.5 rounded-lg text-sm font-semibold
            flex items-center gap-2 transition-all
            ${
              isValid && !isSubmitting
                ? "bg-primary text-white hover:bg-primary/90 cursor-pointer"
                : "bg-bg-soft dark:bg-dark-surface text-text-muted cursor-not-allowed"
            }
          `}
        >
          {isSubmitting && <SpinnerIcon />}
          {isSubmitting ? "Changing..." : "Change Password"}
        </button>
      </div>
    </form>
  );
}
