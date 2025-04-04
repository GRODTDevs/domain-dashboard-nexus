
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import React from 'react'

// Make sure we're using the correct DOM element
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

// Create root outside of any async operations
const root = createRoot(rootElement);

// Log the initial render
console.log("Starting application render...");

// Render the app immediately without waiting for any initialization
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log("Initial render complete");
