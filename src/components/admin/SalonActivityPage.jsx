import React from "react";

function SalonActivityPage() {
  const salons = [
    { name: "Salon Lumière", verified: false },
    { name: "Salon A", verified: true },
    { name: "The Styling Loft", verified: false },
    { name: "Chic Cuts", verified: true },
  ];

  return (
    <div>
      <h2>Salon Performance</h2>
      <div className="salon-performance">
        <h3>Pending Verifications</h3>
        <ul>
          {salons.map((salon, i) => (
            <li key={i}>
              {salon.name}{" "}
              <span style={{ color: salon.verified ? "green" : "red" }}>
                {salon.verified ? "✔" : "✖"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SalonActivityPage;
