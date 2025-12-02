import React, { useState } from "react";
import "../../App.css";

function ViewUptimePage() {
  const [errorsVisible, setErrorsVisible] = useState(false);

  const toggleErrors = () => setErrorsVisible(!errorsVisible);

  return (
    <div className="uptime-page">
      {/* Header */}
      <div className="uptime-header">
        <h2>System Health & Monitoring</h2>
        <div className="uptime-controls">
          <select>
            <option>Date Range</option>
            <option>Past Week</option>
            <option>Past Month</option>
          </select>
          <select>
            <option>Store</option>
            <option>All</option>
            <option>Newark</option>
            <option>Jersey City</option>
          </select>
        </div>
      </div>

      {/* Uptime Cards */}
      <div className="uptime-grid">
        <div className="uptime-card neutral">
          <h4>Platform Uptime</h4>
        </div>
        <div className="uptime-card green">
          <h4>Web App</h4>
          <p>100% Operational</p>
        </div>
        <div className="uptime-card gray">
          <h4>Database</h4>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "99%" }}></div>
          </div>
          <p>99.8% Operational</p>
        </div>
        <div className="uptime-card gray">
          <h4>Retention Rate</h4>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "68%" }}></div>
          </div>
        </div>
        <div className="uptime-card neutral">
          <h4>Engagement Over Time</h4>
        </div>
        <div className="uptime-card gray">
          <h4>API Services</h4>
          <div className="progress-bar red">
            <div className="progress-fill red" style={{ width: "99%" }}></div>
          </div>
          <p>99.8% Operational</p>
        </div>
        <div className="uptime-card red">
          <h4>Payment Gateway</h4>
          <p>75% Operational - Major Issue</p>
        </div>
      </div>

      {/* Error Section */}
      <div className="error-section">
        <h3>Recent Errors</h3>
        {!errorsVisible ? (
          <>
            <p className="no-error-text">No Errors Present!</p>
            <button className="expand-btn" onClick={toggleErrors}>
              Errors Present! Click to expand
            </button>
          </>
        ) : (
          <div className="error-log">
            <p className="error-time">(2024-10-26 14:30 EST)</p>
            <p className="error-details">
              Error 503: Service Unavailable — External payment processor.
            </p>
            <p>Transactions affected: 45 users</p>
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