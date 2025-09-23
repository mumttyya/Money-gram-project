import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Signup from './components/Signup';
import SendMoney from './components/SendMoney'; // New import
import TransactionHistory from './components/TransactionHistory'; // New import


function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/check_session').then((r) => {
      if (r.ok) {
        r.json().then(setUser);
      }
    });
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        <Navbar user={user} setUser={setUser} />
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} />
          {/* New Routes */}
          <Route path="/send" element={<SendMoney user={user} />} />
          <Route path="/history" element={<TransactionHistory user={user} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;