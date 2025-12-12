// src/components/salon_owner/DashboardLoyaltyTab.jsx
import { useEffect, useState } from "react";
import { BarChart3, Users } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, "")
  : "";

function DashboardLoyaltyTab({ salon }) {
  const [loadingProgram, setLoadingProgram] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [programExists, setProgramExists] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const [programSummary, setProgramSummary] = useState({
    pointsPerDollar: "",
    pointsForReward: "",
    rewardType: "FIXED_AMOUNT",
    rewardValue: "",
  });

  const [programSettings, setProgramSettings] = useState({
    pointsPerDollar: "",
    pointsForReward: "",
    rewardType: "FIXED_AMOUNT",
    rewardValue: "",
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);

  const [engagementData, setEngagementData] = useState([]);
  const [customerPoints, setCustomerPoints] = useState([]);

  useEffect(() => {
    if (salon?.id) {
      console.log("[LoyaltyTab] Salon detected:", salon);
      loadProgramDetails();
      loadEngagementData();
      loadCustomerPoints();
    }
  }, [salon?.id]);


  const loadProgramDetails = async () => {
    if (!salon?.id) return;

    console.log("Fetching loyalty program for salon: ", salon.id);

    setLoadingProgram(true);
    setLoadError(null);
    setSaveSuccess(null);

    try {
      const res = await fetch(`${API_BASE}/api/loyalty/salon/${salon.id}`);
      console.log("Loyalty program status: ", res.status);

      const data = await res.json();
      console.log("Loyalty program response: ", data);

      if (!data.id) {
        console.log("No loyalty program exists yet for this salon");
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

      setProgramExists(true);

      const active = data.active === 1;
      console.log("Program active state: ", active);
      setIsActive(active);

      const summary = {
        pointsPerDollar: data.points_per_dollar ?? "",
        pointsForReward: data.points_for_reward ?? "",
        rewardType: "FIXED_AMOUNT",
        rewardValue: data.reward_value ?? "",
      };

      console.log("Parsed loyalty summary: ", summary);

      setProgramSummary(summary);
      setProgramSettings(summary);
    } catch (err) {
      console.error("Loyalty program fetch failed:", err);
      setLoadError("Unable to load loyalty program.");
      setProgramExists(false);
      setIsActive(false);
    } finally {
      setLoadingProgram(false);
    }
  };
 
  // Mock rn
  const loadEngagementData = async () => {
    console.log("Loading engagement data");
    setEngagementData([
      { month: "Jan", earned: 300, redeemed: 100 },
      { month: "Feb", earned: 600, redeemed: 250 },
      { month: "Mar", earned: 900, redeemed: 400 },
      { month: "Apr", earned: 1400, redeemed: 600 },
      { month: "May", earned: 1500, redeemed: 800 },
      { month: "Jun", earned: 1600, redeemed: 900 },
    ]);
  };

  const loadCustomerPoints = async () => {
    console.log("Loading customer points");
    setCustomerPoints([
      { id: 1, name: "John Doe", points: 320, visits: 12, lastVisit: "Jan 6" },
      { id: 2, name: "Jane Doe", points: 80, visits: 3, lastVisit: "Sept 28" },
    ]);
  };


  const handleSettingsChange = (field, value) => {
    console.log(`Changed ${field}: `, value);
    setProgramSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSaveSuccess(null);
    setSaveError(null);
  };

  // Save prog
  const handleSaveSettings = async () => {
    if (!salon?.id) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    const body = {
      active: isActive ? 1 : 0,
      points_per_dollar: programSettings.pointsPerDollar,
      points_for_reward: programSettings.pointsForReward,
      reward_type: "FIXED_AMOUNT",
      reward_value: programSettings.rewardValue,
      reward_description: `Earn ${programSettings.pointsPerDollar} pts per $1, Redeem ${programSettings.pointsForReward} pts`,
    };

    console.log("Sending loyalty program payload: ", body);

    try {
      const res = await fetch(`${API_BASE}/api/loyalty/salon/${salon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      console.log("Save status: ", res.status);

      const data = await res.json();
      console.log("Save response: ", data);

      setProgramSummary({
        pointsPerDollar: data.points_per_dollar ?? "",
        pointsForReward: data.points_for_reward ?? "",
        rewardType: "FIXED_AMOUNT",
        rewardValue: data.reward_value ?? "",
      });

      setProgramExists(true);
      setIsActive(data.active === 1);
      setSaveSuccess("Loyalty program saved.");
    } catch (err) {
      console.error("Save failed:", err);
      setSaveError("Unable to save loyalty program settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!salon?.id) return;

    const newActive = !isActive;
    console.log("Toggling active state: ", newActive);

    setIsActive(newActive);

    try {
      const res = await fetch(`${API_BASE}/api/loyalty/salon/${salon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newActive ? 1 : 0 }),
      });

      const data = await res.json();
      console.log("Toggle response: ", data);

      setIsActive(data.active === 1);
      setSaveSuccess(data.active ? "Program activated." : "Program deactivated.");
    } catch (err) {
      console.error("Toggle failed: ", err);
      setIsActive(!newActive);
      setSaveError("Unable to update program status.");
    }
  };

  const renderProgramSummaryContent = () => {
    if (loadingProgram) {
      return (
        <p className="loyalty-text-line">
          Loading loyalty program...
        </p>
      );
    }

    if (!programExists) {
      return (
        <div className="loyalty-empty-state">
          <p className="loyalty-text-line">
            No loyalty program set up yet.
          </p>
          <p className="loyalty-subtitle">
            Configure how points are earned and redeemed in the form below, then activate the program.
          </p>
        </div>
      );
    }

    if (!isActive) {
      return (
        <div className="loyalty-paused-state">
          <p className="loyalty-text-line">
            A loyalty program exists but is currently not active.
          </p>
          <p className="loyalty-subtitle">
            Review your settings below and click “Activate Program” when you're ready.
          </p>
        </div>
      );
    }

    return (
      <>
        <p className="loyalty-text-line">
          Earn Rate:{" "}
          {programSummary.pointsPerDollar || 0} pts per $1 spent
        </p>
        <p className="loyalty-text-line">
          Reward:{" "}
          {programSummary.pointsForReward || 0} pts for $
          {programSummary.rewardValue || 0} off
        </p>
        <p className="loyalty-subtitle">
          Reward type: {programSummary.rewardType || "FIXED_AMOUNT"}
        </p>
      </>
    );
  };

  return (
    <div className="loyalty-tab-container">
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
              <input
                className="loyalty-input loyalty-input-disabled"
                value="Fixed $ amount off"
                disabled
                readOnly
              />
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
    </div>
  );
}

export default DashboardLoyaltyTab;
