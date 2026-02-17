@echo off
echo 🎵 Starting YouTube Audio Backend Server...
echo ========================================

REM Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist package.json (
    echo ❌ Not in backend-server directory. Please run from backend-server folder.
    pause
    exit /b 1
)

REM Check if .env exists
if not exist .env (
    echo ⚠️  .env file not found. Creating from template...
    copy .env.example .env
    echo 📝 Please edit .env file and add your YouTube API key:
    echo    YOUTUBE_API_KEY=your_api_key_here
    echo.
    echo    Get your API key from: https://console.cloud.google.com/
    echo    Enable YouTube Data API v3 in your project
    echo.
    pause
)

REM Install dependencies if needed
if not exist node_modules (
    echo 📦 Installing dependencies...
    npm install
)

REM Check if YouTube API key is set
findstr "your_youtube_api_key_here" .env >nul
if %ERRORLEVEL% EQU 0 (
    echo ❌ Please set your YouTube API key in .env file first!
    echo    Edit .env and replace 'your_youtube_api_key_here' with your actual API key
    pause
    exit /b 1
)

echo 🚀 Starting server...
echo.
echo Server will be available at:
echo   Local:    http://localhost:3001
echo   Health:   http://localhost:3001/health
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start in development mode
npm run dev