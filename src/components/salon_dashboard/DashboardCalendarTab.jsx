import { useState, useEffect } from "react";

function DashboardCalendarTab({ salon }) {

  // UI State
  const [viewMode, setViewMode] = useState("Week");
  const [employeeFilter, setEmployeeFilter] = useState("ALL");

  // Data State
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

  // Static weekdays
  const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  // TEMPORARY FOR TESTING — REPLACE WITH STATE SALONID
  const SALON_ID = 7;

  // Fetch employees, appointments, hours
  useEffect(() => {
    const loadCalendar = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const base = import.meta.env.VITE_API_URL;

        // Fetch employees
        const empRes = await fetch(`${base}/api/appointments/${SALON_ID}/employees`);
        if (!empRes.ok) throw new Error("Failed to load employees");
        const empJson = await empRes.json();

        const mapped = empJson.map((emp, index) => {
          return {
            id: emp.id,
            name: `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
            colorClass: ["emp-dot-blue","emp-dot-green","emp-dot-red"][index % 3],
            apptClass: ["appt-blue","appt-red","appt-gray"][index % 3],
          };
        });

          setEmployees(mapped);

        //Fetch appointments for each employee
        const apptArrays = await Promise.all(
          mapped.map((emp) =>
          fetch(`${base}/api/employeesapp/${emp.id}/appointments/upcoming`)
            .then(res => res.ok ? res.json() : [])
            .then(list => list.map(a => formatAppt(a, emp)))
          )
        );

        const all = apptArrays.flat();
        setAppointments(all);

        // Fetch salon hours
        const hoursRes = await fetch(`${base}/api/appointments/${SALON_ID}/hours`);
        if (hoursRes.ok) {
          setSalonHours(await hoursRes.json());
        } 
        else {
          setSalonHours([]);
        }

        //cQuick stats
        const total = all.length;
        const canc = all.filter(a => a.status === "CANCELLED").length;
        const nosh = all.filter(a => a.status === "NO_SHOW").length;

        setWeeklyStats({
          totalAppointments: total,
          cancellations: canc,
          noShows: nosh,
          avgBookingRate: total ? Math.round(((total - canc - nosh) / total) * 100) : 0,
        });

      } 
      catch (err) {
        console.error(err);
        setError("Unable to load calendar.");
      } 
      finally {
        setIsLoading(false);
      }
    };

    loadCalendar();

  }, []);

  // Format Appointment
  const formatAppt = (a, emp) => {
    const start = new Date(a.start_at);
    const end = new Date(a.end_at);
    return {
      id: a.appointment_id,
      employeeId: emp.id,
      employeeName: emp.name,
      customerName: a.customer_name,
      service: a.service_name,
      status: a.status,
      dayIndex: start.getDay(),
      startHour: start.getHours(),
      endHour: end.getHours(),
      colorClass: emp.apptClass,
    };
  };

  // Dynamic Salon Hours Helpers
  const getGlobalHourRange = () => {
    if (!salonHours.length) return [8,18];

    const starts = [];
    const ends = [];

    salonHours.forEach(h => {
      if (h.is_open) {
        starts.push(parseInt(h.open_time.split(":")[0]));
        ends.push(parseInt(h.close_time.split(":")[0]));
      }
    });

    if (!starts.length) return [8,18];

    const earliest = Math.max(0, Math.min(...starts) - 1);
    const latest = Math.min(23, Math.max(...ends) + 1);

    return [earliest, latest];
  };

  const getDayHours = (dayIndex) => {
    const h = salonHours.find(s => s.weekday === dayIndex);
    if (!h || !h.is_open) return { open: null, close: null };

    const start = parseInt(h.open_time.split(":")[0]);
    const end = parseInt(h.close_time.split(":")[0]);

    return {
      open: start - 1,
      close: end + 1,
    };
  };

  const [minHour, maxHour] = getGlobalHourRange();

  const HOURS = Array.from(
    { length: maxHour - minHour + 1 },
    (_, i) => minHour + i
  );

    // Filter appointments by employee
  const visibleAppointments =
    employeeFilter === "ALL"
      ? appointments
      : appointments.filter(a => String(a.employeeId) === String(employeeFilter));

  // Position appointments in time grid
  const getStyle = (appt) => {
    const total = maxHour - minHour;
    const top = ((appt.startHour - minHour) / total) * 100;
    const height = ((appt.endHour - appt.startHour) / total) * 100;

    return {
      top: `${top}%`,
      height: `${height}%`,
    };
  };

  return (
    <div className="calendar-page">

      {/* Top controls */}
      <div className="calendar-view-row">
        <div className="calendar-view-buttons">
          {["Day","Week","Month"].map(mode => (
            <button
              key={mode}
              className={`calendar-view-btn ${viewMode === mode ? "calendar-view-btn--active" : ""}`}
              onClick={() => setViewMode(mode)}
            >{mode}
            </button>
          ))}
        </div>

        <div className="calendar-employee-filter">
          <span>View by Employee:&nbsp;</span>
          <select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
            <option value="ALL">All Staff</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>

        <div className="calendar-actions">
            <button className="calendar-action-btn calendar-action-btn--secondary">
                Block Hours
            </button>
        </div>
      </div>

      {isLoading && <p style={{ fontSize: "0.85rem" }}>Loading…</p>}
      {error && <p style={{ color: "#b44" }}>{error}</p>}

      {/* Calendar + Availability */}
      <div className="calendar-main">

        {/* Calendar grid */}
        <div className="calendar-grid">

          {/* Header */}
          <div className="calendar-grid-header">
          <div className="calendar-time-header" />
            {WEEKDAYS.map(d => (
              <div key={d} className="calendar-day-header">{d}</div>
            ))}
          </div>

          <div className="calendar-grid-body">

            {/* Time column */}
            <div className="calendar-time-column">
              {HOURS.map(h => (
                <div key={h} className="calendar-time-slot">{`${h}:00`}</div>
              ))}
            </div>

              {/* Day columns */}
              <div className="calendar-day-columns">
                {WEEKDAYS.map((day, dayIndex) => {
                  const { open, close } = getDayHours(dayIndex);
                  const isClosed = open === null;

                  return (
                    <div
                      key={day}
                      className={`calendar-day-column ${isClosed ? "day-closed" : ""}`}
                    >
                      {HOURS.map(h => (
                          <div
                              key={h}
                              className={`calendar-hour-row ${
                                  !isClosed && (h < open || h > close)
                                      ? "hour-disabled"
                                      : ""
                              }`}
                          />
                      ))}

                      {visibleAppointments
                        .filter(a => a.dayIndex === dayIndex)
                        .filter(a => !isClosed && a.startHour >= open && a.endHour <= close)
                        .map(a => (
                          <div key={a.id} className={`calendar-appointment ${a.colorClass}`} style={getStyle(a)} >
                            <div className="calendar-appointment-name">{a.customerName}</div>
                            <div className="calendar-appointment-service">{a.service}</div>
                          </div>
                        ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        {/* Right: Availability */}
        <div className="calendar-availability">

          <div className="availability-header">Employee Availability</div>

          <div className="availability-list">
            {employees.map(emp => (
              <div key={emp.id} className="availability-item">
                <span className={`availability-dot ${emp.colorClass}`} />
                <span className="availability-name">{emp.name}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "12px" }}>
            <div className="availability-header">Salon Hours</div>

            <div className="availability-list">
              {salonHours.map(h => (
                <div key={h.id} className="availability-item">
                  {WEEKDAYS[h.weekday].slice(0,3)}:&nbsp;
                  {h.is_open ? `${h.open_time.slice(0,5)} - ${h.close_time.slice(0,5)}` : "Closed"}
                </div>
              ))}
            </div>
          </div>

          <button className="availability-add-btn">+ Add More</button>

        </div>
      </div>

      {/* Stats */}
      <div className="calendar-stats-row">
        <div className="calendar-stat-card">
          <div className="calendar-stat-label">Total Appointments</div>
          <div className="calendar-stat-value">{weeklyStats.totalAppointments}</div>
        </div>

        <div className="calendar-stat-card">
          <div className="calendar-stat-label">Cancellations</div>
          <div className="calendar-stat-value">{weeklyStats.cancellations}</div>
        </div>

        <div className="calendar-stat-card">
          <div className="calendar-stat-label">No-Shows</div>
          <div className="calendar-stat-value">{weeklyStats.noShows}</div>
        </div>

        <div className="calendar-stat-card">
          <div className="calendar-stat-label">Avg. Booking Rate</div>
          <div className="calendar-stat-value">{weeklyStats.avgBookingRate}%</div>
        </div>
      </div>
    </div>
  );
}

export default DashboardCalendarTab;
