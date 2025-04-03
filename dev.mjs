
// Use ES modules syntax for Node.js
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to run a command
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

// Check if we need to build first
const shouldBuild = !existsSync(path.join(__dirname, 'dist', 'index.html'));

// Start the development environment
function startDev() {
  console.log('🚀 Starting development environment...');

  // Build the app if needed
  if (shouldBuild) {
    console.log('Building the application first...');
    
    // Use a direct command compatible with older Node.js versions
    const buildProcess = runCommand('node', ['./node_modules/vite/bin/vite.js', 'build']);
    
    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Build completed');
        startServers();
      } else {
        console.error(`❌ Build failed with code ${code}`);
        process.exit(1);
      }
    });
  } else {
    startServers();
  }

  function startServers() {
    // Start the backend server with older Node.js compatibility
    const serverProcess = runCommand('node', ['server.mjs']);

    // Start development server with a direct command to vite
    const clientProcess = runCommand('node', ['./node_modules/vite/bin/vite.js', '--port', '8080', '--host']);

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down development environment...');
      clientProcess.kill();
      serverProcess.kill();
      process.exit(0);
    });

    console.log('✅ Development environment running');
    console.log('📱 Client: http://localhost:8080');
    console.log('🖥️ Server is running (will auto-find an available port)');
    console.log('Press Ctrl+C to stop');
  }
}

// Start the development process
startDev();
