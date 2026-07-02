import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import LogoImg from "../assets/Logoimg.png";
import { authService } from "../api/authApi";
import FormInput from "../components/ui/FormInput";
import Alert from "../components/ui/Alert";
import SpinnerIcon from "../components/ui/SpinnerIcon";

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    setIsEmailValid(validateEmail(email));
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEmailValid) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await authService.forgotPassword(email);
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-[calc(100vh-5rem)] px-8 py-12">
      <div className="w-full max-w-md">

        {}
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <img src={LogoImg} alt="SafeMother" className="h-16 w-auto" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-text-primary dark:text-dark-text">
            Forgot Password
          </h1>
          <p className="mt-2 text-sm text-text-secondary dark:text-text-muted">
            Enter your email and we&apos;ll send you a reset code
          </p>
        </div>

        <>
            {}
            <Alert type="error">{error}</Alert>

            {}
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormInput
                id="email"
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />

              <button
                type="submit"
                disabled={!isEmailValid || isSubmitting}
                className={`
                  w-full py-3 px-6 rounded-xl font-semibold shadow-md
                  flex items-center justify-center gap-2
                  transition-all duration-200
                  ${
                    isEmailValid && !isSubmitting
                      ? "bg-primary text-white hover:bg-primary/90 hover:scale-[1.02] cursor-pointer"
                      : "bg-bg-soft dark:bg-dark-surface text-text-muted cursor-not-allowed"
                  }
                `}
              >
                {isSubmitting ? (
                  <>
                    <SpinnerIcon />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            {}
            <p className="mt-8 text-sm text-center text-text-secondary dark:text-text-muted">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 font-semibold text-primary hover:text-primary/80 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </p>
          </>

      </div>
    </div>
  );
}
