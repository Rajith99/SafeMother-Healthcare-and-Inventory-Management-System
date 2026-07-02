import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import ProtectedRoute from "./ProtectedRoute";
import { appRoutes } from "./AppRoutes";
import Loader from "../components/ui/Loader";
import PublicOnlyRoute from "./PublicOnlyRoute";

export default function RouteRenderer() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {appRoutes.map((route, index) => {
          const Component = route.component;

          const element = route.requiresAuth ? (
            <ProtectedRoute allowedRoles={route.allowedRoles}>
              <Component />
            </ProtectedRoute>
          ) : route.publicOnly ? (
            <PublicOnlyRoute>
              <Component />
            </PublicOnlyRoute>
          ) : (
            <Component />
          );

          return <Route key={index} path={route.path} element={element} />;
        })}
      </Routes>
    </Suspense>
  );
}
