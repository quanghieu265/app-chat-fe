import { lazy, Suspense } from "react";

const loadable = (importFunc) => {
  const LazyComponent = lazy(importFunc);
  const LazyComponentWrapper = (props) => (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
  return LazyComponentWrapper;
};

export default loadable;
