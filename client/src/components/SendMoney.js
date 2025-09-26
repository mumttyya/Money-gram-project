import React, { useState } from 'react';

const API_BASE_URL = 'http://127.0.0.1:5000'; // Flask backend is on port 5000

function SendMoney({ onTransaction }) {
  const [recipientPhone, setRecipientPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem('moneygram_token');
    if (!userId) {
      setMessage('You must be logged in.');
      setIsSuccess(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/send_money`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId, // custom header for backend
        },
        body: JSON.stringify({
          recipient_phone: recipientPhone,
          amount: parseFloat(amount), // ensure number
          notes: '',
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Money sent successfully!');
        setIsSuccess(true);
        setRecipientPhone('');
        setAmount('');
        if (onTransaction) {
          onTransaction(data.sender_balance);
        }
      } else {
        setMessage(data.error || 'Transaction failed.');
        setIsSuccess(false);
      }
    } catch (err) {
      console.error('Send money error:', err);
      setMessage('Failed to connect to server.');
      setIsSuccess(false);
    }
  };

  return (
    <div className="send-money-form">
      <h3>Send Money</h3>
      {message && (
        <div className={isSuccess ? 'alert-success' : 'alert-error'}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Recipient Phone"
          value={recipientPhone}
          onChange={(e) => setRecipientPhone(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <button type="submit" className="button primary-button">Send</button>
      </form>
    </div>
  );
}

export default SendMoney;
