import Logo from "../../assets/Logoimg.png";
import AuthButton from "./AuthButton";

export default function Header() {
  return (
    <header className="bg-surface-light dark:bg-surface-dark border-b border-border dark:border-dark-border transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {}
          <div className="flex items-center gap-3">
            <img src={Logo} alt="SafeMother Logo" className="h-15 w-auto" />
          </div>

          {}
          <div className="flex items-center gap-4">
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
}
