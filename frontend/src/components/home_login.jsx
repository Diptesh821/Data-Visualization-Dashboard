// src/components/AuthenticatedHomePage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import { Toast, ToastContainer } from 'react-bootstrap';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AuthenticatedHomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [showMobileToast, setShowMobileToast] = useState(false);

  const fetchUserInfo = useCallback(() => {
    fetch(`${BACKEND_URL}/user/get`, { credentials: 'include' })
      .then(res => {
        if (res.status === 401) {
          navigate('/home');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          setUser(data);
          console.log('✅ Fetched user info at', new Date().toLocaleTimeString());

          // ✅ Show mobile toast only if on mobile
          if (isMobile) {
            setShowMobileToast(true);
          }
        }
      })
      .catch(err => {
        console.error('Error fetching user info:', err);
        setError('Failed to load user info');
      });
  }, [navigate]);

  useEffect(() => {
    fetchUserInfo();
    const intervalId = setInterval(fetchUserInfo, 10000);
    return () => clearInterval(intervalId);
  }, [fetchUserInfo]);

  const handleLogout = () => {
    fetch(`${BACKEND_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(res => {
        if (res.ok) {
          navigate('/home');
        } else {
          throw new Error('Logout failed');
        }
      })
      .catch(err => {
        console.error(err);
        setError('Logout failed');
      });
  };

  if (!user) return <p className="text-center mt-5">Loading user info...</p>;

  return (
    <div className="container py-5">
      {error && <div className="alert alert-danger">{error}</div>}

      {/* ✅ Toast Container for mobile device message */}
