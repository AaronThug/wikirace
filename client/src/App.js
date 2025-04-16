import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Home from './components/Home/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import GamePage from './components/Game/GamePage';
import UserProfile from './components/Profile/UserProfile';
import PublicProfile from './components/Profile/PublicProfile';
import Leaderboard from './components/Leaderboard/Leaderboard';
import UserSearch from './components/Search/UserSearch';
import NotFound from './components/Layout/NotFound';

// Context
import { AuthProvider } from './context/AuthContext';

// Utilities
import PrivateRoute from './components/Routing/PrivateRoute';

const App = () => {
  return (
    <AuthProvider>
      <div className="app">
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/game" 
              element={
                <PrivateRoute>
                  <GamePage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <UserProfile />
                </PrivateRoute>
              } 
            />
            <Route path="/profile/:username" element={<PublicProfile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/search" element={<UserSearch />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;