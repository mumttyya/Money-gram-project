import React from 'react';
import { NavLink } from 'react-router-dom';
import './style.css';

const Navbar = ({ user, setUser }) => {
  const handleLogout = () => {
    fetch('/logout', { method: 'DELETE' }).then(() => {
      setUser(null);
    });
  };

  return (
    <nav className="navbar">
      <h1>Moneygram</h1>
      <div className="navbar-links">
        <NavLink to="/">Dashboard</NavLink>
        {user ? (
          <>
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