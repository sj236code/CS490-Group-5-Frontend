import React from "react";

function DemographicsPage() {
  return (
    <div>
      <h2>Admin Visualizes User Demographics</h2>
      <div className="demographics">
        <p><strong>Gender:</strong> 45% Female, 45% Male, 10% Other</p>
        <p><strong>Age Groups:</strong> 25-34 → 40%, 35-44 → 30%, 18-24 → 15%, 45+ → 15%</p>
      </div>
    </div>
  );
}

export default DemographicsPage;
