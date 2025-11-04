import React, { useState } from "react";
import AnalyticsPage from "../components/admin/AnalyticsPage";
import SalonActivityPage from "../components/admin/SalonActivityPage";
import DemographicsPage from "../components/admin/DemographicsPage";
import ReportsPage from "../components/admin/ReportsPage";
import ViewUptimePage from "../components/admin/ViewUptimePage";
import "../App.css";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Analytics");

  const renderContent = () => {
    switch (activeTab) {
      case "Analytics":
        return <AnalyticsPage />;
      case "SalonActivity":
        return <SalonActivityPage />;
      case "Demographics":
        return <DemographicsPage />;
      case "Reports":
        return <ReportsPage />;
      case "SystemHealth":
        return <ViewUptimePage />;
      default:
        return <AnalyticsPage />;
    }
  };

  return (
    <div className="admin-dashboard">
      <h1 className="admin-title">Welcome Jade.</h1>

      {/* Top Tabs */}
      <div className="admin-tabs">
        {["Analytics", "SalonActivity", "Demographics", "Reports", "ViewUptime"].map((tab) => (
          <button
            key={tab}
            className={`admin-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.replace(/([A-Z])/g, " $1").trim()}
          </button>
        ))}
      </div>

      <div className="admin-content">{renderContent()}</div>
    </div>
  );
}

export default AdminDashboard;
