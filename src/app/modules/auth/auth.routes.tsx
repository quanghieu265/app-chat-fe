import { lazy, memo } from "react";
import { Route, Routes } from "react-router-dom";
const LoginPage = lazy(() => import("./pages/login"));
const RegisterPage = lazy(() => import("./pages/register"));

const AuthRoutes = memo(() => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
});
export default AuthRoutes;
