#!/bin/bash

echo " Starting M-Pesa Project with Full Requirements..."

# Start new backend server
echo " Starting Flask backend with SQLAlchemy..."
cd server
python3 app_new.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo " Starting React frontend..."
cd ../client
npm start &
FRONTEND_PID=$!

echo " Project started!"
echo "Frontend: http://localhost:3000"
echo " Backend: http://localhost:5000"
echo ""
echo "Features:"
echo "- 3 Models: User, Transaction, Account, UserContact"
echo "- One-to-many: User->Transactions, User->Accounts"
echo "- Many-to-many: User<->User (Contacts) with nickname attribute"
echo "- Full CRUD on all resources"
echo "- Formik validation on all forms"
echo "- 4 client routes: Dashboard, Contacts, Accounts, Transactions"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait $FRONTEND_PID $BACKEND_PID