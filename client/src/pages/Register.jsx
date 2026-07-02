import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../api/authApi";
import LogoImg from "../assets/Logoimg.png";
import ImageCarousel from "../components/ui/ImageCarousel";
import FormInput from "../components/ui/FormInput";
import PasswordStrengthBar from "../components/ui/PasswordStrengthBar";
import Alert from "../components/ui/Alert";
import SpinnerIcon from "../components/ui/SpinnerIcon";

const ROLES = ["MOTHER", "DOCTOR", "MIDWIFE"];

const FIELD_CLASS = `
  w-full px-4 py-2.5 rounded-lg text-sm
  bg-bg-main dark:bg-dark-bg
  text-text-primary dark:text-dark-text
  border border-border dark:border-dark-border
  placeholder:text-text-muted
  focus:outline-none focus:border-primary focus:ring-0
  transition-colors
`;

const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function getMaxDob() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split("T")[0];
}
const MAX_DOB = getMaxDob();

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

function FieldLabel({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-text-primary dark:text-dark-text mb-1.5"
    >
      {children}
    </label>
  );
}


export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    address: "",
    dateOfBirth: "",
    password: "",
    role: ROLES[0],
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    const { fullName, email, contactNumber, address, dateOfBirth, password, role } = form;
    setIsFormValid(
      !!(
        fullName.trim() &&
        validateEmail(email) &&
        contactNumber.trim() &&
        address.trim() &&
        dateOfBirth &&
        dateOfBirth <= MAX_DOB &&
        password.length >= 8 &&
        confirmPassword === password &&
        role
      )
    );
  }, [form, confirmPassword]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "dateOfBirth") {
      setFieldErrors((prev) => ({
        ...prev,
        dateOfBirth: value && value > MAX_DOB ? "You must be at least 18 years old" : "",
      }));
    }
  };

  const handleFullNameChange = (e) => {
    const filtered = e.target.value.replace(/[^a-zA-Z\s''-]/g, "");
    setForm((prev) => ({ ...prev, fullName: filtered }));
  };

  const handleEmailChange = (e) => {
    const sanitized = e.target.value.replace(/[^a-zA-Z0-9@._-]/g, "");
    setForm((prev) => ({ ...prev, email: sanitized }));
    setFieldErrors((prev) => ({
      ...prev,
      email: validateEmail(sanitized) ? "" : "Invalid email format",
    }));
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, password: val }));
    setPasswordStrength(val ? getPasswordStrength(val) : "");
    setFieldErrors((prev) => ({
      ...prev,
      password: val.length >= 8 || !val ? "" : "Minimum 8 characters",
      confirmPassword:
        confirmPassword && val !== confirmPassword ? "Passwords do not match" : "",
    }));
  };

  const handleConfirmPasswordChange = (e) => {
    const val = e.target.value;
    setConfirmPassword(val);
    setFieldErrors((prev) => ({
      ...prev,
      confirmPassword: val && form.password !== val ? "Passwords do not match" : "",
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setServerError(null);
    setIsSubmitting(true);

    try {
      await authService.register(form);
      navigate("/login", {
        replace: true,
        state: { successMessage: "Account created! Please sign in." },
      });
    } catch (err) {
      const message =
        err.response?.data?.message || "Registration failed. Please try again.";
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="w-full flex">
      {}
      <div className="hidden lg:block lg:w-1/2 sticky top-0 h-screen shrink-0">
        <ImageCarousel />
      </div>

      {}
      <div className="flex items-start justify-center w-full lg:w-1/2 px-8 py-12">
        <div className="w-full max-w-lg">

          {}
          <div className="text-center mb-8">
            <div className="flex justify-center">
              <img src={LogoImg} alt="SafeMother" className="h-16 w-auto" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-text-primary dark:text-dark-text">
              Create Your Account
            </h1>
            <p className="mt-2 text-sm text-text-secondary dark:text-text-muted">
              Join SafeMother to get started
            </p>
          </div>

          {}
          <Alert type="error">{serverError}</Alert>

          <form onSubmit={handleSubmit} className="space-y-4">

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                id="fullName"
                label="Full Name"
                type="text"
                value={form.fullName}
                onChange={handleFullNameChange}
                placeholder="Jane Doe"
                required
                autoComplete="name"
              />
              <FormInput
                id="contactNumber"
                label="Contact Number"
                type="tel"
                value={form.contactNumber}
                onChange={handleChange}
                placeholder="0771234567"
                required
                autoComplete="tel"
              />
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                id="email"
                label="Email Address"
                type="email"
                value={form.email}
                onChange={handleEmailChange}
                placeholder="you@example.com"
                required
                autoComplete="email"
                error={fieldErrors.email}
              />
              <FormInput
                id="dateOfBirth"
                label="Date of Birth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
                required
                max={MAX_DOB}
                error={fieldErrors.dateOfBirth}
              />
            </div>

            {}
            <div>
              <FieldLabel htmlFor="address">Address</FieldLabel>
              <textarea
                id="address"
                name="address"
                required
                rows={2}
                value={form.address}
                onChange={handleChange}
                placeholder="123 Main St, City, Country"
                className={`${FIELD_CLASS} resize-none`}
              />
            </div>

            {}
            <div>
              <FieldLabel htmlFor="role">Register as</FieldLabel>
              <select
                id="role"
                name="role"
                required
                value={form.role}
                onChange={handleChange}
                className={FIELD_CLASS}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0) + r.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormInput
                  id="password"
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={handlePasswordChange}
                  placeholder="Min. 8 characters"
                  required
                  autoComplete="new-password"
                  error={fieldErrors.password}
                />
                {form.password && <PasswordStrengthBar strength={passwordStrength} />}
              </div>
              <div>
                <FormInput
                  id="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder="Retype your password"
                  required
                  autoComplete="new-password"
                  error={fieldErrors.confirmPassword}
                />
              </div>
            </div>

            {}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`
                w-full py-3 px-6 rounded-xl font-semibold shadow-md mt-2
                flex items-center justify-center gap-2
                transition-all duration-200
                ${
                  isFormValid && !isSubmitting
                    ? "bg-primary text-white hover:bg-primary/90 hover:scale-[1.02] cursor-pointer"
                    : "bg-bg-soft dark:bg-dark-surface text-text-muted cursor-not-allowed"
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <SpinnerIcon />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {}
          <p className="mt-8 text-sm text-center text-text-secondary dark:text-text-muted">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary hover:text-primary/80 transition"
            >
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
