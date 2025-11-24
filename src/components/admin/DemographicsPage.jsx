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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const base = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const load = async () => {
      try {
        const [city, seg, gen, age] = await Promise.all([
          fetch(`${base}/api/admin/demographics/appointments-by-city`),
          fetch(`${base}/api/admin/demographics/loyalty-segments`),
          fetch(`${base}/api/admin/demographics/gender`),
          fetch(`${base}/api/admin/demographics/age-groups`),
        ]);

        if (!city.ok || !seg.ok || !gen.ok || !age.ok) {
          throw new Error("Failed to load demographics.");
        }

        setCityData(await city.json());
        setSegmentData(await seg.json());
        setGenderData(await gen.json());
        setAgeData(await age.json());
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
        <h2>User & Booking Demographics</h2>
      </div>

      {/* --- 2×2 CHART GRID --- */}
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

        {/* LOYALTY */}
        <div className="chart-card">
          <h4>Loyalty Members vs Guests</h4>
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
    </div>
  );
}

export default DemographicsPage;
