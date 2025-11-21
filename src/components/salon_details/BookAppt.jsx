// src/components/BookAppt.jsx
import { useState, useEffect, useMemo } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import {
  format,
  parse,
  startOfWeek,
  endOfWeek,
  getDay,
  addMinutes, // NEW
} from "date-fns";
import enUS from "date-fns/locale/en-US";
import { EVENT_COLORS } from "../salon_dashboard/OwnerCalendarView";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css"; // NEW

const DnDCalendar = withDragAndDrop(Calendar); // NEW

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

function BookAppt({ isOpen, onClose, service, salon, customerId }) {
  const API_BASE = import.meta.env.VITE_API_URL;

  // STATE
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null); // JS Date
  const [selectedSlotLabel, setSelectedSlotLabel] = useState("");

  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);

  const [tempEvent, setTempEvent] = useState(null); // NEW: temporary selected block

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [employeeSchedule, setEmployeeSchedule] = useState([]); // NEW


  // Calendar vertical bounds
  const minTime = useMemo(() => new Date(1970, 0, 1, 8, 0, 0),[]);
  const maxTime = useMemo(() => new Date(1970, 0, 1, 20, 0, 0),[]);

  // Selected employee object (for colorIndex, etc.) - NEW
  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId) || null;

  // Helper: check if [start, end) overlaps any existing event - NEW
  const hasOverlap = (start, end, events) => {
    return events.some((ev) => {
      const evStart = ev.start;
      const evEnd = ev.end;
      return start < evEnd && end > evStart;
    });
  };

  // All events = real events + temp event (if exists) - NEW
  const allEvents = useMemo(() => {
    return tempEvent ? [...calendarEvents, tempEvent] : calendarEvents;
  }, [calendarEvents, tempEvent]);

  // ---- RESET WHEN OPEN/CLOSE ----
  useEffect(() => {
    if (isOpen) {
      setError("");
      setSuccessMessage("");
      setSelectedEmployeeId(null);
      setSelectedDate(null);
      setSelectedSlotLabel("");
      setCalendarDate(new Date());
      setCalendarEvents([]);
      setTempEvent(null); // NEW
    } 
    else {
      setEmployees([]);
      setTempEvent(null); // NEW
    }
  }, [isOpen]);

  // LOAD EMPLOYEES (APPROVED ONLY)
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
        const list = raw.employees || raw || [];

        const approved = list.filter((emp) => emp.employment_status === "APPROVED");

        const mapped = approved.map((emp, index) => ({
          id: emp.id,
          first_name: emp.first_name,
          last_name: emp.last_name,
          fullName: `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
          status: "Verified",
          colorIndex: index % EVENT_COLORS.length,
        }));

        setEmployees(mapped);
      } 
      catch (err) {
        console.error("Error loading stylists:", err);
        setError("Unable to load stylists for this salon.");
        setEmployees([]);
      } 
      finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, [isOpen, salon?.id, API_BASE]);

  // Load Employee Schedule
  useEffect(() => {
    if (!isOpen || !selectedEmployeeId) {
      setEmployeeSchedule([]);
      return;
    }

    const loadSchedule = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/employees/${selectedEmployeeId}/schedule`);

        if (!res.ok) {
          console.error("Failed to load employee schedule");
          setEmployeeSchedule([]);
          return;
        }

        const data = await res.json();
        const schedule = (data.schedule || []).map((rule) => {
          // rule.start_time like "09:00:00" -> take HH:MM
          const [sh, sm] = rule.start_time ? rule.start_time.split(":").map(Number) : [null, null];
          const [eh, em] = rule.end_time ? rule.end_time.split(":").map(Number) : [null, null];

          return {
            weekday: rule.weekday, // 0=Sunday ... 6=Saturday (same as JS getDay)
            startMinutes: sh != null && sm != null ? sh * 60 + sm : null,
            endMinutes: eh != null && em != null ? eh * 60 + em : null,
          };
        });

        setEmployeeSchedule(schedule);
      } 
      catch (err) {
        console.error("Error loading employee schedule:", err);
        setEmployeeSchedule([]);
      }
    };

    loadSchedule();
  }, [isOpen, selectedEmployeeId, API_BASE]);

  // Check if a [start, end) slot is within the employee's working hours for that day
  const isWithinEmployeeWorkingHours = (start, end) => {
    if (!employeeSchedule || employeeSchedule.length === 0) return true; // if we don't know, don't block

    const weekday = start.getDay(); // 0-6
    const rule = employeeSchedule.find((r) => r.weekday === weekday);

    if (!rule || rule.startMinutes == null || rule.endMinutes == null) {
      // no schedule for this day = not working
      return false;
    }

    const startMin = start.getHours() * 60 + start.getMinutes();
    const endMin = end.getHours() * 60 + end.getMinutes();

    return startMin >= rule.startMinutes && endMin <= rule.endMinutes;
  };

  // Format "Wed, Nov 20 • 1:00 – 1:30 PM"
  const formatSelectedSlot = (start, end) => {
    if (!start || !end) return "";

    const datePart = format(start, "EEE, MMM d");
    const startPart = format(start, "h:mm a");
    const endPart = format(end, "h:mm a");

    return `${datePart} • ${startPart} – ${endPart}`;
  };

  // slot select from calendar
  const handleSlotSelect = (slotInfo) => {
    setSuccessMessage("");
    setError("");

    if (!selectedEmployeeId) {
      setError("Please select a stylist first.");
      return;
    }

    const duration = service?.duration;
    if (!duration || isNaN(duration)) {
      setError(
        "This service is missing a duration. Please choose another service or contact the salon."
      );
      return;
    }

    const start = slotInfo.start;
    const end = addMinutes(start, duration);

    // Block any time in the past
    if (isInPast(start)) {
      setError("You can't book a time in the past. Please choose a future time.");
      return;
    }

    if(!isWithinEmployeeWorkingHours(start,end)){
      setError("This stylist is not scheduled to work during that time. Please choose a time within their working hours. ");
      return;
    }

    // Prevent overlap with existing events (busy slots)
    if (hasOverlap(start, end, calendarEvents)) {
      setError("That time overlaps an existing appointment for this stylist. Please choose another time.");
      return;
    }

    const colorIndex = selectedEmployee?.colorIndex ?? 0;

    const newTempEvent = {
      start,
      end,
      title: service?.name || "Selected Time",
      resource: {
        isTemp: true,
        colorIndex,
      },
    };

    setTempEvent(newTempEvent);
    setSelectedDate(start);
    setSelectedSlotLabel(formatSelectedSlot(start, end));
  };


  // LOAD STYLIST APPTS FOR WWwek
  useEffect(() => {
    if (!selectedEmployeeId) {
      setCalendarEvents([]);
      return;
    }

    const weekStart = startOfWeek(calendarDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(calendarDate, { weekStartsOn: 0 });

    const loadAppointments = async () => {
      try {
        // Re-use the same endpoint you use in DashboardCalendarTab
        const res = await fetch(`${API_BASE}/api/employeesapp/${selectedEmployeeId}/appointments/upcoming`);

        if (!res.ok) {
          console.error("Failed to load stylist appointments");
          setCalendarEvents([]);
          return;
        }

        const data = await res.json();
        // Find this stylist's color index so busy blocks match their color
        const colorIndex =
          (employees.find((e) => e.id === selectedEmployeeId)?.colorIndex ??
            0) % EVENT_COLORS.length;

        // Map response -> react-big-calendar events
        const mapped = (data || [])
          .map((a) => {
            // Adjust property names if endpoint uses different ones
            const start = a.start_at ? new Date(a.start_at) : null;
            const end = a.end_at ? new Date(a.end_at) : null;
            if (!start || !end) return null;

            return {
              id: a.appointment_id || a.id,
              title: a.service_name || "Booked",
              start,
              end,
              resource: {
                colorIndex,
                status: a.status,
                isTemp: false,
              },
            };
          })
          .filter(Boolean)
          // only keep events in currently visible week
          .filter((ev) => ev.start >= weekStart && ev.start <= weekEnd);

        setCalendarEvents(mapped);
      } catch (err) {
        console.error("Error loading stylist appointments:", err);
        setCalendarEvents([]);
      }
    };

    loadAppointments();
  }, [selectedEmployeeId, calendarDate, API_BASE, employees]);


  // DRAG & DROP HANDLERS FOR TEMP EVENT
  const handleEventDrop = ({ event, start }) => {
    if (!event?.resource?.isTemp) return;

    const duration = service?.duration;
    if (!duration || isNaN(duration)) {
      setError("This service is missing a duration. Please choose another service or contact the salon.");
      return;
    }

    const end = addMinutes(start, duration);

    // Prevent dragging block into the past
    if (isInPast(start)) {
      setError("You can't move this appointment into the past. Please choose a future time.");
      return;
    }

    if (!isWithinEmployeeWorkingHours(start, end)){
      setError("This stylist is not scheduled to work durnig that time. Please choose a time within their working hours. ");
      return;
    }

    if (hasOverlap(start, end, calendarEvents)) {
      setError("That time overlaps an existing appointment for this stylist. Please choose another time.");
      return;
    }

    const updatedTemp = {
      ...event,
      start,
      end,
    };

    setTempEvent(updatedTemp);
    setSelectedDate(start);
    setSelectedSlotLabel(formatSelectedSlot(start, end));
    setError("");
  };

  // EVENT STYLING (TEMP VS REAL)
  const eventPropGetter = (event) => {
    const colorIndex = event?.resource?.colorIndex ?? 0;
    const baseColor = EVENT_COLORS[colorIndex % EVENT_COLORS.length];

    // Temporary event: light, striped, clearly different
    if (event?.resource?.isTemp) {
      return {
        style: {
          backgroundColor: baseColor,
          opacity: 0.85,
          border: "1px dashed #2e7d32",
          boxShadow: "0 0 0 1px rgba(46, 125, 50, 0.3)",
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.6) 0, rgba(255,255,255,0.6) 4px, transparent 4px, transparent 8px)",
          backgroundSize: "8px 8px",
          color: "black", 
          fontWeight: 600,
          textShadow: "none", 
        },
      };
    }

    // Future: busy events for stylist
    return {
      style: {
        backgroundColor: baseColor,
        borderRadius: "4px",
        border: "none",
        color: "#222",
        fontSize: "0.75rem",
        padding: "2px 4px",
      },
    };
  };

  // Returns true if a Date is before "right now"
  const isInPast = (date) => {
    if (!date) return false;
    const now = new Date();
    return date < now;
  };

  // CLOSE
  const handleClose = () => {
    setError("");
    setSuccessMessage("");
    setSelectedEmployeeId(null);
    setSelectedDate(null);
    setSelectedSlotLabel("");
    setTempEvent(null); // NEW
    onClose && onClose();
  };

  // ADD TO CART 
  const handleConfirmBooking = async () => {
    setError("");
    setSuccessMessage("");

    if (!selectedEmployeeId) {
      setError("Please select a stylist.");
      return;
    }
    if (!selectedDate) {
      setError("Please select a date and time from the calendar.");
      return;
    }
    if (!customerId || !salon?.id || !service?.id) {
      setError("Missing customer, salon, or service information.");
      return;
    }

    try {
      setSubmitting(true);

      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const timeStr = format(selectedDate, "HH:mm");

      const cartPayload = {
        user_id: customerId,
        service_id: service.id,
        quantity: 1,
        appt_date: dateStr,
        appt_time: timeStr,
        stylist: selectedEmployeeId,
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
          cartData.message ||
            cartData.error ||
            "Unable to add appointment to cart."
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

  const canSubmit = !!selectedEmployeeId && !!selectedDate && !submitting;

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className={`modal-content book-appt-modal ${
          selectedEmployeeId ? "book-appt-modal--calendar" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="book-appt-header">
          <button className="book-appt-back-btn" onClick={handleClose}>
            <X size={22} />
          </button>
          <h2 className="book-appt-title">Book Appointment</h2>
        </div>

        {/* SERVICE BAR */}
        <div className="book-appt-service-row">
          <div className="book-appt-service-name">
            {service?.name || "Selected Service"}
          </div>
          {(service?.price || service?.duration) && (
            <div className="book-appt-service-price">
              {service?.price && `$${Number(service.price).toFixed(2)}`}
              {service?.duration && (
                <span className="book-appt-service-duration">
                  {service?.price ? " • " : ""}
                  {service.duration} min
                </span>
              )}
            </div>
          )}
        </div>

        {/* MESSAGES */}
        {error && (
          <div className="book-appt-alert book-appt-alert-error">{error}</div>
        )}
        {successMessage && (
          <div className="book-appt-alert book-appt-alert-success">
            {successMessage}
          </div>
        )}

        {/* MAIN GRID */}
        <div className="book-appt-grid">
          {/* LEFT: EXPERTS */}
          <div className="book-appt-column book-appt-column-left">
            <h3 className="book-appt-subtitle">Select Expert</h3>

            {loadingEmployees && (
              <p className="book-appt-hint">Loading stylists…</p>
            )}
            {!loadingEmployees && employees.length === 0 && (
              <p className="book-appt-hint">
                No verified stylists available for this salon.
              </p>
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
                      console.log(
                        `potential stylist: ${emp.fullName || emp.id}`
                      );
                      setSelectedEmployeeId(emp.id);
                      setSelectedDate(null);
                      setSelectedSlotLabel("");
                      setSuccessMessage("");
                      setTempEvent(null); // NEW: reset temp block when switching stylist
                    }}
                  >
                    <div
                      className="book-appt-employee-avatar"
                      style={{ backgroundColor: bgColor }}
                    >
                      {emp.fullName
                        ? emp.fullName.charAt(0).toUpperCase()
                        : "S"}
                    </div>

                    <div className="book-appt-employee-info">
                      <div className="book-appt-employee-name">
                        {emp.fullName || "Staff Member"}
                      </div>
                      <div className="book-appt-employee-status">
                        <CheckCircle2
                          size={14}
                          className="book-appt-employee-status-icon"
                        />
                        Verified
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: CALENDAR */}
          <div className="book-appt-column book-appt-column-right">
            {selectedEmployeeId ? (
              <>
                <h3 className="book-appt-subtitle">Stylist Schedule</h3>
                <div className="book-appt-calendar-card">
                  <DnDCalendar
                    localizer={localizer}
                    events={allEvents}
                    defaultView="week"
                    views={["week"]}
                    step={30}
                    timeslots={2}
                    selectable
                    onSelectSlot={handleSlotSelect}
                    date={calendarDate}
                    onNavigate={setCalendarDate}
                    startAccessor="start"
                    endAccessor="end"
                    min={minTime}
                    max={maxTime}
                    eventPropGetter={eventPropGetter}
                    onEventDrop={handleEventDrop}
                    onEventResize={undefined}
                    resizable={false}
                    resizableAccessor={() => false}
                    draggableAccessor={(event) =>!!event?.resource?.isTemp}
                    slotPropGetter={(date) => {
                    const now = new Date();

                    if (date < now) {
                      return {
                        style: {
                          backgroundColor: "#f5f5f5",
                          opacity: 0.7,
                          cursor: "not-allowed",
                        },
                      };
                    }

                    if (!selectedEmployeeId || !employeeSchedule || employeeSchedule.length === 0) {
                      return {style: {backgroundColor: "#ffffff",},};
                    }

                    const weekday = date.getDay();
                    const minutes = date.getHours() * 60 + date.getMinutes();
                    const rule = employeeSchedule.find((r) => r.weekday === weekday);

                    if (!rule || rule.startMinutes == null || rule.endMinutes == null) {
                      return {
                        style: {
                          backgroundColor: "#f7f7f7",
                          opacity: 0.9,
                          cursor: "not-allowed",
                        },
                      };
                    }

                    if (minutes >= rule.startMinutes && minutes < rule.endMinutes) {
                      return {style: {backgroundColor: "#ffffff",},};
                    }

                    return {
                      style: {
                        backgroundColor: "#f7f7f7",
                        opacity: 0.9,
                        cursor: "not-allowed",
                      },
                    };
                  }}
                  />
                </div>

                {selectedSlotLabel && (
                  <p className="book-appt-selected-slot">
                    Selected time: <strong>{selectedSlotLabel}</strong>
                  </p>
                )}
                {!selectedSlotLabel && (
                  <p className="book-appt-hint">
                    Click on the calendar to choose a day and time. Drag the
                    green striped block to adjust.
                  </p>
                )}
              </>
            ) : (
              <p className="book-appt-hint">
                Select a stylist on the left to see their schedule and choose a
                time.
              </p>
            )}
          </div>
        </div>

        {/* FOOTER */}
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
            disabled={!canSubmit}
          >
            {submitting ? "Adding…" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookAppt;
