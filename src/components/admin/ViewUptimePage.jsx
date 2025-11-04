import React from "react";

function SystemHealthPage() {
  const systems = [
    { name: "Web App", status: "100% Operational", color: "green" },
    { name: "Database", status: "99.8% Operational", color: "green" },
    { name: "API Services", status: "99.8% Operational", color: "green" },
    { name: "Payment Gateway", status: "75% Operational - Major Issue", color: "red" },
  ];

  return (
    <div>
      <h2>System Health & Monitoring</h2>
      <div className="system-grid">
        {systems.map((sys, idx) => (
          <div key={idx} className="system-card" style={{ borderColor: sys.color }}>
            <h4>{sys.name}</h4>
            <p style={{ color: sys.color }}>{sys.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SystemHealthPage;
