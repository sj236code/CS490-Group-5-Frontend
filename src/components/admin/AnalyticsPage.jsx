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
  const [returningData, setReturningData] = useState([]);
  const [retentionData, setRetentionData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const base = import.meta.env.VITE_API_URL;

      try {
        const [summaryRes, returningRes, retentionRes] = await Promise.all([
          fetch(`${base}/api/admin/analytics/summary`),
          fetch(`${base}/api/admin/analytics/returning-users-trend`),
          fetch(`${base}/api/admin/analytics/retention-cohort`),
        ]);

        if (!summaryRes.ok || !returningRes.ok || !retentionRes.ok) {
          throw new Error("One or more analytics endpoints failed.");
        }

        const [summaryData, returningTrendData, retentionCohortData] =
          await Promise.all([
            summaryRes.json(),
            returningRes.json(),
            retentionRes.json(),
          ]);

        setSummary(summaryData);
        // backend returns { trend: [...] }
        setReturningData(returningTrendData.trend || []);
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
      {/* HEADER */}
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

      {/* CHART ROW 1 - RETURNING USERS */}
<div className="chart-section">
  <div className="chart-card">
    <h4>Returning Users (Last 30 Days)</h4>

    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={returningData}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="day"
          interval={1} // show every other label (no duplicates)
          tickFormatter={(value) => {
            const d = new Date(value);
            const month = d.toLocaleString("en-US", { month: "short" });
            const day = d.getDate();
            return `${month} ${day}`;
          }}
        />

        <YAxis
          allowDecimals={false} // never fractional
          tickCount={6}
        />

        <Tooltip />

        <Line
          type="monotone"
          dataKey="returning_users"
          stroke="#4B5945"
          strokeWidth={2}
          dot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>

    {/* YEAR LABEL UNDER THE CHART */}
    <div style={{
      textAlign: "center",
      marginTop: "-5px",
      fontSize: "14px",
      color: "#4B5945",
      fontWeight: 500
    }}>
      2025
    </div>

  </div>
</div>


      {/* CHART ROW 2 - COHORT RETENTION */}
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
