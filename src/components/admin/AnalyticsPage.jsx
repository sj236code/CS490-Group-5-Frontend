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
  ResponsiveContainer,
} from "recharts";
import "../../App.css";

function AnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [engagementData, setEngagementData] = useState([]);
  const [retentionData, setRetentionData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const base = import.meta.env.VITE_API_URL;

      try {
        const [summaryRes, engagementRes, retentionRes] = await Promise.all([
          fetch(`${base}/api/admin/analytics/summary`),
          fetch(`${base}/api/admin/analytics/engagement-trend`),
          fetch(`${base}/api/admin/analytics/retention-cohort`),
        ]);

        if (!summaryRes.ok || !engagementRes.ok || !retentionRes.ok) {
          throw new Error("One or more analytics endpoints failed.");
        }

        const [summaryData, engagementTrendData, retentionCohortData] =
          await Promise.all([
            summaryRes.json(),
            engagementRes.json(),
            retentionRes.json(),
          ]);

        setSummary(summaryData);
        setEngagementData(engagementTrendData);
        setRetentionData(retentionCohortData);
      } catch (err) {
        console.error("Error loading analytics:", err);
        setError("Failed to fetch analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="analytics-page">
        <h3>Loading analytics...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <h3 style={{ color: "red" }}>{error}</h3>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* HEADER WITHOUT DATE/STORE FILTERS */}
      <div className="analytics-header">
        <h2>Engagement & Retention Dashboard</h2>
      </div>

      {/* SUMMARY CARDS */}
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
          <small>All Time</small>
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

      {/* CHART ROW 1 - ENGAGEMENT */}
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
      </div>

      {/* CHART ROW 2 - RETENTION */}
      <div className="chart-section">
        <div className="chart-card">
          <h4>Cohort Retention (Monthly)</h4>
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
