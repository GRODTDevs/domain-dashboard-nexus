
// Use ES modules syntax for Node.js
import { spawn } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
  
  // Wait for the server to start (4 seconds)
  console.log('Waiting for backend server to start...');
  await new Promise(resolve => setTimeout(resolve, 4000));
  console.log('Backend server should be running now');

  // Start the development server using Vite directly for better logging
  console.log('Starting frontend development server...');
  console.log('Setting VITE_HOST=0.0.0.0 to allow external network access');
  
  const clientProcess = runCommand('npx', ['vite', '--host', '0.0.0.0'], {
    env: { ...process.env, VITE_HOST: '0.0.0.0' }
  });

  // Set a timeout to check if the development server is running
  const devServerTimeout = setTimeout(() => {
    console.log('\n⚠️ Development server is taking longer than expected to start...');
    console.log('If this continues, try:');
    console.log('1. Checking network connectivity');
    console.log('2. Verifying port 8080 is available');
    console.log('3. Checking for errors in Vite configuration');
    console.log('4. Manually running "npm run dev" in another terminal\n');
  }, 15000); // 15 second warning

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
  console.log('📱 Client: http://localhost:8080');
  console.log('🖥️ Server: Running on port 3001 or higher');
  console.log('Press Ctrl+C to stop');
}

// Start the development process
startDev().catch(err => {
  console.error('Failed to start development environment:', err);
  process.exit(1);
});
