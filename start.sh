
#!/bin/bash

# Start script for development environment

# Pull the latest updates from git
echo "🔄 Pulling latest updates from git..."
git pull

# Check if .env file exists
if [ ! -f ".env" ]; then
  echo "⚠️ .env file doesn't exist. Creating a sample one..."
  cat > .env << EOF
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/fsh
VITE_MONGODB_URI=mongodb://localhost:27017/fsh

# Application Settings
PORT=3001
NODE_ENV=development
EOF
  echo "✅ Created .env file with sample values. Please edit it with your actual values."
else
  echo "✅ .env file exists"
fi

# Install dependencies if node_modules doesn't exist or is empty
if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "📦 Installing dependencies..."
  npm install
  
  if [ $? -ne 0 ]; then
    echo "❌ Dependency installation failed! Aborting."
    exit 1
  fi
  
  echo "✅ Dependencies installed successfully"
else
  echo "✅ Dependencies already installed"
fi

# Build the application if needed
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
  echo "🏗️ Building the application..."
  npm run build
  
  if [ $? -ne 0 ]; then
    echo "❌ Build failed! Aborting."
    exit 1
  fi
  
  echo "✅ Build completed successfully"
else
  echo "✅ Build already exists"
fi

# Check if server.mjs is already running
if pgrep -f "node server.mjs" > /dev/null; then
  echo "🖥️ Server is already running"
else
  echo "🚀 Starting server..."
  node server.mjs 2>&1 | tee server-log.txt &
  SERVER_PID=$!
  
  # Wait for server to start
  echo "⏳ Waiting for server to start..."
  sleep 3
fi

# Start the development environment using dev.mjs instead of npm run dev
echo "🌐 Starting development environment..."
node dev.mjs 2>&1 | tee dev-log.txt

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
echo "📝 Logs are being saved to server-log.txt and dev-log.txt"
wait
