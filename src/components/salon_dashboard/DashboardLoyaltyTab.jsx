// DashboardLoyaltyTab.jsx
import { useEffect, useState } from "react";
import { BarChart3, Users } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, "")
  : "";

function DashboardLoyaltyTab({ salon }) {
  // Program Summary
  const [programSummary, setProgramSummary] = useState({
    pointsPerDollar: 1,
    redeemText: "100 pts = $10 off",
  });

  // Manage Program Settings form
  const [programSettings, setProgramSettings] = useState({
    pointsPerDollar: 1,
    redemptionValue: "100 pts = $10 off",
    expirationDays: 365,
  });

  const [hasProgram, setHasProgram] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // true when active=0

  // Chart + customer table (still mock for now)
  const [engagementData, setEngagementData] = useState([]);
  const [customerPoints, setCustomerPoints] = useState([]);

  // Load data when salon changes
  useEffect(() => {
    if (salon?.id) {
      loadProgramDetails();
      loadEngagementData();
      loadCustomerPoints();
    }
  }, [salon?.id]);

  const loadProgramDetails = async () => {
    if (!salon?.id) return;

    try {
      const res = await fetch(`${API_BASE}/api/loyalty/salon/${salon.id}`);

      if (!res.ok) {
        // If backend says "no program", treat as no program configured yet
        if (res.status === 404) {
          console.warn("No loyalty program found for this salon yet.");
          setHasProgram(false);
          setIsPaused(true);
          return;
        }

        console.error("Failed to load loyalty program:", res.status);
        setHasProgram(false);
        setIsPaused(true);
        return;
      }

      const data = await res.json();
      console.log("Loyalty program for salon:", data);

      setHasProgram(true);

      const redeemText = data.reward_description || "100 pts = $10 off";

      const pointsPerDollar = Number(data.points_per_dollar || 1);

      setProgramSummary({
        pointsPerDollar,
        redeemText,
      });

      setProgramSettings((prev) => ({
        ...prev,
        pointsPerDollar,
        redemptionValue: redeemText,
      }));

      // active is 0/1 – active=0 means "inactive / not set up / paused"
      const active = data.active;
      setIsPaused(active === 0 || active === false);
    } catch (err) {
      console.error("Unable to load program details:", err);
      setHasProgram(false);
      setIsPaused(true);
    }
  };

  const loadEngagementData = async () => {
    try {
      const mockEngagement = [
        { month: "Jan", earned: 300, redeemed: 100 },
        { month: "Feb", earned: 600, redeemed: 250 },
        { month: "Mar", earned: 900, redeemed: 400 },
        { month: "Apr", earned: 1400, redeemed: 600 },
        { month: "May", earned: 1500, redeemed: 800 },
        { month: "Jun", earned: 1600, redeemed: 900 },
      ];
      setEngagementData(mockEngagement);
    } catch (err) {
      console.error("Unable to load engagement data:", err);
    }
  };

  const loadCustomerPoints = async () => {
    try {
      const mockCustomers = [
        { id: 1, name: "John Doe", points: 320, visits: 12, lastVisit: "Jan 6" },
        { id: 2, name: "Jane Doe", points: 80, visits: 3, lastVisit: "Sept 28" },
      ];
      setCustomerPoints(mockCustomers);
    } catch (err) {
      console.error("Unable to load customer points:", err);
    }
  };

  // Form handlers
  const handleSettingsChange = (field, value) => {
    setProgramSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveSettings = async () => {
    const newSummary = {
      pointsPerDollar: programSettings.pointsPerDollar,
      redeemText: programSettings.redemptionValue,
    };
    setProgramSummary(newSummary);

    if (!salon?.id) {
      console.warn("No salon id available to save settings");
      return;
    }

    try {
      const body = {
        reward_description: programSettings.redemptionValue,
        active: isPaused ? 0 : 1,
        // points_per_dollar: programSettings.pointsPerDollar, // when supported
      };

      const res = await fetch(`${API_BASE}/api/loyalty/salon/${salon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        console.error("Unable to save settings:", errBody || res.status);
      } else {
        const data = await res.json();
        console.log("Saved loyalty settings:", data);
        setHasProgram(true);
      }
    } catch (err) {
      console.error("Unable to save settings:", err);
    }
  };

  const handlePauseToggle = async () => {
    if (!salon?.id) {
      console.warn("No salon id available to toggle pause");
      return;
    }

    const newPaused = !isPaused;
    setIsPaused(newPaused);

    try {
      const body = {
        active: newPaused ? 0 : 1,
      };

      const res = await fetch(`${API_BASE}/api/loyalty/salon/${salon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        console.error("Unable to update pause state:", errBody || res.status);
        setIsPaused(!newPaused);
      } 
      else {
        const data = await res.json();
        console.log("Updated pause state:", data);
        setHasProgram(true);
      }
    } 
    catch (err) {
      console.error("Unable to update pause state:", err);
      setIsPaused(!newPaused);
    }
  };

  return (
    <div className="loyalty-tab-container">
      <div className="loyalty-grid">
        {/* LEFT COLUMN: Program summary + settings */}
        <div className="loyalty-left-column">
          {/* Program Summary Card */}
          <div className="loyalty-card program-summary-card">
            <h2 className="loyalty-card-title">Program Summary</h2>

            {/* NEW SUMMARY LOGIC */}
            {!hasProgram ? (
              <p className="loyalty-text-line">
                No loyalty program found. Use the form below to set up your Loyalty Program.
              </p>
            ) : isPaused ? (
              <p className="loyalty-text-line">
                Set up Loyalty Program to see Details.
              </p>
            ) : (
              <>
                <p className="loyalty-text-line">
                  1 Point = ${programSummary.pointsPerDollar} spent
                </p>
                <p className="loyalty-text-line">
                  Redeem: {programSummary.redeemText}
                </p>
              </>
            )}
          </div>

          {/* Manage Program Settings Card */}
          <div className="loyalty-card program-settings-card">
            <h2 className="loyalty-card-title">
              {hasProgram && !isPaused ? "Manage Program Settings" : "Set up Loyalty Program"}
            </h2>

            <div className="loyalty-field-row">
              <label className="loyalty-label">Points per $ spent:</label>
              <input
                className="loyalty-input"
                type="number"
                min="0"
                value={programSettings.pointsPerDollar}
                onChange={(e) =>
                  handleSettingsChange("pointsPerDollar", Number(e.target.value))
                }
              />
            </div>

            <div className="loyalty-field-row">
              <label className="loyalty-label">Redemption Value:</label>
              <input
                className="loyalty-input"
                type="text"
                value={programSettings.redemptionValue}
                onChange={(e) =>
                  handleSettingsChange("redemptionValue", e.target.value)
                }
              />
            </div>

            <div className="loyalty-field-row">
              <label className="loyalty-label">Expiration:</label>
              <input
                className="loyalty-input"
                type="text"
                value={`${programSettings.expirationDays} days`}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, "");
                  const days = raw ? Number(raw) : "";
                  handleSettingsChange("expirationDays", days);
                }}
              />
            </div>

            <div className="loyalty-button-row">
              <button className="loyalty-primary-btn" onClick={handleSaveSettings}>
                {hasProgram && !isPaused ? "Save Changes" : "Create Program"}
              </button>
              <button className="loyalty-secondary-btn" onClick={handlePauseToggle}>
                {isPaused ? "Activate Program" : "Pause Program"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Engagement chart + customer table */}
        <div className="loyalty-right-column">
          {/* Customer Engagement Card */}
          <div className="loyalty-card engagement-card">
            <div className="loyalty-card-header">
              <h2 className="loyalty-card-title">Customer Engagement</h2>
              <BarChart3 size={20} className="loyalty-card-icon" />
            </div>
            <p className="loyalty-subtitle">
              Points Earned vs Redeemed{" "}
              <span className="loyalty-subtitle-light">(monthly)</span>
            </p>

            <div className="loyalty-chart">
              <div className="loyalty-chart-body">
                {engagementData.map((item) => (
                  <div key={item.month} className="loyalty-chart-column">
                    <div className="loyalty-chart-bars">
                      <div
                        className="loyalty-bar-earned"
                        style={{ height: `${(item.earned / 2000) * 100}%` }}
                        title={`Earned: ${item.earned}`}
                      />
                      <div
                        className="loyalty-bar-redeemed"
                        style={{ height: `${(item.redeemed / 2000) * 100}%` }}
                        title={`Redeemed: ${item.redeemed}`}
                      />
                    </div>
                    <span className="loyalty-chart-label">{item.month}</span>
                  </div>
                ))}
              </div>

              <div className="loyalty-chart-legend">
                <span className="loyalty-legend-item">
                  <span className="loyalty-legend-swatch loyalty-legend-earned" />
                  Earned
                </span>
                <span className="loyalty-legend-item">
                  <span className="loyalty-legend-swatch loyalty-legend-redeemed" />
                  Redeemed
                </span>
              </div>
            </div>
          </div>

          {/* Customer Points Card */}
          <div className="loyalty-card customer-points-card">
            <div className="loyalty-card-header">
              <h2 className="loyalty-card-title">Customer Points</h2>
              <Users size={20} className="loyalty-card-icon" />
            </div>

            <div className="loyalty-table">
              <div className="loyalty-table-header">
                <span className="loyalty-table-col loyalty-table-name">
                  Customer Name
                </span>
                <span className="loyalty-table-col">Points</span>
                <span className="loyalty-table-col">Visits</span>
                <span className="loyalty-table-col">Last Visit</span>
              </div>

              {customerPoints.map((cust) => (
                <div key={cust.id} className="loyalty-table-row">
                  <span className="loyalty-table-col loyalty-table-name">
                    {cust.name}
                  </span>
                  <span className="loyalty-table-col">{cust.points}</span>
                  <span className="loyalty-table-col">{cust.visits}</span>
                  <span className="loyalty-table-col">{cust.lastVisit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardLoyaltyTab;
