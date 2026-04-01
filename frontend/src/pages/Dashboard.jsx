import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Battery, 
  Wifi, 
  Clock, 
  Activity, 
  Volume2, 
  Settings,
  ShieldCheck,
  Maximize2,
  Minimize2,
  RotateCw,
  FlipHorizontal2,
  FlipVertical2,
  Thermometer,
  Printer
} from "lucide-react";
import { Switch } from "../components/ui/switch";
import { useLocalConfig } from "../contexts/LocalConfigContext";

// Custom Pelle Logo - Green P with cute cartoon camera lens
const PelleLogo = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25 15h30c16.569 0 30 13.431 30 30s-13.431 30-30 30H45v20c0 2.761-2.239 5-5 5H30c-2.761 0-5-2.239-5-5V15z" fill="#22c55e"/>
    <path d="M45 30h10c8.284 0 15 6.716 15 15s-6.716 15-15 15H45V30z" fill="#fafaf8"/>
    <circle cx="55" cy="45" r="13" fill="#1a1a2e" stroke="#16213e" strokeWidth="2"/>
    <circle cx="55" cy="45" r="10" fill="#0f3460" stroke="#e94560" strokeWidth="1.5"/>
    <circle cx="55" cy="45" r="7" fill="#16213e"/>
    <circle cx="55" cy="45" r="5" fill="#1a1a2e" stroke="#533483" strokeWidth="0.5"/>
    <circle cx="55" cy="45" r="3" fill="#0f3460"/>
    <ellipse cx="52" cy="42" rx="2.5" ry="3" fill="white" opacity="0.9"/>
    <circle cx="58" cy="47" r="1" fill="white" opacity="0.6"/>
    <path d="M50 40 L51 42 L49 42 Z" fill="#e94560" opacity="0.8"/>
  </svg>
);

// Placeholder images
const PLACEHOLDERS = {
  pelle: "https://images.unsplash.com/photo-1505656029707-0fd14cabd9ec?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHxjdXRlJTIwZG9nJTIwc2xlZXBpbmclMjBiZWR8ZW58MHx8fHwxNzc0OTc4NDkyfDA&ixlib=rb-4.1.0&q=85",
  printer: "https://images.unsplash.com/photo-1642969164999-979483e21601?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzV8MHwxfHNlYXJjaHwxfHwzRCUyMHByaW50ZXIlMjBwcmludGluZ3xlbnwwfHx8fDE3NzQ5Nzg0OTJ8MA&ixlib=rb-4.1.0&q=85",
};

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Use local config context
  const { config, batteryLevels, prusaStatus, updateAlerts, getStreamUrl } = useLocalConfig();
  
  const [activeCamera, setActiveCamera] = useState("pelle");
  const [uptime, setUptime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

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

  // Get current camera config from local storage
  const currentCamera = config.cameras[activeCamera];
  const alertSettings = config.alerts;

  // Get stream URL - use local IP or placeholder
  const getVideoSrc = () => {
    const streamUrl = getStreamUrl(activeCamera);
    return streamUrl || PLACEHOLDERS[activeCamera];
  };

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
              <p className="text-lg font-bold text-gray-800">Pelle</p>
              <p className="text-[10px] font-mono tracking-widest text-green-600 uppercase">Kameraövervakning</p>
            </div>
          </div>
          <button
            data-testid="settings-toggle-btn"
            onClick={() => navigate('/settings')}
            className="p-2 rounded-xl bg-[#fafaf8] border-2 border-[#d4dfc4] text-green-600 hover:bg-[#f0f4e8] hover:border-green-300 transition-colors shadow-sm"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Toggle */}
        <div className="bg-[#fafaf8] border-2 border-[#d4dfc4] p-1.5 rounded-full flex gap-1 mx-6 mt-4 shadow-sm">
          {Object.entries(config.cameras).map(([id, camera]) => (
            <button
              key={id}
              data-testid={`camera-toggle-${id}`}
              onClick={() => setActiveCamera(id)}
              className={`relative z-10 px-6 py-3 text-sm font-semibold flex-1 transition-all rounded-full flex items-center justify-center gap-2 ${
                activeCamera === id
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
            filter: `brightness(${currentCamera.brightness / 50}) contrast(${currentCamera.contrast / 50})`
          }}
        >
          {/* Placeholder/Stream Image */}
          <img
            data-testid="camera-feed-image"
            src={getVideoSrc()}
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
            className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-2"
          >
            <Battery className="w-4 h-4" />
            {batteryLevels[activeCamera]}%
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
                filter: `brightness(${currentCamera.brightness / 50}) contrast(${currentCamera.contrast / 50})`
              }}
            >
              <img
                src={getVideoSrc()}
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
                {batteryLevels[activeCamera]}%
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
                {Object.entries(config.cameras).map(([id, camera]) => (
                  <button
                    key={id}
                    onClick={() => setActiveCamera(id)}
                    className={`px-4 py-2 text-sm font-semibold transition-all rounded-full flex items-center gap-2 ${
                      activeCamera === id
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
              onCheckedChange={(checked) => updateAlerts({ motion_enabled: checked })}
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
              onCheckedChange={(checked) => updateAlerts({ sound_enabled: checked })}
            />
          </div>
        </div>

        {/* Prusa Status - Only show when on Printer tab and enabled */}
        {activeCamera === 'printer' && config.prusa.enabled && (
          <div className="mx-6 mt-6">
            <h3 className="text-[10px] font-mono tracking-widest text-green-600 uppercase mb-3">
              3D-Skrivare Status
            </h3>
            <div className="bg-[#fafaf8] border-2 border-[#d4dfc4] rounded-2xl p-4 shadow-sm">
              {prusaStatus.connected ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-medium">Ansluten till PrusaLink</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#f0f4e8] rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                        <Thermometer className="w-4 h-4" />
                      </div>
                      <p className="text-lg font-bold text-gray-800">{prusaStatus.nozzleTemp}°</p>
                      <p className="text-[9px] font-mono text-gray-500 uppercase">Munstycke</p>
                    </div>
                    <div className="bg-[#f0f4e8] rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                        <Thermometer className="w-4 h-4" />
                      </div>
                      <p className="text-lg font-bold text-gray-800">{prusaStatus.bedTemp}°</p>
                      <p className="text-[9px] font-mono text-gray-500 uppercase">Bädd</p>
                    </div>
                    <div className="bg-[#f0f4e8] rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                        <Printer className="w-4 h-4" />
                      </div>
                      <p className="text-lg font-bold text-gray-800">{prusaStatus.progress}%</p>
                      <p className="text-[9px] font-mono text-gray-500 uppercase">Progress</p>
                    </div>
                  </div>
                  {prusaStatus.printing && (
                    <div className="w-full bg-[#e5ead8] rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${prusaStatus.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span>Ej ansluten - Konfigurera i inställningar</span>
                </div>
              )}
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
