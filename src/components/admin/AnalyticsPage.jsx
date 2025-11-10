import React, { useEffect, useState } from "react";
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

const COLORS = ["#4B5945", "#66785F", "#A3B18A", "#D9E9CF"];

function AnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [engagementData, setEngagementData] = useState([]);
  const [featureData, setFeatureData] = useState([]);
  const [retentionData, setRetentionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all endpoints in parallel using native fetch()
  useEffect(() => {
    const fetchAllAnalytics = async () => {
      try {
        const base = import.meta.env.VITE_API_URL;

        const [summaryRes, engagementRes, featureRes, retentionRes] =
          await Promise.all([
            fetch(`${base}/api/admin/analytics/summary`),
            fetch(`${base}/api/admin/analytics/engagement-trend`),
            fetch(`${base}/api/admin/analytics/feature-usage`),
            fetch(`${base}/api/admin/analytics/retention-cohort`),
          ]);

        if (!summaryRes.ok || !engagementRes.ok || !featureRes.ok || !retentionRes.ok) {
          throw new Error("One or more requests failed");
        }

        const [summaryData, engagementData, featureData, retentionData] =
          await Promise.all([
            summaryRes.json(),
            engagementRes.json(),
            featureRes.json(),
            retentionRes.json(),
          ]);

        setSummary(summaryData);
        setEngagementData(engagementData);
        setFeatureData(featureData);
        setRetentionData(retentionData);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllAnalytics();
  }, []);

  if (loading)
    return (
      <div className="analytics-page">
        <h3>Loading analytics...</h3>
      </div>
    );

  if (error)
    return (
      <div className="analytics-page">
        <h3 style={{ color: "red" }}>{error}</h3>
      </div>
    );

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h2>Engagement & Retention Dashboard</h2>
        <div className="filters">
          <button className="filter-btn">Date Range ▼</button>
          <button className="filter-btn">Store ▼</button>
        </div>
      </div>

      {/* --- TOP SUMMARY METRICS --- */}
      <div className="analytics-summary">
        <div className="metric-card">
          <h4>Active Users</h4>
          <p className="metric-value">{summary.activeUsers}</p>
          <small>Trend increasing</small>
        </div>

        <div className="metric-card">
          <h4>Total Salons</h4>
          <p className="metric-value">{summary.totalSalons}</p>
          <small>Nationwide</small>
        </div>

        <div className="metric-card">
          <h4>Total Appointments</h4>
          <p className="metric-value">{summary.totalAppointments}</p>
          <small>Last 7 days</small>
        </div>

        <div className="metric-card">
          <h4>Retention Rate</h4>
          <p className="metric-value">{summary.retentionRate}%</p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${summary.retentionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* --- CHART SECTION 1 --- */}
      <div className="chart-section">
        <div className="chart-card">
          <h4>Engagement Over Time</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#4B5945"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h4>Feature Usage</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={featureData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
              >
                {featureData.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- CHART SECTION 2 --- */}
      <div className="chart-section">
        <div className="chart-card">
          <h4>Cohort Retention</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={retentionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rate" fill="#66785F" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
