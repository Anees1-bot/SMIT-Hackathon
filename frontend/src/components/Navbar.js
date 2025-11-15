import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


function Navbar() {
  const { isAuthenticated, userName, logout } = useAuth();
  return (
    <header className="navbar">
      {/* Logo Left */}
      <div className="logo">
        <h2>COMMUNITY APP</h2>
      </div>

      {/* Center Nav */}
      <nav className="nav-center">
        <ul className="nav-list">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/leaderboard">Leaderboard</Link></li>
          <li><Link to="/create-post">Create Post</Link></li>
        </ul>
      </nav>

      {/* Right Nav */}
      <nav className="nav-right">
        <ul className="nav-list">
          {isAuthenticated ? (
            <>
              <li style={{ opacity: 0.8 }}>{userName ? `Hi, ${userName}` : 'Logged in'}</li>
              <li><button onClick={logout}>Logout</button></li>
              <li><Link to="/profile">Profile</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/signup">Signup</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;
