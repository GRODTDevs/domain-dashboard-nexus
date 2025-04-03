
// Use CommonJS syntax since this is running in an older Node.js environment
const { spawn } = require('child_process');

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
// Using npx with the --no-install flag to avoid using top-level await
const clientProcess = runCommand('npx', ['--no-install', 'vite', '--port', '8080']);

// Start the backend server with Node.js using the --require flag to support CommonJS
const serverProcess = runCommand('node', ['--require=./server-commonjs.js']);

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
