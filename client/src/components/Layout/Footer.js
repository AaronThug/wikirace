import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; {year} WikiRace. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;