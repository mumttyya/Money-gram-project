import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Signup from './components/Signup';
import SendMoney from './components/SendMoney';
import TransactionHistory from './components/TransactionHistory';

const API_BASE_URL = 'http://127.0.0.1:5555';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for a logged-in user session on component mount
    fetch(`${API_BASE_URL}/check_session`).then((r) => {
      setLoading(false);
      if (r.ok) {
        r.json().then(setUser);
      }
    });
  }, []);

  const handleTransaction = (newBalance) => {
    setUser(currentUser => ({ ...currentUser, balance: newBalance }));
  };

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar user={user} setUser={setUser} />
        <main className="content-container">
          <Routes>
            <Route path="/" element={user ? <Dashboard user={user} setUser={setUser}/> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={user ? <Dashboard user={user} setUser={setUser}/> : <Navigate to="/login" />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />} />
            <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup setUser={setUser} />} />
            <Route path="/send" element={user ? <SendMoney user={user} onTransaction={handleTransaction} /> : <Navigate to="/login" />} />
            <Route path="/history" element={user ? <TransactionHistory user={user} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
