import { useState } from "react";
import "../App.css";

function Footer() {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <footer className="footer-container">
      <div className="footer">
        <button onClick={() => toggleSection("contact")} className="footer-link">
          Contact Us
        </button>
        <span> | </span>
        <button onClick={() => toggleSection("about")} className="footer-link">
          About Us
        </button>
      </div>

      {openSection === "contact" && (
        <div className="footer-expand">
          <h3>Contact Us</h3>
          <p>Email: support@moneygramdemo.com</p>
          <p>Phone: +254 700 000 000</p>
          <p>Address: 123 Demo Street, Nairobi, Kenya</p>
        </div>
      )}

      {openSection === "about" && (
        <div className="footer-expand">
          <h3>About Us</h3>
          <p>
            MoneyGram is a fully interactive app to simulate sending
            money, buying airtime, paying bills, withdrawing cash, and checking balances.
          </p>
          <p>Our mission is to provide a simple and fun way to explore digital finance!</p>
        </div>
      )}
    </footer>
  );
}

export default Footer;