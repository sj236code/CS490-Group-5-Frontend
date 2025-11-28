import React, { useState, useEffect } from "react";
import "../../App.css";

function ViewUptimePage() {
  const [uptimeData, setUptimeData] = useState({});
  const [filters, setFilters] = useState({ date_ranges: [], stores: [] });
  const [errors, setErrors] = useState([]);
  const [errorsVisible, setErrorsVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStore, setSelectedStore] = useState("");

  const toggleErrors = () => setErrorsVisible(!errorsVisible);

  // Fetch all data when the component mounts
  useEffect(() => {
    fetch("/api/admin/system/status")
      .then((res) => res.json())
      .then((data) => setUptimeData(data))
      .catch((err) => console.error("Error fetching status:", err));

    fetch("/api/admin/system/errors")
      .then((res) => res.json())
      .then((data) => setErrors(data.errors || []))
      .catch((err) => console.error("Error fetching errors:", err));

    fetch("/api/admin/system/filters")
      .then((res) => res.json())
      .then((data) => setFilters(data))
      .catch((err) => console.error("Error fetching filters:", err));
  }, []);

  // Helper for color logic based on uptime %
  const getCardClass = (value) => {
    if (value >= 99) return "green";
    if (value >= 90) return "gray";
    if (value >= 70) return "orange";
    return "red";
  };

  return (
    <div className="uptime-page">
      {/* Header */}
      <div className="uptime-header">
        <h2>System Health & Monitoring</h2>
        <div className="uptime-controls">
          <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
            <option value="">Date Range</option>
            {filters.date_ranges.map((range, idx) => (
              <option key={idx} value={range}>{range}</option>
            ))}
          </select>

          <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)}>
            <option value="">Store</option>
            {filters.stores.map((store, idx) => (
              <option key={idx} value={store}>{store}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Uptime Cards */}
      <div className="uptime-grid">
        {Object.entries(uptimeData)
          .filter(([key]) => key !== "platform_uptime")
          .map(([key, value]) => (
            <div key={key} className={`uptime-card ${getCardClass(value.operational)}`}>
              <h4>{key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</h4>
              <p>{value.status}</p>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${value.operational || 0}%` }}
                ></div>
              </div>
            </div>
          ))}

        {uptimeData.platform_uptime && (
          <div className="uptime-card neutral">
            <h4>Platform Uptime</h4>
            <p>{uptimeData.platform_uptime}% Overall</p>
          </div>
        )}
      </div>

      {/* Error Section */}
      <div className="error-section">
        <h3>Recent Errors</h3>
        {!errorsVisible ? (
          <>
            {errors.length === 0 ? (
              <p className="no-error-text">No Errors Present!</p>
            ) : (
              <button className="expand-btn" onClick={toggleErrors}>
                {errors.length} Error(s) Present — Click to expand
              </button>
            )}
          </>
        ) : (
          <div className="error-log">
            {errors.map((err, idx) => (
              <div key={idx} className="error-item">
                <p className="error-time">
                  ({new Date(err.timestamp).toLocaleString()})
                </p>
                <p className="error-details">{err.message}</p>
                <p>Component: {err.component}</p>
                <p>Transactions affected: {err.affected_users}</p>
              </div>
            ))}
            <button className="collapse-btn" onClick={toggleErrors}>
              Hide Errors
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewUptimePage;
