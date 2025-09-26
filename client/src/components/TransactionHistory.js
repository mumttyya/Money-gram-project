import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import Notification from './Notification';
import './style.css';

function TransactionHistory() {
  const [transactions, setTransactions] = useState({ sent: [], received: [] });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('moneygram_token');
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        headers: {
          'X-User-ID': token
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (transactionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setNotification({ message: 'Transaction deleted successfully!', type: 'success' });
        fetchTransactions();
      } else {
        setNotification({ message: 'Failed to delete transaction', type: 'error' });
      }
    } catch (err) {
      setNotification({ message: 'Failed to connect to server', type: 'error' });
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  if (loading) {
    return <div className="dashboard-container">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      {notification.message && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification({ message: '', type: '' })} 
        />
      )}
      <h2 className="dashboard-welcome">Transaction History</h2>
      
      <div className="transaction-history-demo">
        <h3>Sent Transactions ({transactions.sent.length})</h3>
        {transactions.sent.length === 0 ? (
          <p>No sent transactions found.</p>
        ) : (
          transactions.sent.map(transaction => (
            <div key={transaction.id} className="transaction-item sent-item">
              <p><strong>Amount:</strong> ${transaction.amount}</p>
              <p><strong>Type:</strong> {transaction.transaction_type}</p>
              <p><strong>To:</strong> {transaction.recipient_name}</p>
              <p><strong>Date:</strong> {new Date(transaction.created_at).toLocaleString()}</p>
              <p><strong>Notes:</strong> {transaction.notes}</p>
              <button 
                className="button delete-button"
                onClick={() => deleteTransaction(transaction.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      <div className="transaction-history-demo">
        <h3>Received Transactions ({transactions.received.length})</h3>
        {transactions.received.length === 0 ? (
          <p>No received transactions found.</p>
        ) : (
          transactions.received.map(transaction => (
            <div key={transaction.id} className="transaction-item received-item">
              <p><strong>Amount:</strong> ${transaction.amount}</p>
              <p><strong>Type:</strong> {transaction.transaction_type}</p>
              <p><strong>From:</strong> {transaction.sender_name}</p>
              <p><strong>Date:</strong> {new Date(transaction.created_at).toLocaleString()}</p>
              <p><strong>Notes:</strong> {transaction.notes}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TransactionHistory;