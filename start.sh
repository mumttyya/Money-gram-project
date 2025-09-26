#!/bin/bash

echo " Starting M-Pesa Money Transfer Application..."

# Start backend
echo " Starting Flask backend..."
cd backend
python3 app.py &
BACKEND_PID=$!

sleep 3

# Start frontend
echo " Starting React frontend..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "Application started!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop both servers"

wait $FRONTEND_PID $BACKEND_PID