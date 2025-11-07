import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import "../../App.css";

// ---------- MOCK DATA ----------
const summary = {
  activeUsers: "1,234",
  avgSession: "5m 32s",
  featureEngagement: 72,
  retentionRate: 65,
};

const engagementOverTime = [
  { day: "Mon", users: 900 },
  { day: "Tue", users: 970 },
  { day: "Wed", users: 1020 },
  { day: "Thu", users: 1100 },
  { day: "Fri", users: 1180 },
  { day: "Sat", users: 1230 },
  { day: "Sun", users: 1280 },
];

const featureUsage = [
  { name: "Booking", value: 35 },
  { name: "Reviews", value: 25 },
  { name: "Gallery", value: 20 },
  { name: "Rewards", value: 20 },
];

const retentionCohort = [
  { month: "Jan", rate: 50 },
  { month: "Feb", rate: 58 },
  { month: "Mar", rate: 63 },
  { month: "Apr", rate: 68 },
  { month: "May", rate: 72 },
];

const COLORS = ["#4B5945", "#66785F", "#A3B18A", "#D9E9CF"];

function AnalyticsPage() {
  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h2>Engagement & Retention Dashboard</h2>
        <div className="filters">
          <button className="filter-btn">Date Range ▼</button>
          <button className="filter-btn">Store ▼</button>
        </div>
      </div>

      {/* --- TOP METRICS --- */}
      <div className="analytics-summary">
        <div className="metric-card">
          <h4>Active Users (DAU/MAU)</h4>
          <p className="metric-value">{summary.activeUsers}</p>
          <small>Trend increasing</small>
        </div>
        <div className="metric-card">
          <h4>Avg. Session Duration</h4>
          <p className="metric-value">{summary.avgSession}</p>
          <small>Last 7 days</small>
        </div>
        <div className="metric-card">
          <h4>Feature Engagement</h4>
          <p className="metric-value">{summary.featureEngagement}%</p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${summary.featureEngagement}%` }}
            />
          </div>
        </div>
        <div className="metric-card">
          <h4>Retention Rate</h4>
          <p className="metric-value">{summary.retentionRate}%</p>
          <small>Consistent Growth</small>
        </div>
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="chart-section">
        <div className="chart-card">
          <h4>Engagement Over Time</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={engagementOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#4B5945" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h4>Feature Usage</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={featureUsage}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
              >
                {featureUsage.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- SECOND ROW --- */}
      <div className="chart-section">
        <div className="chart-card">
          <h4>Cohort Retention</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={retentionCohort}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rate" fill="#66785F" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h4>Store-Level Engagement</h4>
          <table className="store-table">
            <thead>
              <tr>
                <th>Store</th>
                <th>Avg. Session Duration</th>
                <th>Active Users</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Salon A</td><td>5m 20s</td><td>250</td></tr>
              <tr><td>Salon B</td><td>4m 48s</td><td>210</td></tr>
              <tr><td>Salon C</td><td>6m 05s</td><td>270</td></tr>
              <tr><td>Salon D</td><td>5m 59s</td><td>190</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
