
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeStorage } from './lib/db.ts'
import { getDatabaseConnectionString } from './lib/database-config.ts'
import React from 'react'

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
      
      // Try to initialize MongoDB but don't block app rendering
      try {
        const initialized = await initializeStorage();
        if (!initialized) {
          console.warn("MongoDB initialization was not successful - continuing anyway");
        }
      } catch (error) {
        console.error("Error during MongoDB initialization:", error);
        // Continue rendering app despite initialization error
      }
    }
    
    // Always render the app - connection issues will be handled in components
    createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Failed to initialize the application:", error);
    
    // Import the DatabaseConnectionDialog component for error recovery
    import('./components/database-connection-button').then(({ DatabaseConnectionButton }) => {
      createRoot(rootElement).render(
        <div style={{ padding: '20px', maxWidth: '600px', margin: '40px auto' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Application Initialization Error</h2>
          <p style={{ marginBottom: '20px' }}>
            An error occurred while initializing the application. This might be related to the MongoDB connection.
          </p>
          <DatabaseConnectionButton />
          <div style={{ marginTop: '20px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
            <pre style={{ margin: 0, fontSize: '12px' }}>
              {error instanceof Error ? error.message : 'Unknown error'}
            </pre>
          </div>
        </div>
      );
    });
  }
};

// Start the application
initApp();
