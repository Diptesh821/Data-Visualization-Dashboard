// src/components/CustomerTrendsChart.jsx
import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, TimeScale);

const CustomerTrendsChart = ({ data, businessName }) => {
  const segments = Array.from(new Set(data.map((item) => item.customer_segment)));
  const [selectedSegment, setSelectedSegment] = useState(segments[0] || '');

  const filteredData = data
    .filter((item) => item.customer_segment === selectedSegment)
    .sort((a, b) => new Date(a.trend_date) - new Date(b.trend_date));

  const metricTypes = Array.from(new Set(filteredData.map((item) => item.metric_type)));

  const datasets = metricTypes.map((metric) => ({
    label: metric,
    data: filteredData.map((item) => ({
      x: new Date(item.trend_date),
      y: parseFloat(item.metric_value),
    })),
    backgroundColor:
      metric === 'Engagement'
        ? 'rgba(75, 192, 192, 0.6)'
        : metric === 'Satisfaction'
        ? 'rgba(255, 159, 64, 0.6)'
        : metric === 'Retention'
        ? 'rgba(54, 162, 235, 0.6)'
        : 'rgba(200, 200, 200, 0.6)',
  }));

  const chartData = { datasets };

  const options = {
    responsive: true,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'yyyy-MM-dd',
        },
        title: { display: true, text: 'Trend Date' },
      },
      y: {
        title: { display: true, text: 'Metric Value' },
      },
    },
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `${businessName}: ${selectedSegment} Trends` },
      tooltip: {
        callbacks: {
          afterBody: (context) => {
            const metric = context[0].dataset.label;
            const idx = context[0].dataIndex;
            const addContext = filteredData[idx]?.additional_context;
            return addContext
              ? Object.entries(addContext)
                  .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
                  .join('\n')
              : '';
          },
        },
      },
    },
  };

  return (
    <div className="my-8 p-4 bg-white rounded-lg shadow">
      <h3 className="text-xl font-semibold text-center mb-4">{businessName}</h3>
      <div className="mb-3">
        <label className="form-label">Select Customer Segment:</label>
        <select
          className="form-select"
          value={selectedSegment}
          onChange={(e) => setSelectedSegment(e.target.value)}
        >
          {segments.map((seg) => (
            <option key={seg} value={seg}>{seg}</option>
          ))}
        </select>
      </div>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default CustomerTrendsChart;
