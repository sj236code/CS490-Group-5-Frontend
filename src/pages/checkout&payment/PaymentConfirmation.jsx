import React from "react";
import "./PaymentConfirmation.css";
import { CheckCircle, Mail, MessageSquare, CheckCircle2, Clock } from "lucide-react"; 
import { useLocation, useNavigate } from "react-router-dom";

function PaymentConfirmation() {

    const location = useLocation();
    const navigate = useNavigate();
    const bookingData = location.state?.bookingData;

    if(!bookingData) {
        return <p>Missing booking data</p>
    }

    const { date, time, paymentMethod, maskedCard, cartItems, total, salesTax } = bookingData;
    const services = cartItems.filter((item) => item.item_type === "service");
    const products = cartItems.filter((item) => item.item_type === "product");
    
    const returnToSalon = () => {
        navigate("/");
    };

    return (
        <div className="confirmation-container">
            <div className="confirmation-header">
                <CheckCircle className="check-icon" size={40} />
                <h2>Payment Successful!</h2>
                <p>See You Soon!</p>
            </div>

            {services.length > 0 && (
                <div className="booking-details">
                    <div className="detail-card">
                        <p className="label">Date</p>
                        <p>{date}</p>
                    </div>

                    <div className="detail-card">
                        <p className="label">Time</p>
                        <p>{time}</p>

                    </div>

                    <div className="detail-card payment-method">
                        <div>
                            <p className="label">Payment Method</p>
                            {paymentMethod === "card" ? (
                                <>
                                    <p>Credit/Debit Card</p>
                                    <p>{maskedCard}</p>
                                </>
                            ) : (
                                <p>Paid via Paypal</p>
                            )}
                        </div>
                        <span className="paid-badge">Paid</span>
                    </div>
                </div>
            )}
            

            <div className="services-section">
                <h4>Services Booked & Products Bought</h4>
                <div className="service-list">
                    {services.map((service, index) => (
                        <div key={index} className="service-item">
                            <div>
                            <p className="service-name">{service.service_name}</p>
                            <span>{service.service_duration} min</span>
                            </div>
                            <p className="price">${service.service_price.toFixed(2)}</p>
                        </div>
                        ))}

                        {products.map((product, index) => (
                        <div key={index} className="product-item">
                            <div>
                            <p className="product-name">{product.product_name}</p>
                            <span>Quantity: {product.quantity}</span>
                            </div>
                            <p className="price">
                            {(product.product_price * product.quantity).toFixed(2)}
                            </p>
                        </div>
                        ))}
                        <div className="service-total">
                            <span>Tax</span>
                            <span>${salesTax.toFixed(2)}</span>
                        </div>
                        <div className="service-total">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
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

            <button className="return-btn" onClick={returnToSalon}>
                Return to Salon
            </button>
        </div>
    );
}

export default PaymentConfirmation;