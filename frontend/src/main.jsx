// frontend/src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Tailwind CSS and custom styles
import { AuthProvider } from './contexts/AuthContext.jsx'; // Import AuthProvider
import { fileBackend } from './services/fileBackend.js'; // Import file backend service

// Initialize file backend service
const initializeApp = async () => {
  try {
    // Initializing file backend service...
    await fileBackend.initialize();
    // File backend service initialized successfully
    
    // Perform health check to ensure everything is working
    const health = await fileBackend.healthCheck();
    // File backend health check
    
    if (health.status !== 'healthy') {
      console.warn('File backend health check failed, some features may not work properly');
    }
  } catch (error) {
    console.error('Failed to initialize file backend service:', error);
    // Don't prevent app from loading, but log the error
  }
};

// Get root element
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

// App component wrapper with error boundary
const AppWrapper = () => (
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);

// Initialize backend before rendering the app
initializeApp().then(() => {
  root.render(<AppWrapper />);
}).catch((error) => {
  console.error('Critical error during app initialization:', error);
  // Still render the app but without backend services
  root.render(<AppWrapper />);
});
