import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import Login from './pages/Login';
import Register from './pages/Register';
import { getToken, removeToken } from './services/auth';

const App: React.FC = () => {
  console.log('TypeScriptファイル(index.tsx)が実行されました！');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = getToken();
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogout = (): void => {
    removeToken();
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<EventList />} />
        <Route
          path="/events/:eventId"
          element={
            isAuthenticated ? <EventDetail /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/events/create"
          element={
            isAuthenticated ? <CreateEvent /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <Login onLoginSuccess={() => setIsAuthenticated(true)} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/register"
          element={
            !isAuthenticated ? (
              <Register onRegisterSuccess={() => setIsAuthenticated(true)} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </div>
  );
};

export default App;
