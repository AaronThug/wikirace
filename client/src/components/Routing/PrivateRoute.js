import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, loadUser, token } = useContext(AuthContext);

  useEffect(() => {
    // Load user if token exists but user not loaded
    if (token && !isAuthenticated && !loading) {
      loadUser();
    }
  }, [token, isAuthenticated, loading, loadUser]);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;