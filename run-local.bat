@echo off
echo ========================================
echo   CatatDuit AI - Local Development
echo ========================================
echo.

cd frontend-web

echo [1/3] Checking .env.local...
if not exist .env.local (
    echo ERROR: .env.local not found!
    echo Please edit frontend-web/.env.local with your credentials
    pause
    exit /b 1
)

echo [2/3] Installing dependencies...
call npm install

echo [3/3] Starting development server...
echo.
echo Server will run at: http://localhost:3000
echo.
echo NEXT STEPS:
echo 1. Open new terminal and run: ngrok http 3000
echo 2. Copy ngrok URL (e.g., https://abc123.ngrok.io)
echo 3. Update Telegram webhook with that URL
echo.
echo Press Ctrl+C to stop server
echo.

call npm run dev
