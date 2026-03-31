import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { 
  Battery, 
  Wifi, 
  Clock, 
  Activity, 
  Volume2, 
  Sun, 
  Contrast,
  LogOut,
  Settings,
  ShieldCheck
} from "lucide-react";
import { Slider } from "../components/ui/slider";
import { Switch } from "../components/ui/switch";

// Custom Pelle Logo - Green P with camera lens in the hole
const PelleLogo = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M25 15h30c16.569 0 30 13.431 30 30s-13.431 30-30 30H45v20c0 2.761-2.239 5-5 5H30c-2.761 0-5-2.239-5-5V15z"
      fill="#22c55e"
    />
    <path
      d="M45 30h10c8.284 0 15 6.716 15 15s-6.716 15-15 15H45V30z"
      fill="#09090b"
    />
    <circle cx="55" cy="45" r="12" fill="#18181b" stroke="#3f3f46" strokeWidth="2"/>
    <circle cx="55" cy="45" r="8" fill="#27272a"/>
    <circle cx="55" cy="45" r="5" fill="#09090b"/>
    <circle cx="52" cy="42" r="2" fill="#4ade80" opacity="0.6"/>
    <circle cx="55" cy="45" r="10" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.5"/>
  </svg>
);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Camera data
const CAMERAS = {
  pelle: {
    id: "pelle",
    name: "Pelle",
    placeholder: "https://images.unsplash.com/photo-1505656029707-0fd14cabd9ec?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHxjdXRlJTIwZG9nJTIwc2xlZXBpbmclMjBiZWR8ZW58MHx8fHwxNzc0OTc4NDkyfDA&ixlib=rb-4.1.0&q=85",
    battery: 85,
  },
  printer: {
    id: "printer",
    name: "Printer",
    placeholder: "https://images.unsplash.com/photo-1642969164999-979483e21601?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzV8MHwxfHNlYXJjaHwxfHwzRCUyMHByaW50ZXIlMjBwcmludGluZ3xlbnwwfHx8fDE3NzQ5Nzg0OTJ8MA&ixlib=rb-4.1.0&q=85",
    battery: 72,
  }
};

