import { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from '../config';

function Dashboard({ user, onTransaction }) {
  const [balance, setBalance] = useState(user.balance);
  const [transactions, setTransactions] = useState([]);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const sendMoneyRef = useRef(null);
  const airtimeRef = useRef(null);
  const payRef = useRef(null);
  const withdrawRef = useRef(null);
  const transactionRef = useRef(null);

  const handleTransaction = async (type, amount, recipient = 'demo') => {
    if (amount <= 0) {
      setAlert({ type: "error", message: "Amount must be greater than 0" });
      return;
    }
    if (amount > balance) {
      setAlert({ type: "error", message: "Insufficient balance" });
      return;
    }

    try {
      const token = localStorage.getItem('moneygram_token');
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': token
        },
        body: JSON.stringify({
          amount: amount,
          recipient_phone: recipient,
          transaction_type: type.toLowerCase().replace(' ', '_'),
          notes: type
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setBalance(data.sender_balance);
        onTransaction(data.sender_balance);
        
        const newTransaction = {
          id: data.transaction.id,
          type,
          amount,
          date: new Date(data.transaction.created_at).toLocaleString(),
        };
        setTransactions([newTransaction, ...transactions]);
        setAlert({ type: "success", message: `Transaction completed successfully!` });
      } else {
        setAlert({ type: "error", message: data.error || 'Transaction failed' });
      }
    } catch (err) {
      setAlert({ type: "error", message: 'Failed to connect to server' });
    }

    setTimeout(() => setAlert({ type: "", message: "" }), 3000);
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('moneygram_token');
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'GET',
        headers: {
          'X-User-ID': token
        }
      });

      if (response.ok) {
        const data = await response.json();
        const allTransactions = [...data.sent, ...data.received].map((t, index) => ({
          id: index + 1,
          type: t.notes || 'Transaction',
          amount: t.amount,
          date: new Date(t.created_at || Date.now()).toLocaleString()
        }));
        setTransactions(allTransactions);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCheckBalance = () => {
    setAlert({ type: "success", message: `Your current balance is $${balance.toFixed(2)}` });
    setTimeout(() => setAlert({ type: "", message: "" }), 3000);
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-welcome">Welcome, {user.username}</h1>

      {alert.message && (
        <div className={`alert ${alert.type === "success" ? "alert-success" : "alert-error"}`}>
          {alert.message}
        </div>
      )}

      <p className="dashboard-balance">Balance: ${balance.toFixed(2)}</p>

      <div className="feature-grid">
        <div className="feature-card" onClick={() => scrollToSection(sendMoneyRef)}>💸<p>Send Money</p></div>
        <div className="feature-card" onClick={() => scrollToSection(airtimeRef)}>📱<p>Buy Airtime</p></div>
        <div className="feature-card" onClick={() => scrollToSection(payRef)}>💳<p>Pay</p></div>
        <div className="feature-card" onClick={() => scrollToSection(withdrawRef)}>🏧<p>Withdraw Cash</p></div>
        <div className="feature-card" onClick={handleCheckBalance}>💰<p>Check Balance</p></div>
        <div className="feature-card" onClick={() => scrollToSection(transactionRef)}>📜<p>Transaction History</p></div>
      </div>

      {/* --- Send Money --- */}
      <div ref={sendMoneyRef} className="send-money-form">
        <h3>Send Money</h3>
        <input type="text" placeholder="Recipient Phone" id="recipientPhone" />
        <input type="number" placeholder="Amount" id="sendMoneyAmount" />
        <button
          className="button"
          onClick={() => {
            const amount = parseFloat(document.getElementById("sendMoneyAmount").value);
            const recipient = document.getElementById("recipientPhone").value || 'demo';
            handleTransaction("Send Money", amount, recipient);
          }}
        >
          Send
        </button>
      </div>

      {/* --- Buy Airtime --- */}
      <div ref={airtimeRef} className="airtime-demo">
        <h3>Buy Airtime</h3>
        <input type="text" placeholder="Phone Number" />
        <input type="number" placeholder="Amount" id="airtimeAmount" />
        <button
          className="button"
          onClick={() => {
            const amount = parseFloat(document.getElementById("airtimeAmount").value);
            handleTransaction("Buy Airtime", amount);
          }}
        >
          Buy
        </button>
      </div>

      {/* --- Pay --- */}
      <div ref={payRef} className="airtime-demo">
        <h3>Pay</h3>
        <input type="text" placeholder="Recipient / Merchant" />
        <input type="number" placeholder="Amount" id="payAmount" />
        <button
          className="button"
          onClick={() => {
            const amount = parseFloat(document.getElementById("payAmount").value);
            handleTransaction("Pay", amount);
          }}
        >
          Pay
        </button>
      </div>

      {/* --- Withdraw Cash --- */}
      <div ref={withdrawRef} className="send-money-form">
        <h3>Withdraw Cash</h3>
        <input type="number" placeholder="Amount" id="withdrawAmount" />
        <button
          className="button"
          onClick={() => {
            const amount = parseFloat(document.getElementById("withdrawAmount").value);
            handleTransaction("Withdraw Cash", amount);
          }}
        >
          Withdraw
        </button>
      </div>

      {/* --- Transaction History --- */}
      <div ref={transactionRef} className="transaction-history-demo">
        <h3>Transaction History</h3>
        {transactions.length === 0 && <p>No transactions yet.</p>}
        {transactions.map((t) => (
          <div
            key={t.id}
            className={`transaction-item ${
              t.type === "Send Money" || t.type === "Pay" || t.type === "Buy Airtime" || t.type === "Withdraw Cash"
                ? "sent-item"
                : "received-item"
            }`}
          >
            <p><strong>{t.type}:</strong> ${t.amount.toFixed(2)}</p>
            <p>{t.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;