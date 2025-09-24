import React, { useState, useEffect } from 'react';
import './style.css';

const API_BASE_URL = 'http://127.0.0.1:5555';

const TransactionHistory = ({ user }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`${API_BASE_URL}/transactions`)
        .then(res => res.json())
        .then(data => {
          const allTransactions = [
            ...data.sent.map(t => ({ ...t, type: 'sent' })),
            ...data.received.map(t => ({ ...t, type: 'received' }))
          ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setTransactions(allTransactions);
        })
        .catch(error => console.error("Failed to fetch transactions:", error))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <div className="container"><p>Loading history...</p></div>;
  }

  if (!user) {
    return null; // App.js handles navigation
  }

  return (
    <div className="container">
      <div className="transaction-list-container">
        <h2>Transaction History</h2>
        {transactions.length > 0 ? (
          <ul className="transaction-list">
            {transactions.map(t => (
              <li key={`${t.type}-${t.id}`} className={`transaction-item ${t.type}`}>
                <div className="details">
                  <div className="icon">
                    {t.type === 'sent' ?
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                      </svg> :
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                      </svg>
                    }
                  </div>
                  <div className="transaction-details">
                    <strong>{t.type === 'sent' ? 'Sent' : 'Received'}</strong>
                    {t.notes && <p>{t.notes}</p>}
                  </div>
                </div>
                <div className="transaction-amount-time">
                  <div className={`transaction-amount ${t.type}`}>
                    {t.type === 'sent' ? '-' : '+'}${t.amount.toFixed(2)}
                  </div>
                  <small>{new Date(t.timestamp).toLocaleString()}</small>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-transactions">You have no transactions yet.</p>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
