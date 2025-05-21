import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import "./dashboard.css";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function VehicleStatusChart() {
  const data = [
    { name: 'Available', value: 8 },
    { name: 'Assigned', value: 12 },
    { name: 'Maintenance', value: 3 },
    { name: 'Out of Service', value: 1 }
  ];

  return (
    <div className="chart-container">
      <div className="section-header">
        <h2 className="section-title">Vehicle Status</h2>
        <select className="time-filter">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
        </select>
      </div>
      
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}