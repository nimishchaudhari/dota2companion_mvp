import React, { useState, useEffect } from 'react';
import { 
  FiDownload, 
  FiSmartphone, 
  FiWifi, 
  FiWifiOff, 
  FiRefreshCw,
  FiCheck,
  FiClock,
  FiDatabase
} from 'react-icons/fi';
import { enhancedApi } from '../services/enhancedApiWithSync';

const PWAStatus = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineStats, setOfflineStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  
  const [toastMessage, setToastMessage] = useState(null);
  
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), message.duration || 5000);
  };

  useEffect(() => {
    // Check if app is already installed
    const checkInstallation = () => {
      // Check if running in standalone mode (installed PWA)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          window.navigator.standalone ||
                          document.referrer.includes('android-app://');
      setIsInstalled(isStandalone);
    };

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
      showToast({
        title: 'App Installed!',
        description: 'Dota 2 Companion has been installed on your device.',
        status: 'success',
        duration: 5000
      });
    };

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    checkInstallation();
    loadOfflineStats();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load stats periodically
    const statsInterval = setInterval(loadOfflineStats, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(statsInterval);
    };
  }, []);

  const loadOfflineStats = async () => {
    try {
      const stats = await enhancedApi.getOfflineStats();
      setOfflineStats(stats);
    } catch (error) {
      console.error('Failed to load offline stats:', error);
    }
  };

  const handleInstall = async () => {
    if (!installPrompt) return;

    setIsLoading(true);
    
    try {
      const result = await installPrompt.prompt();
      
      if (result.outcome === 'accepted') {
        setIsInstallable(false);
        setInstallPrompt(null);
        
        showToast({
          title: 'Installing...',
          description: 'The app is being installed on your device.',
          status: 'info',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Install failed:', error);
      showToast({
        title: 'Installation Failed',
        description: 'Unable to install the app. Please try again.',
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInstallIcon = () => {
    if (isInstalled) return FiCheck;
    if (isInstallable) return FiDownload;
    return FiSmartphone;
  };

  const getInstallColor = () => {
    if (isInstalled) return 'green';
    if (isInstallable) return 'blue';
    return 'gray';
  };

  const getInstallText = () => {
    if (isInstalled) return 'Installed';
    if (isInstallable) return 'Install App';
    return 'PWA Ready';
  };

  return (
    <>
      {/* Toast notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg max-w-sm ${
          toastMessage.status === 'success' ? 'bg-green-600 text-white' :
          toastMessage.status === 'error' ? 'bg-red-600 text-white' :
          'bg-blue-600 text-white'
        }`}>
          <div className="flex items-start">
            <div className="flex-1">
              <h4 className="font-semibold">{toastMessage.title}</h4>
              <p className="text-sm opacity-90">{toastMessage.description}</p>
            </div>
            <button 
              onClick={() => setToastMessage(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <FiRefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        {/* Install Status */}
        {isInstallable && (
          <button
            className="flex items-center px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors disabled:opacity-50"
            onClick={handleInstall}
            disabled={isLoading}
          >
            <FiDownload className="w-4 h-4 mr-1" />
            {isLoading ? 'Installing...' : 'Install App'}
          </button>
        )}

        {/* PWA Status Popover */}
        <div className="relative">
          <button 
            className="flex items-center space-x-2 p-2 hover:bg-slate-700 rounded transition-colors"
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          >
            {React.createElement(getInstallIcon(), {
              className: `w-4 h-4 ${
                getInstallColor() === 'green' ? 'text-green-500' :
                getInstallColor() === 'blue' ? 'text-blue-500' :
                'text-slate-500'
              }`
            })}
            {isOnline ? 
              <FiWifi className="w-4 h-4 text-green-500" /> : 
              <FiWifiOff className="w-4 h-4 text-orange-500" />
            }
          </button>

          {isPopoverOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-white">PWA Status</h3>
                  <button 
                    onClick={() => setIsPopoverOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* Installation Status */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-white">Installation</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        getInstallColor() === 'green' ? 'bg-green-100 text-green-800' :
                        getInstallColor() === 'blue' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {getInstallText()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">
                      {isInstalled 
                        ? 'App is installed and ready for offline use'
                        : isInstallable 
                        ? 'App can be installed for better experience'
                        : 'Running as Progressive Web App'
                      }
                    </p>
                  </div>

                  <div className="border-t border-slate-700"></div>

                  {/* Connection Status */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-white">Connection</span>
                      <span className={`px-2 py-1 rounded text-xs flex items-center space-x-1 ${
                        isOnline ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {isOnline ? <FiWifi className="w-3 h-3" /> : <FiWifiOff className="w-3 h-3" />}
                        <span>{isOnline ? 'Online' : 'Offline'}</span>
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">
                      {isOnline 
                        ? 'Connected - data will sync automatically'
                        : 'Offline - using cached data'
                      }
                    </p>
                  </div>

                  {/* Offline Stats */}
                  {offlineStats && (
                    <>
                      <div className="border-t border-slate-700"></div>
                      <div>
                        <h4 className="font-medium mb-3 text-white">Cached Data</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-slate-400">Heroes</p>
                            <p className="text-lg font-semibold text-white">{offlineStats.heroes}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Players</p>
                            <p className="text-lg font-semibold text-white">{offlineStats.players}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Matches</p>
                            <p className="text-lg font-semibold text-white">{offlineStats.matches}</p>
                          </div>
                          <div>
                            <div className="flex items-center space-x-1 text-xs text-slate-400">
                              <FiClock className="w-2.5 h-2.5" />
                              <span>Pending</span>
                            </div>
                            <p className={`text-lg font-semibold ${
                              offlineStats.pendingSync > 0 ? 'text-orange-500' : 'text-slate-500'
                            }`}>
                              {offlineStats.pendingSync}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Features */}
                  <div className="border-t border-slate-700"></div>
                  <div>
                    <h4 className="font-medium mb-2 text-white">Features</h4>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-slate-300">
                        <FiCheck className="w-3 h-3 text-green-500" />
                        <span>Offline browsing</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-300">
                        <FiRefreshCw className="w-3 h-3 text-blue-500" />
                        <span>Background sync</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-300">
                        <FiDatabase className="w-3 h-3 text-purple-500" />
                        <span>Smart caching</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PWAStatus;