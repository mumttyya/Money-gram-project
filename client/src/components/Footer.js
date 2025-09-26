import { useState } from "react";
import "../App.css";
import "./Footer.css";

function Footer() {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <footer className="modern-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h3>MoneyGram</h3>
          <p>Your trusted digital wallet</p>
        </div>
        
        <div className="footer-links">
          <div className="footer-section">
            <h4>Services</h4>
            <ul>
              <li>Send Money</li>
              <li>Buy Airtime</li>
              <li>Pay Bills</li>
              <li>Withdraw Cash</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li onClick={() => toggleSection("contact")} className="clickable">Contact Us</li>
              <li onClick={() => toggleSection("about")} className="clickable">About Us</li>
              <li>Help Center</li>
              <li>Security</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Connect</h4>
            <ul>
              <li>support@moneygram.com</li>
              <li>+254 700 000 000</li>
              <li>Nairobi, Kenya</li>
            </ul>
          </div>
        </div>
      </div>
      
      {openSection === "contact" && (
        <div className="footer-expand">
          <div className="expand-content">
            <h3>Contact Us</h3>
            <div className="contact-grid">
              <div className="contact-item">
                <strong>Email</strong>
                <p>support@moneygram.com</p>
              </div>
              <div className="contact-item">
                <strong>Phone</strong>
                <p>+254 700 000 000</p>
              </div>
              <div className="contact-item">
                <strong>Address</strong>
                <p>123 Finance Street, Nairobi, Kenya</p>
              </div>
              <div className="contact-item">
                <strong>Hours</strong>
                <p>24/7 Customer Support</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {openSection === "about" && (
        <div className="footer-expand">
          <div className="expand-content">
            <h3>About MoneyGram</h3>
            <p>
              MoneyGram is a leading digital financial platform that enables secure and instant money transfers, 
              bill payments, and mobile services across Kenya and beyond.
            </p>
            <div className="about-features">
              <div className="feature-item">Secure Transactions</div>
              <div className="feature-item">Instant Transfers</div>
              <div className="feature-item">Mobile First</div>
              <div className="feature-item">Global Reach</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="footer-bottom">
        <p>&copy; 2024 MoneyGram. All rights reserved. | Privacy Policy | Terms of Service</p>
      </div>
    </footer>
  );
}

export default Footer;