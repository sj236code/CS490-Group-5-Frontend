import React, { useState } from "react";
import "../../App.css";

function ReportsPage() {
  const [selectedReports, setSelectedReports] = useState({
    demographics: true,
    engagement: true,
    revenue: false,
  });

  const toggleReport = (key) => {
    setSelectedReports((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownload = () => {
    alert("Mock download started — will connect to backend API later!");
  };

  const handleCreate = () => {
    alert("Report generated successfully (mock)!");
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h2>Admin generates reports to share performance insights</h2>
      </div>

      <div className="reports-top-buttons">
        <button className="view-btn">View Demographic</button>
        <button className="create-btn" onClick={handleCreate}>
          Create Report
        </button>
      </div>

      <div className="report-box">
        <div className="checkbox-container">
          <label>
            <input
              type="checkbox"
              checked={selectedReports.demographics}
              onChange={() => toggleReport("demographics")}
            />
            User Demographics
          </label>
          <label>
            <input
              type="checkbox"
              checked={selectedReports.engagement}
              onChange={() => toggleReport("engagement")}
            />
            User Engagement
          </label>
          <label>
            <input
              type="checkbox"
              checked={selectedReports.revenue}
              onChange={() => toggleReport("revenue")}
            />
            Revenue
          </label>
        </div>

        <button className="download-btn" onClick={handleDownload}>
          Download
        </button>
      </div>
    </div>
  );
}

export default ReportsPage;
