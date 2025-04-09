import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Accordion, Card } from 'react-bootstrap';
import SalesChart from './SalesChart';
import FileUpload from './FileUpload';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const SalesDashboard = () => {
  const [groupedData, setGroupedData] = useState([]);
  const navigate = useNavigate();

  const fetchSalesData = () => {
    fetch(`${BACKEND_URL}/api/sales`, { credentials: 'include' })
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
        const groups = data.reduce((acc, sale) => {
          const biz = sale.business_name || 'Unknown Business';
          acc[biz] = acc[biz] || [];
          acc[biz].push(sale);
          return acc;
        }, {});
        // Convert to array and sort
        const arr = Object.entries(groups).map(([name, items]) => ({
          businessName: name,
          items: items.sort(
            (a, b) => new Date(a.sale_date) - new Date(b.sale_date)
          ),
        }));
        setGroupedData(arr);
      })
      .catch(console.error);
  };

  useEffect(() => {
    // Immediately fetch data once.
    fetchSalesData();
  
    // Set up polling every 30 seconds.
    const intervalId = setInterval(() => {
      fetchSalesData();
    }, 10000);
  
    // Clear the interval on cleanup.
    return () => clearInterval(intervalId);
  }, []);
  

  const handleUploadSuccess = () => fetchSalesData();

  return (
    <div className="container py-4">
      <h2 className="mb-4">Sales Dashboard</h2>

      {/* CSV Template */}
      <div className="mb-4 p-3 bg-light rounded shadow-sm border border-secondary">
        <h5>CSV Template</h5>
        <p>Please format your CSV with these headers:</p>
        <table className="table table-sm table-bordered">
          <thead className="table-secondary">
            <tr>
              <th>sale_date</th>
              <th>quantity</th>
              <th>total_amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>01-01-2023</td>
              <td>100</td>
              <td>1234.56</td>
            </tr>
          </tbody>
        </table>

        <div className="alert alert-warning mt-3">
        <strong>Important:</strong> Each row in the CSV should represent a daily sales record. Try to keep the <code>sale_date</code> different for each row per business. If required, multiple rows with the same <code>sale_date</code> are allowed, but it's recommended to avoid duplicates unless necessary  — for example, to capture multiple transactions on the same day.
        </div>
      </div>

      {/* File upload */}
      <FileUpload
        endpoint={`${BACKEND_URL}/post/sales`}
        fieldName="sales_csv"
        onUploadSuccess={handleUploadSuccess}
        showBusinessNameInput
      />

      {/* Accordion of businesses */}
      {groupedData.length > 0 ? (
        <Accordion defaultActiveKey={groupedData[0].businessName}>
          {groupedData.map(({ businessName, items }) => (
            <Accordion.Item eventKey={businessName} key={businessName}>
              <Accordion.Header>{businessName}</Accordion.Header>
              <Accordion.Body>
                {/* Summary Card */}
                <Card className="mb-3">
                  <Card.Body className="d-flex justify-content-between">
                    <div>
                      <strong>Total Revenue:</strong> $
                      {items.reduce((sum, s) => sum + parseFloat(s.total_amount), 0).toFixed(2)}
                    </div>
                    <div>
                      <strong>Total Qty:</strong>{' '}
                      {items.reduce((sum, s) => sum + Number(s.quantity), 0)}
                    </div>
                  </Card.Body>
                </Card>

                {/* Chart */}
                <SalesChart data={items} businessName={businessName} />
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      ) : (
        <p>No sales data available.</p>
      )}
    </div>
  );
};

export default SalesDashboard;
