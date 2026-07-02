import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import LogoImg from "../assets/Logoimg.png";
import ImageCarousel from "../components/ui/ImageCarousel";
import FormInput from "../components/ui/FormInput";
import Alert from "../components/ui/Alert";
import SpinnerIcon from "../components/ui/SpinnerIcon";

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const successMessage = location.state?.successMessage;

  useEffect(() => {
    setIsFormValid(validateEmail(email) && password.length >= 6);
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const { role } = await login(email, password);

      switch (role) {
        case "ADMIN":
          navigate("/admin", { replace: true });
          break;
        case "DOCTOR":
          navigate("/doctor", { replace: true });
          break;
        case "MIDWIFE":
          navigate("/midwife", { replace: true });
          break;
        case "MOTHER":
          navigate("/dashboard", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex min-h-[calc(100vh-5rem)]">
      {}
      <div className="hidden lg:block lg:w-1/2">
        <ImageCarousel />
      </div>

      {}
      <div className="flex items-center justify-center w-full lg:w-1/2 px-8 py-12">
        <div className="w-full max-w-md">

          {}
          <div className="text-center mb-8">
            <div className="flex justify-center">
              <img src={LogoImg} alt="SafeMother" className="h-16 w-auto" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-text-primary dark:text-dark-text">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-text-secondary dark:text-text-muted">
              Sign in to access your account
            </p>
          </div>

          {}
          <Alert type="success">{successMessage}</Alert>

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

            <FormInput
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              rightElement={
                <Link
                  to="/forgot-password"
                  className="text-sm text-accent hover:opacity-70 transition"
                >
                  Forgot password?
                </Link>
              }
            />

            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`
                w-full py-3 px-6 rounded-xl font-semibold shadow-md
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
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {}
          <p className="mt-8 text-sm text-center text-text-secondary dark:text-text-muted">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-primary hover:text-primary/80 transition"
            >
              Register
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;
