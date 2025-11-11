import { useState } from "react";

function DashboardCalendarTab() {
  // View state
  const [viewMode, setViewMode] = useState("Week"); // "Day" | "Week" | "Month"
  const [employeeFilter, setEmployeeFilter] = useState("ALL");

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

  // Mock employees
  const [employees] = useState([
    { id: 1, name: "John Doe", colorClass: "emp-dot-blue" },
    { id: 2, name: "Jane Doe", colorClass: "emp-dot-green" },
    { id: 3, name: "John Tran", colorClass: "emp-dot-red" },
  ]);

  // Mock appointments (you’ll replace with endpoint data later)
  const [appointments] = useState([
    {
      id: 1,
      employeeId: 3,
      employeeName: "John Tran",
      customerName: "John Tran",
      service: "Haircut",
      day: "Tuesday",
      startHour: 8,
      endHour: 10,
      colorClass: "appt-red",
    },
    {
      id: 2,
      employeeId: 2,
      employeeName: "Jane Doe",
      customerName: "Jane Doe",
      service: "Nails",
      day: "Tuesday",
      startHour: 12,
      endHour: 13,
      colorClass: "appt-gray",
    },
    {
      id: 3,
      employeeId: 1,
      employeeName: "John Doe",
      customerName: "John Doe",
      service: "Haircut",
      day: "Thursday",
      startHour: 16,
      endHour: 17,
      colorClass: "appt-blue",
    },
  ]);

  // Mock metrics for the bottom row
  const [weeklyStats] = useState({
    totalAppointments: 36,
    cancellations: 2,
    noShows: 1,
    avgBookingRate: 89,
  });

  // Filter appointments by employee selection
  const getVisibleAppointments = () => {
    if (employeeFilter === "ALL") return appointments;
    return appointments.filter(
      (appt) => String(appt.employeeId) === String(employeeFilter)
    );
  };

  const visibleAppointments = getVisibleAppointments();

  // Helper for positioning appointments vertically in the column
  const getAppointmentStyle = (appt) => {
    const start = appt.startHour;
    const end = appt.endHour;
    const firstHour = hours[0];
    const lastHour = hours[hours.length - 1];

    const totalHours = lastHour - firstHour;
    const topPercent = ((start - firstHour) / totalHours) * 100;
    const heightPercent = ((end - start) / totalHours) * 100;

    return {
      top: `${topPercent}%`,
      height: `${heightPercent}%`,
    };
  };

  return (
    <div className="calendar-page">

      {/* View mode + filters */}
      <div className="calendar-view-row">
        <div className="calendar-view-buttons">
          <button
            className={`calendar-view-btn ${
              viewMode === "Day" ? "calendar-view-btn--active" : ""
            }`}
            onClick={() => setViewMode("Day")}
          >
            Day
          </button>
          <button
            className={`calendar-view-btn ${
              viewMode === "Week" ? "calendar-view-btn--active" : ""
            }`}
            onClick={() => setViewMode("Week")}
          >
            Week
          </button>
          <button
            className={`calendar-view-btn ${
              viewMode === "Month" ? "calendar-view-btn--active" : ""
            }`}
            onClick={() => setViewMode("Month")}
          >
            Month
          </button>
        </div>

        <div className="calendar-employee-filter">
          <span>View by Employee:&nbsp;</span>
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          >
            <option value="ALL">All Staff</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="calendar-actions">
          {/* <button className="calendar-action-btn">+ Add Appt</button> */}
          <button className="calendar-action-btn calendar-action-btn--secondary">
            Block Hours
          </button>
        </div>
      </div>

      {/* Calendar + Employee availability */}
      <div className="calendar-main">
        {/* Left: calendar grid */}
        <div className="calendar-grid">
          {/* Header row */}
          <div className="calendar-grid-header">
            <div className="calendar-time-header"></div>
            {days.map((day) => (
              <div key={day} className="calendar-day-header">
                {day}
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="calendar-grid-body">
            {/* Time column */}
            <div className="calendar-time-column">
              {hours.map((h) => (
                <div key={h} className="calendar-time-slot">
                  {`${h}:00`}
                </div>
              ))}
            </div>

            {/* Day columns */}
            <div className="calendar-day-columns">
              {days.map((day) => (
                <div key={day} className="calendar-day-column">
                  {/* Background rows */}
                  {hours.map((h) => (
                    <div key={h} className="calendar-hour-row"></div>
                  ))}

                  {/* Appointments for this day */}
                  {visibleAppointments
                    .filter((appt) => appt.day === day)
                    .map((appt) => (
                      <div
                        key={appt.id}
                        className={`calendar-appointment ${appt.colorClass}`}
                        style={getAppointmentStyle(appt)}
                      >
                        <div className="calendar-appointment-name">
                          {appt.customerName}
                        </div>
                        <div className="calendar-appointment-service">
                          {appt.service}
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: employee availability list */}
        <div className="calendar-availability">
          <div className="availability-header">Employee Availability</div>
          <div className="availability-list">
            {employees.map((emp) => (
              <div key={emp.id} className="availability-item">
                <span className={`availability-dot ${emp.colorClass}`} />
                <span className="availability-name">{emp.name}</span>
              </div>
            ))}
          </div>
          <button className="availability-add-btn">+ Add More</button>
        </div>
      </div>

      {/* Bottom stats row */}
      <div className="calendar-stats-row">
        <div className="calendar-stat-card">
          <div className="calendar-stat-label">Total Appointments this Week:</div>
          <div className="calendar-stat-value">
            {weeklyStats.totalAppointments}
          </div>
        </div>
        <div className="calendar-stat-card">
          <div className="calendar-stat-label">Cancellations</div>
          <div className="calendar-stat-value">
            {weeklyStats.cancellations}
          </div>
        </div>
        <div className="calendar-stat-card">
          <div className="calendar-stat-label">No-Shows</div>
          <div className="calendar-stat-value">
            {weeklyStats.noShows}
          </div>
        </div>
        <div className="calendar-stat-card">
          <div className="calendar-stat-label">Avg. Booking Rate</div>
          <div className="calendar-stat-value">
            {weeklyStats.avgBookingRate}%
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardCalendarTab;
