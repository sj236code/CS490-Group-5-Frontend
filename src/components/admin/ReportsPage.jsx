import React from "react";

function ReportsPage() {
  return (
    <div>
      <h2>Generate & Share Performance Reports</h2>
      <form>
        <label>
          <input type="checkbox" defaultChecked /> User Demographics
        </label><br />
        <label>
          <input type="checkbox" defaultChecked /> User Engagement
        </label><br />
        <label>
          <input type="checkbox" /> Revenue
        </label><br /><br />
        <button type="button">Download Report</button>
      </form>
    </div>
  );
}

export default ReportsPage;
