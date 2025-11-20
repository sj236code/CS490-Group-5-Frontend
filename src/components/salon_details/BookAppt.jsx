// src/components/BookAppt.jsx
import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";
import { EVENT_COLORS } from "../salon_dashboard/OwnerCalendarView";

function BookAppt({ isOpen, onClose, service, salon, customerId }) {
  const API_BASE = import.meta.env.VITE_API_URL;

  // ---- CORE STATE ----
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ---- OPEN/CLOSE RESET ----
  useEffect(() => {
    if (isOpen) {
      setError("");
      setSuccessMessage("");
      setSelectedSlot(null);
      setSelectedDate(new Date());
      setSelectedEmployeeId(null);
      setTimeSlots([]);
      // employees will be refetched below when salon.id exists
    } else {
      // Clear everything when modal closes
      setEmployees([]);
      setTimeSlots([]);
    }
  }, [isOpen]);

  // ---- FETCH EMPLOYEES WHEN OPENED ----
  useEffect(() => {
    if (!isOpen || !salon?.id) return;

    const loadEmployees = async () => {
      try {
        setLoadingEmployees(true);
        setError("");
        const res = await fetch(`${API_BASE}/api/appointments/${salon.id}/employees`);
        if (!res.ok) {
          throw new Error("Unable to load stylists.");
        }
        const raw = await res.json();

        const mapped = raw
          .filter(emp => (emp.employment_status || "").toUpperCase() === "APPROVED") 
          .map((emp, index) => ({
            id: emp.id,
            first_name: emp.first_name,
            last_name: emp.last_name,
            fullName: `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
            status: emp.employment_status,
            colorIndex: index % EVENT_COLORS.length,
        }));

        setEmployees(mapped || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load stylists for this salon.");
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, [isOpen, salon?.id, API_BASE]);

  // ---- FETCH AVAILABLE TIME SLOTS WHEN EMPLOYEE / DATE CHANGES ----
  useEffect(() => {
    const fetchSlots = async () => {
      if (!isOpen) return;
      if (!selectedEmployeeId || !selectedDate || !service?.duration) {
        setTimeSlots([]);
        return;
      }

      try {
        setLoadingSlots(true);
        setError("");
        setSuccessMessage("");
        setSelectedSlot(null);

        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const url = `${API_BASE}/api/appointments/${selectedEmployeeId}/available-times?date=${encodeURIComponent(
          dateStr
        )}&duration=${encodeURIComponent(service.duration)}`;

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Unable to fetch available times.");
        }

        const slots = await res.json(); // array of "HH:MM:SS" or "HH:MM"
        // Normalize to "HH:MM"
        const normalized = (slots || []).map((t) => t.slice(0, 5));
        setTimeSlots(normalized);
      } catch (err) {
        console.error(err);
        setError("Error loading available times for this stylist.");
        setTimeSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [isOpen, selectedEmployeeId, selectedDate, service?.duration, API_BASE]);

  // ---- DATE STRIP: NEXT 7 DAYS ----
  const upcomingDays = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, idx) => addDays(today, idx));
  }, []);

  // ---- CLOSE HANDLER ----
  const handleClose = () => {
    setError("");
    setSuccessMessage("");
    setSelectedSlot(null);
    setSelectedEmployeeId(null);
    setTimeSlots([]);
    onClose && onClose();
  };

  // ---- ADD TO CART (NO APPOINTMENT YET) ----
  const handleConfirmBooking = async () => {
    setError("");
    setSuccessMessage("");

    if (!selectedEmployeeId) {
      setError("Please select a stylist.");
      return;
    }
    if (!selectedDate || !selectedSlot) {
      setError("Please select a date and time.");
      return;
    }
    if (!customerId || !salon?.id || !service?.id) {
      setError("Missing customer, salon, or service information.");
      return;
    }

    try {
      setSubmitting(true);

      const dateStr = format(selectedDate, "yyyy-MM-dd");

      // Only add to CART – actual Appointment will be created at checkout
      const cartPayload = {
        user_id: customerId,         // Cart endpoint expects "user_id"
        service_id: service.id,
        quantity: 1,
        appt_date: dateStr,          // "YYYY-MM-DD"
        appt_time: selectedSlot,     // "HH:MM"
        stylist: selectedEmployeeId, // employee_id
        pictures: [],
        notes: null,
      };

      const cartRes = await fetch(`${API_BASE}/api/cart/add-service`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartPayload),
      });

      const cartData = await cartRes.json();

      if (!cartRes.ok) {
        console.error("Cart API error:", cartData);
        throw new Error(
          cartData.message || cartData.error || "Unable to add appointment to cart."
        );
      }

      setSuccessMessage(
        "Appointment time has been added to your cart. Complete checkout to confirm the booking."
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong while adding to cart.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // ---- RENDER HELPERS ----
  const formatSlotLabel = (timeStr) => {
    // timeStr: "HH:MM"
    const [hStr, mStr] = timeStr.split(":");
    let hour = parseInt(hStr, 10);
    const minutes = mStr || "00";
    const ampm = hour >= 12 ? "pm" : "am";
    if (hour === 0) hour = 12;
    else if (hour > 12) hour -= 12;
    return `${hour}:${minutes} ${ampm}`;
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content book-appt-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="book-appt-header">
          <button className="book-appt-back-btn" onClick={handleClose}>
            <X size={22} />
          </button>
          <h2 className="book-appt-title">Book Appointment</h2>
        </div>

        {/* SERVICE SUMMARY */}
        <div className="book-appt-service-row">
          <div className="book-appt-service-name">
            {service?.name || "Selected Service"}
          </div>
          {service?.price && (
            <div className="book-appt-service-price">
              ${Number(service.price).toFixed(2)}
            </div>
          )}
        </div>

        {/* MESSAGES */}
        {error && <div className="book-appt-alert book-appt-alert-error">{error}</div>}
        {successMessage && (
          <div className="book-appt-alert book-appt-alert-success">
            {successMessage}
          </div>
        )}

        {/* BODY GRID */}
        <div className="book-appt-grid">
          {/* LEFT: EMPLOYEE CARDS */}
          <div className="book-appt-column">
            <h3 className="book-appt-subtitle">Select Expert</h3>

            {loadingEmployees && <p className="book-appt-hint">Loading stylists…</p>}
            {!loadingEmployees && employees.length === 0 && (
              <p className="book-appt-hint">No stylists available for this salon.</p>
            )}

            <div className="book-appt-employee-list">
              {employees.map((emp) => {
                const isSelected = emp.id === selectedEmployeeId;
                const bgColor = EVENT_COLORS[emp.colorIndex];
                return (
                  <button
                    key={emp.id}
                    type="button"
                    className={`book-appt-employee-card ${
                      isSelected ? "book-appt-employee-card--selected" : ""
                    }`}
                    onClick={() => {
                      setSelectedEmployeeId(emp.id);
                      setSelectedSlot(null);
                      setSuccessMessage("");
                    }}
                  >
                    <div
                      className="book-appt-employee-avatar"
                      style={{
                        backgroundColor: bgColor,
                      }}
                    >
                      {emp.fullName
                        ? emp.fullName.charAt(0).toUpperCase()
                        : "S"}
                    </div>
                    <div className="book-appt-employee-info">
                      <div className="book-appt-employee-name">
                        {emp.fullName || "Staff Member"}
                      </div>
                      {emp.status && (
                        <div className="book-appt-employee-status">
                          {emp.status}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: DATE & TIME */}
          <div className="book-appt-column">
            <h3 className="book-appt-subtitle">Date &amp; Time</h3>

            {/* DATE PILLS */}
            <div className="book-appt-date-strip">
              {upcomingDays.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    className={`book-appt-date-pill ${
                      isSelected ? "book-appt-date-pill--selected" : ""
                    }`}
                    onClick={() => {
                      setSelectedDate(day);
                      setSelectedSlot(null);
                      setSuccessMessage("");
                    }}
                  >
                    <span className="book-appt-date-weekday">
                      {format(day, "EEE")}
                    </span>
                    <span className="book-appt-date-daynum">
                      {format(day, "d")}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* TIME SLOTS */}
            <div className="book-appt-times-wrapper">
              {!selectedEmployeeId && (
                <p className="book-appt-hint">
                  Select a stylist to see available times.
                </p>
              )}

              {selectedEmployeeId && loadingSlots && (
                <p className="book-appt-hint">Checking availability…</p>
              )}

              {selectedEmployeeId &&
                !loadingSlots &&
                timeSlots.length === 0 && (
                  <p className="book-appt-hint">
                    No available times for this day. Try another date.
                  </p>
                )}

              {selectedEmployeeId && !loadingSlots && timeSlots.length > 0 && (
                <div className="book-appt-times-grid">
                  {timeSlots.map((t) => {
                    const isSelected = selectedSlot === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        className={`book-appt-time-chip ${
                          isSelected ? "book-appt-time-chip--selected" : ""
                        }`}
                        onClick={() => setSelectedSlot(t)}
                      >
                        {formatSlotLabel(t)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="book-appt-footer">
          <button
            type="button"
            className="book-appt-cancel-btn"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="book-appt-confirm-btn"
            onClick={handleConfirmBooking}
            disabled={submitting || !selectedEmployeeId || !selectedSlot}
          >
            {submitting ? "Adding…" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookAppt;
