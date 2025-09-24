import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

const Dashboard = ({ user }) => {
  if (!user) {
    return null; // The App.js handles navigation for unauthenticated users
  }

  return (
    <div className="container">
      <div className="card">
        <div className="dashboard-welcome">
          <h2>Welcome, {user.username}!</h2>
        </div>
        <div className="dashboard-balance-card">
          <div className="dashboard-balance-label">Your Balance</div>
          <div className="dashboard-balance">
            ${user.balance ? user.balance.toFixed(2) : '0.00'}
          </div>
        </div>
        <div className="dashboard-actions">
          <Link to="/send" className="action-button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
            <span>Send Money</span>
          </Link>
          <Link to="/history" className="action-button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <span>History</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
