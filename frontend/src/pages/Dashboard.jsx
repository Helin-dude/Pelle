import { useState, useEffect, useRef } from "react";
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
  Camera
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

// Placeholder image for Pelle
const PLACEHOLDER = "https://images.unsplash.com/photo-1505656029707-0fd14cabd9ec?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHxjdXRlJTIwZG9nJTIwc2xlZXBpbmclMjBiZWR8ZW58MHx8fHwxNzc0OTc4NDkyfDA&ixlib=rb-4.1.0&q=85";

const Dashboard = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  // Use local config context
  const { config, batteryLevels, updateAlerts, getStreamUrl } = useLocalConfig();
  
  const [uptime, setUptime] = useState(0);
  
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
  const currentCamera = config.cameras.pelle;
  const alertSettings = config.alerts;

  // Get stream URL - use local IP or placeholder
  const getVideoSrc = () => {
    const streamUrl = getStreamUrl('pelle');
    return streamUrl || PLACEHOLDER;
  };

  // Get transform style for video
  const getVideoTransform = () => {
    let transform = [];
    if (rotation !== 0) transform.push(`rotate(${rotation}deg)`);
    if (flipH) transform.push('scaleX(-1)');
    if (flipV) transform.push('scaleY(-1)');
    return transform.length > 0 ? transform.join(' ') : 'none';
  };

  // Screenshot function
  const takeScreenshot = () => {
    const img = videoRef.current;
    if (!img) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    const link = document.createElement('a');
    link.download = `pelle-screenshot-${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
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

        {/* Live & Battery Status Bar - Above Video */}
        <div className="flex items-center justify-between mx-6 mt-4">
          <div 
            data-testid="live-indicator"
            className="bg-red-500 text-white px-3 py-1.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-white rounded-full animate-live-pulse" />
            LIVE
          </div>
          <div 
            data-testid="battery-indicator"
            className="bg-[#fafaf8] border-2 border-[#d4dfc4] text-gray-700 px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-2"
          >
            <Battery className="w-4 h-4 text-green-500" />
            {batteryLevels.pelle}%
          </div>
        </div>

        {/* Video Stream Container */}
        <div 
          data-testid="video-stream-container"
          className="relative aspect-[4/3] w-[calc(100%-3rem)] mx-6 mt-3 bg-gray-900 rounded-2xl overflow-hidden border-2 border-[#d4dfc4] shadow-lg"
          style={{
            filter: `brightness(${currentCamera.brightness / 50}) contrast(${currentCamera.contrast / 50})`
          }}
        >
          {/* Placeholder/Stream Image */}
          <img
            ref={videoRef}
            data-testid="camera-feed-image"
            src={getVideoSrc()}
            alt="Pelle camera feed"
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />

          {/* Fullscreen Button */}
          <button
            data-testid="fullscreen-btn"
            onClick={() => setIsFullscreen(true)}
            className="absolute bottom-4 right-4 bg-white/90 text-gray-700 hover:bg-white p-2 rounded-full transition-colors shadow-md"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Screenshot Button */}
          <button
            data-testid="screenshot-btn"
            onClick={takeScreenshot}
            className="absolute bottom-4 left-4 bg-white/90 text-gray-700 hover:bg-white p-2 rounded-full transition-colors shadow-md"
          >
            <Camera className="w-4 h-4" />
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
                alt="Pelle camera feed"
                className="max-w-full max-h-full object-contain transition-transform duration-300"
                style={{ transform: getVideoTransform() }}
              />

              {/* Fullscreen Overlays */}
              <div className="absolute top-6 left-6 bg-red-500 text-white px-4 py-2 rounded-full text-xs font-mono font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-live-pulse" />
                LIVE
              </div>

              <div className="absolute top-6 right-6 bg-white/90 text-gray-700 px-4 py-2 rounded-full text-sm font-mono flex items-center gap-2">
                <Battery className="w-5 h-5 text-green-500" />
                {batteryLevels.pelle}%
              </div>

              {/* Rotation & Flip Controls */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                <button
                  data-testid="rotate-btn"
                  onClick={() => setRotation((prev) => (prev + 180) % 360)}
                  className="p-3 bg-white/90 text-gray-700 hover:bg-white rounded-full transition-colors shadow-md"
                  title="Rotera 180°"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
                <button
                  data-testid="flip-h-btn"
                  onClick={() => setFlipH(!flipH)}
                  className={`p-3 rounded-full transition-colors shadow-md ${
                    flipH 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white/90 text-gray-700 hover:bg-white'
                  }`}
                  title="Spegla horisontellt"
                >
                  <FlipHorizontal2 className="w-5 h-5" />
                </button>
                <button
                  data-testid="flip-v-btn"
                  onClick={() => setFlipV(!flipV)}
                  className={`p-3 rounded-full transition-colors shadow-md ${
                    flipV 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white/90 text-gray-700 hover:bg-white'
                  }`}
                  title="Spegla vertikalt"
                >
                  <FlipVertical2 className="w-5 h-5" />
                </button>
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
                className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/90 text-gray-700 hover:bg-white px-4 py-2 rounded-full flex items-center gap-2 transition-colors shadow-md"
              >
                <Minimize2 className="w-4 h-4" />
                <span className="text-sm font-medium">Stäng</span>
              </button>
            </div>
          </div>
        )}

        {/* Status Row - Compact */}
        <div className="grid grid-cols-2 gap-3 px-6 mt-4">
          {/* Connection Strength */}
          <div 
            data-testid="connection-status-card"
            className="bg-[#fafaf8] border-2 border-[#d4dfc4] rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm"
          >
            <Wifi className="w-4 h-4 text-green-500" />
            <span className="text-sm font-mono text-green-600">Stark</span>
          </div>

          {/* Uptime */}
          <div 
            data-testid="uptime-status-card"
            className="bg-[#fafaf8] border-2 border-[#d4dfc4] rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm"
          >
            <Clock className="w-4 h-4 text-green-500" />
            <span className="text-sm font-mono text-gray-700">{formatUptime(uptime)}</span>
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

        {/* Bottom Spacing */}
        <div className="h-8" />
      </div>
    </div>
  );
};

export default Dashboard;
