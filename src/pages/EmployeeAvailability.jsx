import { useEffect, useState } from "react";
import {useLocation} from "react-router-dom";
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
  //const employeeId = 1;
  // const salonId = 1;

  const location = useLocation();
  const userFromState = location.state?.user;

  const employeeId = userFromState?.profile_id ?? userIdFromState ?? null;
  const salonId = userFromState?.salon_id ?? null;

  //console.log("Employee id:", employeeId);
  console.log("EmployeeProfile: ", userFromState);

  const [employmentStatus, setEmploymentStatus] = useState(null);
  const [weeklyAvailability, setWeeklyAvailability] = useState([]);
  const [salonHours, setSalonHours] = useState({ open: "", close: "" });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editAvailability, setEditAvailability] = useState([]);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadEmployeeSchedule();
    loadSalonHours();
  }, [employeeId, salonId]);

  const formatTimeFromIso = (timeString) => {
    if (!timeString) return "";
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

  const toMinutes = (timeString) => {
    if (!timeString) return null;
    const [h, m] = timeString.split(":").map(Number);
    return h * 60 + m;
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

  // Load employee schedule

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

  // Load salon hours

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

      const openDays = data.filter((h) => h.is_open && h.open_time && h.close_time);

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
    } 
    catch (err) {
      console.error("Unable to load salon hours:", err);
      setSalonHours({ open: "", close: "" });
    }
  };

  // Edit modal 

  const handleOpenEditModal = () => {
    setEditAvailability(weeklyAvailability.map((d) => ({ ...d })));
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => setShowEditModal(false);

  const handleEditTimeChange = (day, field, value) => {
    setEditAvailability((prev) =>
      prev.map((d) =>
        d.day === day
          ? {...d, [field]: value,
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
      prev.map((d) =>{
        if(d.day !== day) return d;

        if(!checked){
          //avail -> not avail
          return{
            ...d,
            isAvailable:false,
            start: null,
            end: null,
            hours: 0,
          };
        }

        //notavail -> avail
        // if user enters times, use that, else, use defauly salonhours
        const defaultStart = d.start || salonHours.open || "09:00";
        const defaultEnd = d.end || salonHours.close || "17:00";

        return {
          ...d,
          isAvailable: true,
          start: defaultStart,
          end: defaultEnd,
          hours: computeHours(defaultStart, defaultEnd),
        };
      })
    );
  };

  // Update FULL_TIME /PART_TIME based on hours

  const updateEmployeeTypeBasedOnHours = async (week) => {
    const totalHours = getTotalHoursForWeek(week);
    const newType = totalHours >= 40 ? "FULL_TIME" : "PART_TIME";

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/employees/${employeeId}/type`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employee_type: newType }),
        }
      );

      console.log("Employee Type Set: ", newType);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Failed to update employee type:", errData);
        return;
      }

      await res.json();
      setEmploymentStatus({
        type: prettyType(newType),
        weeklyHours: totalHours,
      });
    } catch (err) {
      console.error("Error updating employee type:", err);
    }
  };


  // Save schedule

  const handleConfirmEdit = async () => {
    try {
      if (!salonHours.open || !salonHours.close) {
        setErrorMessage(
          "Salon hours are not set yet. Please ask the salon owner to configure hours before saving your schedule."
        );
        return;
      }

      const salonOpenMin = toMinutes(salonHours.open);
      const salonCloseMin = toMinutes(salonHours.close);

      // Find any day that violates salon hours
      const invalidDay = editAvailability.find((d) => {
        if (!d.isAvailable || !d.start || !d.end) return false;

        const startMin = toMinutes(d.start);
        const endMin = toMinutes(d.end);

        // start before salon opens OR end after salon closes
        return startMin < salonOpenMin || endMin > salonCloseMin;
      });

      if (invalidDay) {
        setErrorMessage(
          `Please choose hours within the salon's operating hours (${salonHours.open} – ${salonHours.close}).`
        );
        return; 
      }

      setErrorMessage("");

      const schedulePayload = editAvailability
        .map((d) => ({
          weekday: d.backendWeekday,
          start_time: d.isAvailable ? d.start : null,
          end_time: d.isAvailable ? d.end : null,
        }))
        .filter((r) => r.start_time && r.end_time);

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
        setErrorMessage("Something went wrong while saving your schedule.");
        return;
      }

      // 1) Update local schedule
      setWeeklyAvailability(editAvailability);

      // 2) recompute hours and push new employee_type to backend
      await updateEmployeeTypeBasedOnHours(editAvailability);

      // 3) Close modal
      setShowEditModal(false);
    } 
    catch (err) {
      console.error("Error saving schedule:", err);
      setErrorMessage("Unexpected error while saving your schedule.");
    }
  };

  const totalWeeklyHours =
    employmentStatus?.weeklyHours ?? getTotalHoursForWeek(weeklyAvailability);

  return (
    <div className="employee-availability-page">
      {/* Page Title */}
      <div className="page-title-row">
        <div>
          <h2 className="page-title-main">My Schedule</h2>
          <p className="page-title-sub">View and manage your weekly availability for this salon.</p>
        </div>
      </div>

      {/* Employment Status */}
      <section className="availability-status card-section">
        <div className="status-header">
          <div>
            <h4 className="section-title">Employment Status</h4>
            <p className="section-subtitle">Your current employment type and weekly hours</p>
            <p className="status-hours-line">
              <Clock size={16} className="icon-inline" /> Total Weekly Hours:{" "}
              <strong>{totalWeeklyHours}</strong> hours
            </p>
          </div>
          <span className="status-badge">{employmentStatus?.type || "N/A"}</span>
        </div>
      </section>

      {/* Weekly Availability */}
      <section className="weekly-availability card-section">
        <div className="section-header">
          <div>
            <h4 className="section-title">Weekly Availability</h4>
            <p className="section-subtitle">Your scheduled working hours for each day</p>
          </div>
          <button className="edit-hours-btn" onClick={handleOpenEditModal}>
            <Edit3 size={16} className="icon-inline" /> Edit Hours
          </button>
        </div>

        <div className="day-list">
          {weeklyAvailability.map((dayInfo) => (
            <div
              key={dayInfo.day}
              className={`day-row ${dayInfo.isAvailable ? "" : "unavailable"}`}
            >
              <span className="day-label">{dayInfo.day}</span>
              {dayInfo.isAvailable ? (
                <span className="time-slot">
                  <Clock size={14} className="icon-inline" />
                  {dayInfo.start} - {dayInfo.end}{" "}
                  <span className="hours-pill">{dayInfo.hours}h</span>
                </span>
              ) : (
                <span className="not-available">Not Available</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Salon Hours */}
      <section className="salon-hours card-section">
        <p className="section-title">Salon Hours</p>
        <p className="salon-hours-line">
          {salonHours.open && salonHours.close ? (
            <>
              {salonHours.open} – {salonHours.close}
            </>
          ) : (
            "Not set"
          )}
        </p>
        <p className="section-subtitle">
          Your working hours must be within the salon&apos;s operating hours.
        </p>
      </section>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <h3 className="modal-title">Edit Weekly Hours</h3>

            <div className="edit-list">
              {editAvailability.map((dayData) => (
                <div key={dayData.day} className="edit-row">
                  <span className="edit-day-label">{dayData.day}</span>

                  <div className="edit-times">
                    <div className="edit-time-range">
                      <input
                        type="time"
                        value={dayData.start || salonHours.open || "09:00"}
                        onChange={(e) => handleEditTimeChange(dayData.day, "start", e.target.value)}
                        disabled={!dayData.isAvailable}
                      />
                      <span className="edit-dash">-</span>
                      <input
                        type="time"
                        value={dayData.end || salonHours.close || "17:00"}
                        onChange={(e) =>handleEditTimeChange(dayData.day, "end", e.target.value)}
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
            </div>

            {errorMessage && (
              <div className="error-banner">
                <Info size={16} className="icon-inline" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="edit-modal-actions">
              <button className="btn-secondary" type="button" onClick={handleCloseEditModal}>
                Cancel
              </button>
              <button className="btn-primary" type="button" onClick={handleConfirmEdit}>
                <Check size={16} className="icon-inline" /> Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="availability-info">
        <div className="wallet-security-box">
          <div className="wallet-security-header">
            <Info size={16} className="icon-inline" />
            <div className="wallet-security-title">
              Availability Guidelines
            </div>
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
