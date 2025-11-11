import { UserRound, Gift, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import ProgramCard from "../components/layout/ProgramCard"; // adjust path if needed

function CustomerLoyalty() {
  const lifetimePoints = 920;
  const activePrograms = 3;
  const totalVisits = 8;

  const activity = [
    { title: "Haircut & Style", date: "Jan 6, 2025", pts: 85 },
    { title: "Color Treatment", date: "Dec 15, 2024", pts: 150 },
    { title: "Manicure", date: "Oct 15, 2024", pts: 45 },
  ];

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

      {/* 3 program cards */}
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
      />
    </div>
  );
}

export default CustomerLoyalty;
