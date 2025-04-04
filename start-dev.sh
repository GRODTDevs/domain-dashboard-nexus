
#!/bin/bash

# Display a welcome message
echo "🚀 Starting development environment setup..."

# Delete build cache directories
echo "🧹 Cleaning build cache..."
rm -rf dist .cache
echo "✅ Build cache cleaned"

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
  echo "❌ Dependency installation failed!"
  exit 1
fi
echo "✅ Dependencies installed successfully"

# Build the application
echo "🏗️ Building the application..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi
echo "✅ Build completed successfully"

# Start the development server
echo "💻 Starting development server..."
npm run dev

