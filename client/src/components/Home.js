import React from 'react';
import { Link } from './Router';

const Home = () => {
    return (
        <div className="home-container">
            <h1>Welcome to Moneygram</h1>
            <p>The fast, secure, and easy way to send and receive money. Get started in seconds.</p>
            <div className="home-buttons">
                <Link to="/login" className="btn btn-primary">Login</Link>
                <Link to="/signup" className="btn btn-secondary">Sign Up</Link>
            </div>
        </div>
    );
}

export default Home;
