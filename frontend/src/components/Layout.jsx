// src/components/Layout.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div className="container">
          <NavLink className="navbar-brand" to="/">Dashboard</NavLink>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <NavLink to="/dashboard/sales" className="nav-link">Sales</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/dashboard/financial_reports" className="nav-link">Financial Reports</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/dashboard/customer_trends" className="nav-link">Customer Trends</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/dashboard/products" className="nav-link">Products</NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div>{children}</div>
    </div>
  );
};

export default Layout;
