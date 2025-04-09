import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import SalesDashboard from './components/SalesDashboard';
import FinancialReportsDashboard from './components/FinancialReportsDashboard';
import CustomerTrendsDashboard from './components/CustomerTrendsDashboard';
import ProductsDashboard from './components/ProductsDashboard';
import LoginPage from './components/loginPage';
import SignupPage from './components/signupPage';
import AuthenticatedHomePage from './components/home_login';

function App() {
  return (
    <Layout>
      <Routes>
      <Route path="/home" element={<HomePage />} />
      <Route path="/" element={<AuthenticatedHomePage/>}/>
        <Route path="/dashboard/sales" element={<SalesDashboard />} />
        <Route path="/dashboard/financial_reports" element={<FinancialReportsDashboard />} />
        <Route path="/dashboard/customer_trends" element={<CustomerTrendsDashboard />} />
        <Route path="/dashboard/products" element={<ProductsDashboard />} />
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/signup" element={<SignupPage/>}/>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
