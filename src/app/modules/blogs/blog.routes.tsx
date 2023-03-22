import { lazy, memo } from "react";
import { Route, Routes } from "react-router-dom";
const BlogPage = lazy(() => import("./pages/index"))

const BlogsRoutes = memo(() => {
  return (
    <Routes>
      <Route path="/:userId" element={<BlogPage />} />
    </Routes>
  );
});
export default BlogsRoutes;
