import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'; 
import './App.css'; 
import Appbar from './Appbar';

// Import Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faShoppingCart, faTimesCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const App = () => {
  const [month, setMonth] = useState('November'); // Default to November
  const [transactions, setTransactions] = useState([]);
  const [statistics, setStatistics] = useState({
    totalSales: 0,
    totalSold: 0,
    totalNotSold: 0,
  });
  const [barChartData, setBarChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [searchInput, setSearchInput] = useState(''); // State for search input

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/transactions', {
          params: { month }
        });
        setTransactions(response.data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    const fetchStatistics = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/statistics', {
          params: { month }
        });
        if (response.data) {
          setStatistics(response.data);
        } else {
          setStatistics({
            totalSales: 0,
            totalSold: 0,
            totalNotSold: 0,
          });
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    const fetchBarChart = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/barchart', {
          params: { month }
        });
        setBarChartData(response.data);
      } catch (error) {
        console.error('Error fetching bar chart data:', error);
      }
    };

    const fetchPieChart = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/piechart', {
          params: { month }
        });
        setPieChartData(response.data);
      } catch (error) {
        console.error('Error fetching pie chart data:', error);
      }
    };

    fetchTransactions();
    fetchStatistics();
    fetchBarChart();
    fetchPieChart();
  }, [month]);

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
  };

  // Render statistics as cards
  const renderStatistics = () => {
    const totalSalesPercentage = (statistics.totalSales / 10000) * 100; // Example for percentage calculation
  const soldItemsPercentage = (statistics.totalSold / 100) * 100; // Example for percentage calculation
  const notSoldItemsPercentage = (statistics.totalNotSold / 100) * 100; // Example for percentage calculation

  return (
    <div className="stat-container">
    <div className="stat-card">
      <CircularProgressbar 
        value={totalSalesPercentage} 
        text={`$${statistics.totalSales.toFixed(2)}`} 
        styles={{
          path: { stroke: '#4caf50' }, // Path color
          text: { fill: '#fff', fontSize: '15px',textShadow:'0 0 5px #4caf50, 0 0 10px #4caf50, 0 0 15px #4caf50' }, // Smaller text size
          trail: { stroke: '#d6d6d6' }, // Trail color
        }}
      />
    <h3  style={{color:'#4caf50'}}>Total Sales</h3>
    </div>
    <div className="stat-card">
      <CircularProgressbar 
        value={soldItemsPercentage} 
        text={`${statistics.totalSold}`} 
        styles={{
          path: { stroke: '#2196F3' }, // Path color
          text: { fill: '#fff', fontSize: '15px',textShadow: '0 0 5px #2196F3, 0 0 10px #2196F3, 0 0 15px #2196F3' }, // Smaller text size
          trail: { stroke: '#d6d6d6' }, // Trail color
        }}
      />
      <h3 style={{color:'#2196F3'}}>Sold Items</h3>
    </div>
    <div className="stat-card">
      <CircularProgressbar 
        value={notSoldItemsPercentage} 
        text={`${statistics.totalNotSold}`} 
        styles={{
          path: { stroke: '#f44336' }, // Path color
          text: { fill: '#fff', fontSize: '15px',textShadow: '0 0 5px #f44336, 0 0 10px #f44336, 0 0 15px #f44336' }, // Smaller text size
          trail: { stroke: '#d6d6d6' }, // Trail color
        }}
      />
      <h3  style={{color:'#f44336'}}>Not Sold Items</h3>
    </div>
  </div>
    );
  }

  // Render transactions table

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items to display per page

  // Update the renderTable function
  // Render transactions table with pagination
  const renderTable = () => {
    const filteredTransactions = transactions.filter(transaction => {
        const lowerCaseSearch = searchInput.toLowerCase();
        return (
            transaction.title.toLowerCase().includes(lowerCaseSearch) ||
            transaction.description.toLowerCase().includes(lowerCaseSearch) ||
            transaction.price.toString().includes(lowerCaseSearch) || 
            transaction.category.toLowerCase().includes(lowerCaseSearch) ||
            (transaction.sold ? 'sold'.includes(lowerCaseSearch) : 'not sold'.includes(lowerCaseSearch))
        );
    });

    // Calculate the indices for items to be displayed on the current page
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

    // In your renderTable function:

return (
  <div className="table-responsive">
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Title</th>
          <th>Description</th>
          <th>Price</th>
          <th>Date of Sale</th>
          <th>Category</th>
          <th>Sold</th>
        </tr>
      </thead>
      <tbody>
        {currentItems.map((transaction) => (
          <tr key={transaction.id}>
            <td>
              <img 
                src={transaction.image} 
                alt={transaction.title} 
                className="product-image"
              />
            </td> 
            <td>{transaction.title}</td>
            <td>{transaction.description}</td>
            <td>${transaction.price.toFixed(2)}</td>
            <td>{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
            <td>{transaction.category}</td>
            <td>{transaction.sold ? 'Sold' : 'Not Sold'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

  };


  // Render pagination controls
  const renderPagination = (totalItems) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div className="pagination">
            <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-button"
            >
                Previous
            </button>
            <span className="page-info">Page {currentPage} of {totalPages}</span>
            <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-button"
            >
                Next
            </button>
        </div>
    );
  };



  return (
    <div>
      < Appbar />
    <div className="container">
      

      {/* Month selection container */}
      <div className="filter-container">
        <label htmlFor="month-dropdown" className="month-label">Select Month:</label>
        <select
          id="month-dropdown"
          value={month}
          onChange={handleMonthChange}
          className="month-dropdown"
        >
          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {renderStatistics()} {/* Render the statistics cards */}

      <h2 style={{textAlign:'center'}}>Transactions</h2>
      
      {/* Search Input Positioned Below Transactions Heading */}
      <div className="search-container">
        <div className="search-wrapper">
          <FontAwesomeIcon icon={faSearch} className="search-icon" color='secondary'/>
          <input
            type="text"
            placeholder="Search transactions"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)} // Update the search input state
            className="search-input"
          />
        </div>
      </div>

      {renderTable()}

      <div className="chart-container">
        <div className="chart">
          <h2 >Bar Chart</h2>
          <Bar
              data={{
                  labels: barChartData.map(d => d.range),
                  datasets: [{
                      label: '# of Items',
                      data: barChartData.map(d => d.count),
                      backgroundColor: 'rgba(75, 192, 192, 0.9)',
                  }]
              }}
              options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      ticks: {
                        color: 'white', // Set x-axis text color to white
                      },
                      
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)', // Optional: Set grid line color
                      },
                    },
                    y: {
                      ticks: {
                        color: 'white', // Set y-axis text color to white
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)', // Optional: Set grid line color
                      },
                    }
                  },
                  plugins: {
                      legend: { position: 'top' },
                      title: { display: true, text: 'Price Range Distribution',color:'white' },
                  },
              }}
          />
        </div>
        <div className="chart">
          <h2  >Pie Chart</h2>
          <Pie
              data={{
                  labels: pieChartData.map(d => d._id),
                  datasets: [{
                      label: '# of Items',
                      data: pieChartData.map(d => d.count),
                      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                  }]
              }}
              options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                      legend: { position: 'right',labels: {
                    color: 'white', // Set legend text color to white
                  } },
                      title: { display: true, text: 'Category Distribution',color:'white' },
                  },
              }}
          />
        </div>
      </div>
    </div>
  </div>
  );
};

export default App;
