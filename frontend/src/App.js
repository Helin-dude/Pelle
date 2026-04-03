import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SettingsPage from "./pages/SettingsPage";
import { LocalConfigProvider } from "./contexts/LocalConfigContext";

// ------------------------------------------------------
// GLOBAL STATE FÖR KAMERA + BATTERI
// ------------------------------------------------------
function App() {
  const [image, setImage] = useState(null);
  const [battery, setBattery] = useState("--");

  // ------------------------------------------------------
  // WEBSOCKET STREAM
  // ------------------------------------------------------
  useEffect(() => {
    const ws = new WebSocket("ws://192.168.1.184:81");
    ws.binaryType = "arraybuffer";

    ws.onmessage = (event) => {
      // Batteriprocent
      if (typeof event.data === "string") {
        if (event.data.startsWith("BAT:")) {
          const pct = event.data.replace("BAT:", "");
          setBattery(pct);
        }
        return;
      }

      // Bilddata
      const bytes = new Uint8Array(event.data);
      const blob = new Blob([bytes], { type: "image/jpeg" });
      setImage(URL.createObjectURL(blob));
    };

    return () => ws.close();
  }, []);

  // ------------------------------------------------------
  // SKICKA DATA TILL SIDORNA VIA PROPS
  // ------------------------------------------------------
  return (
    <div className="App">
      <LocalConfigProvider>
        <BrowserRouter basename="/Pelle">
          <Routes>
            <Route
              path="/"
              element={<Dashboard image={image} battery={battery} />}
            />
            <Route
              path="/dashboard"
              element={<Dashboard image={image} battery={battery} />}
            />
            <Route
              path="/settings"
              element={<SettingsPage battery={battery} />}
            />
          </Routes>
        </BrowserRouter>
      </LocalConfigProvider>
    </div>
  );
}

export default App;
