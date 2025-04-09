// src/components/FinancialReportsDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Accordion, Card, Alert } from 'react-bootstrap';
import FinancialReportsChart from './FinancialReportsChart';
import FileUpload from './FileUpload';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const FinancialReportsDashboard = () => {
  const [groupedData, setGroupedData] = useState([]);
  const navigate = useNavigate();

  const fetchFinancialData = () => {
    fetch(`${BACKEND_URL}/api/financial_reports`, {
      credentials: 'include',
    })
      .then((response) => {
        if (response.status === 401) {
          navigate('/login');
          return null;
        }
        return response.json();
      })
      .then((data) => {
        if (!data) return;
        // Group by business_name
        const groups = data.reduce((acc, report) => {
          const biz = report.business_name || 'Unknown Business';
          if (!acc[biz]) acc[biz] = [];
          acc[biz].push(report);
          return acc;
        }, {});
        // Convert to array and sort each group by report_date
        const arr = Object.entries(groups).map(([businessName, reports]) => ({
          businessName,
          reports: reports.sort(
            (a, b) => new Date(a.report_date) - new Date(b.report_date)
          ),
        }));
        setGroupedData(arr);
      })
      .catch((error) => console.error('Error fetching financial reports data:', error));
  };

 
   useEffect(() => {
     // Immediately fetch data once.
     fetchFinancialData();
   
     // Set up polling every 30 seconds.
     const intervalId = setInterval(() => {
       fetchFinancialData();
     }, 10000);
   
     // Clear the interval on cleanup.
     return () => clearInterval(intervalId);
   }, []);

   const handleUploadSuccess = () => {
    fetchFinancialData();
  };
  return (
    <div className="container py-4">
      <h2 className="text-2xl font-bold mb-4">Financial Reports Dashboard</h2>

      {/* CSV Template */}
      <div className="mb-4 p-3 bg-light rounded shadow-sm border border-secondary">
        <h5>CSV Template</h5>
        <p>Please format your CSV with these headers:</p>
        <table className="table table-sm table-bordered">
          <thead className="table-secondary">
            <tr>
              <th>report_date</th>
              <th>revenue</th>
              <th>expenses</th>
              <th>net_profit</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>31-01-2023</td>
              <td>300000.23</td>
              <td>200000.45</td>
              <td>100000.67</td>
            </tr>
          </tbody>
        </table>
        {/* ⚠️ CSV Rules Info Box */}
      <Alert variant="info" className="mb-4">
        <h6 className="mb-2 font-semibold">Important CSV Upload Guidelines:</h6>
        <ul className="mb-0">
          <li>Upload <strong>monthly financial reports</strong> — one report per month.</li>
          <li>Each row in the CSV should represent <strong>one month's report</strong>.</li>
          <li>The <code>report_date</code> for each row should be the <strong>last date of that month</strong> (e.g., 31-01-2023, 28-02-2023).</li>
          <li><strong>Do not add multiple entries for the same month</strong> per business.</li>
        </ul>
      </Alert>

      </div>

      
      {/* File Upload */}
      <FileUpload
        endpoint={`${BACKEND_URL}/post/financial_reports`}
        fieldName="financial_reports_csv"
        onUploadSuccess={handleUploadSuccess}
        showBusinessNameInput={true}
      />

      {groupedData.length > 0 ? (
        <Accordion defaultActiveKey={groupedData[0].businessName}>
          {groupedData.map(({ businessName, reports }) => {
            const totalRevenue = reports.reduce((sum, r) => sum + parseFloat(r.revenue), 0).toFixed(2);
            const totalExpenses = reports.reduce((sum, r) => sum + parseFloat(r.expenses), 0).toFixed(2);
            const totalProfit = reports.reduce((sum, r) => sum + parseFloat(r.net_profit), 0).toFixed(2);

            return (
              <Accordion.Item eventKey={businessName} key={businessName}>
                <Accordion.Header>{businessName}</Accordion.Header>
                <Accordion.Body>
                  {/* Summary Card */}
                  <Card className="mb-3 shadow-sm">
                    <Card.Body className="d-flex justify-content-between">
                      <div>
                        <strong>Months Reported:</strong> {reports.length}
                      </div>
                      <div>
                        <strong>Total Revenue:</strong> ${totalRevenue}
                      </div>
                      <div>
                        <strong>Total Expenses:</strong> ${totalExpenses}
                      </div>
                      <div>
                        <strong>Total Profit:</strong> ${totalProfit}
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Chart */}
                  <FinancialReportsChart data={reports} businessName={businessName} />
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>
      ) : (
        <p>No financial reports data available.</p>
      )}
    </div>
  );
};

export default FinancialReportsDashboard;
