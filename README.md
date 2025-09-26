# M-Pesa Money Transfer Application

A full-stack web application built with React and Flask that simulates M-Pesa mobile money transfer functionality.

## Features

## Core Functionality
1. Send Money - Transfer funds to other users
2. Buy Airtime - Purchase mobile airtime
3. Pay Bills - Make payments to merchants
4. Withdraw Cash - Cash withdrawal simulation
5. Check Balance - View current account balance
6. Transaction History - View all past transactions

## Technical Features
1. User Authentication - Secure login/signup system
2. Contact Management - Add and manage contacts with nicknames
3. Account Management - Multiple account types (savings, checking, mobile money)
4. Real-time Balance Updates - Live balance tracking
5. Responsive Design - Mobile-friendly interface

## Architecture

## Backend (Flask)
1. Models: User, Transaction, Account, Contact
2. Relationships: 
   - One-to-many: User → Transactions, User → Accounts
   - Many-to-many: User ↔ User (Contacts with nickname attribute)
3. Full CRUD Operations on all resources
4. File-based JSON storage for simplicity
5. CORS enabled for frontend communication

## Frontend (React)
1. React Router for navigation (4 routes)
2. Formik + Yup for form validation
3. Modern UI with green/white theme
4. Component-based architecture
5. Responsive grid layouts



## Installation & Setup

### Prerequisites
1. Python 3.x
2. Node.js & npm
3. Flask

### Backend Setup
```bash
cd server
python app.py
```

### Frontend Setup
```bash
cd client
npm install
npm start
```

## Getting Started

1. Clone the repository
2. Start the backend: `cd server && python app.py`
3. Start the frontend: `cd client && npm start`
4. Open browser: Navigate to `http://localhost:3000`
5. Sign up for a new account
6. Explore all the M-Pesa features!

## Usage Examples

### Send Money
1. Enter recipient phone number
2. Enter amount to send
3. Click "Send" button
4. View updated balance

## Add Contacts
1. Go to Contacts page
2. Enter phone number and nickname
3. Contact appears in your list
4. Use delete button to remove

### View Transactions
1. Go to History page
2. See all sent transactions
3. Delete transactions if needed
4. Real-time updates

## Project Goals

This project demonstrates:
1. Full-stack web development skills
2. Database relationship modeling
3. RESTful API design
4. Modern React development
5. Form validation and UX
6. Responsive web design

## License

This project is for educational purposes and demonstrates modern web development practices.

## Author
 1. Collins Opiayo
 2. Mumtaza Mohamed
 