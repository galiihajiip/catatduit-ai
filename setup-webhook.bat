@echo off
echo ========================================
echo   Setup Telegram Webhook
echo ========================================
echo.

set /p BOT_TOKEN="Enter your Telegram Bot Token: "
set /p NGROK_URL="Enter your Ngrok URL (e.g., https://abc123.ngrok.io): "

echo.
echo Setting webhook to: %NGROK_URL%/api/telegram/webhook
echo.

curl -X POST "https://api.telegram.org/bot%BOT_TOKEN%/setWebhook?url=%NGROK_URL%/api/telegram/webhook"

echo.
echo.
echo Done! Test by uploading a receipt to your Telegram bot.
echo.
pause
