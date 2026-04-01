import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SettingsPage from "./pages/SettingsPage";
import { LocalConfigProvider } from "./contexts/LocalConfigContext";

function App() {
  return (
    <div className="App">
      <LocalConfigProvider>
        <BrowserRouter basename="/Pelle">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </BrowserRouter>
      </LocalConfigProvider>
    </div>
  );
}

export default App;
