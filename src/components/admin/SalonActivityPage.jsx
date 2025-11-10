import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import "../../App.css";

function SalonActivityPage() {
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [topSalons, setTopSalons] = useState([]);
  const [appointmentTrend, setAppointmentTrend] = useState([]);
  const [metrics, setMetrics] = useState({ avgTime: "" });

  useEffect(() => {
    axios.get("/api/admin/salons/pending").then(res => setPendingVerifications(res.data));
    axios.get("/api/admin/salons/top").then(res => setTopSalons(res.data));
    axios.get("/api/admin/salons/trends").then(res => setAppointmentTrend(res.data));
    axios.get("/api/admin/salons/metrics").then(res => setMetrics(res.data));
  }, []);

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
              {pendingVerifications.length > 0 ? (
                pendingVerifications.map((s) => (
                  <li key={s.id}>
                    {s.name}
                    <span className="status-icons">
                      <span className="verify-icon">✅</span>
                      <span className="reject-icon">❌</span>
                    </span>
                  </li>
                ))
              ) : (
                <li>No pending verifications</li>
              )}
            </ul>
          </div>
        </div>

        {/* Center Panel */}
        <div className="salon-center">
          <div className="card">
            <h4>Top Salons</h4>
            <ul>
              {topSalons.map((s, i) => (
                <li key={i}>{s.name} ({s.appointments})</li>
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
                <Line type="monotone" dataKey="count" stroke="#4B5945" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Panel */}
        <div className="salon-right">
          <div className="card highlight">
            <h4>Avg. Appointment Time</h4>
            <p className="metric-value">{metrics.avgTime}</p>
          </div>

          <div className="card">
            <h4>Appointment Trends</h4>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={appointmentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" hide />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#66785F" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalonActivityPage;
