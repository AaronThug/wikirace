import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, loading, logout, loadUser, token } = useContext(AuthContext);

  useEffect(() => {
    if (token && !user && !loading) {
      loadUser();
    }
  }, [token, user, loading, loadUser]);

  const authLinks = (
    <ul className="navbar-nav">
      <li className="navbar-item">
        <Link to="/game" className="navbar-link">Play Game</Link>
      </li>
      <li className="navbar-item">
        <Link to="/leaderboard" className="navbar-link">Leaderboard</Link>
      </li>
      <li className="navbar-item">
        <Link to="/search" className="navbar-link">Search</Link>
      </li>
      <li className="navbar-item">
        <Link to="/profile" className="navbar-link">Profile</Link>
      </li>
      <li className="navbar-item">
        <a href="#!" onClick={logout} className="navbar-link">
          Logout
        </a>
      </li>
    </ul>
  );

  const guestLinks = (
    <ul className="navbar-nav">
      <li className="navbar-item">
        <Link to="/leaderboard" className="navbar-link">Leaderboard</Link>
      </li>
      <li className="navbar-item">
        <Link to="/login" className="navbar-link">Login</Link>
      </li>
      <li className="navbar-item">
        <Link to="/register" className="navbar-link">Register</Link>
      </li>
    </ul>
  );

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          WikiRace
        </Link>
        {!loading && (isAuthenticated ? authLinks : guestLinks)}
      </div>
    </nav>
  );
};

export default Navbar;