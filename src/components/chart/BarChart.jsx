import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ title, chartData }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title || 'Chart Title',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Default data if no chartData is provided
  const defaultData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        type: 'bar',
        label: 'Dataset 1 (Bar)',
        data: [450, 590, 800, 810, 560, 550, 400],
        backgroundColor: 'rgba(255, 77, 77, 0.8)',
      },
      {
        type: 'bar',
        label: 'Dataset 2 (Bar)',
        data: [300, 400, 500, 600, 400, 300, 200],
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
      },
      {
        type: 'line',
        label: 'Dataset 3 (Line)',
        data: [500, 600, 700, 800, 600, 500, 400],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderWidth: 2,
        tension: 0.1,
        pointRadius: 5,
        pointBackgroundColor: 'rgb(53, 162, 235)',
      },
    ],
  };

  // Use provided data or default data
  const data = chartData || defaultData;

  return <Chart type='bar' options={options} data={data} />;
};

export default BarChart;