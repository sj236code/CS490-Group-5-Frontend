import { useState, useEffect } from "react";
import OwnerCalendarView from "./OwnerCalendarView";
import { preconnect } from "react-dom";
import { nextFriday } from "date-fns";

function DashboardCalendarTab({ salon }) {

  // UI State
  const [view, setView] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [employeeFilter, setEmployeeFilter] = useState("ALL");

  // Data State
  const [employees, setEmployees] = useState([]);
  const [events, setEvents] = useState([]);
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

  //color indexing for employees
  const colorForIndex = (index) => index % 5;

  // TEMPORARY FOR TESTING — REPLACE WITH STATE SALONID
  const salonId = 1;

  // Fetch employees, appointments, hours
  useEffect(() => {
    const loadCalendar = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const base = import.meta.env.VITE_API_URL;

        // Fetch employees for given salon
        const empRes = await fetch(`${base}/api/appointments/${salonId}/employees`);
        if (!empRes.ok) {
          throw new Error("Failed to load employees");
        }
        
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

        // Fetch salon hours
        const hoursRes = await fetch(`${base}/api/appointments/${salonId}/hours`);
        if (hoursRes.ok) {
          setSalonHours(await hoursRes.json());
        } 
        else {
          setSalonHours([]);
        }

        //Fetch appointments for each employee
        const apptArrays = await Promise.all(
          mapped.map((emp) =>
          fetch(`${base}/api/employeesapp/${emp.id}/appointments/upcoming`)
            .then(res => res.ok ? res.json() : [])
            .then(list => list.map(a => mapToAppointment(a, emp)))
          )
        );

        const all = apptArrays.flat();
        setEvents(all);

        // Quick stats
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

  }, [salon?.id]);

  const mapToAppointment = (a, emp) => {
    const start = new Date(a.start_at);
    const end = new Date(a.end_at);

    return{
      id: a.appointment_id,
      title: `${a.customer_name} — ${a.service_name}`,
      start,
      end,
      resource: {
        employeeId: emp.id,
        employeeName: emp.name,
        colorIndex: emp.colorIndex,
        status: a.status,
      },
    };
  };

  const filteredEvents = 
    employeeFilter === "ALL" ? events : events.filter (
      (evt) =>
        String(evt.resource?.employeeId) === String(employeeFilter)
    );

  const goToday = () => {
    setCurrentDate(new Date());
  }

  const goPrev = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if(view === "month"){
        next.setMonth(next.getMonth() -1);
      }
      else{
        next.setDate(next.getDate() -7);
      }
      return next;
    });
  };

  const goNext = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if(view === "month"){
        next.setMonth(next.getMonth() + 1);
      }
      else {
        next.setDate(next.getDate() + 7);
      }
      return next;
    });
  };

  const viewLabel = (v) => {
    if (v === "day") return "Day";
    if (v === "week") return "Week";
    if (v === "month") return "Month";
    return v;
  };

  // Format Appointment
  // const formatAppt = (a, emp) => {
  //   const start = new Date(a.start_at);
  //   const end = new Date(a.end_at);
  //   return {
  //     id: a.appointment_id,
  //     employeeId: emp.id,
  //     employeeName: emp.name,
  //     customerName: a.customer_name,
  //     service: a.service_name,
  //     status: a.status,
  //     dayIndex: start.getDay(),
  //     startHour: start.getHours(),
  //     endHour: end.getHours(),
  //     colorClass: emp.apptClass,
  //   };
  // };

  // Dynamic Salon Hours Helpers
  // const getGlobalHourRange = () => {
  //   if (!salonHours.length) return [8,18];

  //   const starts = [];
  //   const ends = [];

  //   salonHours.forEach(h => {
  //     if (h.is_open) {
  //       starts.push(parseInt(h.open_time.split(":")[0]));
  //       ends.push(parseInt(h.close_time.split(":")[0]));
  //     }
  //   });

  //   if (!starts.length) return [8,18];

  //   const earliest = Math.max(0, Math.min(...starts) - 1);
  //   const latest = Math.min(23, Math.max(...ends) + 1);

  //   return [earliest, latest];
  // };

  // const getDayHours = (dayIndex) => {
  //   const h = salonHours.find(s => s.weekday === dayIndex);
  //   if (!h || !h.is_open) return { open: null, close: null };

  //   const start = parseInt(h.open_time.split(":")[0]);
  //   const end = parseInt(h.close_time.split(":")[0]);

  //   return {
  //     open: start - 1,
  //     close: end + 1,
  //   };
  // };

  // const [minHour, maxHour] = getGlobalHourRange();

  // const HOURS = Array.from(
  //   { length: maxHour - minHour + 1 },
  //   (_, i) => minHour + i
  // );

    // Filter appointments by employee
  // const visibleAppointments =
  //   employeeFilter === "ALL"
  //     ? appointments
  //     : appointments.filter(a => String(a.employeeId) === String(employeeFilter));

  // Position appointments in time grid
  // const getStyle = (appt) => {
  //   const total = maxHour - minHour;
  //   const top = ((appt.startHour - minHour) / total) * 100;
  //   const height = ((appt.endHour - appt.startHour) / total) * 100;

  //   return {
  //     top: `${top}%`,
  //     height: `${height}%`,
  //   };
  // };

  return (
    <div className="calendar-page">

      {/* top controls */}
      <div className="calendar-view-row">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button className="calendar-view-btn" onClick={goPrev}>{"<"}</button>
          <button className="calendar-view-btn" onClick={goToday}>Today</button>
          <button className="calendar-view-btn" onClick={goNext}>{">"}</button>
        </div>

        <div className="calendar-view-buttons">
          {["day", "week", "month"].map((mode) => (
            <button key={mode} className={`calendar-view-btn ${view === mode ? "calendar-view-btn--active" : ""}`} onClick={() => setView(mode)}>
              {viewLabel(mode)}
            </button>
          ))}
        </div>

        <div className="calendar-employee-filter">
          <span>View by Employee:&nbsp;</span>
          <select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
            <option value="ALL">All Staff</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && (
          <p style={{ fontSize: "0.85rem", color: "#666" }}>Loading…</p>
      )}
      {error && (
          <p style={{ fontSize: "0.85rem", color: "#b44" }}>{error}</p>
      )}

      {/* main layout: calendar + right sidebar */}
      <div className="calendar-main">
        <div className="calendar-grid">
          <OwnerCalendarView events={filteredEvents} salonHours={salonHours} view={view} onViewChange={setView} date={currentDate} onDateChange={setCurrentDate}/>
        </div>

        {/* Right sidebar */}
        <div className="calendar-availability">
          <div className="availability-header">Employee List</div>
            <div className="availability-list">
              {employees.map((emp) => (
                <div key={emp.id} className="availability-item">
                  <span
                    className={`availability-dot emp-dot-${emp.colorIndex}`}
                    style={{
                      backgroundColor: "#96A78D",
                    }}
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
                      {WEEKDAYS[h.weekday].slice(0, 3)}:&nbsp;
                      {h.is_open ? `${h.open_time.slice(0,5)} - ${h.close_time.slice(0, 5)}` : "Closed"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button className="availability-add-btn">
              + Add More
            </button>
          </div>
        </div>

        {/* bottom stats */}
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
