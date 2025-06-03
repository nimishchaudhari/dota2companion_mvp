import React, { useState, useEffect } from 'react';
import { FiDownload, FiRefreshCw, FiInfo, FiX } from 'react-icons/fi';

const UpdateNotification = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateDetails, setUpdateDetails] = useState(null);
  const [registration, setRegistration] = useState(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    // Check for service worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
        
        // Listen for update found
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available
                setUpdateAvailable(true);
                setShowNotification(true);
                setUpdateDetails({
                  version: '1.1.0', // This would come from your build process
                  features: [
                    'Enhanced offline capabilities',
                    'Background sync for API requests',
                    'Improved caching strategies',
                    'Better performance optimizations'
                  ],
                  timestamp: new Date()
                });
              }
            });
          }
        });

        // Listen for controlling service worker change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          // Page will reload automatically, but we can show a message
          showToast({
            title: 'Update Applied',
            description: 'The app has been updated successfully!',
            status: 'success'
          });
        });
      });

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          setUpdateAvailable(true);
          setShowNotification(true);
          setUpdateDetails(event.data.details);
        }
      });
    }

    // Simulate update detection for demo purposes
    const simulateUpdate = () => {
      if (Math.random() < 0.1) { // 10% chance on load
        setTimeout(() => {
          setUpdateAvailable(true);
          setShowNotification(true);
          setUpdateDetails({
            version: '1.1.0',
            features: [
              'Enhanced offline capabilities',
              'Background sync for API requests',
              'Improved caching strategies',
              'Better performance optimizations'
            ],
            timestamp: new Date()
          });
        }, 5000); // After 5 seconds
      }
    };

    simulateUpdate();
  }, []);

  const handleUpdate = async () => {
    if (!registration) {
      // Fallback: reload the page
      window.location.reload();
      return;
    }

    setIsUpdating(true);
    
    try {
      // Skip waiting for the new service worker
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      
      // Wait a moment for the service worker to take control
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reload the page to get the new version
      window.location.reload();
    } catch (error) {
      console.error('Update failed:', error);
      showToast({
        title: 'Update Failed',
        description: 'Failed to apply update. Please refresh the page manually.',
        status: 'error'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
    
    // Hide for this session but show again on next reload
    sessionStorage.setItem('updateDismissed', 'true');
  };

  const handleRemindLater = () => {
    setShowNotification(false);
    
    // Show again after 1 hour
    setTimeout(() => {
      setShowNotification(true);
    }, 60 * 60 * 1000); // 1 hour
  };

  if (!updateAvailable || !showNotification) {
    return null;
  }

  return (
    <>
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white p-4 rounded-md shadow-lg max-w-sm">
          <div className="flex items-start">
            <div className="flex-1">
              <h4 className="font-semibold">{toastMessage.title}</h4>
              <p className="text-sm opacity-90">{toastMessage.description}</p>
            </div>
            <button 
              onClick={() => setToastMessage(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Compact notification bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-blue-500 text-white p-3 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FiDownload className="w-5 h-5" />
            <div className="flex flex-col">
              <span className="font-semibold text-sm">
                App Update Available
              </span>
              <span className="text-xs opacity-90">
                New features and improvements ready to install
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              className="flex items-center px-3 py-1 border border-white border-opacity-50 rounded text-sm hover:bg-white hover:bg-opacity-10 transition-colors"
              onClick={() => setIsOpen(true)}
            >
              <FiInfo className="w-4 h-4 mr-1" />
              Details
            </button>
            <button
              className="flex items-center px-3 py-1 bg-white text-blue-500 rounded text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
              onClick={handleUpdate}
              disabled={isUpdating}
            >
              <FiRefreshCw className={`w-4 h-4 mr-1 ${isUpdating ? 'animate-spin' : ''}`} />
              {isUpdating ? 'Updating...' : 'Update Now'}
            </button>
            <button
              className="p-1 hover:bg-white hover:bg-opacity-10 rounded transition-colors"
              onClick={handleDismiss}
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detailed update modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <FiDownload className="w-6 h-6 text-blue-500" />
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-900">App Update Available</h3>
                  {updateDetails && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      Version {updateDetails.version}
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6">
              <div className="space-y-4">
                <p className="text-gray-600">
                  A new version of Dota 2 Companion is available with exciting improvements:
                </p>
                
                {updateDetails && updateDetails.features && (
                  <div className="w-full">
                    <p className="font-semibold mb-2">What's New:</p>
                    <div className="space-y-1 pl-4">
                      {updateDetails.features.map((feature, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          • {feature}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-start">
                    <FiInfo className="w-4 h-4 text-blue-400 mt-0.5 mr-2" />
                    <p className="text-sm text-blue-700">
                      The update will reload the app and may take a few seconds to apply.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-200 flex justify-end space-x-3">
              <button
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                onClick={handleRemindLater}
              >
                Remind Later
              </button>
              <button
                className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Not Now
              </button>
              <button
                className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                onClick={() => {
                  setIsOpen(false);
                  handleUpdate();
                }}
                disabled={isUpdating}
              >
                <FiRefreshCw className={`w-4 h-4 mr-1 ${isUpdating ? 'animate-spin' : ''}`} />
                {isUpdating ? 'Updating...' : 'Update Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UpdateNotification;