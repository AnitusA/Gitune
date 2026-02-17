#!/bin/bash

# YouTube Audio Backend Startup Script

echo "🎵 Starting YouTube Audio Backend Server..."
echo "========================================"

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Not in backend-server directory. Please run from backend-server folder."
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env file and add your YouTube API key:"
    echo "   YOUTUBE_API_KEY=your_api_key_here"
    echo ""
    echo "   Get your API key from: https://console.cloud.google.com/"
    echo "   Enable YouTube Data API v3 in your project"
    echo ""
    read -p "Press Enter after you've updated the .env file..."
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if YouTube API key is set
if grep -q "your_youtube_api_key_here" .env; then
    echo "❌ Please set your YouTube API key in .env file first!"
    echo "   Edit .env and replace 'your_youtube_api_key_here' with your actual API key"
    exit 1
fi

echo "🚀 Starting server..."
echo ""
echo "Server will be available at:"
echo "  Local:    http://localhost:3001"
echo "  Health:   http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start in development mode
npm run dev