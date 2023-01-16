import { memo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppLayout from "../layout/layout";
import { PrivateRoutes, PublicRoutes } from "../routes/index";

type IModule = {
  isAuthenticated: Boolean;
};

const ModulesRoutes = memo(({ isAuthenticated }: IModule) => {
  let location = useLocation();
  let navigate = useNavigate();

  // redirect if not authenticated
  useEffect(() => {
    if (
      location.pathname === "/auth/register" ||
      location.pathname === "/auth/login"
    )
      return;
    if (!isAuthenticated) {
      return navigate("/auth/login");
    }
  }, [isAuthenticated, navigate, location]);

  if (isAuthenticated) {
    return (
      <>
        <AppLayout>{PrivateRoutes()}</AppLayout>
        {PublicRoutes()}
      </>
    );
  } else {
    return <> {PublicRoutes()}</>;
  }
});
export default ModulesRoutes;
