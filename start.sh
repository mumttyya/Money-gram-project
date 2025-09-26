#!/bin/bash

echo " Starting Money-gram Project..."

# Start backend server
echo " Starting Flask backend..."
cd server
python3 simple_app.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo " Starting React frontend..."
cd ../client
npm start &
FRONTEND_PID=$!

echo " Project started!"
echo " Frontend: http://localhost:3000"
echo " Backend: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait $FRONTEND_PID $BACKEND_PID