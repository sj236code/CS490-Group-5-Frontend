import React from "react";
import "./PaymentConfirmation.css";
import { CheckCircle, Mail, MessageSquare, CheckCircle2, Clock } from "lucide-react"; 
import { useNavigate } from "react-router-dom";

function PaymentConfirmation({ bookingData }) {

    const navigate = useNavigate();

    const services = bookingData?.services || [
        { name: "Classic Fade", duration: 30, buffer: 10, price: 20 },
        { name: "Beard Trim", duration: 20, buffer: 10, price: 25 },
        { name: "Haircut & Style", duration: 45, buffer: 15, price: 40 },
    ];

    const returnToSalon = () => {
        navigate("/");
    }



    return (
        <div className="confirmation-container">
        <div className="confirmation-header">
            <CheckCircle className="check-icon" size={40} />
            <h2>Payment Successful!</h2>
            <p>Your booking has been confirmed</p>
        </div>

        <div className="booking-details">
            <div className="detail-card">
            <p className="label">Date</p>
            <p>Monday, October 13, 2025</p>
            </div>

            <div className="detail-card">
            <p className="label">Time</p>
            <p>10:30 - 12:40</p>
            <span>130 minutes total</span>
            </div>

            <div className="detail-card">
            <p className="label">Staff</p>
            <p>Alex Rivera</p>
            </div>

            <div className="detail-card payment-method">
            <div>
                <p className="label">Payment Method</p>
                <p>Credit/Debit Card</p>
                <p>**** 1111</p>
            </div>
            <span className="paid-badge">Paid</span>
            </div>
        </div>

        <div className="services-section">
            <h4>Services Booked</h4>
            <div className="service-list">
            {services.map((service, index) => (
                <div key={index} className="service-item">
                <div>
                    <p className="service-name">{service.name}</p>
                    <span className="duration">{service.duration} min</span>
                    <span className="buffer">+ {service.buffer} min buffer</span>
                </div>
                <p className="price">${service.price}</p>
                </div>
            ))}
            <div className="service-total">
                <span>Total</span>
                <span>
                ${services.reduce((sum, s) => sum + s.price, 0)}
                </span>
            </div>
            </div>
        </div>

        <div className="notifications">
            <div className="notif-card">
            <Mail className="notif-icon" />
            <div>
                <p className="notif-title">Confirmation Email Sent</p>
                <p>Check your inbox for booking details and receipt</p>
            </div>
            </div>

            <div className="notif-card">
            <MessageSquare className="notif-icon" />
            <div>
                <p className="notif-title">SMS Reminder</p>
                <p>You’ll receive a reminder 24 hours before your appointment</p>
            </div>
            </div>

            <div className="notif-card">
            <CheckCircle2 className="notif-icon" />
            <div>
                <p className="notif-title">Salon Notified</p>
                <p>The salon owner has been notified of your confirmed, paid appointment</p>
            </div>
            </div>
        </div>

        <div className="arrival-note">
            <Clock className="notif-icon" />
            <p>Please arrive <strong>5 minutes early</strong> for your appointment.</p>
        </div>

        <button 
            className="return-btn"
            onClick={returnToSalon}
        >
            Return to Salon
        
        </button>
        </div>
  );
}

export default PaymentConfirmation;
