@echo off
REM Quick start script for Comic Strip Browser To-Go (Windows)

echo Starting Comic Strip Browser To-Go...
echo =======================================
echo.
echo The proxy server will start on http://localhost:8000
echo Your browser should open automatically.
echo.
echo Press Ctrl+C to stop the server.
echo.

REM Start the proxy server
start /B python proxy-server.py

REM Wait a moment for server to start
timeout /t 2 /nobreak >nul

REM Open browser
start http://localhost:8000/index.html

REM Keep window open
pause
