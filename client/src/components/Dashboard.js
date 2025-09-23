import React from 'react';
import './style.css';

const Dashboard = ({ user }) => {
  if (!user) {
    return (
      <div className="container">
        <div className="card">
          <h2>Please log in to view your dashboard.</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Welcome, {user.username}!</h2>
        <div className="dashboard-balance">
          ${user.balance.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;