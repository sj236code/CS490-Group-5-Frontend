import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../../App.css";

const pendingVerifications = [
  { name: "Salon Lumière", verified: false },
  { name: "Salon A", verified: false },
  { name: "The Styling Loft", verified: true },
  { name: "Chic Cuts", verified: false },
];

const topSalons = ["Salon A", "Salon B", "Salon C", "Salon D", "Salon E"];

const appointmentTrend = [
  { day: "Mon", count: 40 },
  { day: "Tue", count: 60 },
  { day: "Wed", count: 70 },
  { day: "Thu", count: 80 },
  { day: "Fri", count: 90 },
  { day: "Sat", count: 100 },
  { day: "Sun", count: 120 },
];

function SalonActivityPage() {
  return (
    <div className="salon-activity-page">
      <div className="salon-header">
        <h2>Salon Performance</h2>
        <div className="salon-actions">
          <button className="filter-btn">Search ▼</button>
        </div>
      </div>

      <div className="salon-main-grid">
        {/* Left Panel */}
        <div className="salon-panel">
          <button className="view-btn">View Salon Activity</button>

          <div className="panel-section">
            <h4>Pending Verifications</h4>
            <ul className="verification-list">
              {pendingVerifications.map((s, i) => (
                <li key={i}>
                  {s.name}
                  <span className="status-icons">
                    <span className="verify-icon">✅</span>
                    <span className="reject-icon">❌</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Center Panel */}
        <div className="salon-center">
          <div className="card">
            <h4>Top Salons</h4>
            <ul>
              {topSalons.map((salon, i) => (
                <li key={i}>{salon}</li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h4>Appointment Trends</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={appointmentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#4B5945"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Panel */}
        <div className="salon-right">
          <div className="card highlight">
            <h4>Avg. Appointment Time</h4>
            <p className="metric-value">45 min</p>
          </div>

          <div className="card">
            <h4>Appointment Trends</h4>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={appointmentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" hide />
                <YAxis hide />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#66785F"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalonActivityPage;
