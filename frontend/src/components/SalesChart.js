// src/components/SalesChart.js
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import io from 'socket.io-client';
import api from '../api'; // Axios instance to call backend API

// Register Chart.js components for Bar chart
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const socket = io('http://localhost:3001');

const SalesChart = () => {
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    // Fetch initial sales data from backend
    const fetchData = async () => {
      try {
        const response = await api.get('/sales');
        setSalesData(response.data);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      }
    };

    fetchData();

    // Listen for real-time updates from server
    socket.on('new_sale', (newSale) => {
      setSalesData((prevData) => {
        // Append new sale and sort by amount, then limit to top 10
        const updatedData = [...prevData, newSale]
          .sort((a, b) => b.amount - a.amount) // Sort in descending order
          .slice(0, 10); // Take the top 10 highest amounts

        return updatedData;
      });
    });

    return () => {
      socket.off('new_sale');
    };
  }, []);

  // Prepare data for the bar chart (top 10 sorted sales)
  const data = {
    labels: salesData.map(sale => sale.product), // X-axis labels (top 10 product names)
    datasets: [
      {
        label: 'Top 10 Sales Amount',
        data: salesData.map(sale => sale.amount), // Y-axis data (top 10 sales amount)
        backgroundColor: 'rgba(75, 192, 192, 0.6)', // Bar color
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true, // Y-axis starts from 0
      },
    },
  };

  return (
    <div>
      <h2>Top 10 Sales Bar Chart (Real-time Updates)</h2>
      <Bar data={data} options={options} />
    </div>
  );
};

export default SalesChart;
