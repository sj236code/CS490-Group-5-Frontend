import React, { useState, useEffect } from "react";
import { MapPin, Calendar, User } from "lucide-react";
import {useLocation} from "react-router-dom";
import EditAppt from "../components/layout/EditAppt";
import CustomerSendMessageModal from "../components/layout/CustomerSendMessageModal";
import "../App.css";

const MyAppointments = () => {
  const location = useLocation();
  const userFromState = location.state?.user;
  const customerId = userFromState?.profile_id ?? null;

  console.log("Customer id:", customerId);
  console.log("User: ", location.state?.user);

  // const customerId = 2; // TODO: replace with real logged-in customer id

  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [previousAppointments, setPreviousAppointments] = useState([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageAppt, setMessageAppt] = useState(null);

  const handleEditClick = (appt) => {
    setSelectedAppt(appt);
    setShowEditModal(true);
  };

  const handleSave = () => {
    setShowEditModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleSendMessageClick = (appt) => {
    setMessageAppt(appt);
    setShowMessageModal(true);
  };

  const handleCancelClick = async (apptId) => {
    if (!customerId) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/${customerId}/appointments/${apptId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CANCELLED" }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Failed to cancel appointment:", data);
        return;
      }

      // remove from upcoming list in UI
      setUpcomingAppointments((prev) =>
        prev.filter((appt) => appt.id !== apptId)
      );
    } 
    catch (err) {
      console.error("Error cancelling appointment:", err);
    }
  };

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

  // Load upcoming appointments from backend
  useEffect(() => {
    if (!customerId) return; // guard

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

        // only keep BOOKED / Booked
        const bookedOnly = (data || []).filter((apt) => {
          const normalized = (apt.status || "").toUpperCase();
          return normalized === "BOOKED";
        });

        const mapped = bookedOnly.map((apt) => ({
          id: apt.id,
          serviceName: apt.service_name || "Service",
          location: apt.salon_name || "Salon",
          dateTime: formatApptDateTime(apt.start_at),
          staffName:
            (apt.employee_first_name || "") +
            (apt.employee_last_name ? ` ${apt.employee_last_name}` : ""),
          customerName: "You",
            salonId: apt.salon_id,
            employeeId: apt.employee_id,
            serviceId: apt.service_id,
            serviceDuration: apt.service_duration,
            servicePrice: apt.service_price,
            startAt: apt.start_at,
            endAt: apt.end_at,
            notes: apt.notes,
            status: apt.status,
        }));

        setUpcomingAppointments(mapped);
      } catch (err) {
        console.error("Error fetching upcoming appointments:", err);
        setUpcomingAppointments([]);
      }
    };

    fetchUpcomingAppointments();
  }, [customerId]);


  // Load previous appointments from backend
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

        const mapped = data.map((apt) => ({
          id: apt.id,
          serviceName: apt.service_name || "Service",
          location: apt.salon_name || "Salon",
          dateTime: formatApptDateTime(apt.start_at),
          staffName:
            (apt.employee_first_name || "") +
            (apt.employee_last_name ? ` ${apt.employee_last_name}` : ""),
          customerName: "You",
        }));

        setPreviousAppointments(mapped);
      } catch (err) {
        console.error("Error fetching previous appointments:", err);
        setPreviousAppointments([]);
      }
    };

    fetchPreviousAppointments();
  }, [customerId]);

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
              <p className="appt-customer">
                Customer: {appt.customerName}
              </p>
            </div>

            <div className="appt-buttons">
              <button className="btn-send" type="button" onClick={() => handleSendMessageClick(appt)}>
                Send Message
              </button>
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
              <p className="appt-customer">
                Customer: {appt.customerName}
              </p>
            </div>

            <div className="appt-buttons">
              <button className="btn-send" type="button" onClick={() => handleSendMessageClick(appt)}>
                Send Message
              </button>
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

      {/* Edit Modal */}
      {showEditModal && selectedAppt && (
        <EditAppt
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          appointment={selectedAppt}
          customerId={customerId}
          onUpdated={(updated) => {
            // update upcoming list so UI reflects backend changes
            setUpcomingAppointments((prev) =>
              prev.map((appt) =>
                appt.id === updated.id ? {
                    ...appt,
                    serviceName: updated.service_name || appt.serviceName,
                    location: updated.salon_name || appt.location,
                    dateTime: formatApptDateTime(updated.start_at),
                    staffName:
                      (updated.employee_first_name || "") +
                      (updated.employee_last_name
                        ? ` ${updated.employee_last_name}`
                        : ""),
                    employeeId: updated.employee_id,
                    startAt: updated.start_at,
                    endAt: updated.end_at,
                    notes: updated.notes,
                    status: updated.status,
                  }
                : appt
              )
            );
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
          }}
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

      {showMessageModal && messageAppt && (
        <CustomerSendMessageModal
          isOpen={showMessageModal}
          onClose={() => {
            setShowMessageModal(false);
            setMessageAppt(null);
          }}
          appointment={messageAppt}
        />
      )}
    </div>
  );
};

export default MyAppointments;
