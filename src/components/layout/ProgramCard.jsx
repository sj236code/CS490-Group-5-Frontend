import { Calendar, Gift, TrendingUp, Gem } from "lucide-react";

function ProgramCard({ name, tier, points, visits, progress, message, activity }) {
  const nextRewardAt = 420;
  const pointsAway = Math.max(nextRewardAt - points, 0);
  const progressPercent = Math.min((points / nextRewardAt) * 100, 100);

  return (
    <div className="loy-program">
      {/* Header */}
      <div className="loy-program-head">
        <div className="loy-program-id">
          <div className="loy-diamond">
            <Gem size={16} />
          </div>
          <div>
            <div className="loy-program-name">{name}</div>
            <div className="loy-program-rule">$1 = 1 point</div>
          </div>
        </div>
        <span className="loy-badge">{tier}</span>
      </div>

      {/* Metrics */}
      <div className="loy-metrics">
        <div>
          <div className="loy-metric-label">Current Points</div>
          <div className="loy-metric-value">{points}</div>
        </div>
        <div>
          <div className="loy-metric-label">Total Visits</div>
          <div className="loy-metric-value">{visits}</div>
        </div>
      </div>

      {/* Next Reward + Progress Bar */}
      <div className="loy-next">
        <div className="loy-next-row">
          <span className="loy-next-left">
            <Calendar size={16} style={{ marginRight: 6 }} />
            Next Reward
          </span>
          <span className="loy-next-right">{pointsAway} points away</span>
        </div>
        <div className="loy-progress">
          <div
            className="loy-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="loy-info">{message}</div>
      </div>

      {/* Tabs (static) */}
      <div className="loy-tabs">
        <button className="loy-tab loy-tab-active">
          <TrendingUp size={14} style={{ marginRight: 6 }} />
          Recent Activity
        </button>
        <button className="loy-tab">
          <Gift size={14} style={{ marginRight: 6 }} />
          Reward
        </button>
      </div>

      {/* Activity List */}
      <ul className="loy-activity">
        {activity.map((a, i) => (
          <li key={i} className="loy-activity-row">
            <div className="loy-activity-left">
              <Calendar size={16} />
              <div>
                <div className="loy-activity-title">{a.title}</div>
                <div className="loy-activity-date">{a.date}</div>
              </div>
            </div>
            <div className="loy-activity-pts">+{a.pts} pts</div>
          </li>
        ))}
      </ul>

      <div className="loy-last">Last visit: Jan 6, 2025</div>
    </div>
  );
}

export default ProgramCard;
