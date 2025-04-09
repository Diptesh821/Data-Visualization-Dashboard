// src/components/AuthenticatedHomePage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AuthenticatedHomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  // Fetch user info
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
        }
      })
      .catch(err => {
        console.error('Error fetching user info:', err);
        setError('Failed to load user info');
      });
  }, [navigate]);

  // Poll every 10 seconds
  useEffect(() => {
    fetchUserInfo(); // Initial fetch
    const intervalId = setInterval(fetchUserInfo, 10000); // 10 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
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

  if (!user) {
    return <p>Loading user info...</p>;
  }

  return (
    <div className="container py-5">
      {error && <div className="alert alert-danger">{error}</div>}

      {/* User Info Card */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h4 className="card-title">Welcome, {user.name}!</h4>
          <p className="card-text"><strong>Email:</strong> {user.email}</p>
          {user.role && <p className="card-text"><strong>Role:</strong> {user.role}</p>}
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Dashboard Navigation */}
      <div className="row g-4">
        {[
          { title: 'Sales', path: '/dashboard/sales', icon: '💰' },
          { title: 'Financial Reports', path: '/dashboard/financial_reports', icon: '📊' },
          { title: 'Customer Trends', path: '/dashboard/customer_trends', icon: '👥' },
          { title: 'Products', path: '/dashboard/products', icon: '📦' },
        ].map((card, i) => (
          <div className="col-md-3" key={i}>
            <Link to={card.path} className="text-decoration-none">
              <div className="card h-100 text-center shadow-sm hover-shadow">
                <div className="card-body d-flex flex-column justify-content-center">
                  <div style={{ fontSize: '2rem' }}>{card.icon}</div>
                  <h5 className="card-title mt-2">{card.title}</h5>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuthenticatedHomePage;
