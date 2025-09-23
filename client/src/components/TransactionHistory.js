import React, { useState, useEffect } from 'react';
import './style.css';

const TransactionHistory = ({ user }) => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (user) {
      fetch('/transactions')
        .then(res => res.json())
        .then(data => {
          // Combine sent and received transactions and sort by date
          const allTransactions = [...data.sent, ...data.received].sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );
          setTransactions(allTransactions);
        });
    }
    //..transanctionHistory
  }, [user]);

  if (!user) {
    return (
      <div className="container">
        <div className="card">
          <h2>Please log in to view your transaction history.</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Transaction History</h2>
      <ul className="transaction-list">
        {transactions.map(t => (
          <li key={t.id} className={`transaction-item ${t.sender_id === user.id ? 'sent' : 'received'}`}>
            <div className="transaction-details">
              <strong>{t.sender_id === user.id ? 'Sent' : 'Received'}</strong>
              <p>Amount: ${t.amount.toFixed(2)}</p>
              <p>{t.notes ? `Notes: ${t.notes}` : ''}</p>
            </div>
            <div>
              <small>{new Date(t.timestamp).toLocaleString()}</small>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionHistory;