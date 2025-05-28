import React, { useState, useEffect } from "react";
import axios from "axios";
import StatsCard from "../components/dashboard/StatsCard";
import QuickActions from "../components/dashboard/QuickActions";
import { FiAlertCircle, FiBell, FiRefreshCw, FiTruck, FiUsers, FiCheckCircle, FiFileText, FiTool } from "react-icons/fi";
import "../components/dashboard/dashboard.css";
import UserVehicleManagement from "../components/users/UserVehicleManagement";
import { useAuth } from '../context/AuthContext';
import VehicleAssignedCard from "../components/users/VehicleAssignedCard";
import VehicleRequestForm from "../components/new components/VehicleRequestForm";
import VehicleRequestsPage from "../components/new components/VehicleRequestsComponent";
import FuelLogList from "../components/fuel/FuelLogList";

const api = axios.create({
  baseURL:  'https://localhost:7092/api',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  },
  withCredentials: true
});

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    vehicles: 0,
    assignments: 0,
    maintenanceRequests: 0,
    availableVehicles: 0
  });
  const [error, setError] = useState(null);
  const { userId } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
  
        
        const [usersRes, vehiclesRes, assignmentsRes, maintenanceRes] = await Promise.all([
          api.get("/Auth/users"),
          api.get("/Vehicles"),
          api.get("/VehicleAssignment/AllAssignments"),
          api.get("/MaintenanceRequest"),
        ]);

        console.log("API Responses:", { 
          users: usersRes.data, 
          vehicles: vehiclesRes.data,
          assignments: assignmentsRes.data,
          maintenance: maintenanceRes.data
        });

        const vehiclesData = vehiclesRes.data || [];
        const availableVehicles = vehiclesData.filter(v => v.status === 'Available').length;

        setStats({
          users: usersRes.data?.length || 0,
          vehicles: vehiclesData.length,
          assignments: assignmentsRes.data?.length || 0,
          maintenanceRequests: maintenanceRes.data?.length || 0,
          availableVehicles
        });

        setLoading(false);
      } catch (error) {
        console.error("API Error:", error);
        setError(error.response?.data?.title || error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);



  const getErrorMessage = (error) => {
    if (error.response) {
      // Server responded with a status code that falls out of 2xx range
      return `Server error: ${error.response.status} - ${error.response.data?.message || 'No additional info'}`;
    } else if (error.request) {
      // Request was made but no response received
      return "No response from server. Check your network connection.";
    } else {
      // Something happened in setting up the request
      return `Request error: ${error.message}`;
    }
  };

  const refreshData = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-circle"></div>
        <p>Loading fleet data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-alert">
          <FiAlertCircle className="error-icon" />
          <h3>Connection Problem</h3>
          <p>{error}</p>
          <div className="troubleshooting-tips">
            <p>Please check:</p>
            <ul>
              <li>Your internet connection</li>
              <li>API server status</li>
              <li>Browser console for more details</li>
            </ul>
          </div>
          <button className="refresh-btn" onClick={refreshData}>
            <FiRefreshCw /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
     

      <div className="dashboard-main">
        <QuickActions />

        <div className="stats-grid">
          <StatsCard
            title="Total Vehicles"
            stats={{ count: stats.vehicles }}
            link="/vehicles"
            linkText="View All Vehicles"
            icon={<FiTruck />}
            color="#4361ee"
          />
          
          <StatsCard
            title="Available Vehicles"
            stats={{ count: stats.availableVehicles }}
            link="/vehicles?status=Available"
            linkText="View Available"
            icon={<FiCheckCircle />}
            color="#10b981"
          />
          

          <StatsCard
            title="Assignments"
            stats={{ count: stats.assignments }}
            link="/assignments"
            linkText="View Assignments"
            icon={<FiFileText />}
            color="#f72585"
          />
          
          <StatsCard
            title="Maintenance"
            stats={{ count: stats.maintenanceRequests }}
            link="/maintenance"
            linkText="View Requests"
            icon={<FiTool />}
            color="#f8961e"
          />
        </div>

 
      </div>
    </div>
  );
}