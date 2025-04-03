
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

// Load environment variables with more debugging
console.log('Server: Attempting to load environment variables from .env file');
const envPath = path.resolve('.env');
console.log('Server: Looking for .env file at path:', envPath);

try {
  if (fs.existsSync(envPath)) {
    console.log('Server: .env file exists, loading now');
    dotenv.config({ path: envPath });
    console.log('Server: Loaded .env file successfully');
  } else {
    console.log('Server: .env file not found at path:', envPath);
    // Try loading from project root as fallback
    const rootEnvPath = path.resolve(projectRoot, '.env');
    console.log('Server: Trying fallback path:', rootEnvPath);
    
    if (fs.existsSync(rootEnvPath)) {
      console.log('Server: .env file found at fallback path, loading now');
      dotenv.config({ path: rootEnvPath });
    } else {
      console.log('Server: No .env file found at fallback path either');
    }
  }
} catch (error) {
  console.error('Server: Error loading .env file:', error);
}

console.log('Server: Environment variables loaded, MONGODB_URI exists:', !!process.env.MONGODB_URI);
if (process.env.MONGODB_URI) {
  console.log('Server: MONGODB_URI value starts with:', process.env.MONGODB_URI.substring(0, 10) + '...');
}

// Server configuration
export const DEFAULT_PORT = 3001; // Changed from 3000 to 3001 to match vite proxy config
export const PORT = process.env.PORT || DEFAULT_PORT;
export const getStaticPath = () => path.join(projectRoot, 'dist');
