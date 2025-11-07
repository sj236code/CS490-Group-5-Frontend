import React from "react";
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

const genderData = [
  { name: "Female", value: 45 },
  { name: "Male", value: 45 },
  { name: "Other", value: 15 },
];

const ageGroupData = [
  { age: "18–24", count: 30 },
  { age: "25–34", count: 70 },
  { age: "35–44", count: 60 },
  { age: "45+", count: 40 },
];

const COLORS = ["#4B5945", "#7E8E6F", "#A3B18A"];

function DemographicsPage() {
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
