import { useEffect, useState } from "react";
import { Clock, Info, Edit3, Check } from "lucide-react";
import "../App.css";

function EmployeeAvailability() {
  // TODO: replace with real logged-in employee id
  const employeeId = 1;
  const salonId= 1;

  const [employmentStatus, setEmploymentStatus] = useState(null);
  const [weeklyAvailability, setWeeklyAvailability] = useState([]);
  const [salonHours, setSalonHours] = useState({
    open: "",
    close: "",
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editAvailability, setEditAvailability] = useState([]);

  useEffect(() => {
    loadEmploymentStatus();
    loadWeeklyAvailability();
    loadSalonHours();
  }, [employeeId, salonId]);

  const formatTimeFromIso = (timeString) => {
    if (!timeString) return "";
    let t = timeString;
    if (t.includes("T")) {
      const parts = t.split("T");
      t = parts[1]; // grab time part
    }
    const [h, m] = t.split(":");
    return `${h}:${m}`;
  };

  // Fetch employment info (later replace with endpoint)
  const loadEmploymentStatus = async () => {
    try {
      const mockStatus = {
        type: "Full-Time",
        weeklyHours: 40,
      };
      setEmploymentStatus(mockStatus);
      console.log("Employment status loaded:", mockStatus);
    } 
    catch (err) {
      console.error("Unable to load employment status:", err);
      setEmploymentStatus(null);
    }
  };

  // Fetch weekly availability (later replace with endpoint)
  const loadWeeklyAvailability = async () => {
    try {
      const mockAvailability = [
        { day: "Monday", start: "09:00", end: "17:00", hours: 8, isAvailable: true },
        { day: "Tuesday", start: "09:00", end: "17:00", hours: 8, isAvailable: true },
        { day: "Wednesday", start: "09:00", end: "17:00", hours: 8, isAvailable: true },
        { day: "Thursday", start: "09:00", end: "17:00", hours: 8, isAvailable: true },
        { day: "Friday", start: "09:00", end: "17:00", hours: 8, isAvailable: true },
        { day: "Saturday", start: null, end: null, hours: 0, isAvailable: false },
        { day: "Sunday", start: null, end: null, hours: 0, isAvailable: false },
      ];
      setWeeklyAvailability(mockAvailability);
      console.log("Weekly availability loaded:", mockAvailability);
    } catch (err) {
      console.error("Unable to load weekly availability:", err);
      setWeeklyAvailability([]);
    }
  };

  // Fetch salon hours 
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

      // Filter by open days
      const openDays = data.filter((h) => h.is_open && h.open_time && h.close_time);

      if (openDays.length === 0) {
        setSalonHours({ open: "", close: "" });
        return;
      }

      // Find earliest open_time and latest close_time (string compare works for "HH:MM:SS")
      const earliestOpen = openDays.reduce((min, h) => (h.open_time < min ? h.open_time : min), openDays[0].open_time);
      const latestClose = openDays.reduce((max, h) => (h.close_time > max ? h.close_time : max), openDays[0].close_time);

      const formatted = {open: formatTimeFromIso(earliestOpen), close: formatTimeFromIso(latestClose),};

      setSalonHours(formatted);
    } 
    catch (err) {
      console.error("Unable to load salon hours:", err);
      setSalonHours({ open: "", close: "" });
    }
  };

  const handleOpenEditModal = () => {
    setEditAvailability(weeklyAvailability);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => setShowEditModal(false);

  const handleEditTimeChange = (day, field, value) => {
    setEditAvailability((prev) => prev.map((d) => d.day === day ? { ...d, [field]: value, hours: computeHours(field === "start" ? value : d.start, field === "end" ? value : d.end) } : d));
  };

  const handleEditAvailableToggle = (day, checked) => {
    setEditAvailability((prev) => prev.map((d) => d.day === day ? {...d, isAvailable: checked, ...(checked ? {} : { start: null, end: null, hours: 0 }),}: d));
  };

  const handleConfirmEdit = () => {
    console.log("Saving availability:", editAvailability);
    setWeeklyAvailability(editAvailability);
    setShowEditModal(false);
  };

  const computeHours = (start, end) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return diff > 0 ? diff / 60 : 0;
  };

  const totalWeeklyHours =
    employmentStatus?.weeklyHours ??
    weeklyAvailability.reduce((sum, d) => sum + (d.hours || 0), 0);

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
              <Clock size={16} style={{ marginRight: "4px" }} /> Total Weekly Hours:{" "}
              {totalWeeklyHours} hours
            </p>
          </div>
          <span className="status-badge">{employmentStatus?.type || "N/A"}</span>
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
        <p>Salon Hours:{" "}{salonHours.open && salonHours.close ? `${salonHours.open} - ${salonHours.close}` : "Not set"}</p>
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
                      onChange={(e) => handleEditTimeChange(dayData.day, "start", e.target.value)
                      }
                      disabled={!dayData.isAvailable}
                    />
                    <span className="edit-dash">-</span>
                    <input
                      type="time"
                      value={dayData.end || "17:00"}
                      onChange={(e) => handleEditTimeChange(dayData.day, "end", e.target.value)}
                      disabled={!dayData.isAvailable}
                    />
                  </div>

                  <label className="edit-available-label">
                    <input type="checkbox" checked={dayData.isAvailable} onChange={(e) => handleEditAvailableToggle(dayData.day, e.target.checked)}/>
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
            Your availability helps the salon plan schedules effectively. Make sure to update changes promptly.
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmployeeAvailability;
