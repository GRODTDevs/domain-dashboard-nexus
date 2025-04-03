
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Make sure we're using the correct DOM element
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

try {
  createRoot(rootElement).render(<App />);
} catch (error) {
  console.error("Failed to render the application:", error);
  
  // Provide fallback error display
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: sans-serif;">
      <h2>Application Error</h2>
      <p>Sorry, the application failed to load. Please try refreshing the page.</p>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; text-align: left; margin-top: 20px;">${error instanceof Error ? error.message : 'Unknown error'}</pre>
    </div>
  `;
}
