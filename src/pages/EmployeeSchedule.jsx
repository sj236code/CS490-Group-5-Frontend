import { useEffect, useState } from "react";
import { Clock, Info, Edit3, Check } from "lucide-react";
import "../App.css";

const WEEKDAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function EmployeeAvailability() {
  // TODO: replace with real logged-in employee id
  const employeeId = 1;
  const salonId = 1;

  const [employmentStatus, setEmploymentStatus] = useState(null);
  const [weeklyAvailability, setWeeklyAvailability] = useState([]);
  const [salonHours, setSalonHours] = useState({ open: "", close: "" });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editAvailability, setEditAvailability] = useState([]);

  useEffect(() => {
    loadEmployeeSchedule();
    loadSalonHours();
  }, [employeeId, salonId]);

  // ---------- Helpers ----------

  const formatTimeFromIso = (timeString) => {
    if (!timeString) return "";
    // backend gives "HH:MM:SS" or "HH:MM"
    const [h, m] = timeString.split(":");
    return `${h}:${m}`;
  };

  const computeHours = (start, end) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const diff = eh * 60 + em - (sh * 60 + sm);
    return diff > 0 ? diff / 60 : 0;
  };

  const getTotalHoursForWeek = (week) =>
    week.reduce((sum, d) => sum + (d.hours || 0), 0);

  const prettyType = (raw) => {
    if (!raw) return null;
    return raw
      .toLowerCase()
      .split("_")
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(" ");
  };

  // ---------- Load employee schedule (GET /api/employees/:id/schedule) ----------

  const loadEmployeeSchedule = async () => {
    try {
      const url = `${import.meta.env.VITE_API_URL}/api/employees/${employeeId}/schedule`;
      const res = await fetch(url);

      if (!res.ok) {
        console.error("Failed to fetch employee schedule");
        setWeeklyAvailability([]);
        setEmploymentStatus(null);
        return;
      }

      const data = await res.json();
      console.log("Employee schedule from backend:", data);

      const schedule = data.schedule || [];

      // base week knows both frontend index and backend weekday
      const baseWeek = WEEKDAY_LABELS.map((day, idx) => ({
        day,
        frontendIndex: idx,
        backendWeekday: (idx + 1) % 7, // Monday->1 ... Saturday->6, Sunday->0
        start: null,
        end: null,
        hours: 0,
        isAvailable: false,
      }));

      const filledWeek = baseWeek.map((dayObj) => {
        const matchesForDay = schedule.filter(
          (rule) => rule.weekday === dayObj.backendWeekday
        );

        if (!matchesForDay.length) return dayObj;

        const rule = matchesForDay[0];
        const start = formatTimeFromIso(rule.start_time);
        const end = formatTimeFromIso(rule.end_time);
        const hours = computeHours(start, end);

        return {
          ...dayObj,
          start,
          end,
          hours,
          isAvailable: !!start && !!end,
        };
      });

      const totalHours = getTotalHoursForWeek(filledWeek);

      setWeeklyAvailability(filledWeek);
      setEmploymentStatus({
        type:
          prettyType(data.employee_type) ||
          prettyType(data.employment_status) ||
          "N/A",
        weeklyHours: totalHours,
      });
    } catch (err) {
      console.error("Unable to load employee schedule:", err);
      setWeeklyAvailability([]);
      setEmploymentStatus(null);
    }
  };

  // ---------- Load salon hours ----------

  const loadSalonHours = async () => {
    try {
      const url = `${import.meta.env.VITE_API_URL}/api/appointments/${salonId}/hours`;
      const res = await fetch(url);

      if (!res.ok) {
        console.error("Failed to fetch salon hours");
        setSalonHours({ open: "", close: "" });
        return;
      }

      const data = await res.json();
      console.log("Salon hours from backend:", data);

      if (!data || data.length === 0) {
        setSalonHours({ open: "", close: "" });
        return;
      }

      const openDays = data.filter(
        (h) => h.is_open && h.open_time && h.close_time
      );

      if (!openDays.length) {
        setSalonHours({ open: "", close: "" });
        return;
      }

      const earliestOpen = openDays.reduce(
        (min, h) => (h.open_time < min ? h.open_time : min),
        openDays[0].open_time
      );
      const latestClose = openDays.reduce(
        (max, h) => (h.close_time > max ? h.close_time : max),
        openDays[0].close_time
      );

      setSalonHours({
        open: formatTimeFromIso(earliestOpen),
        close: formatTimeFromIso(latestClose),
      });
    } catch (err) {
      console.error("Unable to load salon hours:", err);
      setSalonHours({ open: "", close: "" });
    }
  };

  // ---------- Edit modal handlers ----------

  const handleOpenEditModal = () => {
    setEditAvailability(weeklyAvailability);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => setShowEditModal(false);

  const handleEditTimeChange = (day, field, value) => {
    setEditAvailability((prev) =>
      prev.map((d) =>
        d.day === day
          ? {
              ...d,
              [field]: value,
              hours: computeHours(
                field === "start" ? value : d.start,
                field === "end" ? value : d.end
              ),
            }
          : d
      )
    );
  };

  const handleEditAvailableToggle = (day, checked) => {
    setEditAvailability((prev) =>
      prev.map((d) =>
        d.day === day
          ? {
              ...d,
              isAvailable: checked,
              ...(checked ? {} : { start: null, end: null, hours: 0 }),
            }
          : d
      )
    );
  };

  // ---------- Update FULL_TIME / PART_TIME based on hours ----------

  const updateEmployeeTypeBasedOnHours = async (week) => {
    const totalHours = getTotalHoursForWeek(week);
    const newType = totalHours >= 40 ? "FULL_TIME" : "PART_TIME";

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/employees/${employeeId}/type`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employee_type: newType }),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Failed to update employee type:", errData);
        return;
      }

      const updated = await res.json();
      console.log("Employee type updated:", updated);

      setEmploymentStatus({
        type: prettyType(newType),
        weeklyHours: totalHours,
      });
    } catch (err) {
      console.error("Error updating employee type:", err);
    }
  };

  // ---------- Save schedule (PUT /api/employees/:id/schedule) ----------

  const handleConfirmEdit = async () => {
  try {
    // Map editAvailability -> backend shape
    const schedulePayload = editAvailability
      .map((d) => ({
        weekday: d.backendWeekday,               // 0–6
        start_time: d.isAvailable ? d.start : null,
        end_time: d.isAvailable ? d.end : null,
      }))
      .filter((r) => r.start_time && r.end_time); // only send days with both

    console.log("Saving availability payload:", schedulePayload);

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/employees/${employeeId}/schedule`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule: schedulePayload }),
      }
    );

    const json = await res.json().catch(() => null);
    console.log("Schedule save response status:", res.status, json);

    if (!res.ok) {
      console.error("Failed to save schedule:", json);
      return;
    }

    // json should now contain employee_type + total_hours (see backend below)
    setWeeklyAvailability(editAvailability);
    setEmploymentStatus({
      type: prettyType(json.employee_type),
      weeklyHours: json.total_hours,
    });

    setShowEditModal(false);
  } catch (err) {
    console.error("Error saving schedule:", err);
  }
};


  const totalWeeklyHours =
    employmentStatus?.weeklyHours ??
    getTotalHoursForWeek(weeklyAvailability);

  // ---------- Render ----------

  return (
    <div className="availability-container">
      <header className="jade-header">
        <h1>Employee Availability</h1>
      </header>

      {/* Employment Status */}
      <section className="availability-status">
        <div className="status-header">
          <div>
            <h4>Employment Status</h4>
            <p>Your current employment type and weekly hours</p>
            <p>
              <Clock size={16} style={{ marginRight: "4px" }} /> Total Weekly
              Hours: {totalWeeklyHours} hours
            </p>
          </div>
          <span className="status-badge">
            {employmentStatus?.type || "N/A"}
          </span>
        </div>
      </section>

      {/* Weekly Availability */}
      <section className="weekly-availability">
        <div className="section-header">
          <h4>Weekly Availability</h4>
          <p>Your scheduled working hours for each day</p>
          <button className="edit-hours-btn" onClick={handleOpenEditModal}>
            <Edit3 size={16} style={{ marginRight: "6px" }} /> Edit Hours
          </button>
        </div>

        {weeklyAvailability.map((dayInfo) => (
          <div
            key={dayInfo.day}
            className={`day-row ${dayInfo.isAvailable ? "" : "unavailable"}`}
          >
            <span>{dayInfo.day}</span>
            {dayInfo.isAvailable ? (
              <span className="time-slot">
                <Clock size={14} style={{ marginRight: "4px" }} />
                {dayInfo.start} - {dayInfo.end} ({dayInfo.hours} hours)
              </span>
            ) : (
              <span className="not-available">Not Available</span>
            )}
          </div>
        ))}
      </section>

      {/* Salon Hours */}
      <div className="salon-hours">
        <p>
          Salon Hours:{" "}
          {salonHours.open && salonHours.close
            ? `${salonHours.open} - ${salonHours.close}`
            : "Not set"}
        </p>
        <p>Your working hours must be within the salon's operating hours.</p>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <h3>Edit Weekly Hours</h3>

            {editAvailability.map((dayData) => (
              <div key={dayData.day} className="edit-row">
                <span className="edit-day-label">{dayData.day}</span>

                <div className="edit-times">
                  <div className="edit-time-range">
                    <input
                      type="time"
                      value={dayData.start || "09:00"}
                      onChange={(e) =>
                        handleEditTimeChange(
                          dayData.day,
                          "start",
                          e.target.value
                        )
                      }
                      disabled={!dayData.isAvailable}
                    />
                    <span className="edit-dash">-</span>
                    <input
                      type="time"
                      value={dayData.end || "17:00"}
                      onChange={(e) =>
                        handleEditTimeChange(
                          dayData.day,
                          "end",
                          e.target.value
                        )
                      }
                      disabled={!dayData.isAvailable}
                    />
                  </div>

                  <label className="edit-available-label">
                    <input
                      type="checkbox"
                      checked={dayData.isAvailable}
                      onChange={(e) =>
                        handleEditAvailableToggle(
                          dayData.day,
                          e.target.checked
                        )
                      }
                    />
                    Available
                  </label>
                </div>
              </div>
            ))}

            <div className="edit-modal-actions">
              <button onClick={handleCloseEditModal}>Cancel</button>
              <button onClick={handleConfirmEdit}>
                <Check size={16} style={{ marginRight: "6px" }} /> Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="availability-info">
        <div className="wallet-security-box">
          <div className="wallet-security-header">
            <Info size={16} style={{ marginRight: "4px" }} />
            <div className="wallet-security-title">Availability Guidelines</div>
          </div>
          <p className="wallet-text">
            Your availability helps the salon plan schedules effectively. Make
            sure to update changes promptly.
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmployeeAvailability;
