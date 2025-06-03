import React, { useState, useEffect } from 'react';
import { FiWifi, FiWifiOff, FiRefreshCw, FiDatabase, FiClock } from 'react-icons/fi';
import { enhancedApi } from '../services/enhancedApiWithSync';

const OfflineNotice = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineStats, setOfflineStats] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);


  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline stats
    loadOfflineStats();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      loadOfflineStats();
    }
  }, [isOnline]);

  const loadOfflineStats = async () => {
    try {
      const stats = await enhancedApi.getOfflineStats();
      setOfflineStats(stats);
    } catch (error) {
      console.error('Failed to load offline stats:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Trigger a data refresh by reloading the page
      window.location.reload();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRetrySync = async () => {
    if (!isOnline) return;
    
    setIsRefreshing(true);
    try {
      // The background sync will automatically process when we're online
      await new Promise(resolve => setTimeout(resolve, 2000)); // Give it time to sync
      await loadOfflineStats();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isOnline && (!offlineStats || offlineStats.pendingSync === 0)) {
    return null; // Don't show anything when online and no pending sync
  }

  return (
    <div className="p-4 bg-slate-800 border-b border-slate-700">
      <div className={`flex flex-col items-center justify-center text-center p-4 rounded-md ${
        isOnline ? 'bg-blue-50 border border-blue-200' : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className={`w-8 h-8 mb-4 ${isOnline ? 'text-blue-500' : 'text-yellow-500'}`}>
          {isOnline ? <FiWifi className="w-full h-full" /> : <FiWifiOff className="w-full h-full" />}
        </div>
        
        <h3 className="mt-4 mb-1 text-lg font-semibold">
          <div className="flex items-center space-x-2">
            {isOnline ? <FiWifi className="w-5 h-5" /> : <FiWifiOff className="w-5 h-5" />}
            <span>{isOnline ? 'Online Mode' : 'Offline Mode'}</span>
          </div>
        </h3>
        
        <div className="max-w-sm">
          <div className="space-y-3">
            <p className="text-gray-700">
              {isOnline 
                ? 'You\'re back online! Some data may be cached from your offline session.'
                : 'You\'re currently offline. Using cached data where available.'
              }
            </p>
            
            {offlineStats && (
              <div className="space-y-2">
                <div className="flex flex-wrap justify-center gap-4">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    <span className="flex items-center space-x-1">
                      <FiDatabase className="w-3 h-3" />
                      <span>{offlineStats.heroes} Heroes</span>
                    </span>
                  </span>
                  
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    <span className="flex items-center space-x-1">
                      <FiDatabase className="w-3 h-3" />
                      <span>{offlineStats.players} Players</span>
                    </span>
                  </span>
                  
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                    <span className="flex items-center space-x-1">
                      <FiDatabase className="w-3 h-3" />
                      <span>{offlineStats.matches} Matches</span>
                    </span>
                  </span>
                  
                  {offlineStats.pendingSync > 0 && (
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                      <span className="flex items-center space-x-1">
                        <FiClock className="w-3 h-3" />
                        <span>{offlineStats.pendingSync} Pending Sync</span>
                      </span>
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <FiRefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </button>
                  
                  {isOnline && offlineStats.pendingSync > 0 && (
                    <button
                      className="flex items-center px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors disabled:opacity-50"
                      onClick={handleRetrySync}
                      disabled={isRefreshing}
                    >
                      <FiRefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                      {isRefreshing ? 'Syncing...' : 'Retry Sync'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineNotice;