import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">Moneygram</Link>
      </div>
      <div className="navbar-right">
        {user ? (
          <>
            <Link to="/" className="button">Dashboard</Link>
            <Link to="/contacts" className="button">Contacts</Link>
            <Link to="/accounts" className="button">Accounts</Link>
            <Link to="/transactions" className="button">History</Link>
            <button onClick={onLogout} className="button logout-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="button nav-button">Log In</Link>
            <Link to="/signup" className="button nav-button">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;