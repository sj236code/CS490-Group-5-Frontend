import React, { useState } from "react";
import { Link } from "react-router-dom";

import "../App.css";

const EmployeeAvailability = () => {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <div className="availability-container">
      <header className="jade-header">
        <h1>Employee Availability</h1>
      </header>

      <div className="tab-bar">
  <Link to="/employee-overview">
    <button>Overview</button>
  </Link>
  <Link to="/employee-schedule">
    <button>Schedule</button>
  </Link>
  <Link to="/employee-availability">
    <button className="active-tab">Availability</button>
  </Link>
</div>


      <section className="availability-status">
        <div>
          <h4>Employment Status</h4>
          <p>Your current employment type and weekly hours</p>
          <p>🕓 Total Weekly Hours: 40 hours</p>
        </div>
        <span className="status-badge">Full-Time</span>
      </section>

      <section className="weekly-availability">
        <div className="section-header">
          <h4>Weekly Availability</h4>
          <p>Your scheduled working hours for each day</p>
          <button onClick={() => setShowEditModal(true)}>Edit Hours</button>
        </div>

        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
          <div key={day} className="day-row">
            <span>{day}</span>
            <span className="time-slot">🕓 09:00 - 17:00 (8 hours)</span>
          </div>
        ))}

        {["Saturday", "Sunday"].map((day) => (
          <div key={day} className="day-row unavailable">
            <span>{day}</span>
            <span className="not-available">Not Available</span>
          </div>
        ))}
      </section>

      <div className="salon-hours">
        <p>💈 Salon Hours: 08:00 - 20:00</p>
        <p>Your working hours must be within the salon's operating hours.</p>
      </div>

      {showEditModal && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <h3>Edit Weekly Hours</h3>
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
              (day) => (
                <div key={day} className="edit-row">
                  <span>{day}</span>
                  <div className="edit-times">
                    <input type="time" defaultValue="09:00" /> -
                    <input type="time" defaultValue="17:00" />
                    <label>
                      <input type="checkbox" defaultChecked /> Available
                    </label>
                  </div>
                </div>
              )
            )}
            <div className="edit-modal-actions">
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
              <button>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAvailability;
