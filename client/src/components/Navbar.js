import React from 'react';
import { NavLink } from 'react-router-dom';
import './style.css';

const API_BASE_URL = 'http://127.0.0.1:5555';

const Navbar = ({ user, setUser }) => {
  const handleLogout = () => {
    fetch(`${API_BASE_URL}/logout`, { method: 'POST' }).then(() => {
      setUser(null);
    });
  };

  return (
    <nav className="navbar">
      <h1>Moneygram</h1>
      <div className="navbar-links">
        {user ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/send">Send Money</NavLink>
            <NavLink to="/history">History</NavLink>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/signup">Signup</NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
