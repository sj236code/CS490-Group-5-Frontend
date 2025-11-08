import React, { useState } from "react";
import "../App.css";

const MyAppointments = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleSave = () => {
    setShowEditModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
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
        <div className="appointment-card">
          <div className="appt-info">
            <h3>Classic Fade</h3>
            <p>📍 JADE Boutique</p>
            <p>📅 Monday, October 20 at 10:00 AM</p>
            <p>💇 with Markus</p>
            <p>👤 Customer: John Smith</p>
          </div>
          <div className="appt-buttons">
            <button className="btn-send">Send Message</button>
            <button className="btn-edit" onClick={handleEditClick}>
              Edit
            </button>
            <button className="btn-cancel">Cancel</button>
          </div>
        </div>

        <div className="appointment-card">
          <div className="appt-info">
            <h3>Hot Towel Shave</h3>
            <p>📍 JADE Boutique</p>
            <p>📅 Saturday, October 25 at 8:00 AM</p>
            <p>💇 with John Doe</p>
            <p>👤 Customer: Mike Scott</p>
          </div>
          <div className="appt-buttons">
            <button className="btn-send">Send Message</button>
            <button className="btn-edit" onClick={handleEditClick}>
              Edit
            </button>
            <button className="btn-cancel">Cancel</button>
          </div>
        </div>
      </section>

      {/* Previous Section */}
      <section>
        <h2 className="section-title">Previous</h2>
        <div className="appointment-card">
          <div className="appt-info">
            <h3>Hot Towel Shave</h3>
            <p>📍 JADE Boutique</p>
            <p>📅 Saturday, October 5 at 8:00 AM</p>
            <p>💇 with John Doe</p>
            <p>👤 Customer: Mike Scott</p>
          </div>
          <div className="appt-buttons">
            <button className="btn-send">Send Message</button>
            <button className="btn-edit" onClick={handleEditClick}>
              Edit
            </button>
          </div>
        </div>
      </section>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">Edit Appointment</h3>

            <label>Service</label>
            <select className="service-select">
              <option>Classic Fade</option>
              <option>Beard Trim</option>
              <option>Hair Color</option>
            </select>

            <label>Select Experts</label>
            <div className="expert-container">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="expert-card">
                  <img
                    src={`https://i.pravatar.cc/100?img=${n}`}
                    alt="Expert"
                  />
                  <p>Name Last Name</p>
                </div>
              ))}
            </div>

            <label>Date & Time</label>
            <div className="calendar-container">
              {["7:30am", "8:00am", "8:30am", "9:00am", "9:30am", "10:00am"].map(
                (time) => (
                  <button key={time} className="time-btn">
                    {time}
                  </button>
                )
              )}
            </div>

            <div className="modal-buttons">
              <button className="btn-delete">Delete Appt</button>
              <button className="btn-save" onClick={handleSave}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
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
