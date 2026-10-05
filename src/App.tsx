import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import ScannerArea from "./pages/ScannerArea.tsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/scanner" element={<ScannerArea />} />
    </Routes>
  );
}

export default App;