const Dashboard = ({ user: propUser, logout }) => {
  const location = useLocation();
  const user = propUser || location.state?.user;
  
  const [activeCamera, setActiveCamera] = useState("pelle");
  const [uptime, setUptime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  // Camera settings
  const [cameraSettings, setCameraSettings] = useState({
    pelle: { brightness: 50, contrast: 50, stream_url: null },
    printer: { brightness: 50, contrast: 50, stream_url: null }
  });
  
  // Alert settings
  const [alertSettings, setAlertSettings] = useState({
    motion_enabled: true,
    sound_enabled: true
  });

  // Fetch camera settings
  const fetchCameraSettings = useCallback(async (cameraId) => {
    try {
      const response = await fetch(`${API}/cameras/settings/${cameraId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setCameraSettings(prev => ({
          ...prev,
          [cameraId]: data
        }));
      }
    } catch (error) {
      console.error('Error fetching camera settings:', error);
    }
  }, []);

  // Fetch alert settings
  const fetchAlertSettings = useCallback(async () => {
    try {
      const response = await fetch(`${API}/alerts/settings`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAlertSettings(data);
      }
    } catch (error) {
      console.error('Error fetching alert settings:', error);
    }
  }, []);

  // Update camera settings
  const updateCameraSetting = async (cameraId, key, value) => {
    setCameraSettings(prev => ({
      ...prev,
      [cameraId]: { ...prev[cameraId], [key]: value }
    }));

    try {
      await fetch(`${API}/cameras/settings/${cameraId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ [key]: value })
      });
    } catch (error) {
      console.error('Error updating camera settings:', error);
    }
  };

  // Update alert settings
  const updateAlertSetting = async (key, value) => {
    setAlertSettings(prev => ({ ...prev, [key]: value }));

    try {
      await fetch(`${API}/alerts/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ [key]: value })
      });
    } catch (error) {
      console.error('Error updating alert settings:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCameraSettings('pelle');
    fetchCameraSettings('printer');
    fetchAlertSettings();
  }, [fetchCameraSettings, fetchAlertSettings]);

  // Uptime counter
  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentCamera = CAMERAS[activeCamera];
  const currentSettings = cameraSettings[activeCamera];

  return (
    <div className="min-h-screen bg-black flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-zinc-950 flex flex-col relative border-x border-zinc-900 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center">
              <PelleLogo className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Välkommen</p>
              <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              data-testid="settings-toggle-btn"
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              data-testid="logout-btn"
              onClick={logout}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Camera Toggle */}
        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 p-1.5 rounded-full flex gap-1 mx-6 mt-4 shadow-sm">
          {Object.values(CAMERAS).map((camera) => (
            <button
              key={camera.id}
              data-testid={`camera-toggle-${camera.id}`}
              onClick={() => setActiveCamera(camera.id)}
              className={`relative z-10 px-6 py-3 text-sm font-semibold flex-1 transition-all rounded-full flex items-center justify-center gap-2 ${
                activeCamera === camera.id
                  ? 'text-white bg-zinc-700/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <PelleLogo className="w-4 h-4" />
              {camera.name}
            </button>
          ))}
        </div>

        {/* Video Stream Container */}
        <div 
          data-testid="video-stream-container"
          className="relative aspect-[4/3] w-[calc(100%-3rem)] mx-6 mt-6 bg-black rounded-[2rem] overflow-hidden border border-zinc-800 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]"
          style={{
            filter: `brightness(${currentSettings.brightness / 50}) contrast(${currentSettings.contrast / 50})`
          }}
        >
          {/* Placeholder/Stream Image */}
          <img
            data-testid="camera-feed-image"
            src={currentSettings.stream_url || currentCamera.placeholder}
            alt={`${currentCamera.name} camera feed`}
            className="w-full h-full object-cover opacity-80"
          />

          {/* Camera Corner Brackets */}
          <div className="camera-corner camera-corner-tl" />
          <div className="camera-corner camera-corner-tr" />
          <div className="camera-corner camera-corner-bl" />
          <div className="camera-corner camera-corner-br" />

          {/* LIVE Overlay */}
          <div 
            data-testid="live-indicator"
            className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-red-500/30 text-red-500 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full animate-live-pulse" />
            LIVE
          </div>

          {/* Battery Overlay */}
          <div 
            data-testid="battery-indicator"
            className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-zinc-700/50 text-white px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-2"
          >
            <Battery className="w-4 h-4" />
            {currentCamera.battery}%
          </div>

          {/* Camera Name Overlay */}
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md border border-zinc-700/50 text-zinc-300 px-3 py-1.5 rounded-full text-[10px] font-mono tracking-widest uppercase">
            {currentCamera.name}
          </div>
        </div>

        {/* Status Bento Grid */}
        <div className="grid grid-cols-2 gap-4 px-6 mt-6">
          {/* Connection Strength */}
          <div 
            data-testid="connection-status-card"
            className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-5 flex flex-col gap-3"
          >
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
              Anslutning
            </span>
            <div className="text-xl font-mono text-zinc-100 flex items-center gap-2">
              <Wifi className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400">Stark</span>
            </div>
          </div>

          {/* Uptime */}
          <div 
            data-testid="uptime-status-card"
            className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-5 flex flex-col gap-3"
          >
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
              Drifttid
            </span>
            <div className="text-xl font-mono text-zinc-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-zinc-400" />
              {formatUptime(uptime)}
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div 
          data-testid="security-notice"
          className="mx-6 mt-4 p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl flex items-center gap-3"
        >
          <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <p className="text-emerald-400/80 text-xs font-mono">
            Skyddad: Endast tillgänglig inom lokalt WiFi
          </p>
        </div>

        {/* Alerts Section */}
        <div className="flex flex-col gap-3 px-6 mt-6">
          <h3 className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
            Varningar
          </h3>
          
          {/* Motion Alert */}
          <div 
            data-testid="motion-alert-card"
            className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${alertSettings.motion_enabled ? 'bg-red-500/10 text-red-500' : 'bg-zinc-800/50 text-zinc-500'}`}>
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Rörelsedetektering</p>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  {alertSettings.motion_enabled ? 'Aktiv' : 'Inaktiv'}
                </p>
              </div>
            </div>
            <Switch
              data-testid="motion-alert-toggle"
              checked={alertSettings.motion_enabled}
              onCheckedChange={(checked) => updateAlertSetting('motion_enabled', checked)}
            />
          </div>

          {/* Sound Alert */}
          <div 
            data-testid="sound-alert-card"
            className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${alertSettings.sound_enabled ? 'bg-red-500/10 text-red-500' : 'bg-zinc-800/50 text-zinc-500'}`}>
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Ljuddetektering</p>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  {alertSettings.sound_enabled ? 'Aktiv' : 'Inaktiv'}
                </p>
              </div>
            </div>
            <Switch
              data-testid="sound-alert-toggle"
              checked={alertSettings.sound_enabled}
              onCheckedChange={(checked) => updateAlertSetting('sound_enabled', checked)}
            />
          </div>
        </div>

        {/* Camera Settings Panel - Collapsible */}
        {showSettings && (
          <div 
            data-testid="camera-settings-panel"
            className="bg-zinc-900 border border-zinc-800/60 rounded-[2rem] p-6 mx-6 mt-6 flex flex-col gap-6"
          >
            <h3 className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
              Kamerainställningar - {currentCamera.name}
            </h3>

            {/* Brightness Slider */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Sun className="w-4 h-4" />
                  <span className="text-sm font-medium">Ljusstyrka</span>
                </div>
                <span className="text-sm font-mono text-zinc-500">{currentSettings.brightness}%</span>
              </div>
              <Slider
                data-testid="brightness-slider"
                value={[currentSettings.brightness]}
                onValueChange={([value]) => updateCameraSetting(activeCamera, 'brightness', value)}
                max={100}
                step={1}
                className="dark-slider"
              />
            </div>

            {/* Contrast Slider */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Contrast className="w-4 h-4" />
                  <span className="text-sm font-medium">Kontrast</span>
                </div>
                <span className="text-sm font-mono text-zinc-500">{currentSettings.contrast}%</span>
              </div>
              <Slider
                data-testid="contrast-slider"
                value={[currentSettings.contrast]}
                onValueChange={([value]) => updateCameraSetting(activeCamera, 'contrast', value)}
                max={100}
                step={1}
                className="dark-slider"
              />
            </div>
          </div>
        )}

        {/* Bottom Spacing */}
        <div className="h-8" />
      </div>
    </div>
  );
};

export default Dashboard;
