// src/pages/DemographicsPage.jsx

import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "../../App.css";

const COLORS = ["#4B5945", "#7E8E6F", "#A3B18A", "#9CA986", "#B7C8A4"];

function DemographicsPage() {
  const [cityData, setCityData] = useState([]);
  const [segmentData, setSegmentData] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [ageData, setAgeData] = useState([]);
  const [loyaltySummary, setLoyaltySummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const base = import.meta.env.VITE_API_URL;

  const handleGeneratePdf = () => {
    const url = `${base}/api/admin/demographics/report-pdf`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [city, seg, gen, age, loyalty] = await Promise.all([
          fetch(`${base}/api/admin/demographics/appointments-by-city`),
          fetch(`${base}/api/admin/demographics/loyalty-segments`),
          fetch(`${base}/api/admin/demographics/gender`),
          fetch(`${base}/api/admin/demographics/age-groups`),
          fetch(`${base}/api/admin/demographics/loyalty-summary`),
        ]);

        if (!city.ok || !seg.ok || !gen.ok || !age.ok || !loyalty.ok) {
          throw new Error("Failed to load demographics.");
        }

        setCityData(await city.json());
        setSegmentData(await seg.json());
        setGenderData(await gen.json());
        setAgeData(await age.json());
        setLoyaltySummary(await loyalty.json());
      } catch (err) {
        console.error(err);
        setError("Unable to fetch demographics data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [base]);

  if (loading) return <h3 style={{ margin: "30px" }}>Loading demographics...</h3>;
  if (error) return <h3 style={{ color: "red", margin: "30px" }}>{error}</h3>;

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h2>Loyalty Program, User & Booking Demographics</h2>
      </div>

      {/* ----- LOYALTY SUMMARY CARDS ----- */}
      {loyaltySummary && (
        <div className="analytics-summary-row">
          {/* Card 1: coverage */}
          <div className="summary-card">
            <h4>Loyalty Coverage</h4>
            <div className="summary-main">
              <span className="summary-value">
                {loyaltySummary.totalMembers}
              </span>
              <span className="summary-label">Members</span>
            </div>
            <div className="summary-metrics">
              <div className="summary-metric-row">
                <span>Salons with loyalty</span>
                <span>{loyaltySummary.activeLoyaltySalons}</span>
              </div>
              <div className="summary-metric-row">
                <span>Total balance</span>
                <span>{Math.round(loyaltySummary.totalPointsBalance)} pts</span>
              </div>
              <div className="summary-metric-row">
                <span>Avg per member</span>
                <span>{loyaltySummary.avgPointsPerMember.toFixed(1)} pts</span>
              </div>
            </div>
          </div>

          {/* Card 2: activity 90d */}
          <div className="summary-card">
            <h4>Member Activity (Last 90 Days)</h4>
            <div className="summary-main">
              <span className="summary-value">
                {loyaltySummary.activeMembers90d}
              </span>
              <span className="summary-label">Active Members</span>
            </div>
            <div className="summary-metrics">
              <div className="summary-metric-row">
                <span>Dormant members</span>
                <span>{loyaltySummary.dormantMembers90d}</span>
              </div>
              <div className="summary-metric-row">
                <span>Engagement</span>
                <span>
                  {(loyaltySummary.engagementRate90d * 100).toFixed(0)}%
                </span>
              </div>
              <div className="summary-metric-row">
                <span>Transactions (90d)</span>
                <span>{loyaltySummary.transactionsLast90d}</span>
              </div>
            </div>
          </div>

          {/* Card 3: points & redemption 90d */}
          <div className="summary-card">
            <h4>Points &amp; Redemption (Last 90 Days)</h4>
            <div className="summary-main">
              <span className="summary-value">
                {(loyaltySummary.redemptionRate90d * 100).toFixed(0)}%
              </span>
              <span className="summary-label">Redemption Rate</span>
            </div>
            <div className="summary-metrics">
              <div className="summary-metric-row">
                <span>Points earned</span>
                <span>{Math.round(loyaltySummary.pointsEarned90d)} pts</span>
              </div>
              <div className="summary-metric-row">
                <span>Points redeemed</span>
                <span>{Math.round(loyaltySummary.pointsRedeemed90d)} pts</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----- 2×2 CHART GRID ----- */}
      <div className="analytics-summary-chart-grid">
        {/* CITY */}
        <div className="chart-card">
          <h4>Appointments by City</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={cityData}
                dataKey="value"
                nameKey="name"
                outerRadius={85}
                label
              >
                {cityData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* LOYALTY MIX */}
        <div className="chart-card">
          <h4>Loyalty Members vs Guests (Customers)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={segmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="segment" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4B5945" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* GENDER */}
        <div className="chart-card">
          <h4>Gender Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={genderData}
                dataKey="count"
                nameKey="gender"
                outerRadius={85}
                label
              >
                {genderData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* AGE */}
        <div className="chart-card">
          <h4>Age Group Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age_group" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#7E8E6F" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    {/* ---- PDF button at bottom right ---- */}
      <div
        className="analytics-footer-actions"
        style={{ marginTop: "24px", textAlign: "right" }}
      >
        <button className="primary-button" onClick={handleGeneratePdf}>
          Generate PDF Report
        </button>
      </div>
    </div>
  );
}

export default DemographicsPage;
