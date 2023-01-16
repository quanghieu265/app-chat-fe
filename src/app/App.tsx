import { BrowserRouter, Route, Routes } from "react-router-dom";
import ModulesComponent from "./modules/index";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<ModulesComponent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
