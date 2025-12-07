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
const API = import.meta.env.VITE_API_URL;   //

function AnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [engagementTrend, setEngagementTrend] = useState([]); // appointments per day
  const [returningData, setReturningData] = useState([]);     // returning users per day
  const [retentionData, setRetentionData] = useState([]);     // monthly cohort

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleGeneratePdf = () => {
    const url = `${API}/api/admin/analytics/engagement/report-pdf?days=30`;
    window.open(url, "_blank"); // opens / downloads the PDF
  };

    useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const [summaryRes, engagementRes, returningRes, retentionRes] =
          await Promise.all([
            fetch(`${API}/api/admin/analytics/engagement/summary?days=30`),
            fetch(`${API}/api/admin/analytics/engagement-trend?days=30`),
            fetch(`${API}/api/admin/analytics/returning-users-trend?days=30`),
            fetch(`${API}/api/admin/analytics/retention-cohort`),
          ]);


        if (
          !summaryRes.ok ||
          !engagementRes.ok ||
          !returningRes.ok ||
          !retentionRes.ok
        ) {
          throw new Error("One or more analytics endpoints failed.");
        }

        const [
          summaryData,
          engagementTrendData,
          returningTrendData,
          retentionCohortData,
        ] = await Promise.all([
          summaryRes.json(),
          engagementRes.json(),
          returningRes.json(),
          retentionRes.json(),
        ]);

        setSummary(summaryData);
        setEngagementTrend(engagementTrendData.trend || []);
        setReturningData(returningTrendData.trend || []);
        setRetentionData(retentionCohortData || []);
      } catch (err) {
        console.error("Error loading analytics:", err);
        setError("Failed to fetch analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading || !summary) {
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

  // Calculate retention % safely
  const retentionPercent =
    summary.retentionRatePercent ??
    (summary.retentionRate ? summary.retentionRate * 100 : 0);

  return (
    <div className="analytics-page">
      {/* HEADER */}
      <div className="analytics-header">
        <h2>Engagement & Retention Dashboard</h2>
        <p className="page-subtitle">
          Overview of how customers use the platform over the last 30 days.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="analytics-summary">
        <div className="metric-card">
          <h4>Active Users</h4>
          <p className="metric-value">{summary.activeUsers}</p>
          <small>Had at least one appointment in window</small>
        </div>

        <div className="metric-card">
  <h4>Customers</h4>
  <p className="metric-value">{summary.totalCustomers}</p>
  <small>{summary.newUsers} new in this window</small>
</div>


        <div className="metric-card">
          <h4>Total Appointments</h4>
          <p className="metric-value">{summary.totalAppointments}</p>
          <small>Last 30 days</small>
        </div>

        <div className="metric-card">
          <h4>Total Salons</h4>
          <p className="metric-value">{summary.totalSalons}</p>
          <small>Across the platform</small>
        </div>

        <div className="metric-card">
          <h4>Retention Rate</h4>
          <p className="metric-value">
            {retentionPercent.toFixed(2)}%
          </p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(retentionPercent, 100)}%` }}
            />
          </div>
          <small>
            {summary.returningUsers} returning users out of{" "}
            {summary.activeUsers} active
          </small>
        </div>
      </div>

      {/* CHART ROW 1 - APPOINTMENTS TREND */}
      <div className="chart-section">
        <div className="chart-card">
          <h4>Appointments (Last 30 Days)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={engagementTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tickFormatter={(value) => {
                  const d = new Date(value);
                  const month = d.toLocaleString("en-US", { month: "short" });
                  const day = d.getDate();
                  return `${month} ${day}`;
                }}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                labelFormatter={(value) => {
                  const d = new Date(value);
                  return d.toLocaleDateString();
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#4B5945"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART ROW 2 - RETURNING USERS TREND */}
      <div className="chart-section">
        <div className="chart-card">
          <h4>Returning Users (Last 30 Days)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={returningData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tickFormatter={(value) => {
                  const d = new Date(value);
                  const month = d.toLocaleString("en-US", { month: "short" });
                  const day = d.getDate();
                  return `${month} ${day}`;
                }}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                labelFormatter={(value) => {
                  const d = new Date(value);
                  return d.toLocaleDateString();
                }}
              />
              <Line
                type="monotone"
                dataKey="returning_users"
                stroke="#4B5945"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART ROW 3 - COHORT RETENTION */}
      <div className="chart-section">
        <div className="chart-card">
          <h4>Cohort Retention (Monthly)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={retentionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="rate" fill="#66785F" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GENERATE PDF BUTTON AT THE BOTTOM */}
      <div
        className="analytics-footer"
        style={{ marginTop: "24px", textAlign: "right" }}
      >
        <button className="primary-button" onClick={handleGeneratePdf}>
          Generate PDF Report
        </button>
      </div>
    </div>
  );
}

export default AnalyticsPage;
