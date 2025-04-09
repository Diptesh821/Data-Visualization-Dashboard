// src/components/ProductsDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Accordion, Card } from 'react-bootstrap';
import ProductsChart from './ProductsChart';
import FileUpload from './FileUpload';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ProductsDashboard = () => {
  const [groupedData, setGroupedData] = useState([]);
  const navigate = useNavigate();

  const fetchProductsData = () => {
    fetch(`${BACKEND_URL}/api/products`, {
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
        const groups = data.reduce((acc, product) => {
          const biz = product.business_name || 'Unknown Business';
          if (!acc[biz]) acc[biz] = [];
          acc[biz].push(product);
          return acc;
        }, {});
        // Convert to array of { businessName, items }
        const arr = Object.entries(groups).map(([businessName, items]) => ({
          businessName,
          items,
        }));
        setGroupedData(arr);
      })
      .catch((error) => console.error('Error fetching products data:', error));
  };

 
   useEffect(() => {
     // Immediately fetch data once.
     fetchProductsData();
   
     // Set up polling every 30 seconds.
     const intervalId = setInterval(() => {
       fetchProductsData();
     }, 10000);
     
   
     // Clear the interval on cleanup.
     return () => clearInterval(intervalId);
   }, []);

   const handleUploadSuccess = () => {
    fetchProductsData();
  };

  return (
    <div className="container py-4">
      <h2 className="text-2xl font-bold mb-4">Products Dashboard</h2>

      {/* CSV Template */}
      <div className="mb-4 p-3 bg-light rounded shadow-sm border border-secondary">
        <h5>CSV Template</h5>
        <p>Please format your CSV with these headers:</p>
        <table className="table table-sm table-bordered">
          <thead className="table-secondary">
            <tr>
              <th>product_name</th>
              <th>description</th>
              <th>price</th>
              <th>category</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Toothbrush </td>
              <td>A manual toothbrush for daily oral hygiene</td>
              <td>2.99</td>
              <td>Oral Care</td>
            </tr>
          </tbody>
        </table>
        <p className="text-danger mt-3 fw-bold">
          ⚠️ Important: Each product name should appear only once per business in the CSV. Duplicate product names for the same business are not allowed.
        </p>
      </div>

      <FileUpload
        endpoint={`${BACKEND_URL}/post/products`}
        fieldName="products_csv"
        onUploadSuccess={handleUploadSuccess}
        showBusinessNameInput={true}
      />

      {groupedData.length > 0 ? (
        <Accordion defaultActiveKey={groupedData[0].businessName}>
          {groupedData.map(({ businessName, items }) => (
            <Accordion.Item eventKey={businessName} key={businessName}>
              <Accordion.Header>{businessName}</Accordion.Header>
              <Accordion.Body>
                {/* Summary Card */}
                <Card className="mb-3 shadow-sm">
                  <Card.Body className="d-flex justify-content-between">
                    <div>
                      <strong>Total Products:</strong> {items.length}
                    </div>
                    <div>
                      <strong>Average Price:</strong> $
                      {(
                        items.reduce((sum, p) => sum + parseFloat(p.price), 0) /
                        items.length
                      ).toFixed(2)}
                    </div>
                  </Card.Body>
                </Card>

                {/* Chart */}
                <ProductsChart data={items} businessName={businessName} />
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      ) : (
        <p>No products data available.</p>
      )}
    </div>
  );
};

export default ProductsDashboard;
