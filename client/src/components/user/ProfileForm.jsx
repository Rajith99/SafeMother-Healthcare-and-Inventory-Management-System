import { useState, useEffect } from "react";
import { userService } from "../../api/userApi";
import FormInput from "../ui/FormInput";
import Alert from "../ui/Alert";
import SpinnerIcon from "../ui/SpinnerIcon";

export default function ProfileForm({ userId, initialData, onSave }) {
  const [form, setForm] = useState({
    fullName: "",
    contactNumber: "",
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        fullName: initialData.fullName ?? "",
        contactNumber: initialData.contactNumber ?? "",
        address: initialData.address ?? "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFullNameChange = (e) => {
    const filtered = e.target.value.replace(/[^a-zA-Z\s''-]/g, "");
    setForm((prev) => ({ ...prev, fullName: filtered }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await userService.updateUser(userId, form);
      setSuccess("Profile updated successfully.");
      onSave?.(form);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isChanged =
    initialData &&
    (form.fullName !== (initialData.fullName ?? "") ||
      form.contactNumber !== (initialData.contactNumber ?? "") ||
      form.address !== (initialData.address ?? ""));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Alert type="error">{error}</Alert>
      <Alert type="success">{success}</Alert>

      <FormInput
        id="fullName"
        label="Full Name"
        value={form.fullName}
        onChange={handleFullNameChange}
        placeholder="Your full name"
        required
        autoComplete="name"
      />

      <FormInput
        id="contactNumber"
        label="Contact Number"
        value={form.contactNumber}
        onChange={handleChange}
        placeholder="0771234567"
        required
        autoComplete="tel"
      />

      <FormInput
        id="address"
        label="Address"
        value={form.address}
        onChange={handleChange}
        placeholder="Your address"
        required
        autoComplete="street-address"
      />

      <div className="pt-2">
        <button
          type="submit"
          disabled={!isChanged || isSubmitting}
          className={`
            px-5 py-2.5 rounded-lg text-sm font-semibold
            flex items-center gap-2 transition-all
            ${
              isChanged && !isSubmitting
                ? "bg-primary text-white hover:bg-primary/90 cursor-pointer"
                : "bg-bg-soft dark:bg-dark-surface text-text-muted cursor-not-allowed"
            }
          `}
        >
          {isSubmitting && <SpinnerIcon />}
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
