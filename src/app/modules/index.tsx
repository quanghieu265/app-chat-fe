import { memo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { setAuthenticated } from "./auth/redux/action";
import ModulesRoutes from "./modules.routes";

const ModulesComponent = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  useEffect(() => {
    if (isAuthenticated) {
      const user: any = localStorage.getItem("user");
      const userData = user ? JSON.parse(user) : null;
      dispatch(setAuthenticated(userData));
    }
  }, [isAuthenticated, dispatch]);

  return <ModulesRoutes isAuthenticated={isAuthenticated} />;
};
export default memo(ModulesComponent);
