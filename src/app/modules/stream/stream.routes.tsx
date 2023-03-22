import { lazy, memo } from "react";
import { Route, Routes } from "react-router-dom";
const StreamPage = lazy(() => import("./pages/index"))

const StreamRoutes = memo(() => {
  return (
    <Routes>
      <Route path="/" element={<StreamPage />} />
    </Routes>
  );
});
export default StreamRoutes;
