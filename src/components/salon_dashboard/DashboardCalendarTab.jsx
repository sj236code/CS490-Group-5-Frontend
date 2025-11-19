import { useState } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

// Mock employees – swap with API later
const EMPLOYEES = [
    { id: 1, name: "John Doe",  colorClass: "emp-dot-blue" },
    { id: 2, name: "Jane Doe",  colorClass: "emp-dot-green" },
    { id: 3, name: "John Tran", colorClass: "emp-dot-red" },
];

// Mock appointments – swap with API later
const APPOINTMENTS = [
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
];

// Mock weekly stats – swap with API later
const WEEKLY_STATS = {
    totalAppointments: 36,
    cancellations: 2,
    noShows: 1,
    avgBookingRate: 89,
};

function DashboardCalendarTab() {
    const [viewMode, setViewMode] = useState("Week");   // "Day" | "Week" | "Month"
    const [employeeFilter, setEmployeeFilter] = useState("ALL");

    const visibleAppointments =
        employeeFilter === "ALL"
            ? APPOINTMENTS
            : APPOINTMENTS.filter(appt => String(appt.employeeId) === String(employeeFilter));

    const getAppointmentStyle = (appt) => {
        const firstHour = HOURS[0];
        const lastHour = HOURS[HOURS.length - 1];
        const totalHours = lastHour - firstHour;

        const topPercent = ((appt.startHour - firstHour) / totalHours) * 100;
        const heightPercent = ((appt.endHour - appt.startHour) / totalHours) * 100;

        return {
            top: `${topPercent}%`,
            height: `${heightPercent}%`,
        };
    };

    return (
        <div className="calendar-page">
            {/* Top controls */}
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
                        {EMPLOYEES.map(emp => (
                            <option key={emp.id} value={emp.id}>
                                {emp.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="calendar-actions">
                    <button className="calendar-action-btn calendar-action-btn--secondary">
                        Block Hours
                    </button>
                </div>
            </div>

            {/* Main calendar + availability */}
            <div className="calendar-main">
                {/* Calendar grid */}
                <div className="calendar-grid">
                    {/* Header row */}
                    <div className="calendar-grid-header">
                        <div className="calendar-time-header" />
                        {DAYS.map((day) => (
                            <div key={day} className="calendar-day-header">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Body */}
                    <div className="calendar-grid-body">
                        {/* Time column */}
                        <div className="calendar-time-column">
                            {HOURS.map((h) => (
                                <div key={h} className="calendar-time-slot">
                                    {`${h}:00`}
                                </div>
                            ))}
                        </div>

                        {/* Day columns */}
                        <div className="calendar-day-columns">
                            {DAYS.map((day) => (
                                <div key={day} className="calendar-day-column">
                                    {HOURS.map((h) => (
                                        <div key={h} className="calendar-hour-row" />
                                    ))}

                                    {visibleAppointments
                                        .filter(appt => appt.day === day)
                                        .map(appt => (
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

                {/* Availability sidebar */}
                <div className="calendar-availability">
                    <div className="availability-header">Employee Availability</div>
                    <div className="availability-list">
                        {EMPLOYEES.map(emp => (
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
                    <div className="calendar-stat-label">
                        Total Appointments this Week:
                    </div>
                    <div className="calendar-stat-value">
                        {WEEKLY_STATS.totalAppointments}
                    </div>
                </div>

                <div className="calendar-stat-card">
                    <div className="calendar-stat-label">Cancellations</div>
                    <div className="calendar-stat-value">
                        {WEEKLY_STATS.cancellations}
                    </div>
                </div>

                <div className="calendar-stat-card">
                    <div className="calendar-stat-label">No-Shows</div>
                    <div className="calendar-stat-value">
                        {WEEKLY_STATS.noShows}
                    </div>
                </div>

                <div className="calendar-stat-card">
                    <div className="calendar-stat-label">Avg. Booking Rate</div>
                    <div className="calendar-stat-value">
                        {WEEKLY_STATS.avgBookingRate}%
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardCalendarTab;
