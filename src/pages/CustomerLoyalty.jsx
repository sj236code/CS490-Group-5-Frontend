import { UserRound, Gift, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function CustomerLoyalty() {
  const location = useLocation();
  const userFromState = location.state?.user;
  const customerId = userFromState?.profile_id ?? null;

  console.log("Customer id:", customerId);
  console.log("User: ", location.state?.user);

  const [lifetimePoints, setLifetimePoints] = useState(0);
  const [activePrograms, setActivePrograms] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [programs, setPrograms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getTierFromPoints = (points) => {
    if (points >= 250) return "Gold";
    if (points >= 100) return "Silver";
    if (points > 0) return "Bronze";s
    return "Member";
  };

  const getProgramMessage = (prog) => {
    const progress = prog.next_reward_progress || {};
    const pointsAway = progress.points_away ?? 0;
    const pointsToNext = progress.points_to_next_reward ?? 0;

    if (pointsAway <= 0 && pointsToNext > 0) {
      return "You’ve unlocked a reward! Redeem it at your next visit.";
    }

    if (pointsAway > 0 && pointsToNext > 0) {
      return `Only ${pointsAway} points away from your next reward (${pointsToNext} points needed).`;
    }

    if (prog.program_details?.points_per_dollar) {
      return `Earn ${prog.program_details.points_per_dollar} points for every $1 you spend here.`;
    }

    return "Earn points on every visit to unlock rewards.";
  };

  const getProgressPercent = (prog) => {
    const progress = prog.next_reward_progress || {};
    const pointsAway = progress.points_away ?? 0;
    const pointsToNext = progress.points_to_next_reward ?? 0;

    if (!pointsToNext || pointsToNext <= 0) return 0;

    const earnedTowardNext = pointsToNext - pointsAway;
    const pct = (earnedTowardNext / pointsToNext) * 100;
    return Math.min(Math.max(pct, 0), 100);
  };

  useEffect(() => {
    const fetchLoyaltyData = async () => {
      if (!customerId) {
        setError("No customer found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // 1) Points summary (lifetime + current)
        try {
          const pointsRes = await fetch(
            `${import.meta.env.VITE_API_URL}/api/loyalty/customers/${customerId}/points-summary`
          );

          if (pointsRes.ok) {
            const pointsData = await pointsRes.json();
            setLifetimePoints(pointsData.lifetime_points || 0);
            console.log("Points summary:", pointsData);
          } else if (pointsRes.status === 404) {
            console.warn("Customer not found for points summary");
            setLifetimePoints(0);
          } else {
            console.error("Failed to fetch points summary");
          }
        } catch (pointsErr) {
          console.error("Error loading points summary:", pointsErr);
        }

        // 2) Dashboard summary (active programs + total visits)
        const dashboardResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/loyalty/customers/${customerId}/dashboard`
        );

        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json();
          setActivePrograms(dashboardData.active_programs_count || 0);
          setTotalVisits(dashboardData.total_visits_all_time || 0);
          console.log("Dashboard info received: ", dashboardData);
        } else if (dashboardResponse.status === 404) {
          console.error("Customer not found for loyalty dashboard");
          setError("We couldn’t find loyalty info for this account yet.");
        } else {
          console.error("Failed to fetch loyalty dashboard");
          setError("Unable to load your loyalty summary right now.");
        }

        // 3) Programs list
        const programsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/loyalty/customers/${customerId}/programs`
        );

        if (programsResponse.ok) {
          const programsData = await programsResponse.json();
          console.log("Loyalty Programs Loaded: ", programsData);

          const programsWithExtras = await Promise.all(
            (Array.isArray(programsData) ? programsData : []).map(async (prog) => {
              let totalVisits = prog.total_visits_at_salon ?? 0;
              let rewardDetails = null;

              try {
                const visitsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/loyalty/customers/${customerId}/salons/${prog.salon_id}/visits`);
                if (visitsRes.ok) {
                  const visitsData = await visitsRes.json();
                  totalVisits = visitsData.total_completed_visits ?? 0;
                }
              } catch (e) {
                console.error("Error fetching visits for salon", prog.salon_id, e);
              }

              try {
                const rewardsRes = await fetch(
                  `${import.meta.env.VITE_API_URL}/api/loyalty/customers/${customerId}/programs/${prog.salon_id}/rewards`
                );

                if (rewardsRes.ok) {
                  const rewardsData = await rewardsRes.json();
                  // we only have one main reward in your endpoint
                  rewardDetails = rewardsData[0] ?? null;
                } else if (rewardsRes.status !== 404) {
                  console.error("Failed to fetch rewards for salon", prog.salon_id);
                }
              } catch (e) {
                console.error("Error fetching rewards for salon", prog.salon_id, e);
              }

              return {
                ...prog,
                total_visits_at_salon: totalVisits,
                reward_details: rewardDetails,
              };
            })
          );

          setPrograms(programsWithExtras);
        } else {
          console.error("Failed to fetch loyalty programs");
          setPrograms([]);
        }

      } catch (err) {
        console.error("Error loading loyalty data: ", err);
        setError("Something went wrong loading your rewards.");
      } finally {
        setLoading(false);
      }
    };

    fetchLoyaltyData();
  }, [customerId]);

  const getRedeemText = (prog) => {
    const rd = prog.reward_details;
    if (!rd) return null;

  const { points_cost, reward_value, reward_type } = rd;

    // Show "Redeem 1000 pts for $20 off" for FIXED_AMOUNT
    if (reward_type === "FIXED_AMOUNT") {
      return `Redeem ${points_cost} pts for $${reward_value} off`;
    }

    return `Redeem ${points_cost} pts`;
  };


  return (
    <div className="loy-page">
      {/* Title */}
      <div className="loy-title">
        <UserRound size={22} />
        <span>MyRewards</span>
      </div>

      {/* Stat cards */}
      <div className="loy-stats">
        <div className="loy-card">
          <Gift size={18} />
          <div>
            <div className="loy-card-label">Lifetime Points</div>
            <div className="loy-card-value">{lifetimePoints}</div>
          </div>
        </div>
        <div className="loy-card">
          <Gift size={18} />
          <div>
            <div className="loy-card-label">Active Programs</div>
            <div className="loy-card-value">{activePrograms}</div>
          </div>
        </div>
        <div className="loy-card">
          <Calendar size={18} />
          <div>
            <div className="loy-card-label">Total Visits</div>
            <div className="loy-card-value">{totalVisits}</div>
          </div>
        </div>
      </div>

      {loading && <p>Loading your rewards...</p>}
      {!loading && error && <p>{error}</p>}

      {!loading && !error && (
        <>
          <h3 className="loy-subtitle">Your Loyalty Programs</h3>

          {programs.length === 0 && (
            <p>You’re not enrolled in any loyalty programs yet.</p>
          )}

          {programs.map((prog) => {
            const tier = getTierFromPoints(prog.current_points || 0);
            const progressPercent = getProgressPercent(prog);
            const rulePoints = prog.program_details?.points_per_dollar;
            const redeemText = getRedeemText(prog);

            return (
              <div className="loy-program" key={prog.salon_id}>
                {/* Header */}
                <div className="loy-program-head">
                  <div className="loy-program-id">
                    <div className="loy-diamond">
                      <Gift size={16} />
                    </div>
                    <div>
                      <div className="loy-program-name">{prog.salon_name}</div>
                      {rulePoints && (
                        <div className="loy-program-rule">
                          Earn {rulePoints} pts per $1
                        </div>
                      )}
                      {redeemText && (
                        <div className="loy-program-redeem">
                          {redeemText}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="loy-badge">{tier}</div>
                </div>

                {/* Metrics row */}
                <div className="loy-metrics">
                  <div>
                    <div className="loy-metric-label">Current Points</div>
                    <div className="loy-metric-value">
                      {prog.current_points || 0}
                    </div>
                  </div>
                  <div>
                    <div className="loy-metric-label">Visits to This Salon</div>
                    <div className="loy-metric-value">
                      {prog.total_visits_at_salon || 0}
                    </div>
                  </div>
                </div>

                {/* Next reward + progress */}
                <div className="loy-next">
                  <div className="loy-next-row">
                    <div className="loy-next-left">Next Reward</div>
                    <div className="loy-next-right">
                      {getProgramMessage(prog)}
                    </div>
                  </div>

                  {progressPercent > 0 && (
                    <div className="loy-progress">
                      <div
                        className="loy-progress-fill"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default CustomerLoyalty;
