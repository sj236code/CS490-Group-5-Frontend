import React, { useState } from "react";
import "../../App.css";

function ReportsPage() {
  const [selectedReports, setSelectedReports] = useState({
    demographics: true,
    engagement: true,
    revenue: false,
  });

  const [reportData, setReportData] = useState({
    demographics: null,
    engagement: null,
    revenue: null,
  });

  const [loading, setLoading] = useState(false);
  const BASE_URL = "http://127.0.0.1:5000/api/admin/reports";

  const toggleReport = (key) => {
    setSelectedReports((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCreate = async () => {
    setLoading(true);
    const newData = {};

    try {
      // Demographics
      if (selectedReports.demographics) {
        const res = await fetch(`${BASE_URL}/demographics`);
        newData.demographics = await res.json();
      }

      // Engagement
      if (selectedReports.engagement) {
        const res = await fetch(`${BASE_URL}/engagement`);
        newData.engagement = await res.json();
      }

      // Revenue
      if (selectedReports.revenue) {
        const res = await fetch(`${BASE_URL}/revenue`);
        newData.revenue = await res.json();
      }

      setReportData(newData);
      alert("✅ Reports loaded successfully!");
    } catch (error) {
      console.error("Error fetching reports:", error);
      alert("❌ Failed to fetch reports. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(`${BASE_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedReports),
      });

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "JADE_Report.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      alert("📊 Report downloaded successfully!");
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("❌ Failed to download report.");
    }
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h2>Admin generates reports to share performance insights</h2>
      </div>

      <div className="reports-top-buttons">
        <button
          className="view-btn"
          disabled={loading}
          onClick={handleCreate}
        >
          {loading ? "Loading..." : "View Reports"}
        </button>
        <button className="create-btn" onClick={handleDownload}>
          Download Excel
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
      </div>

      <div className="report-output">
        {reportData.demographics && (
          <div className="report-section">
            <h4>👥 Demographics Summary</h4>
            <pre>{JSON.stringify(reportData.demographics, null, 2)}</pre>
          </div>
        )}

        {reportData.engagement && (
          <div className="report-section">
            <h4>📈 Engagement Summary</h4>
            <pre>{JSON.stringify(reportData.engagement, null, 2)}</pre>
          </div>
        )}

        {reportData.revenue && (
          <div className="report-section">
            <h4>💰 Revenue Summary</h4>
            <pre>{JSON.stringify(reportData.revenue, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsPage;
