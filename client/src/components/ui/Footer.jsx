import Logo from "../../assets/Logoimg.png";

function Footer() {
  return (
    <footer
      className="
        bg-background-light dark:bg-background-dark
        border-t border-border dark:border-dark-border
      "
    >
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          {}
          <div className="flex items-center justify-center sm:justify-start">
            <img src={Logo} alt="Sunny Logo" className="h-15 w-auto" />
          </div>

          {}
          <p
            className="
              text-center sm:text-right
              text-sm
              text-secondary-500 dark:text-secondary-400
            "
          >
            © {new Date().getFullYear()} SafeMother. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
