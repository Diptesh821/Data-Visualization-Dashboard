// src/components/FinancialReportsChart.jsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const FinancialReportsChart = ({ data, businessName }) => {
  const labels = data.map((report) => report.report_date);
  const revenues = data.map((report) => parseFloat(report.revenue));
  const expenses = data.map((report) => parseFloat(report.expenses));
  const netProfits = data.map((report) => parseFloat(report.net_profit));

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Revenue',
        data: revenues,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Expenses',
        data: expenses,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Net Profit',
        data: netProfits,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Financial Reports Over Time' },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Report Date',
        },
      },
    },
  };

  return (
    <div className="my-8 p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-center">{businessName}</h3>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default FinancialReportsChart;
