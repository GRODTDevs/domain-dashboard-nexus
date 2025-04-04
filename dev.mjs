
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
  
  // Wait for the server to start (7 seconds)
  console.log('Waiting for backend server to start...');
  await new Promise(resolve => setTimeout(resolve, 7000));
  console.log('Backend server should be running now');

  // Check if port 8080 is already in use
  console.log('Checking if port 8080 is available...');
  try {
    const checkPortProcess = spawn('lsof', ['-i', ':8080'], { stdio: 'pipe' });
    let portData = '';
    
    checkPortProcess.stdout.on('data', (data) => {
      portData += data.toString();
    });
    
    await new Promise((resolve) => {
      checkPortProcess.on('close', (code) => {
        if (code === 0 && portData.trim()) {
          console.log('⚠️ Port 8080 is already in use. Will try to use a different port.');
        } else {
          console.log('✅ Port 8080 appears to be available');
        }
        resolve();
      });
    });
  } catch (error) {
    console.log('Unable to check port availability:', error.message);
  }

  // Start the development server using Vite directly for better diagnostics
  console.log('Starting frontend development server...');
  
  // Run vite with debug logging enabled and fallback port
  const clientProcess = runCommand('npx', ['vite', '--host', '0.0.0.0', '--debug'], {
    env: { 
      ...process.env, 
      VITE_HOST: '0.0.0.0',
      DEBUG: 'vite:*', // Enable debug logging
      VITE_PORT: '8080',
      NODE_OPTIONS: '--max-old-space-size=4096' // Increase memory limit
    }
  });

  // Set a timeout to check if the development server is running
  const devServerTimeout = setTimeout(() => {
    console.log('\n⚠️ Development server is taking longer than expected to start...');
    console.log('If this continues, try:');
    console.log('1. Checking network connectivity');
    console.log('2. Verifying port 8080 is available');
    console.log('3. Checking for errors in Vite configuration');
    console.log('4. Manually running "npx vite" in another terminal\n');
    
    // Add a secondary timeout for extended hanging
    setTimeout(() => {
      console.log('\n❌ Development server may be stuck. Possible causes:');
      console.log('- Port 8080 might be in use by another application');
      console.log('- Network interface binding issues');
      console.log('- Memory constraints');
      console.log('\nTrying to check port availability...');
      
      const checkPortProcess = runCommand('lsof', ['-i', ':8080']);
      
      // Don't exit, let the user decide what to do
      console.log('\nYou can press Ctrl+C to stop and try manually running:');
      console.log('PORT=8081 npx vite --host\n');
      
      // Provide a fallback option - try a different port
      console.log('Attempting to start on a different port (8081)...');
      runCommand('npx', ['vite', '--host', '0.0.0.0', '--port', '8081'], {
        env: { ...process.env, VITE_HOST: '0.0.0.0' }
      });
    }, 15000); // After 15 more seconds
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
  console.log('📱 Client: http://localhost:8080');
  console.log('🖥️ Server: Running on port 3001 or higher');
  console.log('Press Ctrl+C to stop');
}

// Start the development process
startDev().catch(err => {
  console.error('Failed to start development environment:', err);
  process.exit(1);
});
