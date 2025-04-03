
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

// Start the Vite dev server for the client
const clientProcess = runCommand('npm', ['run', 'dev']);

// Start the backend server with nodemon for auto-restart
const serverProcess = runCommand('node', ['server.js']);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development environment...');
  clientProcess.kill();
  serverProcess.kill();
  process.exit(0);
});

console.log('✅ Development environment running');
console.log('📱 Client: http://localhost:8080');
console.log('🖥️ Server is running');
console.log('Press Ctrl+C to stop');
