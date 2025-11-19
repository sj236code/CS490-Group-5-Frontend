import { useState, useEffect } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

// Simple color pairing for employees + their appointments
const COLOR_SETS = [
    { dot: "emp-dot-blue",  appt: "appt-blue" },
    { dot: "emp-dot-green", appt: "appt-red" },
    { dot: "emp-dot-red",   appt: "appt-gray" },
];

function getColorSet(index) {
    return COLOR_SETS[index % COLOR_SETS.length];
}

// Map API appointment → calendar appointment shape
function mapApiAppointment(apiAppt, employee) {
    const start = new Date(apiAppt.start_at);
    const end = new Date(apiAppt.end_at);

    return {
        id: apiAppt.appointment_id,
        employeeId: employee.id,
        employeeName: employee.name,
        customerName: apiAppt.customer_name,
        service: apiAppt.service_name,
        status: apiAppt.status,
        day: start.toLocaleDateString("en-US", { weekday: "long" }),
        startHour: start.getHours(),
        endHour: end.getHours(),
        colorClass: employee.apptClass,
    };
}

function DashboardCalendarTab({ salon }) {
    const [viewMode, setViewMode] = useState("Week");   // "Day" | "Week" | "Month"
    const [employeeFilter, setEmployeeFilter] = useState("ALL");

    const [employees, setEmployees] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [salonHours, setSalonHours] = useState([]);

    const [weeklyStats, setWeeklyStats] = useState({
        totalAppointments: 0,
        cancellations: 0,
        noShows: 0,
        avgBookingRate: 0,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadCalendarData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const baseUrl = import.meta.env.VITE_API_URL;

                // temp: hardcoded salon id for testing
                const TEST_SALON_ID = 7;
                const salonIdToUse = TEST_SALON_ID;

                // 1) Employees for this salon
                const empRes = await fetch(
                    `${baseUrl}/api/appointments/${salonIdToUse}/employees`
                );

                if (!empRes.ok) {
                    throw new Error("Failed to load employees");
                }

                const empData = await empRes.json();

                const mappedEmployees = empData.map((emp, index) => {
                    const colors = getColorSet(index);
                    return {
                        id: emp.id,
                        name: `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
                        colorClass: colors.dot,
                        apptClass: colors.appt,
                        employment_status: emp.employment_status,
                    };
                });

                setEmployees(mappedEmployees);

                // 2) Upcoming appointments for each employee
                const apptArrays = await Promise.all(
                    mappedEmployees.map((emp) =>
                        fetch(
                            `${baseUrl}/api/employeesapp/${emp.id}/appointments/upcoming`
                        )
                            .then((res) => (res.ok ? res.json() : []))
                            .then((list) => list.map((a) => mapApiAppointment(a, emp)))
                            .catch(() => [])
                    )
                );

                const allAppointments = apptArrays.flat();
                setAppointments(allAppointments);

                // 3) Salon operating hours
                const hoursRes = await fetch(
                    `${baseUrl}/api/appointments/${salonIdToUse}/hours`
                );

                if (hoursRes.ok) {
                    const hoursData = await hoursRes.json();
                    setSalonHours(hoursData);
                } else {
                    setSalonHours([]);
                }

                // 4) Simple stats for bottom row
                const total = allAppointments.length;
                const cancellations = allAppointments.filter(
                    (a) => a.status === "CANCELLED"
                ).length;
                const noShows = allAppointments.filter(
                    (a) => a.status === "NO_SHOW"
                ).length;

                const successful = total - cancellations - noShows;
                const bookingRate =
                    total > 0 ? Math.round((successful / total) * 100) : 0;

                setWeeklyStats({
                    totalAppointments: total,
                    cancellations,
                    noShows,
                    avgBookingRate: bookingRate,
                });
            } catch (err) {
                console.error(err);
                setError("Unable to load calendar. Showing empty view.");
                setEmployees([]);
                setAppointments([]);
                setSalonHours([]);
                setWeeklyStats({
                    totalAppointments: 0,
                    cancellations: 0,
                    noShows: 0,
                    avgBookingRate: 0,
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadCalendarData();
    }, [viewMode]);

    const visibleAppointments =
        employeeFilter === "ALL"
            ? appointments
            : appointments.filter(
                  (appt) => String(appt.employeeId) === String(employeeFilter)
              );

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

    const weekdayLabel = (weekday) => {
        const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return labels[weekday] ?? weekday;
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
                        {employees.map((emp) => (
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

            {isLoading && (
                <p style={{ fontSize: "0.8rem", color: "#777", marginBottom: "8px" }}>
                    Loading calendar…
                </p>
            )}

            {error && (
                <p style={{ fontSize: "0.8rem", color: "#b25a5a", marginBottom: "8px" }}>
                    {error}
                </p>
            )}

            {/* Main calendar + availability */}
            <div className="calendar-main">
                {/* Calendar grid */}
                <div className="calendar-grid">
                    <div className="calendar-grid-header">
                        <div className="calendar-time-header" />
                        {DAYS.map((day) => (
                            <div key={day} className="calendar-day-header">
                                {day}
                            </div>
                        ))}
                    </div>

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

                {/* Right sidebar: employees + salon hours */}
                <div className="calendar-availability">
                    <div className="availability-header">Employee Availability</div>

                    <div className="availability-list">
                        {employees.map((emp) => (
                            <div key={emp.id} className="availability-item">
                                <span
                                    className={`availability-dot ${emp.colorClass}`}
                                />
                                <span className="availability-name">{emp.name}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: "12px" }}>
                        <div className="availability-header">Salon Hours</div>
                        <div className="availability-list">
                            {salonHours.length === 0 && (
                                <div className="availability-item">
                                    <span className="availability-name">
                                        No hours set
                                    </span>
                                </div>
                            )}
                            {salonHours.map((h) => (
                                <div key={h.id} className="availability-item">
                                    <span className="availability-name">
                                        <strong>{weekdayLabel(h.weekday)}:</strong>&nbsp;
                                        {h.is_open
                                            ? `${h.open_time?.slice(0, 5)} - ${h.close_time?.slice(0, 5)}`
                                            : "Closed"}
                                    </span>
                                </div>
                            ))}
                        </div>
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
