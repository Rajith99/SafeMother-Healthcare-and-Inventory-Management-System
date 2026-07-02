import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const ROLE_HOME = {
  ADMIN:   "/admin",
  DOCTOR:  "/doctor",
  MIDWIFE: "/midwife",
  MOTHER:  "/dashboard",
};

function NotFound() {
  const { isAuthenticated, userRole } = useAuth();
  const homePath = isAuthenticated ? (ROLE_HOME[userRole] ?? "/") : "/";
  return (
    <div
      className="
        min-h-[60vh] flex items-center justify-center px-4
      "
    >
      <div className="text-center max-w-md">
        <h1
          className="
            text-7xl font-bold
            text-primary
          "
        >
          404
        </h1>

        <h2
          className="
            mt-4 text-2xl font-semibold
            text-light-text dark:text-dark-text
          "
        >
          Page not found
        </h2>

        <p
          className="
            mt-2 text-sm
            text-secondary-600 dark:text-secondary-300
          "
        >
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Link
            to={homePath}
            className="
              px-5 py-2.5 rounded-full text-sm font-medium
              bg-primary text-light-surface
              hover:opacity-90 transition
              focus:outline-none focus:ring-2 focus:ring-primary/40
            "
          >
            Go Back
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
