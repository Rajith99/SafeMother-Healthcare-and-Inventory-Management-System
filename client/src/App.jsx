import { useLocation, matchPath } from "react-router-dom";
import ThemeToggle from "./components/ui/ThemeToggle";
import Header from "./components/ui/Header";
import RouteRenderer from "./routes/RouteRenderer";
import Footer from "./components/ui/Footer";
import { appRoutes } from "./routes/AppRoutes";
import "./App.css";

function App() {
  const { pathname } = useLocation();

  const currentRoute = appRoutes.find((r) =>
    r.path === "*" ? false : matchPath({ path: r.path, end: true }, pathname)
  );
  const hideChrome = currentRoute?.hideChrome ?? false;

  return (
    <div className="min-h-screen flex flex-col transition-colors">
      {!hideChrome && <Header />}
      <main className={`flex-1 flex justify-center w-full ${!hideChrome ? "pt-6 mb-6" : ""}`}>
        <RouteRenderer />
      </main>
      {!hideChrome && <Footer />}
      <ThemeToggle />
    </div>
  );
}

export default App;
