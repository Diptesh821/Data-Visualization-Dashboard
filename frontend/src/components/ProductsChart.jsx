// src/components/ProductsChart.jsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

// Custom tooltip to display product details
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, description, price, category } = payload[0].payload;
    return (
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        padding: '10px',
        maxWidth: '250px'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>Product: {name}</p>
        <p style={{ margin: 0 }}>Description: {description}</p>
        <p style={{ margin: 0 }}>Price: {price}</p>
        <p style={{ margin: 0 }}>Category: {category}</p>
      </div>
    );
  }
  return null;
};

const ProductsChart = ({ data, businessName }) => {

  const chartData = data.map(product => ({
    name: product.product_name,
    price: parseFloat(product.price),
    description: product.description,
    category: product.category
  }));


  const barHeight = 40;
  const chartHeight = Math.min(chartData.length * barHeight + 100, 800);

  return (
    <div style={{ marginBottom: '50px', padding: '10px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h3 className="text-xl font-semibold mb-4 text-center">{businessName}</h3>
      <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              label={{ value: 'Price', position: 'insideBottom', offset: -10 }} 
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={150}
              label={{ value: 'Product', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" />
            <Bar 
              dataKey="price" 
              fill="#8884d8" 
              barSize={barHeight - 10} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProductsChart;
