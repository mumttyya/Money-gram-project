import { useState } from "react";
import "../App.css";

function Footer() {
  const [showContact, setShowContact] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const toggleContact = () => {
    setShowContact(!showContact);
    if (showAbout) setShowAbout(false);
  };

  const toggleAbout = () => {
    setShowAbout(!showAbout);
    if (showContact) setShowContact(false);
  };

  return (
    <footer className="footer">
      <h3>MoneyGram</h3>
      <div className="footer-links">
        <a href="#!" onClick={toggleContact}>Contact Us</a>
        <a href="#!" onClick={toggleAbout}>About Us</a>
      </div>

      {/* Contact Us Panel */}
      <div className={`footer-panel ${showContact ? "show" : ""}`}>
        <h4>Contact Us</h4>
        <p>Email: support@moneygram.com</p>
        <p>Phone: +254 700 000 000</p>
        <p>Address: Nairobi, Kenya</p>
      </div>

      {/* About Us Panel */}
      <div className={`footer-panel ${showAbout ? "show" : ""}`}>
        <h4>About Us</h4>
        <p>
            MoneyGram is a fully interactive app to simulate sending
            money, buying airtime, paying bills, withdrawing cash, and checking balances.
          </p>
          <p>Our mission is to provide a simple and fun way to explore digital finance!</p>
      </div>
    </footer>
  );
}

export default Footer;
