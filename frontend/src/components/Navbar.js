import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


function Navbar() {
  const { isAuthenticated, userName, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMobileMenu();
  };

  return (
    <header className="navbar">
      {/* Logo Left */}
      <div className="logo">
        <h2>COMMUNITY APP</h2>
      </div>

      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle" 
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Center Nav */}
      <nav className={`nav-center ${isMobileMenuOpen ? 'active' : ''}`}>
        <ul className="nav-list">
          <li><Link to="/" onClick={closeMobileMenu}>Home</Link></li>
          <li><Link to="/leaderboard" onClick={closeMobileMenu}>Leaderboard</Link></li>
          <li><Link to="/create-post" onClick={closeMobileMenu}>Create Post</Link></li>
        </ul>
      </nav>

      {/* Right Nav */}
      <nav className={`nav-right ${isMobileMenuOpen ? 'active' : ''}`}>
        <ul className="nav-list">
          {isAuthenticated ? (
            <>
              <li style={{ opacity: 0.8 }}>{userName ? `Hi, ${userName}` : 'Logged in'}</li>
              <li><button onClick={handleLogout}>Logout</button></li>
              <li><Link to="/profile" onClick={closeMobileMenu}>Profile</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/login" onClick={closeMobileMenu}>Login</Link></li>
              <li><Link to="/signup" onClick={closeMobileMenu}>Signup</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;
