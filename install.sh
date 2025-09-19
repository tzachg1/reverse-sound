#!/bin/bash

# Sound Reverse App Installation Script

echo "🎵 Installing Sound Reverse App..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (version 16 or higher) first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    echo "   Please update Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
    echo ""
    echo "🚀 Starting development server..."
    echo "   The app will open in your browser at http://localhost:3000"
    echo ""
    echo "🎮 How to use:"
    echo "   1. Allow microphone access when prompted"
    echo "   2. Record your audio"
    echo "   3. Listen to it in reverse"
    echo "   4. Try to imitate it"
    echo "   5. See your score!"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    
    # Start development server
    npm run dev
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
