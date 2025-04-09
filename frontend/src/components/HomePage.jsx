// src/components/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { Modal, Button } from 'react-bootstrap';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Axios sends cookies
axios.defaults.withCredentials = true;

const HomePage = () => {
  const [cookiesBlocked, setCookiesBlocked] = useState(false);
  const [popupAccepted, setPopupAccepted] = useState(false);
  const navigate = useNavigate();

  // Check auth on load
  useEffect(() => {
    fetch(`${BACKEND_URL}/user/get`, { credentials: 'include' })
      .then(res => {
        if (res.status === 201) {
          navigate('/');
          return null;
        }
        return res.json();
      })
      .catch(err => {
        console.error('Error fetching user info:', err);
      });
  }, [navigate]);

  // Detect third-party cookie block
  useEffect(() => {
    axios.get(`${BACKEND_URL}/test/set-cookie`, { withCredentials: true })
      .then(() => {
        axios.get(`${BACKEND_URL}/test/check-cookie`, { withCredentials: true })
          .then(res => {
            if (!res.data.hasCookie) {
              setCookiesBlocked(true);
            }
          })
          .catch(() => setCookiesBlocked(true));
      })
      .catch(() => setCookiesBlocked(true));
  }, []);

  // When OK is clicked on the popup
  const handleAcceptPopup = () => {
    setPopupAccepted(true);
  };

  // Show modal if cookies are blocked and not yet accepted
  const showModal = cookiesBlocked && !popupAccepted;

  return (
    <>
      {/* React-Bootstrap Modal for Cookie Block Warning */}
      <Modal show={showModal} backdrop="static" centered>
        <Modal.Header>
          <Modal.Title>Cookies Are Blocked</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Our site requires third-party cookies for authentication.
            Please enable third-party cookies in your browser settings to continue.
          </p>
          <p>
            <strong>Chrome Instructions:</strong><br />
            1. Open <code>chrome://settings/cookies</code> in your browser.<br />
            or navigate via: <em>Settings &gt; Privacy and Security &gt; Third-Party Cookies</em><br />
            2. Either choose <em>"Allow third-party cookies"</em>, or scroll to <em>"Sites allowed to use third-party cookies"</em><br />
            3. Click "Add" and enter this site's domain.
          </p>
          <p>
            After allowing cookies, click "OK" to proceed. You will not be able to use this site without it.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleAcceptPopup}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Actual HomePage content shown only after popup is accepted or cookies are not blocked */}
      {(!cookiesBlocked || popupAccepted) && (
        <div className="container py-5">
          {/* Auth Buttons */}
          <div className="d-flex justify-content-end mb-4">
            <Link to="/login" className="btn btn-outline-primary me-2">Login</Link>
            <Link to="/signup" className="btn btn-outline-success">Sign Up</Link>
          </div>

          {/* Hero Section */}
          <div className="jumbotron bg-light p-5 rounded-lg shadow">
            <h1 className="display-4">Welcome to Your Business Metrics Dashboard</h1>
            <p className="lead">
              Visualize and analyze your business data in real-time with interactive charts and graphs.
            </p>
            <hr className="my-4" />
            <p>
              Upload your CSV files for Sales, Financial Reports, Customer Trends, and Products using our easy-to-use interface.
            </p>
            <Link to="/dashboard/products" className="btn btn-primary btn-lg">
              Get Started with Products
            </Link>
          </div>

          {/* Dashboard Section Cards */}
          <div className="row text-center mt-5">
            {[
              { title: 'Sales', path: '/dashboard/sales', text: 'View and analyze your sales data with detailed charts.' },
              { title: 'Financial Reports', path: '/dashboard/financial_reports', text: 'Track revenue, expenses, and profit trends over time.' },
              { title: 'Customer Trends', path: '/dashboard/customer_trends', text: 'Understand customer behavior with interactive insights.' },
              { title: 'Products', path: '/dashboard/products', text: 'Analyze product performance and inventory metrics.' },
            ].map((card, i) => (
              <div className="col-md-3 mb-4" key={i}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">{card.title}</h5>
                    <p className="card-text">{card.text}</p>
                  </div>
                  <div className="card-footer">
                    <Link to={card.path} className="btn btn-outline-primary btn-sm">
                      View {card.title}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default HomePage;
