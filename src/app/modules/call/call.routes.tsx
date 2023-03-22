import { lazy, memo } from "react";
import { Route, Routes } from "react-router-dom";
const VideoCallPage = lazy(() => import("./pages/index"))

const StreamRoutes = memo(() => {
  return (
    <Routes>
      <Route path="/" element={<VideoCallPage />} />
    </Routes>
  );
});
export default StreamRoutes;
