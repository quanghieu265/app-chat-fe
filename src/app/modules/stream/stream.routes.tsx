import { lazy, memo } from "react";
import { Route, Routes } from "react-router-dom";
const StreamOnlinePage = lazy(() => import("./pages/online-stream/index"));
const StreamPlaylistPage = lazy(() => import("./pages/playlist-stream/index"));
const StreamWatchPage = lazy(() => import("./pages/watch-stream/index"));

const StreamRoutes = memo(() => {
  return (
    <Routes>
      <Route path="/online" element={<StreamOnlinePage />} />
      <Route path="/playlist/:username" element={<StreamPlaylistPage />} />
      <Route path="/watch" element={<StreamWatchPage />} />
    </Routes>
  );
});
export default StreamRoutes;
