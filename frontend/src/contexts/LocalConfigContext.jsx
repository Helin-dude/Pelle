import { createContext, useContext, useState, useEffect } from 'react';

// Default camera configuration
const DEFAULT_CONFIG = {
  cameras: {
    pelle: {
      id: 'pelle',
      name: 'Pelle',
      ip: '192.168.1.184',
      streamPath: '/stream',
      batteryPath: '/battery',
      brightness: 50,
      contrast: 50,
    },
    printer: {
      id: 'printer',
      name: 'Printer',
      ip: '192.168.1.185',
      streamPath: '/stream',
      batteryPath: '/battery',
      brightness: 50,
      contrast: 50,
    }
  },
  prusa: {
    ip: '192.168.1.185',
    apiKey: '',
    enabled: false,
  },
  alerts: {
    motion_enabled: true,
    sound_enabled: true,
    sound_sensitivity: 50,
  }
};

const LocalConfigContext = createContext(null);

export const useLocalConfig = () => {
  const context = useContext(LocalConfigContext);
  if (!context) {
    throw new Error('useLocalConfig must be used within LocalConfigProvider');
  }
  return context;
};

export const LocalConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(() => {
    // Load from localStorage on init
    const saved = localStorage.getItem('pelle_config');
    if (saved) {
      try {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse config:', e);
      }
    }
    return DEFAULT_CONFIG;
  });

  // Battery states
  const [batteryLevels, setBatteryLevels] = useState({
    pelle: 100,
    printer: 100,
  });

  // Prusa status
  const [prusaStatus, setPrusaStatus] = useState({
    nozzleTemp: 0,
    bedTemp: 0,
    progress: 0,
    printing: false,
    connected: false,
  });

  // Save config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pelle_config', JSON.stringify(config));
  }, [config]);

  // Poll battery levels
  useEffect(() => {
    const fetchBattery = async (cameraId) => {
      const camera = config.cameras[cameraId];
      if (!camera.ip) return;
      
      try {
        const response = await fetch(`http://${camera.ip}${camera.batteryPath}`, {
          mode: 'cors',
          signal: AbortSignal.timeout(3000),
        });
        if (response.ok) {
          const data = await response.json();
          setBatteryLevels(prev => ({
            ...prev,
            [cameraId]: data.battery || data.level || 100,
          }));
        }
      } catch (e) {
        // Silently fail - camera might not support battery endpoint
      }
    };

    const interval = setInterval(() => {
      fetchBattery('pelle');
      fetchBattery('printer');
    }, 30000); // Poll every 30 seconds

    // Initial fetch
    fetchBattery('pelle');
    fetchBattery('printer');

    return () => clearInterval(interval);
  }, [config.cameras]);

  // Poll Prusa status
  useEffect(() => {
    if (!config.prusa.enabled || !config.prusa.ip || !config.prusa.apiKey) {
      setPrusaStatus(prev => ({ ...prev, connected: false }));
      return;
    }

    const fetchPrusaStatus = async () => {
      try {
        const response = await fetch(`http://${config.prusa.ip}/api/v1/status`, {
          headers: {
            'X-Api-Key': config.prusa.apiKey,
          },
          mode: 'cors',
          signal: AbortSignal.timeout(5000),
        });
        
        if (response.ok) {
          const data = await response.json();
          setPrusaStatus({
            nozzleTemp: data.printer?.temp_nozzle || data.nozzle?.temperature || 0,
            bedTemp: data.printer?.temp_bed || data.bed?.temperature || 0,
            progress: data.job?.progress || 0,
            printing: data.printer?.state === 'PRINTING' || data.state?.flags?.printing || false,
            connected: true,
          });
        } else {
          setPrusaStatus(prev => ({ ...prev, connected: false }));
        }
      } catch (e) {
        setPrusaStatus(prev => ({ ...prev, connected: false }));
      }
    };

    const interval = setInterval(fetchPrusaStatus, 5000); // Poll every 5 seconds
    fetchPrusaStatus(); // Initial fetch

    return () => clearInterval(interval);
  }, [config.prusa]);

  // Update functions
  const updateCamera = (cameraId, updates) => {
    setConfig(prev => ({
      ...prev,
      cameras: {
        ...prev.cameras,
        [cameraId]: {
          ...prev.cameras[cameraId],
          ...updates,
        }
      }
    }));
  };

  const updatePrusa = (updates) => {
    setConfig(prev => ({
      ...prev,
      prusa: {
        ...prev.prusa,
        ...updates,
      }
    }));
  };

  const updateAlerts = (updates) => {
    setConfig(prev => ({
      ...prev,
      alerts: {
        ...prev.alerts,
        ...updates,
      }
    }));
  };

  const getStreamUrl = (cameraId) => {
    const camera = config.cameras[cameraId];
    if (!camera.ip) return null;
    return `http://${camera.ip}${camera.streamPath}`;
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem('pelle_config');
  };

  return (
    <LocalConfigContext.Provider value={{
      config,
      batteryLevels,
      prusaStatus,
      updateCamera,
      updatePrusa,
      updateAlerts,
      getStreamUrl,
      resetConfig,
    }}>
      {children}
    </LocalConfigContext.Provider>
  );
};

export default LocalConfigProvider;
