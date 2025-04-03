
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeStorage } from './lib/db.ts'
import { getDatabaseConnectionString } from './lib/database-config.ts'

// Make sure we're using the correct DOM element
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

// Initialize storage and render app
const initApp = async () => {
  try {
    // Check if we have a MongoDB connection string
    const connectionString = getDatabaseConnectionString();
    if (!connectionString) {
      console.warn("No MongoDB connection string found. Please set the VITE_MONGODB_URI environment variable.");
    } else {
      console.log("Found MongoDB connection string");
    }
    
    // Initialize MongoDB connection
    await initializeStorage();
    
    // Render the app
    createRoot(rootElement).render(<App />);
  } catch (error) {
    console.error("Failed to initialize the application:", error);
    
    // Provide fallback error display
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: sans-serif;">
        <h2>Application Error</h2>
        <p>Sorry, the application failed to load. Please ensure your MongoDB connection is properly configured.</p>
        <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; text-align: left; margin-top: 20px;">${error instanceof Error ? error.message : 'Unknown error'}</pre>
      </div>
    `;
  }
};

// Start the application
initApp();
