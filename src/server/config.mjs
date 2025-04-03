
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

// Load environment variables with more debugging
console.log('Server: Loading environment variables from .env file');
const envPath = path.resolve('.env');

try {
  if (fs.existsSync(envPath)) {
    console.log('Server: .env file found, loading now');
    dotenv.config({ path: envPath });
    console.log('Server: Loaded .env file successfully');
  } else {
    console.log('Server: .env file not found, attempting to create a default one');
    
    // Create a default .env file
    const defaultEnv = `# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/myapp
VITE_MONGODB_URI=mongodb://localhost:27017/myapp

# Application Settings
PORT=3001
NODE_ENV=development
`;

    try {
      fs.writeFileSync(envPath, defaultEnv);
      console.log('Server: Created default .env file');
      dotenv.config({ path: envPath });
      console.log('Server: Loaded default .env file successfully');
    } catch (writeError) {
      console.error('Server: Failed to create default .env file:', writeError);
    }
  }
} catch (error) {
  console.error('Server: Error loading .env file:', error);
}

// Log environment variable status
console.log('Server: Environment variables loaded');
console.log('Server: MONGODB_URI exists:', !!process.env.MONGODB_URI);
if (process.env.MONGODB_URI) {
  const uriStart = process.env.MONGODB_URI.substring(0, 10);
  console.log(`Server: MONGODB_URI value starts with: ${uriStart}...`);
}

// Server configuration
export const DEFAULT_PORT = 3001; // Changed from 3000 to 3001 to match vite proxy config
export const PORT = process.env.PORT || DEFAULT_PORT;
export const getStaticPath = () => path.join(projectRoot, 'dist');
