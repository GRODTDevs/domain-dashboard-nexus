
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import React from 'react'

// Make sure we're using the correct DOM element
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

// Render the app immediately without waiting for any initialization
createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
