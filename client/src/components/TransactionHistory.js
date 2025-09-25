import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:5555';

function TransactionHistory() {
  const [transactions, setTransactions] = useState({ sent: [], received: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sent');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const userId = localStorage.getItem('moneygram_token');
        if (!userId) return;

        const response = await fetch(`${API_BASE_URL}/transactions`, {
          headers: { 'X-User-ID': userId },
        });

        if (response.ok) {
          const data = await response.json();
          setTransactions(data);
        }
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString();

  if (loading) return <p className="loading-history">Loading transactions...</p>;

  const renderTransactions = (list, type) => {
    if (list.length === 0) return <p className="no-transactions">No {type} transactions found.</p>;

    return list.map((t) => (
      <div key={t.id} className={`transaction-item ${type}-item`}>
        <div className="transaction-details">
          <span>
            {type === 'sent' ? `Sent to: ${t.recipient_username || t.recipient_id}` : `Received from: ${t.sender_username || t.sender_id}`}
          </span>
          <span className={type === 'sent' ? 'sent-amount' : 'received-amount'}>
            {type === 'sent' ? `-${t.amount.toFixed(2)}` : `+${t.amount.toFixed(2)}`}
          </span>
        </div>
        <p className="transaction-date">{formatTimestamp(t.timestamp)}</p>
        {t.notes && <p className="transaction-notes">Notes: {t.notes}</p>}
      </div>
    ));
  };

  return (
    <div className="history-container">
      <h2 className="history-title">Transaction History</h2>
      <div className="tabs">
        <button
          className={activeTab === 'sent' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('sent')}
        >
          Sent
        </button>
        <button
          className={activeTab === 'received' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('received')}
        >
          Received
        </button>
      </div>
      <div className="transaction-list">
        {activeTab === 'sent' ? renderTransactions(transactions.sent, 'sent') : renderTransactions(transactions.received, 'received')}
      </div>
    </div>
  );
}

export default TransactionHistory;
