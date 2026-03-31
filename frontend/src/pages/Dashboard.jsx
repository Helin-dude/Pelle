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
  ShieldCheck,
  Link,
  Check,
  Maximize2,
  Minimize2,
  X,
  RotateCw,
  FlipHorizontal2,
  FlipVertical2
} from "lucide-react";
import { Slider } from "../components/ui/slider";
import { Switch } from "../components/ui/switch";

// Custom Pelle Logo - Green P with cute cartoon camera lens
const PelleLogo = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Green P letter */}
    <path
      d="M25 15h30c16.569 0 30 13.431 30 30s-13.431 30-30 30H45v20c0 2.761-2.239 5-5 5H30c-2.761 0-5-2.239-5-5V15z"
      fill="#22c55e"
    />
    {/* Inner cutout for P hole */}
    <path
      d="M45 30h10c8.284 0 15 6.716 15 15s-6.716 15-15 15H45V30z"
      fill="#fafaf8"
    />
    {/* Camera lens body - cartoon style */}
    <circle cx="55" cy="45" r="13" fill="#1a1a2e" stroke="#16213e" strokeWidth="2"/>
    {/* Outer lens ring - shiny */}
    <circle cx="55" cy="45" r="10" fill="#0f3460" stroke="#e94560" strokeWidth="1.5"/>
    {/* Inner lens - gradient effect */}
    <circle cx="55" cy="45" r="7" fill="#16213e"/>
    {/* Lens iris rings */}
    <circle cx="55" cy="45" r="5" fill="#1a1a2e" stroke="#533483" strokeWidth="0.5"/>
    <circle cx="55" cy="45" r="3" fill="#0f3460"/>
    {/* Cute eye-like reflection - big */}
    <ellipse cx="52" cy="42" rx="2.5" ry="3" fill="white" opacity="0.9"/>
    {/* Small reflection */}
    <circle cx="58" cy="47" r="1" fill="white" opacity="0.6"/>
    {/* Lens sparkle */}
    <path d="M50 40 L51 42 L49 42 Z" fill="#e94560" opacity="0.8"/>
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
    sound_enabled: true,
    sound_sensitivity: 50
  });
  
  // Stream URL input state
  const [streamUrlInput, setStreamUrlInput] = useState("");
  const [showStreamInput, setShowStreamInput] = useState(false);
  const [streamSaved, setStreamSaved] = useState(false);
  
  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

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

  // Reset stream URL input when camera changes
  useEffect(() => {
    setStreamUrlInput(cameraSettings[activeCamera]?.stream_url || "");
    setStreamSaved(false);
  }, [activeCamera, cameraSettings]);

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

  // Get transform style for video
  const getVideoTransform = () => {
    let transform = [];
    if (rotation !== 0) transform.push(`rotate(${rotation}deg)`);
    if (flipH) transform.push('scaleX(-1)');
    if (flipV) transform.push('scaleY(-1)');
    return transform.length > 0 ? transform.join(' ') : 'none';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8faf5] to-[#eef4e5] flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-[#fafaf8]/95 backdrop-blur-sm flex flex-col relative border-x border-[#e5ead8] shadow-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#fafaf8] rounded-xl border-2 border-[#d4dfc4] flex items-center justify-center shadow-sm">
              <PelleLogo className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-widest text-green-600 uppercase">Välkommen</p>
              <p className="text-sm font-semibold text-gray-800">{user?.name || 'User'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              data-testid="settings-toggle-btn"
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-xl bg-[#fafaf8] border-2 border-[#d4dfc4] text-green-600 hover:bg-[#f0f4e8] hover:border-green-300 transition-colors shadow-sm"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              data-testid="logout-btn"
              onClick={logout}
              className="p-2 rounded-xl bg-[#fafaf8] border-2 border-[#d4dfc4] text-green-600 hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-colors shadow-sm"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Camera Toggle */}
        <div className="bg-[#fafaf8] border-2 border-[#d4dfc4] p-1.5 rounded-full flex gap-1 mx-6 mt-4 shadow-sm">
          {Object.values(CAMERAS).map((camera) => (
            <button
              key={camera.id}
              data-testid={`camera-toggle-${camera.id}`}
              onClick={() => setActiveCamera(camera.id)}
              className={`relative z-10 px-6 py-3 text-sm font-semibold flex-1 transition-all rounded-full flex items-center justify-center gap-2 ${
                activeCamera === camera.id
                  ? 'text-white bg-green-500 shadow-md'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-[#f0f4e8]'
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
          className="relative aspect-[4/3] w-[calc(100%-3rem)] mx-6 mt-6 bg-gray-900 rounded-[2rem] overflow-hidden border-2 border-[#d4dfc4] shadow-lg"
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

          {/* Fullscreen Button */}
          <button
            data-testid="fullscreen-btn"
            onClick={() => setIsFullscreen(true)}
            className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md border border-zinc-700/50 text-zinc-300 hover:text-white p-2 rounded-full transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Fullscreen Modal */}
        {isFullscreen && (
          <div 
            data-testid="fullscreen-modal"
            className="fixed inset-0 z-50 bg-gray-900 flex items-center justify-center"
          >
            {/* Fullscreen Video */}
            <div 
              className="relative w-full h-full flex items-center justify-center"
              style={{
                filter: `brightness(${currentSettings.brightness / 50}) contrast(${currentSettings.contrast / 50})`
              }}
            >
              <img
                src={currentSettings.stream_url || currentCamera.placeholder}
                alt={`${currentCamera.name} camera feed`}
                className="max-w-full max-h-full object-contain transition-transform duration-300"
                style={{ transform: getVideoTransform() }}
              />

              {/* Fullscreen Overlays */}
              <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md border border-red-500/30 text-red-500 px-4 py-2 rounded-full text-xs font-mono font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-live-pulse" />
                LIVE
              </div>

              <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm font-mono flex items-center gap-2">
                <Battery className="w-5 h-5" />
                {currentCamera.battery}%
              </div>

              <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-xs font-mono tracking-widest uppercase">
                {currentCamera.name}
              </div>

              {/* Rotation & Flip Controls */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                <button
                  data-testid="rotate-btn"
                  onClick={() => setRotation((prev) => (prev + 180) % 360)}
                  className="p-3 bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 rounded-full transition-colors"
                  title="Rotera 180°"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
                <button
                  data-testid="flip-h-btn"
                  onClick={() => setFlipH(!flipH)}
                  className={`p-3 backdrop-blur-md border rounded-full transition-colors ${
                    flipH 
                      ? 'bg-green-500/80 border-green-400 text-white' 
                      : 'bg-black/60 border-white/20 text-white hover:bg-white/20'
                  }`}
                  title="Spegla horisontellt"
                >
                  <FlipHorizontal2 className="w-5 h-5" />
                </button>
                <button
                  data-testid="flip-v-btn"
                  onClick={() => setFlipV(!flipV)}
                  className={`p-3 backdrop-blur-md border rounded-full transition-colors ${
                    flipV 
                      ? 'bg-green-500/80 border-green-400 text-white' 
                      : 'bg-black/60 border-white/20 text-white hover:bg-white/20'
                  }`}
                  title="Spegla vertikalt"
                >
                  <FlipVertical2 className="w-5 h-5" />
                </button>
              </div>

              {/* Camera Toggle in Fullscreen */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/20 p-1 rounded-full flex gap-1">
                {Object.values(CAMERAS).map((camera) => (
                  <button
                    key={camera.id}
                    onClick={() => setActiveCamera(camera.id)}
                    className={`px-4 py-2 text-sm font-semibold transition-all rounded-full flex items-center gap-2 ${
                      activeCamera === camera.id
                        ? 'text-white bg-green-500'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <PelleLogo className="w-3 h-3" />
                    {camera.name}
                  </button>
                ))}
              </div>

              {/* Close Fullscreen Button */}
              <button
                data-testid="close-fullscreen-btn"
                onClick={() => {
                  setIsFullscreen(false);
                  setRotation(0);
                  setFlipH(false);
                  setFlipV(false);
                }}
                className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 px-4 py-2 rounded-full flex items-center gap-2 transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
                <span className="text-sm font-medium">Stäng</span>
              </button>
            </div>
          </div>
        )}

        {/* Status Bento Grid */}
        <div className="grid grid-cols-2 gap-4 px-6 mt-6">
          {/* Connection Strength */}
          <div 
            data-testid="connection-status-card"
            className="bg-[#fafaf8] border-2 border-[#d4dfc4] rounded-2xl p-5 flex flex-col gap-3 shadow-sm"
          >
            <span className="text-[10px] font-mono tracking-widest text-green-600 uppercase">
              Anslutning
            </span>
            <div className="text-xl font-mono text-gray-800 flex items-center gap-2">
              <Wifi className="w-5 h-5 text-green-500" />
              <span className="text-green-600">Stark</span>
            </div>
          </div>

          {/* Uptime */}
          <div 
            data-testid="uptime-status-card"
            className="bg-[#fafaf8] border-2 border-[#d4dfc4] rounded-2xl p-5 flex flex-col gap-3 shadow-sm"
          >
            <span className="text-[10px] font-mono tracking-widest text-green-600 uppercase">
              Drifttid
            </span>
            <div className="text-xl font-mono text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-500" />
              {formatUptime(uptime)}
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div 
          data-testid="security-notice"
          className="mx-6 mt-4 p-3 bg-[#f0f4e8] border-2 border-[#d4dfc4] rounded-xl flex items-center gap-3"
        >
          <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-700 text-xs font-mono">
            Skyddad: Endast tillgänglig inom lokalt WiFi
          </p>
        </div>

        {/* Alerts Section */}
        <div className="flex flex-col gap-3 px-6 mt-6">
          <h3 className="text-[10px] font-mono tracking-widest text-green-600 uppercase">
            Varningar
          </h3>
          
          {/* Motion Alert */}
          <div 
            data-testid="motion-alert-card"
            className="bg-[#fafaf8] border-2 border-[#d4dfc4] rounded-2xl p-4 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${alertSettings.motion_enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Rörelsedetektering</p>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
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
            className="bg-[#fafaf8] border-2 border-[#d4dfc4] rounded-2xl p-4 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${alertSettings.sound_enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Ljuddetektering</p>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
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
            className="bg-[#fafaf8] border-2 border-[#d4dfc4] rounded-[2rem] p-6 mx-6 mt-6 flex flex-col gap-6 shadow-sm"
          >
            <h3 className="text-[10px] font-mono tracking-widest text-green-600 uppercase">
              Kamerainställningar - {currentCamera.name}
            </h3>

            {/* Stream URL Input */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <Link className="w-4 h-4" />
                  <span className="text-sm font-medium">Stream URL</span>
                </div>
                {streamSaved && (
                  <span className="text-green-600 text-xs font-mono flex items-center gap-1">
                    <Check className="w-3 h-3" /> Sparad
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  data-testid="stream-url-input"
                  type="text"
                  placeholder="http://192.168.1.50/stream"
                  value={streamUrlInput || currentSettings.stream_url || ""}
                  onChange={(e) => {
                    setStreamUrlInput(e.target.value);
                    setStreamSaved(false);
                  }}
                  className="flex-1 bg-[#f0f4e8] border-2 border-[#d4dfc4] rounded-xl px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400"
                />
                <button
                  data-testid="save-stream-url-btn"
                  onClick={() => {
                    updateCameraSetting(activeCamera, 'stream_url', streamUrlInput || null);
                    setStreamSaved(true);
                    setTimeout(() => setStreamSaved(false), 2000);
                  }}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Spara
                </button>
              </div>
              <p className="text-gray-500 text-[10px] font-mono">
                Ange lokal IP-adress för MJPEG-ström (endast tillgänglig inom samma WiFi)
              </p>
            </div>

            {/* Brightness Slider */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <Sun className="w-4 h-4" />
                  <span className="text-sm font-medium">Ljusstyrka</span>
                </div>
                <span className="text-sm font-mono text-gray-500">{currentSettings.brightness}%</span>
              </div>
              <Slider
                data-testid="brightness-slider"
                value={[currentSettings.brightness]}
                onValueChange={([value]) => updateCameraSetting(activeCamera, 'brightness', value)}
                max={100}
                step={1}
                className="light-slider"
              />
            </div>

            {/* Contrast Slider */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <Contrast className="w-4 h-4" />
                  <span className="text-sm font-medium">Kontrast</span>
                </div>
                <span className="text-sm font-mono text-gray-500">{currentSettings.contrast}%</span>
              </div>
              <Slider
                data-testid="contrast-slider"
                value={[currentSettings.contrast]}
                onValueChange={([value]) => updateCameraSetting(activeCamera, 'contrast', value)}
                max={100}
                step={1}
                className="light-slider"
              />
            </div>

            {/* Sound Sensitivity Slider */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <Volume2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Ljudkänslighet</span>
                </div>
                <span className="text-sm font-mono text-gray-500">{alertSettings.sound_sensitivity || 50}%</span>
              </div>
              <Slider
                data-testid="sound-sensitivity-slider"
                value={[alertSettings.sound_sensitivity || 50]}
                onValueChange={([value]) => updateAlertSetting('sound_sensitivity', value)}
                max={100}
                step={1}
                className="light-slider"
              />
              <div className="flex justify-between text-[10px] font-mono text-gray-500">
                <span>Låg</span>
                <span>Hög</span>
              </div>
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
