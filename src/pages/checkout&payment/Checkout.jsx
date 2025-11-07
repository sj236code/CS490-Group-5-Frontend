import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

function Checkout() {

    const navigate = useNavigate();

    const [paymentMethod, setPaymentMethod] = useState("card");
    const [tip, setTip] = useState(0.0);

    const [cardDetails, setCardDetails] = useState({
        name: "",
        number: "",
        expiry: "",
        cvv: "",
        zip: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        let newValue = value;

        // Input-specific validation rules
        switch (name) {
            case "name":
                // Allow only letters and spaces
                newValue = value.replace(/[^A-Za-z\s]/g, "");
                break;

            case "number":
                // Allow only digits, max 16
                newValue = value.replace(/\D/g, "").slice(0, 16);
                break;

            case "expiry":
                // Allow only digits, max 4 (MMYY)
                newValue = value.replace(/\D/g, "").slice(0, 4);
                break;

            case "cvv":
                // Allow only digits, max 3
                newValue = value.replace(/\D/g, "").slice(0, 3);
                break;

            case "zip":
                // Allow only digits, max 5
                newValue = value.replace(/\D/g, "").slice(0, 5);
                break;

            default:
                break;
        }

        setCardDetails((prev) => ({ ...prev, [name]: newValue }));
    };

    const confirmPayment = () => {
        if (paymentMethod === "card") {
            const { name, number, expiry, cvv, zip } = cardDetails;

            if (!name || !number || !expiry || !cvv || !zip) {
                alert("Please fill out all card details before proceeding.");
                return;
            }

            if (number.length < 16) {
                alert("Card number must be 16 digits.");
                return;
            }

            if (expiry.length < 4) {
                alert("Expiration date must be 4 digits (MMYY).");
                return;
            }

            if (cvv.length < 3) {
                alert("CVV must be 3 digits.");
                return;
            }

            if (zip.length < 5) {
                alert("ZIP code must be 5 digits.");
                return;
            }
        }

        navigate("/payment-confirmation");
    };

    return (
        <div className="payment-container">
            <div className="payment-header">
                <div>
                    <h2>Payment</h2>
                    <p>Complete your payment to confirm booking</p>
                </div>
                <p className="summary-text">130 min - $85</p>
            </div>

            <div className="selected-section">
                <div className="selected-tags">
                    <p>Selected: </p>
                    <span>Classic Fade</span>
                    <span>Beard Trim</span>
                    <span>Haircut & Style</span>
                </div>
            </div>

            <div className="secure-message">
                <p>Your payment information is encrypted and secure</p>
            </div>

            <div className="amount-section">
                <label>Add Tip?</label>
                <input
                    className="tip-input"
                    placeholder="0.0"
                    value={tip}
                    onChange={(e) => setTip(e.target.value)}
                />
            </div>

            <div className="payment-method">
                <h4>Select Payment Method</h4>
            </div>

            <div
                className={`method-card ${paymentMethod === "card" ? "active" : ""}`}
                onClick={() => setPaymentMethod("card")}
            >
                Credit or Debit Card
            </div>

            <div
                className={`method-card ${paymentMethod === "paypal" ? "active" : ""}`}
                onClick={() => setPaymentMethod("paypal")}
            >
                Paypal
            </div>

            {paymentMethod === "card" && (
                <div className="card-form">
                    <div className="form-group">
                        <label>Cardholder Name</label>
                        <input
                            name="name"
                            type="text"
                            placeholder="ex: John Doe"
                            value={cardDetails.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Card Number</label>
                        <input
                            name="number"
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            value={cardDetails.number}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="card-details">
                        <div className="form-group">
                            <label>Expiration Date</label>
                            <input
                                name="expiry"
                                type="text"
                                placeholder="MMYY"
                                value={cardDetails.expiry}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>CVV</label>
                            <input
                                name="cvv"
                                type="text"
                                placeholder="123"
                                value={cardDetails.cvv}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Billing ZIP Code</label>
                        <input
                            name="zip"
                            type="text"
                            placeholder="12345"
                            value={cardDetails.zip}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            )}

            <div className="encryption-box">
                <p>256-bit SSL Encryption</p>
                <p>
                    Your payment information is encrypted and never stored on our servers.
                    We are PCI DSS compliant.
                </p>
            </div>

            <button className="pay-btn" onClick={confirmPayment}>
                Pay $85.00
            </button>
        </div>
    );
}

export default Checkout;
