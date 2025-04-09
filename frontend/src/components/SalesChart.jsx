// src/components/SalesChart.jsx
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const getMonthYear = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const SalesChart = ({ data, businessName }) => {
  const monthly = data.reduce((acc, { sale_date, total_amount, quantity }) => {
    const m = getMonthYear(sale_date);
    if (!acc[m]) acc[m] = { revenue: 0, qty: 0 };
    acc[m].revenue += parseFloat(total_amount);
    acc[m].qty += Number(quantity);
    return acc;
  }, {});

  const labels = Object.keys(monthly).sort();
  const revenues = labels.map((m) => monthly[m].revenue);
  const quantities = labels.map((m) => monthly[m].qty);

  const chartData = {
    labels,
    datasets: [
      {
        type: 'bar',
        label: 'Revenue',
        data: revenues,
        backgroundColor: 'rgba(75,192,192,0.6)',
        yAxisID: 'y1',
      },
      {
        type: 'line',
        label: 'Quantity Sold',
        data: quantities,
        borderColor: 'rgba(153,102,255,1)',
        backgroundColor: 'rgba(153,102,255,0.2)',
        yAxisID: 'y2',
        tension: 0.3,
        pointRadius: 5,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Monthly Sales & Quantity',
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed.y;
            return `${ctx.dataset.label}: ${val}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Month' },
        ticks: { maxRotation: 45, minRotation: 45 },
      },
      y1: {
        type: 'linear',
        position: 'left',
        title: { display: true, text: 'Revenue' },
        grid: { drawOnChartArea: false },
      },
      y2: {
        type: 'linear',
        position: 'right',
        title: { display: true, text: 'Quantity' },
        grid: { drawOnChartArea: false },
      },
    },
  };

  return (
    <div className="my-6 p-4 bg-white rounded shadow-md">
      <h3 className="text-center text-xl font-semibold mb-2">
        {businessName}
      </h3>
      <Chart type="bar" data={chartData} options={options} />
    </div>
  );
};

export default SalesChart;
