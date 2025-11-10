import { Calendar, Gift, TrendingUp, Gem } from "lucide-react";

function ProgramCard({ name, tier, points, visits, progress, message, activity, pointsPerDollar }) {
  const nextRewardAt = progress?.points_to_next_reward ?? 0;
  const pointsAway =
    progress?.points_away ??
    (nextRewardAt > 0 ? Math.max(nextRewardAt - points, 0) : 0);

  const progressPercent = nextRewardAt > 0 ? Math.min((points / nextRewardAt) * 100, 100) : 0;

  const lastVisitText = activity && activity.length > 0 ? activity[0].date : "No visits yet";

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
            {pointsPerDollar && (
              <div className="loy-program-rule">
                $1 = {pointsPerDollar !== 1 ? "s" : ""}
              </div>
            )}
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
          {nextRewardAt > 0 && (
            <span className="loy-next-right">{pointsAway} points away</span>
          )}
        </div>
        {nextRewardAt > 0 && (
          <>
            <div className="loy-progress">
              <div className="loy-progress-fill" style={{ width: `${progressPercent}%` }}/>
            </div>
          </>
        )}
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
