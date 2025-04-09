// src/components/CustomerTrendsDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Accordion, Card, Alert } from 'react-bootstrap';
import CustomerTrendsChart from './CustomerTrendsChart';
import FileUpload from './FileUpload';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const CustomerTrendsDashboard = () => {
  const [groupedData, setGroupedData] = useState([]);
  const navigate = useNavigate();

  const fetchTrendsData = () => {
    fetch(`${BACKEND_URL}/api/customer_trends`, {
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
        const groups = data.reduce((acc, item) => {
          const biz = item.business_name || 'Unknown Business';
          if (!acc[biz]) acc[biz] = [];
          acc[biz].push(item);
          return acc;
        }, {});
        // Convert to array and sort each group by date
        const arr = Object.entries(groups).map(([businessName, items]) => ({
          businessName,
          items: items.sort(
            (a, b) => new Date(a.trend_date) - new Date(b.trend_date)
          ),
        }));
        setGroupedData(arr);
      })
      .catch((error) => console.error('Error fetching customer trends data:', error));
  };

  
    useEffect(() => {
      // Immediately fetch data once.
      fetchTrendsData();
    
      // Set up polling every 30 seconds.
      const intervalId = setInterval(() => {
        fetchTrendsData();
      }, 10000);
    
      // Clear the interval on cleanup.
      return () => clearInterval(intervalId);
    }, []);

    const handleUploadSuccess = () => {
      fetchTrendsData();
    };
    

  return (
    <div className="container py-4">
      <h2 className="text-2xl font-bold mb-4">Customer Trends Dashboard</h2>
      {/* CSV Template */}
      <div className="mb-4 p-3 bg-light rounded shadow-sm border border-secondary">
        <h5>CSV Template</h5>
        <p>Please format your CSV with these headers:</p>
        <table className="table table-sm table-bordered">
          <thead className="table-secondary">
            <tr>
              <th>trend_date</th>
              <th>customer_segment</th>
              <th>metric_type</th>
              <th>metric_value</th>
              <th>additional_context</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>28-03-2025</td>
              <td>Occasional Buyers  </td>
              <td>Satisfaction </td>
              <td>68</td>
              <td>
                <code>{"{\"product\": \"Standard\", \"survey_count\": 45}"}</code>
              </td>

            </tr>
          </tbody>
        </table>
        <Alert variant="info" className="mb-4">
          <h6 className="mb-2 font-semibold">Important CSV Upload Guidelines:</h6>
          <p className="mt-3 text-muted">
            💡 <strong>Note:</strong> The <code>additional_context</code> field is optional but recommended. You may leave it blank if you prefer, but including it can help provide meaningful insights (e.g., seasonal trends, promotional events, customer feedback summaries) that enhance the usefulness of your trend analysis.
          </p>

        </Alert>
      </div>



      <FileUpload
        endpoint={`${BACKEND_URL}/post/customer_trends`}
        fieldName="customer_trends_csv"
        onUploadSuccess={handleUploadSuccess}
        showBusinessNameInput={true}
      />

      {groupedData.length > 0 ? (
        <Accordion defaultActiveKey={groupedData[0].businessName}>
          {groupedData.map(({ businessName, items }) => {
            const uniqueSegments = [...new Set(items.map(i => i.customer_segment))].length;
            return (
              <Accordion.Item eventKey={businessName} key={businessName}>
                <Accordion.Header>{businessName}</Accordion.Header>
                <Accordion.Body>
                  {/* Summary Card */}
                  <Card className="mb-3 shadow-sm">
                    <Card.Body className="d-flex justify-content-between">
                      <div>
                        <strong>Total Records:</strong> {items.length}
                      </div>
                      <div>
                        <strong>Customer Segments:</strong> {uniqueSegments}
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Trends Chart */}
                  <CustomerTrendsChart
                    data={items}
                    businessName={businessName}
                  />
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>
      ) : (
        <p>No customer trends data available.</p>
      )}
    </div>
  );
};

export default CustomerTrendsDashboard;
