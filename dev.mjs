
// Use ES modules syntax for Node.js
import { spawn } from 'child_process';

// Function to run a command
function runCommand(command, args, options = {}) {
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

// Start both server and client
console.log('🚀 Starting development environment...');

// Start the backend server with older Node.js compatibility
const serverProcess = runCommand('node', ['server.mjs']);

// Use a more compatible approach to start Vite
// Instead of using npx directly, which might use newer syntax
const clientProcess = runCommand('node', [
  './node_modules/vite/bin/vite.js',
  '--port',
  '8080'
], {
  env: {
    ...process.env,
    NODE_OPTIONS: '--no-experimental-fetch'  // Disable experimental features
  }
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
console.log('🖥️ Server is running (will auto-find an available port)');
console.log('Press Ctrl+C to stop');
