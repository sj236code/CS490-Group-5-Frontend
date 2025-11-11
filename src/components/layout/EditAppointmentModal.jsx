import React, { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";

const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function EditAppointmentModal({ customerId, appointment, onClose, onSaved, onDelete}) {
    // expects `appointment` to contain:
    // id, salonId, serviceId, serviceName, employeeId, startAt, serviceDuration, priceAtBook, notes
    const { id: appointmentId, salonId, serviceId, serviceName, employeeId, startAt, serviceDuration,} = appointment;

    // Local selection state (now synced from props via useEffect) ----
    const [selectedServiceId, setSelectedServiceId] = useState(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");

    // Data from backen
    const [salonHours, setSalonHours] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [empAvailability, setEmpAvailability] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]); // [{ time: "HH:MM:SS", isFree: bool }]

    const [isSaving, setIsSaving] = useState(false);

    // Helper functions 
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);

    const formatTimeDisplay = (time) => {
        if (!time) return "";
        const [h, m] = time.split(":");
        let hour = parseInt(h, 10);
        const ampm = hour >= 12 ? "pm" : "am";
        hour = ((hour + 11) % 12) + 1;
        return `${hour}:${m} ${ampm}`;
    };

    const formatRange = (start, end) => {
        if (!start || !end) return "Closed";
        return `${formatTimeDisplay(start)} – ${formatTimeDisplay(end)}`;
    };

    const addMinutesToTime = (dateStr, timeStr, minutesToAdd) => {
        if (!dateStr || !timeStr) return null;

        const [year, month, day] = dateStr.split("-").map(Number);
        const [hour, minute, second] = timeStr.split(":").map(Number);
        const d = new Date(year, month - 1, day, hour, minute, second || 0);
        d.setMinutes(d.getMinutes() + minutesToAdd);

        const yy = d.getFullYear();
        const mm = pad(d.getMonth() + 1);
        const dd = pad(d.getDate());
        const hh = pad(d.getHours());
        const min = pad(d.getMinutes());
        const sec = pad(d.getSeconds());

        return `${yy}-${mm}-${dd}T${hh}:${min}:${sec}`;
    };

    const generateSlotsForDay = (startTimeStr, endTimeStr, stepMinutes = 15) => {
        if (!startTimeStr || !endTimeStr) return [];

        const [sh, sm] = startTimeStr.split(":").map(Number);
        const [eh, em] = endTimeStr.split(":").map(Number);

        const current = new Date(2000, 0, 1, sh, sm, 0);
        const end = new Date(2000, 0, 1, eh, em, 0);

        const slots = [];
        while (current < end) {
            const hh = pad(current.getHours());
            const mm = pad(current.getMinutes());
            slots.push(`${hh}:${mm}:00`);
            current.setMinutes(current.getMinutes() + stepMinutes);
        }
        return slots;
    };

    const getSalonDay = (weekday) =>
        salonHours.find((h) => h.weekday === weekday) || null;

    const getEmpDay = (weekday) =>
        empAvailability.find((h) => h.weekday === weekday) || null;

    // -------- Sync local state from appointment prop --------
    useEffect(() => {
        // Parse date + time from appointment.startat
        if (startAt) {
            const [datePart, timePartRaw] = startAt.split("T");
            const timePart = timePartRaw?.slice(0, 8) || "";
            setSelectedDate(datePart || "");
            setSelectedTime(timePart || "");
        } 
        else {
            setSelectedDate("");
            setSelectedTime("");
        }

        setSelectedEmployeeId(employeeId || null);
        setSelectedServiceId(serviceId || null);
    }, [employeeId, serviceId, startAt]);

    // Fetch Salon Hours
    useEffect(() => {
        const fetchSalonHours = async () => {
            if (!salonId) return;

            try {
                const url = `${import.meta.env.VITE_API_URL}/api/appointments/${salonId}/hours`;
                const res = await fetch(url);

                if (!res.ok) {
                console.error("Failed to fetch salon hours");
                setSalonHours([]);
                return;
                }

                const data = await res.json();
                setSalonHours(data || []);
            } 
            catch (err) {
                console.error("Error fetching salon hours:", err);
                setSalonHours([]);
            }
        };

        fetchSalonHours();
    }, [salonId]);

    // -------- Fetch Salon Employees --------
    useEffect(() => {
        const fetchEmployees = async () => {
            if (!salonId) return;

            try {
                const url = `${import.meta.env.VITE_API_URL}/api/appointments/${salonId}/employees`;
                const res = await fetch(url);

                if (!res.ok) {
                    console.error("Failed to fetch employees");
                    setEmployees([]);
                    return;
                }

                const data = await res.json();
                setEmployees(data || []);
            } 
            catch (err) {
                console.error("Error fetching employees:", err);
                setEmployees([]);
            }
        };

        fetchEmployees();
    }, [salonId]);

    // Fetch Employee Availability whenever selectedEmployeeId changes 
    useEffect(() => {
        const fetchAvailability = async () => {
            if (!selectedEmployeeId) {
                setEmpAvailability([]);
                return;
            }

            try {
                const url = `${import.meta.env.VITE_API_URL}/api/appointments/${selectedEmployeeId}/availability`;
                const res = await fetch(url);

                if (!res.ok) {
                console.error("Failed to fetch employee availability");
                setEmpAvailability([]);
                return;
                }

                const data = await res.json();
                setEmpAvailability(data || []);
            } 
            catch (err) {
                console.error("Error fetching employee availability:", err);
                setEmpAvailability([]);
            }
        };

        fetchAvailability();
    }, [selectedEmployeeId]);

    // Compute timeSlots whenever employee/date/availability changes 
    useEffect(() => {

        const buildSlots = async () => {
        if (!selectedEmployeeId || !selectedDate || empAvailability.length === 0) {
            setTimeSlots([]);
            return;
        }

        const jsDate = new Date(selectedDate);
        if (Number.isNaN(jsDate.getTime())) {
            setTimeSlots([]);
            return;
        }

        const weekday = jsDate.getDay(); // 0 (Sun) - 6 (Sat)
        const dayAvail = empAvailability.find((a) => a.weekday === weekday);

        if (!dayAvail || !dayAvail.start_time || !dayAvail.end_time) {
            setTimeSlots([]);
            return;
        }

        const allSlots = generateSlotsForDay(
            dayAvail.start_time,
            dayAvail.end_time
        );

        const minutes = serviceDuration || 30;

        try {

            const url = `${import.meta.env.VITE_API_URL}/api/appointments/${selectedEmployeeId}/available-times?date=${selectedDate}&duration=${minutes}`;
            const res = await fetch(url);

            if (!res.ok) {
                console.error("Failed to fetch available times");
                setTimeSlots(allSlots.map((t) => ({ time: t, isFree: false })));
                return;
            }

            const available = await res.json(); // ["HH:MM:SS", ...]
            const availableSet = new Set(available || []);

            const merged = allSlots.map((t) => ({
            time: t,
            isFree: availableSet.has(t),
            }));

            setTimeSlots(merged);
        } 
        catch (err) {
            console.error("Error fetching available times:", err);
            setTimeSlots(allSlots.map((t) => ({ time: t, isFree: false })));
        }
        };

        buildSlots();
    }, [selectedEmployeeId, selectedDate, serviceDuration, empAvailability]);

    const handleExpertClick = (empId) => {
        setSelectedEmployeeId(empId);
    };

    const handleTimeClick = (slot) => {
        if (!slot.isFree) {
            alert("This time is no longer available. Please select another time.");
            return;
        }
        setSelectedTime(slot.time);
    };

  const handleSave = async () => {
    if (!selectedEmployeeId || !selectedDate || !selectedTime) {
      alert("Please select an expert, date, and available time.");
      return;
    }

    setIsSaving(true);

    const start_at = `${selectedDate}T${selectedTime}`;
    const end_at = addMinutesToTime(
      selectedDate,
      selectedTime,
      serviceDuration || 30
    );

    const payload = {
      employee_id: selectedEmployeeId,
      service_id: selectedServiceId || serviceId,
      start_at,
      ...(end_at ? { end_at } : {}),
    };

    try {
      const url = `${import.meta.env.VITE_API_URL}/api/appointments/${customerId}/appointments/${appointmentId}`;
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 404) {
        console.error("Customer or appointment not found");
        setIsSaving(false);
        return;
      }

      if (res.status === 403) {
        console.error("Appointment does not belong to this customer");
        setIsSaving(false);
        return;
      }

      if (res.status === 400) {
        const errBody = await res.json();
        console.error("Validation error:", errBody);
        setIsSaving(false);
        return;
      }

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error("Failed to update appointment:", errBody);
        setIsSaving(false);
        return;
      }

      const updated = await res.json();
      console.log("Updated appointment:", updated);

      if (onSaved) {
        onSaved(updated);
      }
    } catch (err) {
      console.error("Error updating appointment:", err);
      setIsSaving(false);
    }
  };

    const handleDeleteClick = () => {
        if (onDelete) {
            onDelete(appointmentId);
        }
    };

    const headerMonthYear = selectedDate && new Date(selectedDate).toLocaleDateString(undefined, {month: "long", year: "numeric",});

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal-box">
        {/* Header */}
        <div className="edit-modal-header">
            <button className="edit-back-btn" onClick={onClose}>
                <ChevronLeft size={20} />
            </button>
            <h2 className="edit-modal-title">Edit Appointment</h2>
        </div>

        {/* Service */}
        <div className="edit-section">
            <label className="edit-label">Service</label>
            <select
                className="edit-service-select"
                value={selectedServiceId || ""}
                onChange={(e) => setSelectedServiceId(Number(e.target.value))}
            >
                <option value={serviceId || ""}>{serviceName}</option>
            </select>
        </div>

        {/* Salon Hours */}
        <div className="edit-section">
            <label className="edit-label">Salon Hours</label>
            <div className="edit-hours-row">
                {WEEKDAY_LABELS.map((label, idx) => {
                    const day = getSalonDay(idx);
                    const open = day && day.is_open && day.open_time && day.close_time;
                    return (
                        <div key={label} className="edit-hours-col">
                        <div className="edit-hours-day">{label}</div>
                            <div className="edit-hours-time">
                                {open ? formatRange(day.open_time, day.close_time) : "Closed"}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Experts */}
        <div className="edit-section">
            <label className="edit-label">Select Experts</label>
            <div className="edit-experts-row">
                {employees.map((emp) => {
                    const fullName = `${emp.first_name || ""} ${
                        emp.last_name || ""
                    }`.trim();
                    const isSelected = emp.id === selectedEmployeeId;

                    return (
                        <button
                            key={emp.id}
                            type="button"
                            className={"edit-expert-card" + (isSelected ? " edit-expert-card-selected" : "")}
                            onClick={() => handleExpertClick(emp.id)}
                        >
                            <div className="edit-expert-avatar" />
                            <p className="edit-expert-name"> {fullName || "Name Last Name"}</p>
                        </button>
                    );
                })}
                {employees.length === 0 && (
                <p className="edit-helper-text">
                    No experts found for this salon.
                </p>
                )}
            </div>
        </div>

        {/* Expert Schedule */}
        <div className="edit-section">
            <label className="edit-label">Expert Schedule</label>
            <div className="edit-hours-row">
                {WEEKDAY_LABELS.map((label, idx) => {
                    const day = getEmpDay(idx);
                    const open = day && day.start_time && day.end_time;
                    return (
                        <div key={label} className="edit-hours-col">
                        <div className="edit-hours-day">{label}</div>
                        <div className="edit-hours-time">
                            {open ? formatRange(day.start_time, day.end_time) : "Off"}
                        </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Date & Time */}
        <div className="edit-section">
            <label className="edit-label">Date &amp; Time</label>
            <div className="edit-date-row">
                <input type="date" className="edit-date-input" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}/>
                <span className="edit-date-header">{headerMonthYear}</span>
            </div>

            <div className="edit-times-grid">
                {!selectedEmployeeId || !selectedDate ? (
                <p className="edit-helper-text">Select an expert and date to see available times.</p>
                ) : timeSlots.length === 0 ? (
                <p className="edit-helper-text">No working hours or available slots for this day.</p>
                ) : (
                timeSlots.map((slot) => {
                    const isSelected = slot.time === selectedTime;
                    const classes = ["edit-time-btn", slot.isFree ? "edit-time-free" : "edit-time-busy", isSelected ? "edit-time-btn-selected" : "",]
                        .filter(Boolean)
                        .join(" ");

                    return (
                        <button key={slot.time} type="button" className={classes} onClick={() => handleTimeClick(slot)}>
                            {formatTimeDisplay(slot.time)}
                        </button>
                    );
                })
                )}
            </div>
        </div>

        {/* Footer buttons */}
        <div className="edit-modal-footer">
            <button type="button" className="edit-delete-btn" onClick={handleDeleteClick}>Delete Appt</button>
            <button type="button" className="edit-save-btn" onClick={handleSave} disabled={isSaving} >
                {isSaving ? "Saving..." : "Save Changes"}
            </button>
        </div>
      </div>
    </div>
  );
}

export default EditAppointmentModal;
