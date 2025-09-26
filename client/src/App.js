import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Signup from './components/Signup';
import Contacts from './components/Contacts';
import Accounts from './components/Accounts';
import TransactionHistory from './components/TransactionHistory';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  // Handle login and save user info to localStorage
  const handleLogin = (loggedInUser, token) => {
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    localStorage.setItem('moneygram_token', token);
  };

  // Update balance after transactions
  const handleTransaction = (newBalance) => {
    if (!user) return;
    const updatedUser = { ...user, balance: newBalance };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('moneygram_token');
  };

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="app-container">
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Dashboard user={user} onTransaction={handleTransaction} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/" /> : <Signup onLogin={handleLogin} />}
          />
          <Route
            path="/contacts"
            element={user ? <Contacts /> : <Navigate to="/login" />}
          />
          <Route
            path="/accounts"
            element={user ? <Accounts /> : <Navigate to="/login" />}
          />
          <Route
            path="/transactions"
            element={user ? <TransactionHistory /> : <Navigate to="/login" />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      {/* Footer */}
      <Footer />
    </BrowserRouter>
  );
}

export default App;