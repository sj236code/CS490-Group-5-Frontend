import { UserRound, Gift, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import {useLocation} from "react-router-dom";
import ProgramCard from "../components/layout/ProgramCard";

function CustomerLoyalty() {
  const location = useLocation();
  const userFromState = location.state?.user;
  const user = userFromState;
  const customerId = userFromState?.profile_id ?? userIdFromState ?? null;
  // const customerId = 2;

  // const lifetimePoints = 920;
  // const activePrograms = 3;
  // const totalVisits = 8;
  
  const [lifetimePoints, setLifetimePoints] = useState(0);
  const [activePrograms, setActivePrograms] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);

  const [programs, setPrograms] = useState([]);

  // const activity = [
  //   { title: "Haircut & Style", date: "Jan 6, 2025", pts: 85 },
  //   { title: "Color Treatment", date: "Dec 15, 2024", pts: 150 },
  //   { title: "Manicure", date: "Oct 15, 2024", pts: 45 },
  // ];

  const getTierFromPoints = (points) => {
    if (points >= 500) return "Gold";
    if (points >= 250) return "Silver";
    if (points > 0) return "Bronze";
    return "Member";
  };

  const getProgramMessage = (prog) => {
    const progress = prog.next_reward_progress || {};
    const pointsAway = progress.points_away ?? 0;
    const pointsToNext = progress.points_to_next_reward ?? 0;

    if (pointsAway <= 0) {
      return "You’ve unlocked a reward! Redeem at your next visit.";
    }

    return `Only ${pointsAway} points away from your next reward (${pointsToNext} points).`;
  };

  const formatActivityDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {month: "short", day: "numeric", year: "numeric",});
  };

  useEffect(() => {
    const fetchLoyaltyData = async () => {
      try{

        // Dashboard Summ
        const dashboardResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/loyalty/customers/${customerId}/dashboard`);

        if (dashboardResponse.status === 404){
          console.error("Customer not found for loyalty dashboard");
        }
        else if(!dashboardResponse.ok){
          console.error("Failed to fetch loyalty dashboard");
        }
        else{
          const dashboardData = await dashboardResponse.json();
          setLifetimePoints(dashboardData.current_total_points || 0);
          setActivePrograms(dashboardData.active_programs_count || 0);
          setTotalVisits(dashboardData.total_visits_all_time || 0);
          console.log("Dashboard info recieved: ", dashboardData);
        }

        // Programs list
        const programsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/loyalty/customers/${customerId}/programs`);
        if(!programsResponse.ok){
          console.error("Failed to fetch loyalty programs");
          setPrograms([]);
          return;
        }

        const programsData = await programsResponse.json();
        console.log("Loyalty Programs Loaded: ", programsData);

        // Fetch recent activity for each active loyalty program
        const programsWithActivity = await Promise.all(
          (programsData || []).map(async (prog) => {
            try {
              const activityRes = await fetch(`${import.meta.env.VITE_API_URL}/api/loyalty/customers/${customerId}/programs/${prog.salon_id}/activity`);

              if (!activityRes.ok) {
                console.error("Failed to fetch loyalty activity for salon", prog.salon_id);
                return { ...prog, activity: [] };
              }

              const rawActivity = await activityRes.json();

              const activity = (rawActivity || []).map((txn) => ({
                title: txn.description || "Activity",
                date: formatActivityDate(txn.date),
                pts: txn.points_change,
              }));

              return { ...prog, activity };
            } 
            catch (err) {
              console.error("Error fetching activity:", err);
              return { ...prog, activity: [] };
            }
          })
        );
        setPrograms(programsWithActivity);

      }
      catch(err){
        console.error("Error loading loyalty data: ", err);
      }
    };

    fetchLoyaltyData();
  },[customerId]);

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

      <h3 className="loy-subtitle">Your Loyalty Programs</h3>

      {programs.length === 0 && (<p>You’re not enrolled in any loyalty programs yet.</p>)}

      {programs.map((prog) => (
        <ProgramCard
          key={prog.salon_id}
          name={prog.salon_name}
          tier={getTierFromPoints(prog.current_points)}
          points={prog.current_points}
          visits={prog.total_visits_at_salon}
          message={getProgramMessage(prog)}
          activity={prog.activity || []} 
          pointsPerDollar={prog.program_details?.points_per_dollar}
        />
      ))}

      {/* 3 program cards
      <ProgramCard
        name="Jade Boutique"
        tier="Gold"
        points={320}
        visits={12}
        message="You’ve earned 3 rewards! Redeem at your next visit!"
        activity={activity}
      />

      <ProgramCard
        name="Glow Studio"
        tier="Silver"
        points={260}
        visits={9}
        message="Almost there! Only a few visits away from your next reward."
        activity={activity}
      />

      <ProgramCard
        name="Radiant Lounge"
        tier="Bronze"
        points={140}
        visits={5}
        message="Keep earning points to unlock exclusive discounts!"
        activity={activity}
      /> */}
    </div>
  );
}

export default CustomerLoyalty;
