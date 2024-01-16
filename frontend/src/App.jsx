import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./Pages/Dashboard";
import { Checklist } from "./Pages/Checklist";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/checklist/:checklistId" element={<Checklist />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
