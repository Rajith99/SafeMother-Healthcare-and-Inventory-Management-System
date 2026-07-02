import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

export default function AuthButton() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (isAuthenticated) {
    return (
      <button
        onClick={handleLogout}
        className="
          group
          bg-primary hover:bg-primary/90
          text-white
          font-semibold
          px-4 py-2
          rounded-lg
          shadow-sm
          flex items-center gap-2
          transition
          focus:outline-none
          focus:ring-2 focus:ring-primary/40
          hover:cursor-pointer
        "
      >
        <span>Log Out</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate("/login")}
      className="
        group
        bg-primary hover:bg-primary/90
        text-white
        font-semibold
        px-4 py-2
        rounded-lg
        shadow-sm
        flex items-center gap-2
        transition
        focus:outline-none
        focus:ring-2 focus:ring-primary/40
        hover:cursor-pointer
      "
    >
      <span>Log In</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m-6-4l4-4m0 0l-4-4m4 4H3"
        />
      </svg>
    </button>
  );
}
