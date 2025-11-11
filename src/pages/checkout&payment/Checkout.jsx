import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Checkout.css";

function Checkout() {

    const navigate = useNavigate();
    const location = useLocation();

    const customerIdFromState = (location.state && location.state.customer_id);
    const customerIdFromSession = sessionStorage.getItem("checkout_customer_id");

    const customer_id = customerIdFromState || customerIdFromSession;

    const cartItems = (location.state && location.state.cartItems) || [];
    //const { cartItems = [], customer_id } = location.state || {};

    const [paymentMethod, setPaymentMethod] = useState("card");
    const [tip, setTip] = useState();
    const [employeeName] = useState("Alex Rivera");

    const presubtotal = cartItems.reduce(
        (sum, item) => sum + (item.item_price || 0) * (item.quantity || 1), 0
    );

    const taxRate = Number(import.meta.env.VITE_TAX_RATE) || 0.066;
    const salesTax = presubtotal * taxRate; 
    const subtotal = salesTax + presubtotal;
    const total = parseFloat(subtotal) + parseFloat(tip || 0); 

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

        switch (name) {
            case "name":
                newValue = value.replace(/[^A-Za-z\s]/g, "");
                break;
            case "number":
                newValue = value.replace(/\D/g, "").slice(0, 16);
                break;
            case "expiry":
                newValue = value.replace(/\D/g, "").slice(0, 4);
                break;
            case "cvv":
                newValue = value.replace(/\D/g, "").slice(0, 3);
                break;
            case "zip":
                newValue = value.replace(/\D/g, "").slice(0, 5);
                break;
            default:
                break;
        }

        setCardDetails((prev) => ({ ...prev, [name]: newValue }));
    };

    const confirmPayment = async () => {

        if (!customer_id) {
            alert("Error: Customer ID is missing. This can happen if you refresh the page. Please return to your cart and check out again.");
            return;
        }

        // 3. Card validation (this was already here)
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

        const maskedCard =
            paymentMethod === "card"
                ? `${"*".repeat(12)} ${cardDetails.number.slice(-4)}`
                : null;

        const totalServiceDuration = cartItems
            .filter((item) => item.item_type === "service")
            .reduce((sum, service) => sum + (service.service_duration || 0), 0);

        const firstStartItem = cartItems.find(
            (item) => item.start_at && item.start_at !== null
        );

        let appointmentDate = "N/A";
        let appointmentTime = "N/A";

        if (firstStartItem) {
            const dateObj = new Date(firstStartItem.start_at);
            if (!isNaN(dateObj.getTime())) {
                appointmentDate = dateObj.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                });
                appointmentTime = dateObj.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                });
            } else {
                console.warn("Invalid start_at date:", firstStartItem.start_at);
            }
        } else {
            console.warn("No valid start_at found in cartItems:", cartItems);
        }

        const bookingData = {
            customer_id,
            date: appointmentDate,
            time: appointmentTime,
            duration: totalServiceDuration,
            staff: employeeName,
            paymentMethod,
            maskedCard,
            cartItems,
            total,
            salesTax,
        };

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/payments/create_order`,
                {
                    customer_id: customer_id, 
                    
                    salon_id: cartItems[0]?.salon_id || null,
                    subtotal: presubtotal,
                    tip_amnt: parseFloat(tip || 0),
                    tax_amnt: salesTax,
                    total_amnt: total,
                    promo_id: null,
                    cart_items: cartItems.map((item) => ({
                        kind: item.item_type,
                        product_id: item.item_type === "product" ? item.product_id : null,
                        service_id: item.item_type === "service" ? item.service_id : null,
                        qty: item.quantity || 1,
                        unit_price: item.item_price,
                    })),
                }
            );

            if (response.status === 201) {
                console.log("order created successfully", response.data);
                navigate("/payment-confirmation", { state: { bookingData } });
            } else {
                alert("Unexpected response from server.");
            }
        } catch (error) {
            console.error("Error creating order:", error);
            
            if (error.response) {
                console.error("Server Response Data:", error.response.data);
                alert(`Error: ${error.response.data.error || error.response.data.details || 'Bad Request'}`);
            } else {
                alert("Error processing payment. Please try again.");
            }
        }
    };

    useEffect(() => {
        console.log("Checkout received cartItems:", JSON.stringify(cartItems, null, 2));
    }, [cartItems]);

    return (
        <div className="payment-container">
            <div className="payment-header">
                <div>
                    <h2>Payment</h2>
                    <p>Complete your payment to confirm booking</p>
                </div>
            </div>

            <div className="selected-section">
                <div className="selected-tags">
                    <p>Selected: </p>
                    {cartItems.length > 0 ? (
                        cartItems.map((item, index) => (
                            <span key={index}>
                                    {(item.service_name || item.product_name)} - $
                                    {(item.item_price * item.quantity).toFixed(2)}{" "}
                                    {item.quantity > 1 ? `(${item.quantity}x)` : " "}
                            </span>
                        ))
                    ) : (
                        <span>No Items Selected.</span>
                    )}
                </div>
            </div>

            <div className="secure-message">
                <p>Your payment information is encrypted and secure</p>
            </div>

            <div className="amount-section">
                <label>Add Tip?</label>
                <input
                    className="tip-input"
                    placeholder="0.00"
                    value={tip}
                    onChange={(e) => setTip(e.target.value.replace(/[^0-9.]/g, ""))}
                />
                <p className="summary-text">
                    Subtotal: ${subtotal.toFixed(2)} <br />
                    Total (with tip): ${total.toFixed(2)}
                </p>
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
                Pay ${total.toFixed(2)}
            </button>
        </div>
    );
}

export default Checkout;