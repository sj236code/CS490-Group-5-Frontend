// src/components/EditAppt.jsx
import { useState, useEffect, useMemo } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import {
  format,
  parse,
  startOfWeek,
  endOfWeek,
  getDay,
  addMinutes,
} from "date-fns";
import enUS from "date-fns/locale/en-US";
import { EVENT_COLORS } from "../salon_dashboard/OwnerCalendarView";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

const DnDCalendar = withDragAndDrop(BigCalendar);

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

function EditAppt({ isOpen, onClose, appointment, customerId, onUpdated }) {
  const API_BASE = import.meta.env.VITE_API_URL;

  // pull important fields from appointment
  const salonId = appointment?.salonId || appointment?.salon_id;
  const initialEmployeeId = appointment?.employeeId || appointment?.employee_id;
  const serviceName =
    appointment?.serviceName || appointment?.service_name || "Selected Service";
  const serviceDuration =
    appointment?.serviceDuration ||
    appointment?.service_duration ||
    30;
  const servicePrice =
    appointment?.servicePrice || appointment?.service_price || null;
  const initialStart = appointment?.startAt || appointment?.start_at || null;
  const initialNotes = appointment?.notes || "";

  // STATE
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // JS Date
  const [selectedSlotLabel, setSelectedSlotLabel] = useState("");

  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);

  const [tempEvent, setTempEvent] = useState(null); // temp selected block

  const [employeeSchedule, setEmployeeSchedule] = useState([]);
  const [notes, setNotes] = useState(initialNotes);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Calendar vertical bounds
  const minTime = useMemo(() => new Date(1970, 0, 1, 8, 0, 0),[]);
  const maxTime = useMemo(() => new Date(1970, 0, 1, 20, 0, 0),[]);

  // Selected employee object (for colorIndex, etc.)
  const selectedEmployee =
    employees.find((e) => e.id === selectedEmployeeId) || null;

  // helper: overlap
  const hasOverlap = (start, end, events) => {
    return events.some((ev) => {
      const evStart = ev.start;
      const evEnd = ev.end;
      return start < evEnd && end > evStart;
    });
  };

  // all events = busy + temp selection
  const allEvents = useMemo(
    () => (tempEvent ? [...calendarEvents, tempEvent] : calendarEvents),
    [calendarEvents, tempEvent]
  );

  // RESET / PREFILL WHEN OPEN
  useEffect(() => {
    if (isOpen && appointment) {
      setError("");
      setSuccessMessage("");
      setEmployees([]);
      setEmployeeSchedule([]);
      setCalendarEvents([]);
      setTempEvent(null);

      // pre-select stylist
      setSelectedEmployeeId(initialEmployeeId || null);

      // pre-select date/time
      if (initialStart && serviceDuration) {
        const start = new Date(initialStart);
        const end = addMinutes(start, serviceDuration);
        setSelectedDate(start);
        setSelectedSlotLabel(formatSelectedSlot(start, end));
        setCalendarDate(start);

        // temp event - colorIndex will be updated once employees load
        setTempEvent({
          start,
          end,
          title: serviceName,
          resource: {
            isTemp: true,
            colorIndex: 0,
          },
        });
      } else {
        setSelectedDate(null);
        setSelectedSlotLabel("");
        setCalendarDate(new Date());
      }

      setNotes(initialNotes || "");
    } else if (!isOpen) {
      // full reset
      setSelectedEmployeeId(null);
      setSelectedDate(null);
      setSelectedSlotLabel("");
      setCalendarDate(new Date());
      setCalendarEvents([]);
      setTempEvent(null);
      setNotes("");
      setError("");
      setSuccessMessage("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, appointment]);

  // LOAD EMPLOYEES (APPROVED ONLY) for this salon
  useEffect(() => {
    if (!isOpen || !salonId) return;

    const loadEmployees = async () => {
      try {
        setLoadingEmployees(true);
        setError("");

        const res = await fetch(`${API_BASE}/api/appointments/${salonId}/employees`);
        if (!res.ok) {
          throw new Error("Unable to load stylists.");
        }

        const raw = await res.json();
        const list = raw.employees || raw || [];

        const approved = list.filter(
          (emp) => emp.employment_status === "APPROVED"
        );

        const mapped = approved.map((emp, index) => ({
          id: emp.id,
          first_name: emp.first_name,
          last_name: emp.last_name,
          fullName: `${emp.first_name || ""} ${
            emp.last_name || ""
          }`.trim(),
          status: "Verified",
          colorIndex: index % EVENT_COLORS.length,
        }));

        setEmployees(mapped);
      } catch (err) {
        console.error("Error loading stylists:", err);
        setError("Unable to load stylists for this salon.");
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, [isOpen, salonId, API_BASE]);

  // LOAD EMPLOYEE SCHEDULE
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
            const [sh, sm] = rule.start_time ? rule.start_time.split(":").map(Number) : [null, null];
            const [eh, em] = rule.end_time ? rule.end_time.split(":").map(Number) : [null, null];

            return {
                weekday: rule.weekday, 
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

  // Check if [start, end) slot is within working hours
    const isWithinEmployeeWorkingHours = (start, end) => {
        if (!employeeSchedule || employeeSchedule.length === 0) return true;

        const weekday = start.getDay(); // 0-6
        const rule = employeeSchedule.find((r) => r.weekday === weekday);

        if (!rule || rule.startMinutes == null || rule.endMinutes == null) {
            return false;
        }

        const startMin = start.getHours() * 60 + start.getMinutes();
        const endMin = end.getHours() * 60 + end.getMinutes();

        return (
            startMin >= rule.startMinutes && endMin <= rule.endMinutes
        );
  };

    // Format slot label
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

        const duration = serviceDuration;
        if (!duration || isNaN(duration)) {
            setError(
            "This service is missing a duration. Please choose another service or contact the salon."
            );
            return;
        }

        const start = slotInfo.start;
        const end = addMinutes(start, duration);

        if (isInPast(start)) {
            setError("You can't book a time in the past. Please choose a future time.");
            return;
        }

        if (!isWithinEmployeeWorkingHours(start, end)) {
            setError("This stylist is not scheduled to work during that time. Please choose a time within their working hours.");
            return;
        }

        if (hasOverlap(start, end, calendarEvents)) {
            setError("That time overlaps an existing appointment for this stylist. Please choose another time.");
            return;
        }

        const colorIndex = selectedEmployee?.colorIndex ?? 0;

        const newTempEvent = {
            start,
            end,
            title: serviceName,
            resource: {
            isTemp: true,
            colorIndex,
            },
        };

        setTempEvent(newTempEvent);
        setSelectedDate(start);
        setSelectedSlotLabel(formatSelectedSlot(start, end));
    };

  // LOAD STYLIST APPTS FOR WEEK (excluding this appointment)
    useEffect(() => {
    if (!selectedEmployeeId) {
        setCalendarEvents([]);
        return;
    }

    const weekStart = startOfWeek(calendarDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(calendarDate, { weekStartsOn: 0 });

    const loadAppointments = async () => {
        try {
            const res = await fetch(
                `${API_BASE}/api/employeesapp/${selectedEmployeeId}/appointments/upcoming`
            );

            if (!res.ok) {
                console.error("Failed to load stylist appointments");
                setCalendarEvents([]);
                return;
            }

            const data = await res.json();
            const colorIndex =
                (employees.find((e) => e.id === selectedEmployeeId)
                ?.colorIndex ?? 0) % EVENT_COLORS.length;

            const mapped = (data || [])
                .filter((a) => a.id !== appointment.id && a.appointment_id !== appointment.id) // ignore this appt
                .map((a) => {
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
                .filter((ev) => ev.start >= weekStart && ev.start <= weekEnd);

            setCalendarEvents(mapped);
        } 
        catch (err) {
            console.error("Error loading stylist appointments:", err);
            setCalendarEvents([]);
        }
    };

        loadAppointments();
    }, [selectedEmployeeId, calendarDate, API_BASE, employees, appointment?.id]);

    // DRAG & DROP for temp event
    const handleEventDrop = ({ event, start }) => {
        if (!event?.resource?.isTemp) return;

        const duration = serviceDuration;
        if (!duration || isNaN(duration)) {
            setError("This service is missing a duration. Please choose another service or contact the salon.");
            return;
        }

        const end = addMinutes(start, duration);

        if (isInPast(start)) {
            setError("You can't move this appointment into the past. Please choose a future time.");
            return;
        }

        if (!isWithinEmployeeWorkingHours(start, end)) {
            setError("This stylist is not scheduled to work during that time. Please choose a time within their working hours.");
            return;
        }

        if (hasOverlap(start, end, calendarEvents)) {
            setError("That time overlaps an existing appointment for this stylist. Please choose another time.");
            return;
        }

        const updatedTemp = { ...event, start, end };

        setTempEvent(updatedTemp);
        setSelectedDate(start);
        setSelectedSlotLabel(formatSelectedSlot(start, end));
        setError("");
    };

  // EVENT STYLING
    const eventPropGetter = (event) => {
        const colorIndex = event?.resource?.colorIndex ?? 0;
        const baseColor = EVENT_COLORS[colorIndex % EVENT_COLORS.length];

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

    // is in past
    const isInPast = (date) => {
        if (!date) return false;
        const now = new Date();
        return date < now;
    };

    const handleCloseInternal = () => {
        setError("");
        setSuccessMessage("");
        onClose && onClose();
    };

    // SAVE CHANGES (PUT edit_appointment)
    const handleSaveChanges = async () => {
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
        if (!customerId || !appointment?.id) {
            setError("Missing customer or appointment information.");
            return;
        }

        try {
            setSubmitting(true);

            const duration = serviceDuration;
            const start = selectedDate;
            const end = addMinutes(start, duration);

            const startIso = format(start, "yyyy-MM-dd'T'HH:mm:ss");
            const endIso = format(end, "yyyy-MM-dd'T'HH:mm:ss");

            const payload = {
            employee_id: selectedEmployeeId,
            start_at: startIso,
            end_at: endIso,
            notes: notes?.trim() || null,
            status: "BOOKED",
            };

            const res = await fetch(`${API_BASE}/api/appointments/${customerId}/appointments/${appointment.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                console.error("Edit appointment API error:", data);
                throw new Error(
                    data.error ||
                    data.message ||
                    "Unable to update appointment."
                );
            }

            // let parent update its state
            if (onUpdated) {
                onUpdated(data);
            }

            handleCloseInternal();
        } 
        catch (err) {
            console.error(err);
            setError(err.message || "Something went wrong while updating your appointment.");
        } 
        finally {
            setSubmitting(false);
        }
    };

  const canSubmit = !!selectedEmployeeId && !!selectedDate && !submitting;

  if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleCloseInternal}>
            <div className={`modal-content book-appt-modal ${selectedEmployeeId ? "book-appt-modal--calendar" : ""}`} onClick={(e) => e.stopPropagation()}>
            
            {/* HEADER */}
            <div className="book-appt-header">
                <button className="book-appt-back-btn" onClick={handleCloseInternal}>
                    <X size={22} />
                </button>
                <h2 className="book-appt-title">Edit Appointment</h2>
            </div>

            {/* SERVICE BAR */}
            <div className="book-appt-service-row">
                <div className="book-appt-service-name">{serviceName}</div>
                {(servicePrice || serviceDuration) && (
                <div className="book-appt-service-price">
                    {servicePrice && `$${Number(servicePrice).toFixed(2)}`}
                    {serviceDuration && (
                    <span className="book-appt-service-duration">
                        {servicePrice ? " • " : ""}
                        {serviceDuration} min
                    </span>
                    )}
                </div>
                )}
            </div>

            {/* MESSAGES */}
            {error && (
                <div className="book-appt-alert book-appt-alert-error">
                {error}
                </div>
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
                            isSelected
                            ? "book-appt-employee-card--selected"
                            : ""
                        }`}
                        onClick={() => {
                            setSelectedEmployeeId(emp.id);
                            setSelectedDate(null);
                            setSelectedSlotLabel("");
                            setSuccessMessage("");
                            setTempEvent(null);
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
                        draggableAccessor={(event) =>
                            !!event?.resource?.isTemp
                        }
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

                            if (
                            !selectedEmployeeId ||
                            !employeeSchedule ||
                            employeeSchedule.length === 0
                            ) {
                            return {
                                style: {
                                backgroundColor: "#ffffff",
                                },
                            };
                            }

                            const weekday = date.getDay();
                            const minutes =
                            date.getHours() * 60 + date.getMinutes();
                            const rule = employeeSchedule.find(
                            (r) => r.weekday === weekday
                            );

                            if (
                            !rule ||
                            rule.startMinutes == null ||
                            rule.endMinutes == null
                            ) {
                            return {
                                style: {
                                backgroundColor: "#f7f7f7",
                                opacity: 0.9,
                                cursor: "not-allowed",
                                },
                            };
                            }

                            if (
                            minutes >= rule.startMinutes &&
                            minutes < rule.endMinutes
                            ) {
                            return {
                                style: {
                                backgroundColor: "#ffffff",
                                },
                            };
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

                    <div className="book-appt-notes">
                        <label className="book-appt-notes-label">
                        Notes for your stylist (optional)
                        </label>
                        <textarea
                        className="book-appt-notes-textarea"
                        placeholder="e.g., hair length, goals, sensitivities, specific requests…"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        />
                    </div>

                    {selectedSlotLabel && (
                        <p className="book-appt-selected-slot">
                        Selected time:{" "}
                        <strong>{selectedSlotLabel}</strong>
                        </p>
                    )}
                    {!selectedSlotLabel && (
                        <p className="book-appt-hint">
                        Click on the calendar to choose a new day and
                        time, or drag the green striped block to adjust.
                        </p>
                    )}
                    </>
                ) : (
                    <p className="book-appt-hint">
                    Select a stylist on the left to see their schedule and
                    choose a time.
                    </p>
                )}
                </div>
            </div>

            {/* FOOTER */}
            <div className="book-appt-footer">
                <button
                type="button"
                className="book-appt-cancel-btn"
                onClick={handleCloseInternal}
                >
                Cancel
                </button>
                <button
                type="button"
                className="book-appt-confirm-btn"
                onClick={handleSaveChanges}
                disabled={!canSubmit}
                >
                {submitting ? "Saving…" : "Save Changes"}
                </button>
            </div>
            </div>
        </div>
    );
}

export default EditAppt;
