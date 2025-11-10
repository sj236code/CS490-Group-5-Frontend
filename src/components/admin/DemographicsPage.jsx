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

const COLORS = ["#4B5945", "#7E8E6F", "#A3B18A"];

function DemographicsPage() {
  const [genderData, setGenderData] = useState([]);
  const [ageGroupData, setAgeGroupData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch demographics from backend
  useEffect(() => {
    const fetchDemographics = async () => {
      try {
        const base = import.meta.env.VITE_API_URL;

        // Fetch gender data
        const genderRes = await fetch(`${base}/api/admin/users/gender`);
        const ageRes = await fetch(`${base}/api/admin/users/age-distribution`);

        if (!genderRes.ok || !ageRes.ok) throw new Error("Failed to fetch demographics");

        const genderJson = await genderRes.json();
        const ageJson = await ageRes.json();

        setGenderData(genderJson);
        setAgeGroupData(ageJson);
      } catch (err) {
        console.error("Error loading demographics:", err);
        setError("Unable to load demographics data");
      } finally {
        setLoading(false);
      }
    };

    fetchDemographics();
  }, []);

  if (loading) {
    return (
      <div className="demographics-page">
        <h3>Loading demographics...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="demographics-page">
        <h3 style={{ color: "red" }}>{error}</h3>
      </div>
    );
  }

  return (
    <div className="demographics-page">
      <div className="header-section">
        <h2>Admin Visualizes User Demographics</h2>
      </div>

      <div className="top-buttons">
        <button className="view-btn">View Demographics</button>
        <select className="dropdown">
          <option>User Purchases</option>
          <option>Engagement</option>
          <option>Appointments</option>
        </select>
      </div>

      <div className="demographics-grid">
        {/* Gender Pie Chart */}
        <div className="card">
          <h4>Gender</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={genderData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#4B5945"
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Age Groups Bar Chart */}
        <div className="card">
          <h4>Age Groups</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ageGroupData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4B5945" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default DemographicsPage;
