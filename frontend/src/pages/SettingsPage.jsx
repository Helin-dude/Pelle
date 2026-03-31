import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Camera, 
  Printer, 
  Wifi, 
  Key, 
  Save,
  RotateCcw,
  Check,
  AlertCircle
} from "lucide-react";
import { Slider } from "../components/ui/slider";
import { Switch } from "../components/ui/switch";
import { useLocalConfig } from "../contexts/LocalConfigContext";

// Custom Pelle Logo
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
  </svg>
);

const SettingsPage = () => {
  const navigate = useNavigate();
  const { config, updateCamera, updatePrusa, updateAlerts, resetConfig, prusaStatus } = useLocalConfig();
  
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('cameras');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('Återställa alla inställningar till standard?')) {
      resetConfig();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8faf5] to-[#eef4e5] flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-[#fafaf8]/95 backdrop-blur-sm flex flex-col relative border-x border-[#e5ead8] shadow-xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 px-6 pt-6 pb-4 border-b border-[#e5ead8]">
          <button
            data-testid="back-btn"
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl bg-[#fafaf8] border-2 border-[#d4dfc4] text-green-600 hover:bg-[#f0f4e8] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <PelleLogo className="w-8 h-8" />
            <div>
              <h1 className="text-lg font-bold text-gray-800">Inställningar</h1>
              <p className="text-[10px] font-mono text-green-600 uppercase tracking-widest">Lokal konfiguration</p>
            </div>
          </div>
          {saved && (
            <div className="ml-auto flex items-center gap-1 text-green-600 text-sm">
              <Check className="w-4 h-4" />
              Sparat
            </div>
          )}
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 px-6 py-4 border-b border-[#e5ead8]">
          {[
            { id: 'cameras', label: 'Kameror', icon: Camera },
            { id: 'prusa', label: 'Prusa', icon: Printer },
            { id: 'alerts', label: 'Varningar', icon: AlertCircle },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                activeSection === id
                  ? 'bg-green-500 text-white'
                  : 'bg-[#f0f4e8] text-gray-600 hover:bg-[#e5ead8]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          
          {/* Cameras Section */}
          {activeSection === 'cameras' && (
            <div className="space-y-6">
              {Object.entries(config.cameras).map(([id, camera]) => (
                <div key={id} className="bg-[#fafaf8] border-2 border-[#d4dfc4] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <Camera className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{camera.name}</h3>
                      <p className="text-[10px] font-mono text-gray-500 uppercase">Kamera {id === 'pelle' ? '1' : '2'}</p>
                    </div>
                  </div>

                  {/* IP Address */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">IP-adress</label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2 flex-1 bg-[#f0f4e8] border-2 border-[#d4dfc4] rounded-xl px-3">
                        <Wifi className="w-4 h-4 text-gray-400" />
                        <input
                          data-testid={`camera-${id}-ip`}
                          type="text"
                          value={camera.ip}
                          onChange={(e) => updateCamera(id, { ip: e.target.value })}
                          placeholder="192.168.1.xxx"
                          className="flex-1 bg-transparent py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stream Path */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Stream-sökväg</label>
                    <input
                      data-testid={`camera-${id}-stream-path`}
                      type="text"
                      value={camera.streamPath}
                      onChange={(e) => updateCamera(id, { streamPath: e.target.value })}
                      placeholder="/stream"
                      className="w-full bg-[#f0f4e8] border-2 border-[#d4dfc4] rounded-xl px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400"
                    />
                  </div>

                  {/* Brightness */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-medium text-gray-600">Ljusstyrka</label>
                      <span className="text-xs font-mono text-gray-500">{camera.brightness}%</span>
                    </div>
                    <Slider
                      value={[camera.brightness]}
                      onValueChange={([v]) => updateCamera(id, { brightness: v })}
                      max={100}
                      step={1}
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-medium text-gray-600">Kontrast</label>
                      <span className="text-xs font-mono text-gray-500">{camera.contrast}%</span>
                    </div>
                    <Slider
                      value={[camera.contrast]}
                      onValueChange={([v]) => updateCamera(id, { contrast: v })}
                      max={100}
                      step={1}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Prusa Section */}
          {activeSection === 'prusa' && (
            <div className="space-y-6">
              <div className="bg-[#fafaf8] border-2 border-[#d4dfc4] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-xl">
                      <Printer className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">PrusaLink</h3>
                      <p className="text-[10px] font-mono text-gray-500 uppercase">3D-skrivare integration</p>
                    </div>
                  </div>
                  <Switch
                    data-testid="prusa-enabled"
                    checked={config.prusa.enabled}
                    onCheckedChange={(checked) => updatePrusa({ enabled: checked })}
                  />
                </div>

                {config.prusa.enabled && (
                  <>
                    {/* Connection Status */}
                    <div className={`flex items-center gap-2 p-3 rounded-xl ${
                      prusaStatus.connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        prusaStatus.connected ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm font-medium">
                        {prusaStatus.connected ? 'Ansluten' : 'Ej ansluten'}
                      </span>
                    </div>

                    {/* IP Address */}
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Prusa IP-adress</label>
                      <div className="flex items-center gap-2 bg-[#f0f4e8] border-2 border-[#d4dfc4] rounded-xl px-3">
                        <Wifi className="w-4 h-4 text-gray-400" />
                        <input
                          data-testid="prusa-ip"
                          type="text"
                          value={config.prusa.ip}
                          onChange={(e) => updatePrusa({ ip: e.target.value })}
                          placeholder="192.168.1.xxx"
                          className="flex-1 bg-transparent py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* API Key */}
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">API-nyckel</label>
                      <div className="flex items-center gap-2 bg-[#f0f4e8] border-2 border-[#d4dfc4] rounded-xl px-3">
                        <Key className="w-4 h-4 text-gray-400" />
                        <input
                          data-testid="prusa-api-key"
                          type="password"
                          value={config.prusa.apiKey}
                          onChange={(e) => updatePrusa({ apiKey: e.target.value })}
                          placeholder="Din PrusaLink API-nyckel"
                          className="flex-1 bg-transparent py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Finns i PrusaLink → Settings → API Key
                      </p>
                    </div>

                    {/* Live Status */}
                    {prusaStatus.connected && (
                      <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="bg-[#f0f4e8] rounded-xl p-3 text-center">
                          <p className="text-[10px] font-mono text-gray-500 uppercase">Munstycke</p>
                          <p className="text-lg font-bold text-orange-600">{prusaStatus.nozzleTemp}°</p>
                        </div>
                        <div className="bg-[#f0f4e8] rounded-xl p-3 text-center">
                          <p className="text-[10px] font-mono text-gray-500 uppercase">Bädd</p>
                          <p className="text-lg font-bold text-orange-600">{prusaStatus.bedTemp}°</p>
                        </div>
                        <div className="bg-[#f0f4e8] rounded-xl p-3 text-center">
                          <p className="text-[10px] font-mono text-gray-500 uppercase">Progress</p>
                          <p className="text-lg font-bold text-green-600">{prusaStatus.progress}%</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Alerts Section */}
          {activeSection === 'alerts' && (
            <div className="space-y-4">
              <div className="bg-[#fafaf8] border-2 border-[#d4dfc4] rounded-2xl p-5 space-y-4">
                <h3 className="font-semibold text-gray-800">Varningsinställningar</h3>

                {/* Motion Detection */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Rörelsedetektering</p>
                    <p className="text-xs text-gray-500">Varna vid rörelse</p>
                  </div>
                  <Switch
                    data-testid="motion-enabled"
                    checked={config.alerts.motion_enabled}
                    onCheckedChange={(checked) => updateAlerts({ motion_enabled: checked })}
                  />
                </div>

                {/* Sound Detection */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Ljuddetektering</p>
                    <p className="text-xs text-gray-500">Varna vid ljud</p>
                  </div>
                  <Switch
                    data-testid="sound-enabled"
                    checked={config.alerts.sound_enabled}
                    onCheckedChange={(checked) => updateAlerts({ sound_enabled: checked })}
                  />
                </div>

                {/* Sound Sensitivity */}
                {config.alerts.sound_enabled && (
                  <div className="pt-2">
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-medium text-gray-600">Ljudkänslighet</label>
                      <span className="text-xs font-mono text-gray-500">{config.alerts.sound_sensitivity}%</span>
                    </div>
                    <Slider
                      value={[config.alerts.sound_sensitivity]}
                      onValueChange={([v]) => updateAlerts({ sound_sensitivity: v })}
                      max={100}
                      step={1}
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                      <span>Låg</span>
                      <span>Hög</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="px-6 py-4 border-t border-[#e5ead8] flex gap-3">
          <button
            data-testid="reset-btn"
            onClick={handleReset}
            className="flex-1 py-3 px-4 rounded-xl border-2 border-[#d4dfc4] text-gray-600 font-medium flex items-center justify-center gap-2 hover:bg-[#f0f4e8] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Återställ
          </button>
          <button
            data-testid="save-btn"
            onClick={handleSave}
            className="flex-1 py-3 px-4 rounded-xl bg-green-500 text-white font-medium flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
          >
            <Save className="w-4 h-4" />
            Spara
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
