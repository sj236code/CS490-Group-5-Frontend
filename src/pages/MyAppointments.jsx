import React, { useState, useEffect } from "react";
import { MapPin, Calendar, User } from "lucide-react";
import EditAppointmentModal from "../components/layout/EditAppointmentModal";
import "../App.css";

const MyAppointments = () => {
  const customerId = 2; // TODO: replace with real logged-in customer id

  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [previousAppointments, setPreviousAppointments] = useState([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  const formatApptDateTime = (isoString) => {
    if (!isoString) return "Date & time TBD";
    const d = new Date(isoString);
    const datePart = d.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const timePart = d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${datePart} at ${timePart}`;
  };

  // Map backend appointment → shape used in UI + modal
  const mapAppointment = (apt) => ({
    id: apt.id,
    serviceName: apt.service_name || "Service",
    location: apt.salon_name || "Salon",
    dateTime: formatApptDateTime(apt.start_at),
    staffName:
      (apt.employee_first_name || "") +
      (apt.employee_last_name ? ` ${apt.employee_last_name}` : ""),
    customerName: "You",

    // extra fields for editing
    salonId: apt.salon_id,
    serviceId: apt.service_id,
    employeeId: apt.employee_id,
    startAt: apt.start_at,
    endAt: apt.end_at,
    status: apt.status,
    serviceDuration: apt.service_duration, // in minutes
    priceAtBook: apt.price_at_book,
    notes: apt.notes,
  });

  // Load upcoming appointments
  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      try {
        const url = `${import.meta.env.VITE_API_URL}/api/appointments/${customerId}/upcoming`;
        const res = await fetch(url);

        if (res.status === 404) {
          console.error("Customer not found");
          setUpcomingAppointments([]);
          return;
        }

        if (!res.ok) {
          console.error("Failed to fetch upcoming appointments");
          setUpcomingAppointments([]);
          return;
        }

        const data = await res.json();
        console.log("Upcoming appointments from backend:", data);

        const mapped = data.map(mapAppointment);
        setUpcomingAppointments(mapped);
      } catch (err) {
        console.error("Error fetching upcoming appointments:", err);
        setUpcomingAppointments([]);
      }
    };

    fetchUpcomingAppointments();
  }, [customerId]);

  // Load previous appointments
  useEffect(() => {
    const fetchPreviousAppointments = async () => {
      try {
        const url = `${import.meta.env.VITE_API_URL}/api/appointments/${customerId}/previous`;
        const res = await fetch(url);

        if (res.status === 404) {
          console.error("Customer not found");
          setPreviousAppointments([]);
          return;
        }

        if (!res.ok) {
          console.error("Failed to fetch previous appointments");
          setPreviousAppointments([]);
          return;
        }

        const data = await res.json();
        console.log("Previous appointments from backend:", data);

        const mapped = data.map(mapAppointment);
        setPreviousAppointments(mapped);
      } catch (err) {
        console.error("Error fetching previous appointments:", err);
        setPreviousAppointments([]);
      }
    };

    fetchPreviousAppointments();
  }, [customerId]);

  // --- Handlers ---

  const handleEditClick = (appt) => {
    setSelectedAppt(appt);
    setShowEditModal(true);
  };

  const handleEditSaved = (updatedFromBackend) => {
    const updatedMapped = mapAppointment(updatedFromBackend);

    setUpcomingAppointments((prev) =>
      prev.map((appt) =>
        appt.id === updatedMapped.id ? updatedMapped : appt
      )
    );

    setPreviousAppointments((prev) =>
      prev.map((appt) =>
        appt.id === updatedMapped.id ? updatedMapped : appt
      )
    );

    setShowEditModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  // For now, cancel/delete just removes from UI.
  const handleCancelClick = (apptId) => {
    setUpcomingAppointments((prev) => prev.filter((appt) => appt.id !== apptId));
  };

  const handleDeleteFromModal = (apptId) => {
    handleCancelClick(apptId);
    setShowEditModal(false);
  };

  return (
    <div className="appointments-container">
      {/* Header */}
      <header className="jade-header">
        <h1>My Appointments</h1>
      </header>

      {/* Upcoming Section */}
      <section>
        <h2 className="section-title">Upcoming</h2>
        {upcomingAppointments.map((appt) => (
          <div key={appt.id} className="appointment-card">
            <div className="appt-info">
              <h3>{appt.serviceName}</h3>
              <p>
                <MapPin size={16} style={{ marginRight: "6px" }} />
                {appt.location}
              </p>
              <p>
                <Calendar size={16} style={{ marginRight: "6px" }} />
                {appt.dateTime}
              </p>
              <p>
                <User size={16} style={{ marginRight: "6px" }} />
                with {appt.staffName}
              </p>
              <p className="appt-customer">Customer: {appt.customerName}</p>
            </div>

            <div className="appt-buttons">
              <button className="btn-send">Send Message</button>
              <button
                className="btn-edit"
                onClick={() => handleEditClick(appt)}
              >
                Edit
              </button>
              <button
                className="btn-cancel"
                onClick={() => handleCancelClick(appt.id)}
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Previous Section */}
      <section>
        <h2 className="section-title">Previous</h2>
        {previousAppointments.map((appt) => (
          <div key={appt.id} className="appointment-card">
            <div className="appt-info">
              <h3>{appt.serviceName}</h3>
              <p>
                <MapPin size={16} style={{ marginRight: "6px" }} />
                {appt.location}
              </p>
              <p>
                <Calendar size={16} style={{ marginRight: "6px" }} />
                {appt.dateTime}
              </p>
              <p>
                <User size={16} style={{ marginRight: "6px" }} />
                with {appt.staffName}
              </p>
              <p className="appt-customer">Customer: {appt.customerName}</p>
            </div>

            <div className="appt-buttons">
              <button className="btn-send">Send Message</button>
              <button
                className="btn-edit"
                onClick={() => handleEditClick(appt)}
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Edit Appointment Modal */}
      {showEditModal && selectedAppt && (
        <EditAppointmentModal
          customerId={customerId}
          appointment={selectedAppt}
          onClose={() => setShowEditModal(false)}
          onSaved={handleEditSaved}
          onDelete={handleDeleteFromModal}
        />
      )}

      {/* Success Popup */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="success-box">
            <h3>Thank You!</h3>
            <p className="booking-updated">Booking Updated!</p>
            <p>Your appointment has been successfully updated.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
