
#!/bin/bash

# Start everything script

# Build the application if needed
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
  echo "🏗️ Building the application..."
  npm run build
  
  if [ $? -ne 0 ]; then
    echo "❌ Build failed! Aborting."
    exit 1
  fi
  
  echo "✅ Build completed successfully"
fi

# Check if server.mjs is already running
if pgrep -f "node server.mjs" > /dev/null; then
  echo "🖥️ Server is already running"
else
  echo "🚀 Starting server..."
  node server.mjs &
  SERVER_PID=$!
  
  # Wait for server to start
  echo "⏳ Waiting for server to start..."
  sleep 3
fi

# Start the Vite development server
echo "🌐 Starting Vite development server..."
npm run dev

# Clean up when done
cleanup() {
  echo "🛑 Shutting down..."
  if [ ! -z "$SERVER_PID" ]; then
    kill $SERVER_PID
  fi
  # Kill any other running instances
  pkill -f "node server.mjs" || true
  exit 0
}

# Set up cleanup on exit
trap cleanup SIGINT SIGTERM

echo "✨ All services running. Press Ctrl+C to stop."
wait
