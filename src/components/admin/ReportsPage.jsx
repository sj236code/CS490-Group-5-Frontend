// src/pages/admin/ReportsPage.jsx

import React, { useState } from "react";
import "../../App.css";

function ReportsPage() {
  const base = import.meta.env.VITE_API_URL;

  const [selectedReports, setSelectedReports] = useState({
    analytics: true,
    salon: true,
    demographics: true,
    revenue: true,
  });

  const [downloading, setDownloading] = useState(false);

  const toggleReport = (key) => {
    setSelectedReports((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleDownload = async () => {
    const sections = Object.entries(selectedReports)
      .filter(([, value]) => value)
      .map(([key]) => key)
      .join(",");

    if (!sections) {
      alert("Please select at least one report section.");
      return;
    }

    try {
      setDownloading(true);

      const res = await fetch(
        `${base}/api/admin/reports/download?sections=${encodeURIComponent(
          sections
        )}`,
        {
          method: "GET",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to download Excel file.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "jade_admin_reports.xlsx"; // backend sends a timestamped name; this is a safe fallback
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading report:", err);
      alert("Error downloading report. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h2>Admin generates reports to share performance insights</h2>
      </div>

      <div className="reports-toolbar">
        <div className="reports-toolbar-left">
          <span className="reports-toolbar-title">View Reports</span>
        </div>
        <button
          className="reports-download-button"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? "Preparing Excel..." : "Download Excel"}
        </button>
      </div>

      <div className="reports-card">
        <div className="reports-checkbox-row">
          <label>
            <input
              type="checkbox"
              checked={selectedReports.analytics}
              onChange={() => toggleReport("analytics")}
            />
            Analytics (Engagement &amp; Retention)
          </label>
        </div>

        <div className="reports-checkbox-row">
          <label>
            <input
              type="checkbox"
              checked={selectedReports.salon}
              onChange={() => toggleReport("salon")}
            />
            Salon Activity
          </label>
        </div>

        <div className="reports-checkbox-row">
          <label>
            <input
              type="checkbox"
              checked={selectedReports.demographics}
              onChange={() => toggleReport("demographics")}
            />
            Demographics &amp; Loyalty
          </label>
        </div>

        <div className="reports-checkbox-row">
          <label>
            <input
              type="checkbox"
              checked={selectedReports.revenue}
              onChange={() => toggleReport("revenue")}
            />
            Revenue &amp; Sales
          </label>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
