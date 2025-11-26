// src/components/BookAppt.jsx
import { useState, useEffect, useMemo } from "react";
import { X, CheckCircle2, UploadCloud } from "lucide-react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import {format, parse, startOfWeek, endOfWeek, getDay,addMinutes} from "date-fns";
import enUS from "date-fns/locale/en-US";
import { EVENT_COLORS } from "../salon_dashboard/OwnerCalendarView";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

const DnDCalendar = withDragAndDrop(Calendar);

const locales = { "en-US": enUS };

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
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlotLabel, setSelectedSlotLabel] = useState("");
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [tempEvent, setTempEvent] = useState(null);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [employeeSchedule, setEmployeeSchedule] = useState([]);
    const [notes, setNotes] = useState("");

    // — Photo related state
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [galleryImages, setGalleryImages] = useState([]); // {id, url}
    const [galleryLoading, setGalleryLoading] = useState(false);
    const [selectedPictureUrls, setSelectedPictureUrls] = useState([]); // final urls to send
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const fileInputRef = useMemo(() => ({ current: null }), []); // we'll attach actual ref in JSX

    // Calendar vertical bounds
    const minTime = useMemo(() => new Date(1970, 0, 1, 8, 0, 0), []);
    const maxTime = useMemo(() => new Date(1970, 0, 1, 20, 0, 0), []);

    const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId) || null;

    const hasOverlap = (start, end, events) =>
        events.some((ev) => {
          const evStart = ev.start;
          const evEnd = ev.end;
          return start < evEnd && end > evStart;
      });

    const allEvents = useMemo(() => (tempEvent ? [...calendarEvents, tempEvent] : calendarEvents), [calendarEvents, tempEvent]);

    useEffect(() => {
        if (isOpen) {
          setError("");
          setSuccessMessage("");
          setSelectedEmployeeId(null);
          setSelectedDate(null);
          setSelectedSlotLabel("");
          setCalendarDate(new Date());
          setCalendarEvents([]);
          setTempEvent(null);
          setNotes("");
          setSelectedPictureUrls([]);
        } else {
          setEmployees([]);
          setTempEvent(null);
          setNotes("");
          setSelectedPictureUrls([]);
        }
    }, [isOpen]);

    useEffect(() => {
      if (!isOpen || !salon?.id) return;
      const loadEmployees = async () => {
          try {
              setLoadingEmployees(true);
              setError("");
              const res = await fetch(`${API_BASE}/api/appointments/${salon.id}/employees`);
              if (!res.ok) throw new Error("Unable to load stylists.");
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
          } catch (err) {
              console.error("Error loading stylists:", err);
              setError("Unable to load stylists for this salon.");
              setEmployees([]);
          } finally {
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
                const [sh, sm] = rule.start_time ? rule.start_time.split(":").map(Number) : [null, null];
                const [eh, em] = rule.end_time ? rule.end_time.split(":").map(Number) : [null, null];
                return {
                    weekday: rule.weekday,
                    startMinutes: sh != null && sm != null ? sh * 60 + sm : null,
                    endMinutes: eh != null && em != null ? eh * 60 + em : null,
                };
            });
            setEmployeeSchedule(schedule);
        } catch (err) {
            console.error("Error loading employee schedule:", err);
            setEmployeeSchedule([]);
        }
      };
      loadSchedule();
    }, [isOpen, selectedEmployeeId, API_BASE]);

    const isWithinEmployeeWorkingHours = (start, end) => {
        if (!employeeSchedule || employeeSchedule.length === 0) return true;
        const weekday = start.getDay();
        const rule = employeeSchedule.find((r) => r.weekday === weekday);
        if (!rule || rule.startMinutes == null || rule.endMinutes == null) return false;
        const startMin = start.getHours() * 60 + start.getMinutes();
        const endMin = end.getHours() * 60 + end.getMinutes();
        return startMin >= rule.startMinutes && endMin <= rule.endMinutes;
    };

    const formatSelectedSlot = (start, end) => {
        if (!start || !end) return "";
        const datePart = format(start, "EEE, MMM d");
        const startPart = format(start, "h:mm a");
        const endPart = format(end, "h:mm a");
        return `${datePart} • ${startPart} – ${endPart}`;
    };

    const handleSlotSelect = (slotInfo) => {
        setSuccessMessage("");
        setError("");
        if (!selectedEmployeeId) {
            setError("Please select a stylist first.");
            return;
        }
        const duration = service?.duration;
        if (!duration || isNaN(duration)) {
            setError("This service is missing a duration. Please choose another service or contact the salon.");
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
            title: service?.name || "Selected Time",
            resource: { isTemp: true, colorIndex },
        };
        setTempEvent(newTempEvent);
        setSelectedDate(start);
        setSelectedSlotLabel(formatSelectedSlot(start, end));
    };

    useEffect(() => {
        if (!selectedEmployeeId) {
            setCalendarEvents([]);
            return;
        }
        const weekStart = startOfWeek(calendarDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(calendarDate, { weekStartsOn: 0 });
        const loadAppointments = async () => {

          try {

            const res = await fetch(`${API_BASE}/api/employeesapp/${selectedEmployeeId}/appointments/upcoming`);

            if (!res.ok) { setCalendarEvents([]); return; }

            const data = await res.json();
            const colorIndex = (employees.find((e) => e.id === selectedEmployeeId)?.colorIndex ?? 0) % EVENT_COLORS.length;
            const mapped = (data || []).map((a) => {

                const start = a.start_at ? new Date(a.start_at) : null;
                const end = a.end_at ? new Date(a.end_at) : null;
                if (!start || !end) return null;
                return { id: a.appointment_id || a.id, title: a.service_name || "Booked", start, end, resource: { colorIndex, status: a.status, isTemp: false } };

            }).filter(Boolean).filter((ev) => ev.start >= weekStart && ev.start <= weekEnd);
            setCalendarEvents(mapped);
          } catch (err) {
              console.error("Error loading stylist appointments:", err);
              setCalendarEvents([]);
          }
        };
        loadAppointments();
    }, [selectedEmployeeId, calendarDate, API_BASE, employees]);

    const handleEventDrop = ({ event, start }) => {

        if (!event?.resource?.isTemp) return;
        const duration = service?.duration;
        if (!duration || isNaN(duration)) {
            setError("This service is missing a duration. Please choose another service or contact the salon.");
            return;
        }
        const end = addMinutes(start, duration);
        if (isInPast(start)) { setError("You can't move this appointment into the past."); return; }
        if (!isWithinEmployeeWorkingHours(start, end)) { setError("This stylist is not scheduled to work durnig that time."); return; }
        if (hasOverlap(start, end, calendarEvents)) { setError("That time overlaps an existing appointment for this stylist."); return; }
        const updatedTemp = { ...event, start, end };
        setTempEvent(updatedTemp);
        setSelectedDate(start);
        setSelectedSlotLabel(formatSelectedSlot(start, end));
        setError("");
    };

    const eventPropGetter = (event) => {
        const colorIndex = event?.resource?.colorIndex ?? 0;
        const baseColor = EVENT_COLORS[colorIndex % EVENT_COLORS.length];
        if (event?.resource?.isTemp) {
            return { style: { backgroundColor: baseColor, opacity: 0.85, border: "1px dashed #2e7d32", boxShadow: "0 0 0 1px rgba(46, 125, 50, 0.3)", backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.6) 0, rgba(255,255,255,0.6) 4px, transparent 4px, transparent 8px)", backgroundSize: "8px 8px", color: "black", fontWeight: 600, textShadow: "none" } };
        }
        return { style: { backgroundColor: baseColor, borderRadius: "4px", border: "none", color: "#222", fontSize: "0.75rem", padding: "2px 4px" } };
    };

    const isInPast = (date) => { if (!date) return false; const now = new Date(); return date < now; };

    const handleClose = () => {
        setError("");
        setSuccessMessage("");
        setSelectedEmployeeId(null);
        setSelectedDate(null);
        setSelectedSlotLabel("");
        setTempEvent(null);
        setNotes("");
        setSelectedPictureUrls([]);
        onClose && onClose();
    };

      const fetchGallery = async () => {
          if (!customerId) return;
          try {
              setGalleryLoading(true);
              const res = await fetch(`${API_BASE}/api/user_gallery/gallery/${customerId}`);
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Failed to fetch gallery");
              setGalleryImages(data.gallery || []);
          } catch (err) {
              console.error("Gallery fetch error:", err);
              setError(err.message || "Failed to load gallery");
          } finally {
              setGalleryLoading(false);
          }
      };

    // toggle gallery modal
    const openGallery = async () => {
        await fetchGallery();
        setGalleryOpen(true);
    };
    const closeGallery = () => setGalleryOpen(false);

    // toggle select/deselect gallery image (by url)
    const toggleSelectGalleryImage = (url) => {
        setSelectedPictureUrls((prev) => {
            if (prev.includes(url)) return prev.filter((u) => u !== url);
            return [...prev, url];
        });
    };

    // Upload new files to S3 via existing endpoint and automatically add to selectedPictureUrls
    const handleFilesSelected = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length || !customerId) return;
        setError("");
        setUploadingFiles(true);
        try {
          for (const file of files) {
              const formData = new FormData();
              formData.append("customer_id", String(customerId));
              formData.append("image_file", file);
              const res = await fetch(`${API_BASE}/api/user_gallery/upload_image`, {
                  method: "POST",
                  body: formData,
              });
              const data = await res.json();
              if (!res.ok) {
                  console.error("Upload failed:", data);
                  throw new Error(data.error || "Upload failed");
              }
              if (data.image && data.image.url) {
                  // push to galleryImages and select it
                  setGalleryImages((prev) => [data.image, ...prev]);
                  setSelectedPictureUrls((prev) => [data.image.url, ...prev]);
              }
          }
        } catch (err) {
            console.error("Error uploading files:", err);
            setError(err.message || "Upload failed");
        } finally {
            setUploadingFiles(false);
            if (fileInputRef.current && typeof fileInputRef.current.value !== "undefined") {
                fileInputRef.current.value = "";
            }
        }
    };

    // Add to cart (includes pictures array)
    const handleConfirmBooking = async () => {
        setError("");
        setSuccessMessage("");
        if (!selectedEmployeeId) { setError("Please select a stylist."); return; }
        if (!selectedDate) { setError("Please select a date and time from the calendar."); return; }
        if (!customerId || !salon?.id || !service?.id) { setError("Missing customer, salon, or service information."); return; }

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
              stylist_id: selectedEmployeeId,
              pictures: selectedPictureUrls, // <-- send S3 URLs here
              notes: notes?.trim() || null,
            };

            const cartRes = await fetch(`${API_BASE}/api/cart/add-service`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(cartPayload),
            });

            const cartData = await cartRes.json();
            console.log("Sent to cart:", cartPayload, "response:", cartData);

            if (!cartRes.ok) {
                console.error("Cart API error:", cartData);
                throw new Error(cartData.message || cartData.error || "Unable to add appointment to cart.");
            }

            setSuccessMessage("Added to cart. Proceed to checkout to confirm.");
            handleClose();
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
        <div className={`modal-content book-appt-modal ${selectedEmployeeId ? "book-appt-modal--calendar" : ""}`} onClick={(e) => e.stopPropagation()}>
          <div className="book-appt-header">
            <button className="book-appt-back-btn" onClick={handleClose}><X size={22} /></button>
            <h2 className="book-appt-title">Book Appointment</h2>
          </div>

          <div className="book-appt-service-row">
            <div className="book-appt-service-name">{service?.name || "Selected Service"}</div>
            {(service?.price || service?.duration) && (
              <div className="book-appt-service-price">
                {service?.price && `$${Number(service.price).toFixed(2)}`}
                {service?.duration && <span className="book-appt-service-duration">{service?.price ? " • " : ""}{service.duration} min</span>}
              </div>
            )}
          </div>

          {error && <div className="book-appt-alert book-appt-alert-error">{error}</div>}
          {successMessage && <div className="book-appt-alert book-appt-alert-success">{successMessage}</div>}

          <div className="book-appt-grid">
            <div className="book-appt-column book-appt-column-left">
              <h3 className="book-appt-subtitle">Select Expert</h3>
              {loadingEmployees && <p className="book-appt-hint">Loading stylists…</p>}
              {!loadingEmployees && employees.length === 0 && <p className="book-appt-hint">No verified stylists available for this salon.</p>}

              <div className="book-appt-employee-list">
                {employees.map((emp) => {
                  const isSelected = emp.id === selectedEmployeeId;
                  const bgColor = EVENT_COLORS[emp.colorIndex];
                  return (
                    <button
                      key={emp.id}
                      type="button"
                      className={`book-appt-employee-card ${isSelected ? "book-appt-employee-card--selected" : ""}`}
                      onClick={() => {
                        setSelectedEmployeeId(emp.id);
                        setSelectedDate(null);
                        setSelectedSlotLabel("");
                        setSuccessMessage("");
                        setTempEvent(null);
                      }}
                    >
                      <div className="book-appt-employee-avatar" style={{ backgroundColor: bgColor }}>{emp.fullName ? emp.fullName.charAt(0).toUpperCase() : "S"}</div>
                      <div className="book-appt-employee-info">
                        <div className="book-appt-employee-name">{emp.fullName || "Staff Member"}</div>
                        <div className="book-appt-employee-status"><CheckCircle2 size={14} className="book-appt-employee-status-icon" /> Verified</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

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
                      resizable={false}
                      resizableAccessor={() => false}
                      draggableAccessor={(event) => !!event?.resource?.isTemp}
                      slotPropGetter={(date) => {
                        const now = new Date();
                        if (date < now) return { style: { backgroundColor: "#f5f5f5", opacity: 0.7, cursor: "not-allowed" } };
                        if (!selectedEmployeeId || !employeeSchedule || employeeSchedule.length === 0) return { style: { backgroundColor: "#ffffff" } };
                        const weekday = date.getDay();
                        const minutes = date.getHours() * 60 + date.getMinutes();
                        const rule = employeeSchedule.find((r) => r.weekday === weekday);
                        if (!rule || rule.startMinutes == null || rule.endMinutes == null) return { style: { backgroundColor: "#f7f7f7", opacity: 0.9, cursor: "not-allowed" } };
                        if (minutes >= rule.startMinutes && minutes < rule.endMinutes) return { style: { backgroundColor: "#ffffff" } };
                        return { style: { backgroundColor: "#f7f7f7", opacity: 0.9, cursor: "not-allowed" } };
                      }}
                    />
                  </div>

                  <div className="book-appt-notes">
                    <label className="book-appt-notes-label">Notes for your stylist (optional)</label>
                    <textarea className="book-appt-notes-textarea" placeholder="e.g., hair length, goals, sensitivities, specific requests…" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                  </div>

                  <div className="gallery-controls" style={{ marginTop: "12px" }}>
                    <label className="book-appt-subtitle">Attach Photos</label>
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px", alignItems: "center" }}>
                      <button type="button" className="btn-small" onClick={() => {
                        // trigger hidden file input
                        if (fileInputRef.current && typeof fileInputRef.current.click === "function") {
                          fileInputRef.current.click();
                        }
                      }}>
                        <UploadCloud size={16} /> Upload Photo
                      </button>

                      <input
                        ref={(el) => (fileInputRef.current = el)}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                        onChange={handleFilesSelected}
                      />

                      <button type="button" className="btn-small btn-outline" onClick={openGallery} disabled={galleryLoading}>
                        Choose from Gallery
                      </button>

                      <div style={{ marginLeft: "auto" }}>
                        <small>{selectedPictureUrls.length} photo(s) attached</small>
                      </div>
                    </div>

                    {selectedPictureUrls.length > 0 && (
                      <div className="selected-photos-preview" style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                        {selectedPictureUrls.map((u) => (
                          <div key={u} style={{ position: "relative" }}>
                            <img src={u} alt="selected" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6, border: "1px solid #ddd" }} />
                            <button type="button" onClick={() => setSelectedPictureUrls((prev) => prev.filter((p) => p !== u))} style={{ position: "absolute", top: -6, right: -6, background: "#fff", borderRadius: 12, border: "1px solid #ccc", padding: 4, cursor: "pointer" }}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedSlotLabel ? <p className="book-appt-selected-slot">Selected time: <strong>{selectedSlotLabel}</strong></p> : <p className="book-appt-hint">Click on the calendar to choose a day and time. Drag the green striped block to adjust.</p>}
                </>
              ) : (
                <p className="book-appt-hint">Select a stylist on the left to see their schedule and choose a time.</p>
              )}
            </div>
          </div>

          <div className="book-appt-footer" style={{ display: "flex", gap: 8 }}>
            <button type="button" className="book-appt-cancel-btn" onClick={handleClose}>Cancel</button>
            <button type="button" className="book-appt-confirm-btn" onClick={handleConfirmBooking} disabled={!canSubmit}>{submitting ? "Adding…" : "Add to Cart"}</button>
          </div>
        </div>

        {galleryOpen && (
          <div className="modal-overlay" onClick={() => setGalleryOpen(false)}>
            <div className="modal-content gallery-modal" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3>Your Gallery</h3>
                <div>
                  <button className="btn-small" onClick={() => { /* re-fetch */ fetchGallery(); }}>Refresh</button>
                  <button className="btn-small" onClick={() => setGalleryOpen(false)} style={{ marginLeft: 8 }}>Close</button>
                </div>
              </div>

              {galleryLoading && <p>Loading gallery...</p>}
              {!galleryLoading && galleryImages.length === 0 && <p>No images found. Upload some photos first.</p>}

              <div className="gallery-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 120px)", gap: 10, marginTop: 12 }}>
                {galleryImages.map((img) => {
                  const selected = selectedPictureUrls.includes(img.url);
                  return (
                    <div key={img.id} style={{ position: "relative", border: selected ? "2px solid #007bff" : "1px solid #eee", borderRadius: 6, overflow: "hidden", cursor: "pointer" }} onClick={() => toggleSelectGalleryImage(img.url)}>
                      <img src={img.url} alt={`img-${img.id}`} style={{ width: "100%", height: 100, objectFit: "cover" }} />
                      {selected && <div style={{ position: "absolute", top: 6, right: 6, background: "#007bff", color: "#fff", borderRadius: 12, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>}
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button className="btn-small" onClick={() => setGalleryOpen(false)}>Done</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
}

export default BookAppt;
