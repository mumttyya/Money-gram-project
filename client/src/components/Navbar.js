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
          <button onClick={onLogout} className="button logout-button">Log Out</button>
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