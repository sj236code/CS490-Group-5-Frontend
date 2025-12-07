// src/pages/admin/RevenuePage.jsx

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import "../../App.css";

const RANGE_OPTIONS = [
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 90 Days" },
  { value: "all", label: "All Time" },
];

function formatMoney(value) {
  const num = Number(value || 0);
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

function RevenuePage() {
  const API = import.meta.env.VITE_API_URL;

  const [range, setRange] = useState("90");
  const [salonId, setSalonId] = useState("all");

  const [salonOptions, setSalonOptions] = useState([
    { value: "all", label: "All Stores" },
  ]);

  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [bySalon, setBySalon] = useState([]);
  const [byService, setByService] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --------- Load salons for dropdown ---------
  const loadSalons = async () => {
    try {
      const res = await fetch(`${API}/api/admin/revenue/salons`);
      if (!res.ok) throw new Error("Failed to load salons");
      const data = await res.json();
      const opts = [{ value: "all", label: "All Stores" }].concat(
        data.map((s) => ({ value: String(s.id), label: s.name }))
      );
      setSalonOptions(opts);
    } catch (err) {
      console.error(err);
    }
  };

  // --------- Load revenue analytics ---------
  const loadRevenue = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("range", range);
      if (salonId !== "all") params.set("salonId", salonId);

      // only 4 endpoints – matches your backend
      const [summaryRes, trendRes, bySalonRes, byServiceRes] =
        await Promise.all([
          fetch(`${API}/api/admin/revenue/summary?${params.toString()}`),
          fetch(`${API}/api/admin/revenue/trend?${params.toString()}`),
          fetch(`${API}/api/admin/revenue/by-salon?${params.toString()}`),
          fetch(`${API}/api/admin/revenue/by-service?${params.toString()}`),
        ]);

      if (
        !summaryRes.ok ||
        !trendRes.ok ||
        !bySalonRes.ok ||
        !byServiceRes.ok
      ) {
        throw new Error("One or more revenue endpoints failed.");
      }

      const [summaryJson, trendJson, bySalonJson, byServiceJson] =
        await Promise.all([
          summaryRes.json(),
          trendRes.json(),
          bySalonRes.json(),
          byServiceRes.json(),
        ]);

      setSummary(summaryJson);
      setTrend(trendJson.trend || []);
      setBySalon(bySalonJson.bySalon || []);
      setByService(byServiceJson.byService || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load revenue data.");
    } finally {
      setLoading(false);
    }
  };

  // --------- Generate PDF ---------
  const handleGeneratePdf = () => {
    const params = new URLSearchParams();
    params.set("range", range);
    if (salonId !== "all") params.set("salonId", salonId);

    window.open(
      `${API}/api/admin/revenue/report-pdf?${params.toString()}`,
      "_blank"
    );
  };

  useEffect(() => {
    loadSalons();
  }, []);

  useEffect(() => {
    loadRevenue();
  }, [range, salonId]);

  // --------- Render helpers ---------
  if (loading && !summary) {
    return (
      <div className="analytics-page">
        <h3>Loading revenue & sales...</h3>
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

  const windowLabel =
    summary && summary.window && summary.window.from
      ? `${summary.window.from} – ${summary.window.to}`
      : "All Time";

  const topSalonName = summary?.topSalon?.salonName || "—";
  const topSalonRevenue = summary?.topSalon
    ? formatMoney(summary.topSalon.revenue)
    : "—";

  return (
    <div className="analytics-page">
      {/* HEADER */}
      <div className="analytics-header">
        <h2>Revenue & Sales Performance</h2>

        <div className="analytics-filters">
          {/* Date Range */}
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="analytics-filter-select"
          >
            {RANGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Salon Filter */}
          <select
            value={salonId}
            onChange={(e) => setSalonId(e.target.value)}
            className="analytics-filter-select"
          >
            {salonOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="analytics-summary">
        <div className="metric-card">
          <h4>Total Revenue</h4>
          <p className="metric-value">
            {summary ? formatMoney(summary.totalRevenue) : "$0.00"}
          </p>
          <small>{windowLabel}</small>
        </div>

        <div className="metric-card">
          <h4>Total Number of Orders</h4>
          <p className="metric-value">
            {summary ? summary.totalOrders.toLocaleString() : "0"}
          </p>
          <small>Completed</small>
        </div>

        <div className="metric-card">
          <h4>Avg Order Value</h4>
          <p className="metric-value">
            {summary ? formatMoney(summary.avgOrderValue) : "$0.00"}
          </p>
          <small>Revenue per completed order</small>
        </div>

        <div className="metric-card">
          <h4>Top Salon</h4>
          <p className="metric-value">{topSalonName}</p>
          <small>Total Revenue: {topSalonRevenue} in this window</small>
        </div>
      </div>

      {/* REVENUE OVER TIME */}
      <div className="chart-section">
        <div className="chart-card">
          <h4>Revenue Over Time</h4>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip
                formatter={(value) => formatMoney(value)}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#4B5945"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* REVENUE BY SALON & TOP SERVICES */}
      <div className="analytics-summary-chart-grid">
        <div className="chart-card">
          <h4>Revenue by Salon</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={bySalon}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="salonName" />
              <YAxis />
              <Tooltip formatter={(value) => formatMoney(value)} />
              <Bar dataKey="revenue" fill="#7E8E6F" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h4>Top Services by Revenue</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byService}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="serviceName" />
              <YAxis />
              <Tooltip formatter={(value) => formatMoney(value)} />
              <Bar dataKey="revenue" fill="#4B5945" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NEW: PDF export button (right aligned, no CSS changes) */}
<div
  style={{
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "20px",
    marginBottom: "20px",
  }}
>
  <button
    type="button"
    className="analytics-download-btn"
    onClick={handleGeneratePdf}
  >
    Generate PDF Report
  </button>
</div>

    </div>
  );
}

export default RevenuePage;
