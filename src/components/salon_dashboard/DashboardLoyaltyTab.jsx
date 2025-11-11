// DashboardLoyaltyTab.jsx
import { useEffect, useState } from "react";
import { BarChart3, Users } from "lucide-react";

function DashboardLoyaltyTab({salon}) {
  // Program Summary
  const [programSummary, setProgramSummary] = useState({
    pointsPerDollar: 1,
    redeemText: "100 pts = $10 off",
  });

  // Manage Program Settings form
  const [programSettings, setProgramSettings] = useState({
    pointsPerDollar: 1,
    redemptionValue: "10 pts = $1",
    expirationDays: 365,
  });

  // Pause state
  const [isPaused, setIsPaused] = useState(false);

  // Chart + customer table
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

  // Later you can replace this with a real endpoint for summary + settings
  const loadProgramDetails = async () => {
    try {
      // Example shape if you fetch from your backend:
      // const res = await fetch(`${import.meta.env.VITE_API_URL}/api/loyalty/${salon.id}/settings`);
      // const data = await res.json();
      // setProgramSummary({
      //   pointsPerDollar: data.points_per_dollar,
      //   redeemText: data.redemption_text,
      // });
      // setProgramSettings({
      //   pointsPerDollar: data.points_per_dollar,
      //   redemptionValue: data.redemption_value,
      //   expirationDays: data.expiration_days,
      // });
      // setIsPaused(data.is_paused);

      // For now, use mock data
      const mockSummary = {
        pointsPerDollar: 1,
        redeemText: "100 pts = $10 off",
      };
      const mockSettings = {
        pointsPerDollar: 1,
        redemptionValue: "10 pts = $1",
        expirationDays: 365,
      };

      setProgramSummary(mockSummary);
      setProgramSettings(mockSettings);
      setIsPaused(false);
    } catch (err) {
      console.error("Unable to load program details:", err);
    }
  };

  const loadEngagementData = async () => {
    try {
      // Later:
      // const res = await fetch(`${import.meta.env.VITE_API_URL}/api/loyalty/${salon.id}/engagement`);
      // const data = await res.json();
      // setEngagementData(data);

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
      // Later:
      // const res = await fetch(`${import.meta.env.VITE_API_URL}/api/loyalty/${salon.id}/customers`);
      // const data = await res.json();
      // setCustomerPoints(data.customers);

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
    // When user saves, update summary to match settings
    const newSummary = {
      pointsPerDollar: programSettings.pointsPerDollar,
      redeemText: programSettings.redemptionValue,
    };
    setProgramSummary(newSummary);

    try {
      // Later you can send to backend:
      // await fetch(`${import.meta.env.VITE_API_URL}/api/loyalty/${salon.id}/settings`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     points_per_dollar: programSettings.pointsPerDollar,
      //     redemption_value: programSettings.redemptionValue,
      //     expiration_days: programSettings.expirationDays,
      //     is_paused: isPaused,
      //   }),
      // });
      console.log("Saving settings:", programSettings, "Paused:", isPaused);
    } catch (err) {
      console.error("Unable to save settings:", err);
    }
  };

  const handlePauseToggle = async () => {
    const newPaused = !isPaused;
    setIsPaused(newPaused);

    try {
      // Later:
      // await fetch(`${import.meta.env.VITE_API_URL}/api/loyalty/${salon.id}/pause`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ is_paused: newPaused }),
      // });
      console.log(newPaused ? "Program paused" : "Program unpaused");
    } catch (err) {
      console.error("Unable to update pause state:", err);
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

            {isPaused ? (
              <p className="loyalty-text-line">Program Paused</p>
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
            <h2 className="loyalty-card-title">Manage Program Settings</h2>

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
                Save Changes
              </button>
              <button className="loyalty-secondary-btn" onClick={handlePauseToggle}>
                {isPaused ? "Unpause Program" : "Pause Program"}
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
