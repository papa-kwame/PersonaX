import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import { useAuth } from '../context/AuthContext';
import VehicleAssignedCard from "../components/users/VehicleAssignedCard";
import FuelExpensesDashboard from "../components/fuel/AdminDashFuel";
import CommentsAndFeedback from "../components/new components/CommentsVehicle";
import StatsCard from "../components/dashboard/StatsCard";
import { FiTruck, FiCheckCircle, FiFileText, FiTool } from "react-icons/fi";
import '../components/dashboard/dashboard.css'; // Import your CSS file
import VehicleAssignment from "../components/new components/VehicleAssignment";
import CompleteInvoiceForm from "../components/new components/InvoiceForm";


const api = axios.create({
  baseURL: 'https://localhost:7092/api',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  },
  withCredentials: true
});

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    vehicleRequests: 0,
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
        const [AllRes, vehiclesRes, assignmentsRes, maintenanceRes] = await Promise.all([
          api.get("/VehicleAssignment/AllRequests"),
          api.get("/Vehicles"),
          api.get("/VehicleAssignment/AllAssignments"),
          api.get("/MaintenanceRequest"),
        ]);

        const vehiclesData = vehiclesRes.data || [];
        const availableVehicles = vehiclesData.filter(v => v.status === 'Available').length;

        setStats({
          vehicleRequests: AllRes.data?.length || 0,
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
      <div className="top-section">
        <VehicleAssignedCard />
        <FuelExpensesDashboard />
      </div>
        <div className="stats-cards">
          <StatsCard
            title="Total Vehicles"
            stats={{ count: stats.vehicles }}
            link="/vehicles"
            linkText="View All Vehicles"
            icon={<FiTruck />}
            color="rgba(24,118,210, 0.8)"
          />
          <StatsCard
            title="Assignments"
            stats={{ count: stats.assignments }}
            link="/assignments"
            linkText="View Assignments"
            icon={<FiFileText />}
            color="rgba(24,118,210, 0.8)"
          />
          <StatsCard
            title="Maintenance Requests"
            stats={{ count: stats.maintenanceRequests }}
            link="/maintenance"
            linkText="View Requests"
            icon={<FiTool />}
            color="rgba(24,118,210, 0.8)"
          />
                    <StatsCard
            title="Vehicle Request"
            stats={{ count: stats.vehicleRequests }}
            link="/vehicles"
            linkText="View All Vehicles"
            icon={<FiTruck />}
            color="rgba(24,118,210, 0.8)"
          />
        </div>
      <div className="bottom-section">
        <CommentsAndFeedback />
        <VehicleAssignment/>
        <CompleteInvoiceForm/>
      </div>
    </div>
  );
}
