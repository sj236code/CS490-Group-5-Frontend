import React from "react";
import "../App.css";

const EmployeeSchedule = () => {
  return (
    <div className="schedule-container">
      <header className="jade-header">
        <h1>Employee Schedule</h1>
      </header>

      <div className="tab-bar">
        <button>Overview</button>
        <button className="active-tab">Schedule</button>
        <button>Availability</button>
      </div>

      <div className="schedule-header">
        <h4>Work Schedule</h4>
        <p>View your scheduled shifts and working hours</p>
        <div className="date-nav">
          <button>{"<"}</button>
          <span>Oct 6 - Oct 12, 2025</span>
          <button>{">"}</button>
        </div>
      </div>

      <div className="schedule-list">
        {[
          { day: "Monday", date: "Oct 6", hours: "09:00 - 17:00", role: "Stylist" },
          { day: "Tuesday", date: "Oct 7", hours: "09:00 - 17:00", role: "Stylist - Cover for Sarah" },
          { day: "Wednesday", date: "Oct 8", hours: "09:00 - 17:00", role: "Stylist" },
          { day: "Thursday", date: "Oct 9", hours: "09:00 - 17:00", role: "Stylist" },
          { day: "Friday", date: "Oct 10", hours: "No shift scheduled" },
          { day: "Saturday", date: "Oct 11", hours: "No shift scheduled" },
          { day: "Sunday", date: "Oct 12", hours: "No shift scheduled" },
        ].map((shift) => (
          <div key={shift.day} className="shift-row">
            <div className="shift-left">
              <strong>{shift.day}</strong>
              <p>{shift.date}, 2025</p>
            </div>
            <div className="shift-right">
              {shift.hours === "No shift scheduled" ? (
                <span className="no-shift">{shift.hours}</span>
              ) : (
                <span className="shift-info">
                  🕓 {shift.hours} — {shift.role}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="footer-controls">
        <button>Download</button>
        <button>Print</button>
        <span>Total: 40 hours (5 shifts)</span>
      </div>
    </div>
  );
};

export default EmployeeSchedule;
