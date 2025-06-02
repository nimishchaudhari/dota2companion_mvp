// Service exports for easy importing
// Provides unified access to all services in the application

// Main API services
export { api as openDotaApi, mockAuth } from './api.js';
export { enhancedApi, mockAuth as auth } from './enhancedApi.js';
export { fileBackend } from './fileBackend.js';

// Storage services
export { dbService } from './storage/indexedDB.js';
export { localStorageService } from './storage/localStorage.js';

// Engine services
export { recommendationEngine } from './engine/recommendations.js';

// Default export - Enhanced API as the main service
export { enhancedApi as default } from './enhancedApi.js';