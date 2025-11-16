#!/bin/bash
# Quick start script for Comic Strip Browser To-Go

echo "Starting Comic Strip Browser To-Go..."
echo "======================================="
echo ""
echo "The proxy server will start on http://localhost:8000"
echo "Your browser should open automatically."
echo ""
echo "Press Ctrl+C to stop the server."
echo ""

# Start the proxy server
python3 proxy-server.py &
SERVER_PID=$!

# Wait a moment for server to start
sleep 2

# Open browser
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:8000/index.html
elif command -v open > /dev/null; then
    open http://localhost:8000/index.html
else
    echo "Please open http://localhost:8000/index.html in your browser"
fi

# Wait for server process
wait $SERVER_PID
