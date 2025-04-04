
// Use ES modules syntax for Node.js
import { spawn } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import net from 'net';

// Get the current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to run a command with timeout protection
function runCommand(command, args, options = {}) {
  console.log(`Running command: ${command} ${args.join(' ')}`);
  
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
    ...options,
  });
  
  child.on('error', (error) => {
    console.error(`Error executing ${command}:`, error);
  });
  
  return child;
}

// Check if we need to install dependencies
const shouldInstallDependencies = !existsSync(path.join(__dirname, 'node_modules')) || 
                                 readdirSync(path.join(__dirname, 'node_modules')).length === 0;

// Check if we need to build first
const shouldBuild = !existsSync(path.join(__dirname, 'dist', 'index.html'));

// Function to check if a port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => {
      // Port is not available
      resolve(false);
    });
    server.once('listening', () => {
      // Port is available
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

// Function to find an available port
async function findAvailablePort(startPort, maxAttempts = 10) {
  let port = startPort;
  
  for (let attempts = 0; attempts < maxAttempts; attempts++) {
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
    port++;
  }
  
  // If no port is found, return null
  return null;
}

// Start the development environment
async function startDev() {
  console.log('🚀 Starting development environment...');

  // Install dependencies if needed
  if (shouldInstallDependencies) {
    console.log('Installing dependencies first...');
    
    try {
      await new Promise((resolve, reject) => {
        const installProcess = runCommand('npm', ['install']);
        
        const timeout = setTimeout(() => {
          console.error('❌ Dependency installation timed out after 5 minutes');
          installProcess.kill();
          reject(new Error('Installation timed out'));
        }, 300000); // 5 minute timeout
        
        installProcess.on('close', (code) => {
          clearTimeout(timeout);
          if (code === 0) {
            console.log('✅ Dependencies installed');
            resolve();
          } else {
            reject(new Error(`Installation failed with code ${code}`));
          }
        });
      });
    } catch (error) {
      console.error('❌', error.message);
      process.exit(1);
    }
  }

  // Build the app if needed
  if (shouldBuild) {
    console.log('Building the application...');
    
    try {
      await new Promise((resolve, reject) => {
        const buildProcess = runCommand('npm', ['run', 'build']);
        
        const timeout = setTimeout(() => {
          console.error('❌ Build process timed out after 5 minutes');
          buildProcess.kill();
          reject(new Error('Build timed out'));
        }, 300000); // 5 minute timeout
        
        buildProcess.on('close', (code) => {
          clearTimeout(timeout);
          if (code === 0) {
            console.log('✅ Build completed');
            resolve();
          } else {
            reject(new Error(`Build failed with code ${code}`));
          }
        });
      });
    } catch (error) {
      console.error('❌', error.message);
      process.exit(1);
    }
  }

  // Start the backend server first and wait a bit to ensure it's running
  console.log('Starting backend server...');
  const serverProcess = runCommand('node', ['server.mjs']);
  
  // Wait for the server to start (7 seconds)
  console.log('Waiting for backend server to start...');
  await new Promise(resolve => setTimeout(resolve, 7000));
  console.log('Backend server should be running now');

  // Find available port starting from 8080
  console.log('Finding an available port for the development server...');
  const availablePort = await findAvailablePort(8080);
  
  if (!availablePort) {
    console.error('❌ Failed to find an available port after 10 attempts. Please free up ports in the range 8080-8089.');
    process.exit(1);
  }
  
  console.log(`✅ Found available port: ${availablePort}`);

  // Start the development server using Vite directly with the available port
  console.log(`Starting frontend development server on port ${availablePort}...`);
  
  // Run vite with the available port
  const clientProcess = runCommand('npx', ['vite', '--host', '0.0.0.0', '--port', availablePort], {
    env: { 
      ...process.env, 
      VITE_HOST: '0.0.0.0',
      VITE_CLIENT_PORT: availablePort.toString(),
      DEBUG: 'vite:*', // Enable debug logging
      NODE_OPTIONS: '--max-old-space-size=4096' // Increase memory limit
    }
  });

  // Set a timeout to check if the development server is running
  const devServerTimeout = setTimeout(() => {
    console.log('\n⚠️ Development server is taking longer than expected to start...');
    console.log('If this continues, try:');
    console.log('1. Checking network connectivity');
    console.log('2. Verifying port configuration');
    console.log('3. Checking for errors in Vite configuration');
    console.log(`4. Manually running "npx vite --host 0.0.0.0 --port ${availablePort}" in another terminal\n`);
  }, 15000); // 15 second initial warning

  // Clear the timeout if the process exits
  clientProcess.on('close', () => {
    clearTimeout(devServerTimeout);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development environment...');
    clientProcess.kill();
    serverProcess.kill();
    process.exit(0);
  });

  console.log('✅ Development environment running');
  console.log(`📱 Client: http://localhost:${availablePort}`);
  console.log('🖥️ Server: Running on port 3001 or higher');
  console.log('Press Ctrl+C to stop');
}

// Start the development process
startDev().catch(err => {
  console.error('Failed to start development environment:', err);
  process.exit(1);
});
