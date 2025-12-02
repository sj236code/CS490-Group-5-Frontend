// src/components/salon_owner/DashboardLoyaltyTab.jsx
import { useEffect, useState } from "react";
import { BarChart3, Users } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, "")
  : "";

function DashboardLoyaltyTab({ salon }) {
  const [loadingProgram, setLoadingProgram] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Does a row exist in LoyaltyProgram for this salon?
  const [programExists, setProgramExists] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Program summary for the top card
  const [programSummary, setProgramSummary] = useState({
    pointsPerDollar: "",
    pointsForReward: "",
    rewardType: "FIXED_AMOUNT",
    rewardValue: "",
  });

  // Form state for editing / creating the program
  const [programSettings, setProgramSettings] = useState({
    pointsPerDollar: "",
    pointsForReward: "",
    rewardType: "FIXED_AMOUNT",
    rewardValue: "",
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);

  // Chart + customer table (still mock for now)
  const [engagementData, setEngagementData] = useState([]);
  const [customerPoints, setCustomerPoints] = useState([]);

  useEffect(() => {
    if (salon?.id) {
      loadProgramDetails();
      loadEngagementData();
      loadCustomerPoints();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salon?.id]);

  // --- GET /api/loyalty/salon/<salon_id> ---
  const loadProgramDetails = async () => {
    if (!salon?.id) return;

    setLoadingProgram(true);
    setLoadError(null);
    setSaveSuccess(null);

    try {
      const res = await fetch(`${API_BASE}/api/loyalty/salon/${salon.id}`);
      if (!res.ok) {
        console.error("Failed to load loyalty program:", res.status);
        setProgramExists(false);
        setIsActive(false);
        setProgramSummary({
          pointsPerDollar: "",
          pointsForReward: "",
          rewardType: "FIXED_AMOUNT",
          rewardValue: "",
        });
        setProgramSettings({
          pointsPerDollar: "",
          pointsForReward: "",
          rewardType: "FIXED_AMOUNT",
          rewardValue: "",
        });
        setLoadError("Unable to load loyalty program.");
        return;
      }

      const data = await res.json();
      console.log("Loyalty program for salon:", data);

      // If id is null → no program yet
      if (!data.id) {
        setProgramExists(false);
        setIsActive(false);
        setProgramSummary({
          pointsPerDollar: "",
          pointsForReward: "",
          rewardType: "FIXED_AMOUNT",
          rewardValue: "",
        });
        setProgramSettings({
          pointsPerDollar: "",
          pointsForReward: "",
          rewardType: "FIXED_AMOUNT",
          rewardValue: "",
        });
        return;
      }

      // Program exists
      setProgramExists(true);

      const active = data.active === 1;
      setIsActive(active);

      const pointsPerDollar =
        typeof data.points_per_dollar === "number"
          ? data.points_per_dollar
          : data.points_per_dollar
          ? Number(data.points_per_dollar)
          : "";

      const pointsForReward =
        data.points_for_reward !== null && data.points_for_reward !== undefined
          ? data.points_for_reward
          : "";

      const rewardType = data.reward_type || "FIXED_AMOUNT";

      const rewardValue =
        data.reward_value !== null && data.reward_value !== undefined
          ? Number(data.reward_value)
          : "";

      const summary = {
        pointsPerDollar,
        pointsForReward,
        rewardType,
        rewardValue,
      };

      setProgramSummary(summary);
      setProgramSettings(summary);
    } catch (err) {
      console.error("Unable to load program details:", err);
      setLoadError("Unable to load loyalty program.");
      setProgramExists(false);
      setIsActive(false);
    } finally {
      setLoadingProgram(false);
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
      // TODO: replace with real endpoint in future
      const mockCustomers = [
        {
          id: 1,
          name: "John Doe",
          points: 320,
          visits: 12,
          lastVisit: "Jan 6",
        },
        {
          id: 2,
          name: "Jane Doe",
          points: 80,
          visits: 3,
          lastVisit: "Sept 28",
        },
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
    setSaveSuccess(null);
    setSaveError(null);
  };

  // --- PUT /api/loyalty/salon/<salon_id> ---
  const handleSaveSettings = async () => {
    if (!salon?.id) {
      console.warn("No salon id available to save settings");
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const body = {};

      // active: 1 if we consider the program "on"
      body.active = isActive ? 1 : 0;

      // Only send fields that have values; backend handles validation
      const ppd = programSettings.pointsPerDollar;
      if (ppd !== "" && ppd !== null && ppd !== undefined) {
        body.points_per_dollar = Number(ppd);
      }

      const pfr = programSettings.pointsForReward;
      if (pfr !== "" && pfr !== null && pfr !== undefined) {
        body.points_for_reward = parseInt(pfr, 10);
      }

      if (programSettings.rewardType) {
        body.reward_type = programSettings.rewardType;
      }

      const rv = programSettings.rewardValue;
      if (rv !== "" && rv !== null && rv !== undefined) {
        body.reward_value = Number(rv);
      }

      // Optional: nice human-readable description
      // e.g. "Earn 1 pt per $1, redeem 100 pts for $10 off"
      const descParts = [];
      if (ppd) descParts.push(`Earn ${ppd} pts per $1`);
      if (pfr && rv) {
        const unit =
          programSettings.rewardType === "PERCENT" ? "% off" : "$ off";
        descParts.push(`Redeem ${pfr} pts for ${rv}${unit}`);
      }
      const desc = descParts.join(", ");
      if (desc) {
        body.reward_description = desc;
      }

      const res = await fetch(`${API_BASE}/api/loyalty/salon/${salon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        console.error("Unable to save settings:", errBody || res.status);
        setSaveError(
          errBody?.message || "Unable to save loyalty program settings."
        );
        return;
      }

      const data = await res.json();
      console.log("Saved loyalty settings:", data);

      // Update local summary from response
      const updatedPointsPerDollar =
        data.points_per_dollar !== null && data.points_per_dollar !== undefined
          ? Number(data.points_per_dollar)
          : "";

      const updatedPointsForReward =
        data.points_for_reward !== null && data.points_for_reward !== undefined
          ? data.points_for_reward
          : "";

      const updatedRewardType = data.reward_type || "FIXED_AMOUNT";

      const updatedRewardValue =
        data.reward_value !== null && data.reward_value !== undefined
          ? Number(data.reward_value)
          : "";

      const summary = {
        pointsPerDollar: updatedPointsPerDollar,
        pointsForReward: updatedPointsForReward,
        rewardType: updatedRewardType,
        rewardValue: updatedRewardValue,
      };

      setProgramSummary(summary);
      setProgramExists(true);
      setIsActive(data.active === 1);
      setSaveSuccess("Loyalty program saved.");
    } catch (err) {
      console.error("Unable to save settings:", err);
      setSaveError("Unable to save loyalty program settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!salon?.id) return;
    const newActive = !isActive;
    setIsActive(newActive);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const res = await fetch(`${API_BASE}/api/loyalty/salon/${salon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newActive ? 1 : 0 }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        console.error("Unable to toggle active:", errBody || res.status);
        setIsActive(!newActive); // revert
        setSaveError("Unable to update program status.");
        return;
      }

      const data = await res.json();
      console.log("Updated active state:", data);
      setIsActive(data.active === 1);
      setProgramExists(true);
      setSaveSuccess(
        data.active === 1 ? "Program activated." : "Program deactivated."
      );
    } catch (err) {
      console.error("Unable to update active state:", err);
      setIsActive(!newActive); // revert
      setSaveError("Unable to update program status.");
    }
  };

  const renderProgramSummaryContent = () => {
    if (loadingProgram) {
      return <p className="loyalty-text-line">Loading program...</p>;
    }

    // No program yet OR inactive → prompt to set up
    if (!programExists || !isActive) {
      return (
        <>
          <p className="loyalty-text-line">
            <strong>No active loyalty program.</strong>
          </p>
          <p className="loyalty-text-line">
            Set up points earning & redemption below so customers can start
            collecting rewards.
          </p>
        </>
      );
    }

    // Active program with configured values
    return (
      <>
        <p className="loyalty-text-line">
          Earn{" "}
          <strong>
            {programSummary.pointsPerDollar || 1} pts
          </strong>{" "}
          per $1 spent
        </p>
        {programSummary.pointsForReward && programSummary.rewardValue && (
          <p className="loyalty-text-line">
            Redeem{" "}
            <strong>{programSummary.pointsForReward} pts</strong> for{" "}
            <strong>
              {programSummary.rewardValue}
              {programSummary.rewardType === "PERCENT" ? "% off" : "$ off"}
            </strong>
          </p>
        )}
      </>
    );
  };

  return (
    <div className="loyalty-tab-container">
      <div className="loyalty-grid">
        {/* LEFT COLUMN: Program summary + settings */}
        <div className="loyalty-left-column">
          {/* Program Summary Card */}
          <div className="loyalty-card program-summary-card">
            <div className="loyalty-card-header">
              <h2 className="loyalty-card-title">Loyalty Program Summary</h2>
              <span className="loyalty-status-pill">
                {isActive && programExists ? "Active" : "Not Active"}
              </span>
            </div>

            {loadError && (
              <p className="loyalty-error-text">{loadError}</p>
            )}

            {renderProgramSummaryContent()}
          </div>

          {/* Manage Program Settings Card */}
          <div className="loyalty-card program-settings-card">
            <h2 className="loyalty-card-title">Configure Loyalty Program</h2>

            <p className="loyalty-subtitle">
              Define how customers earn points and what they can redeem them
              for.
            </p>

            <div className="loyalty-field-row">
              <label className="loyalty-label">
                Points earned per $1 spent
              </label>
              <input
                className="loyalty-input"
                type="number"
                min="0"
                step="0.01"
                value={programSettings.pointsPerDollar}
                onChange={(e) =>
                  handleSettingsChange("pointsPerDollar", e.target.value)
                }
                placeholder="e.g. 1"
              />
            </div>

            <div className="loyalty-field-row">
              <label className="loyalty-label">
                Points required to redeem a reward
              </label>
              <input
                className="loyalty-input"
                type="number"
                min="0"
                step="1"
                value={programSettings.pointsForReward}
                onChange={(e) =>
                  handleSettingsChange("pointsForReward", e.target.value)
                }
                placeholder="e.g. 100"
              />
            </div>

            <div className="loyalty-field-row">
              <label className="loyalty-label">Reward type</label>
              <select
                className="loyalty-input"
                value={programSettings.rewardType}
                onChange={(e) =>
                  handleSettingsChange("rewardType", e.target.value)
                }
              >
                <option value="FIXED_AMOUNT">Fixed $ amount off</option>
                <option value="PERCENT">Percent off</option>
                <option value="FREE_ITEM">Free item</option>
              </select>
            </div>

            <div className="loyalty-field-row">
              <label className="loyalty-label">
                Reward value{" "}
                {programSettings.rewardType === "PERCENT"
                  ? "(%)"
                  : programSettings.rewardType === "FREE_ITEM"
                  ? "(describe in description later)"
                  : "($)"}
              </label>
              <input
                className="loyalty-input"
                type="number"
                min="0"
                step="0.01"
                value={programSettings.rewardValue}
                onChange={(e) =>
                  handleSettingsChange("rewardValue", e.target.value)
                }
                placeholder={
                  programSettings.rewardType === "PERCENT"
                    ? "e.g. 10"
                    : programSettings.rewardType === "FREE_ITEM"
                    ? "e.g. 0"
                    : "e.g. 5"
                }
              />
            </div>

            {saveError && (
              <p className="loyalty-error-text">{saveError}</p>
            )}
            {saveSuccess && (
              <p className="loyalty-success-text">{saveSuccess}</p>
            )}

            <div className="loyalty-button-row">
              <button
                className="loyalty-primary-btn"
                onClick={handleSaveSettings}
                disabled={saving}
              >
                {saving ? "Saving..." : programExists ? "Save Changes" : "Create Program"}
              </button>
              <button
                className="loyalty-secondary-btn"
                onClick={handleToggleActive}
                disabled={saving || !programExists}
              >
                {isActive ? "Deactivate Program" : "Activate Program"}
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
                        style={{
                          height: `${(item.earned / 2000) * 100}%`,
                        }}
                        title={`Earned: ${item.earned}`}
                      />
                      <div
                        className="loyalty-bar-redeemed"
                        style={{
                          height: `${(item.redeemed / 2000) * 100}%`,
                        }}
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
