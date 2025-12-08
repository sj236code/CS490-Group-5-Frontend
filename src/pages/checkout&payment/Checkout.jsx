import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DiscountItem from "./DiscountItem";
import axios from "axios";

import "./Checkout.css";

function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();

    const customerIdFromState = (location.state && location.state.customer_id);
    const customerIdFromSession = sessionStorage.getItem("checkout_customer_id");
    const customer_id = customerIdFromState || customerIdFromSession;
    const cartItems = (location.state && location.state.cartItems) || [];
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [tip, setTip] = useState(""); 
    const [employeeName] = useState("");
    const [savedMethods, setSavedMethods] = useState([]);
    const [selectedCardId, setSelectedCardId] = useState("");
    
    const [cardDetails, setCardDetails] = useState({
        name: "",
        number: "",
        expiry: "",
        cvv: "",
        zip: "",
    });

    const brandLogo = {
        visa: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg",
        mastercard: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",
        amex: "https://1000logos.net/wp-content/uploads/2016/10/American-Express-logo-1536x864.png",
        discover: "https://1000logos.net/wp-content/uploads/2020/11/Discover-Logo.jpg"
    };

    const [discounts, setDiscounts] = useState([]);

    const allChecked = discounts.length > 0 && discounts.every((d) => d.checked);

    const toggleSelectAll = () => {
        setDiscounts(prev =>
            prev.map(d => ({ ...d, checked: !allChecked }))
        );
    };

    const toggleSingle = (id) => {
        setDiscounts(prev =>
            prev.map(d =>
                d.id === id ? { ...d, checked: !d.checked } : d
            )
        );
    };

    const presubtotal = cartItems.reduce(
        (sum, item) => sum + (item.item_price || 0) * (item.quantity || 1), 0
    );

    const taxRate = Number(import.meta.env.VITE_TAX_RATE) || 0.066;
    const salesTax = presubtotal * taxRate;
    const subtotal = salesTax + presubtotal;

    const discountTotal = discounts
        .filter(d => d.checked)
        .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

    const total = Math.max(0, parseFloat(subtotal) + parseFloat(tip || 0) - discountTotal);

    const extractSalonName = (item) => {
        if (!item) return null;
        return (
            item.service_salon_name ||
            item.product_salon_name ||
            item.salon_name ||
            (item.salon && (item.salon.name || item.salon.title)) ||
            null
        );
    };

    useEffect(() => {
        if (!customer_id || cartItems.length === 0) {
            setDiscounts([]); // clear
            return;
        }

        const fetchPreview = async () => {
            const spendMap = {};
            cartItems.forEach((item) => {
                const salonId = item.salon_id || item.service_salon_id || item.product_salon_id || (item.salon && item.salon.id);
                const price = Number(item.item_price || 0) * (Number(item.quantity || 1));
                if (!salonId) return;
                spendMap[salonId] = (spendMap[salonId] || 0) + price;
            });

            const cart_spending = Object.entries(spendMap).map(([salon_id, amount_spent]) => ({
                salon_id: Number(salon_id),
                amount_spent: Number(amount_spent)
            }));

            const cartSalonIds = new Set(Object.keys(spendMap).map(Number));

            try {
                const resp = await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/loyalty/cart/checkout-preview`,
                    {
                        customer_id: customer_id,
                        cart_spending
                    }
                );

                console.log("=== RAW CHECKOUT PREVIEW DATA ===");
                console.log("Input cart_spending:", cart_spending);
                console.log("Raw API Response:", resp.data);
                console.log("Cart salon IDs:", Array.from(cartSalonIds));
                console.log("===============================");

                const rewardsData = resp.data || {};
                const seenSalonOrder = Array.from(cartSalonIds);

                const newDiscounts = seenSalonOrder.map((salonId, idx) => {
                    const entry = rewardsData[String(salonId)] || {};
                    const matchingItem = cartItems.find(item =>
                        (item.salon_id && item.salon_id == salonId) ||
                        (item.service_salon_id && item.service_salon_id == salonId) ||
                        (item.product_salon_id && item.product_salon_id == salonId) ||
                        (item.salon && item.salon.id && item.salon.id == salonId)
                    );
                    const salonName = entry.salon_name || extractSalonName(matchingItem) || `Salon #${salonId}`;

                    let pointsInfo = entry.info_text;
                    if (!pointsInfo) {
                        const est = entry.estimated_points_earned;
                        if (est && Number(est) > 0) {
                            pointsInfo = `No points yet — you'll earn ${est} points from this purchase`;
                        } else {
                            pointsInfo = "No points available for use";
                        }
                    }

                    return {
                        id: Number(salonId),
                        salon: salonName,
                        pointsInfo,
                        amount: Number(entry.max_discount || 0),
                        checked: false,
                    };
                });

                setDiscounts(newDiscounts);

            } catch (err) {
                console.error("Failed to fetch checkout preview", err);
                const fallback = {};
                cartItems.forEach(item => {
                    const sid = item.salon_id || item.service_salon_id || item.product_salon_id || (item.salon && item.salon.id);
                    fallback[sid] = fallback[sid] || {
                        id: sid,
                        salon: extractSalonName(item) || `Salon #${sid}`,
                        pointsInfo: "Unable to load points",
                        amount: 0,
                        checked: false
                    };
                });
                setDiscounts(Object.values(fallback));
            }
        };

        fetchPreview();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customer_id, JSON.stringify(cartItems)]); // JSON.stringify to watch deep changes in cartItems

    const convertISOToMMYY = (isoDateString) => {
        if (!isoDateString) return "";
        const dateMatch = isoDateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (dateMatch) {
            const year = dateMatch[1].slice(-2);
            const month = dateMatch[2];
            return `${month}/${year}`;
        }
        try {
            const date = new Date(isoDateString);
            if (isNaN(date.getTime())) return "";
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = String(date.getFullYear()).slice(-2);
            return `${month}/${year}`;
        } catch (error) {
            return "";
        }
    };

    useEffect(() => {
        if (!customer_id) return;

        const fetchMethods = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/payments/${customer_id}/methods`,
                );
                const methods = Array.isArray(response.data) ? response.data : response.data.methods || [];
                setSavedMethods(methods);

                const defaultCard = methods.find((m) => m.is_default);
                if (defaultCard) {
                    setSelectedCardId(defaultCard.id);
                    setCardDetails((prev) => ({
                        ...prev,
                        name: defaultCard.card_name || "",
                        expiry: convertISOToMMYY(defaultCard.expiration || defaultCard.Expiration || defaultCard.expiry),
                        number: "************" + (defaultCard.last4 || ""), 
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch saved payment methods:", error);
            }
        };
        fetchMethods();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customer_id]);

    const handleCardSelect = (e) => {
        const selectedId = e.target.value;
        setSelectedCardId(selectedId);

        if (!selectedId) {
            setCardDetails({ name: "", number: "", expiry: "", cvv: "", zip: "" });
            return;
        }
        const selectedMethod = savedMethods.find((m) => m.id === Number(selectedId));
        if (selectedMethod) {
            const formattedExpiry = convertISOToMMYY(selectedMethod.expiration || selectedMethod.Expiration || selectedMethod.expiry);
            setCardDetails({
                name: selectedMethod.card_name || "",
                number: "************" + (selectedMethod.last4 || ""),
                expiry: formattedExpiry,
                cvv: "",
                zip: "",
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        if (selectedCardId !== "" && name !== "number" && name !== "cvv" && name !== "zip") {
            setSelectedCardId("");
        }

        switch (name) {
            case "name": newValue = value.replace(/[^A-Za-z\s]/g, ""); break;
            case "number": 
                if (selectedCardId) {
                    const cleanInput = value.replace(/\D/g, "");
                    newValue = "************" + cleanInput.slice(-4);
                } else {
                    newValue = value.replace(/\D/g, "").slice(0, 16);
                }
                break;
            case "expiry":
                newValue = value.replace(/[^\d/]/g, "");
                if (newValue.length === 2 && !newValue.includes('/')) newValue = newValue + '/';
                if (newValue.length > 5) newValue = newValue.slice(0, 5);
                break;
            case "cvv": newValue = value.replace(/\D/g, "").slice(0, 3); break;
            case "zip": newValue = value.replace(/\D/g, "").slice(0, 5); break;
            default: break;
        }
        setCardDetails((prev) => ({ ...prev, [name]: newValue }));
    };

    const formatCardOption = (method) => {
        const brand = method.brand ? method.brand.charAt(0).toUpperCase() + method.brand.slice(1).toLowerCase() : "Card";
        const defaultTag = method.is_default ? " (Default)" : "";
        return `${brand} ending in ${method.last4 || "xxxx"}${defaultTag}`;
    };

    // --- APPOINTMENT CREATION ---
    const createAppointmentsForServices = async () => {
        const serviceItems = cartItems.filter(
            (item) => item.item_type === "service" && item.start_at
        );
        if (!serviceItems.length) return;

        try {
            await Promise.all(
                serviceItems.map(async(item) => {
                    const salonId = item.salon_id ?? item.service_salon_id ?? item.salon?.id ?? null;
                    const serviceId = item.service_id ?? item.service?.id ?? item.serviceID ?? null;
                    const employeeId = item.stylist_id ?? item.employee_id ?? item.employeeId ?? null;
                    const photos = item.images || [];

                    const payload = {
                        customer_id,
                        salon_id: salonId,
                        service_id: serviceId,
                        employee_id: employeeId, 
                        start_at: item.start_at,
                        notes: item.notes || null,
                        status: "Booked",
                    };

                    const apptRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/appointments/add`, payload); 
                    
                    if(apptRes.data.appointment_id && photos.length > 0 && item.cart_item_id) {
                        try {
                            await axios.post(
                                `${import.meta.env.VITE_API_URL}/api/cart/transfer-images-to-appointment`,
                                {
                                    cart_item_id: item.cart_item_id,
                                    appointment_id: apptRes.data.appointment_id,
                                    image_urls: photos  
                                }
                            );
                        } catch (transferErr) {
                            console.error("Error transferring images:", transferErr);
                        }
                    }
                    return apptRes;
                })
            );
        } catch (err) {
            console.error("Error creating appointments:", err);
        }
    };
    
    // --- CONFIRM PAYMENT ---
    const confirmPayment = async () => {
        if (!customer_id) {
            alert("Error: Customer ID missing. Please return to cart.");
            return;
        }

        // Validate Card
        if (paymentMethod === "card") {
            if (selectedCardId === "") {
                const { name, number, expiry, cvv, zip } = cardDetails;
                if (!name || !number || !expiry || !cvv || !zip || number.length < 16 || expiry.length < 5 || cvv.length < 3 || zip.length < 5) {
                    alert("Please fill out all NEW card details correctly.");
                    return;
                }
            } else {
                const { number, cvv } = cardDetails;
                const selectedMethod = savedMethods.find((m) => m.id === Number(selectedCardId));
                if (!selectedMethod) { alert("Saved card not found."); return; }
                if (cvv.length < 3) { alert("Please enter the 3-digit CVV."); return; }
                if (number.slice(-4) !== selectedMethod.last4) { alert("Last 4 digits mismatch."); return; }
            }
        }

        const maskedCard = paymentMethod === "card"
                ? selectedCardId
                    ? `Saved Card ending in ${savedMethods.find(m => m.id === Number(selectedCardId))?.last4}`
                    : `${"*".repeat(12)} ${cardDetails.number.slice(-4)}`
                : null;
        
        // --- 5. PREPARE BOOKING DATA ---
        const totalServiceDuration = cartItems
            .filter((item) => item.item_type === "service")
            .reduce((sum, service) => sum + (service.service_duration || 0), 0);

        const firstStartItem = cartItems.find((item) => item.start_at);
        let appointmentDate = "N/A", appointmentTime = "N/A";
        if (firstStartItem) {
            const dateObj = new Date(firstStartItem.start_at);
            if (!isNaN(dateObj.getTime())) {
                appointmentDate = dateObj.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
                appointmentTime = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
            }
        }

        const bookingData = {
            customer_id,
            date: appointmentDate,
            time: appointmentTime,
            duration: totalServiceDuration,
            staff: employeeName,
            paymentMethod: selectedCardId ? "Saved Card" : paymentMethod,
            maskedCard,
            cartItems,
            total,
            salesTax,
            discountTotal // Pass this to confirmation if needed
        };

        try {
            // Identify rewards to deduct points
            const appliedRewards = discounts
                .filter(d => d.checked)
                .map(d => ({
                    salon_id: d.id,
                    discount_amount: d.amount
                }));

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/payments/create_order`,
                {
                    customer_id: customer_id,
                    salon_id: cartItems[0]?.salon_id || null, // Primary salon for order header
                    subtotal: presubtotal,
                    tip_amnt: parseFloat(tip || 0),
                    tax_amnt: salesTax,
                    discount_amnt: discountTotal, // Total discount applied
                    total_amnt: total,
                    applied_rewards: appliedRewards, // List of rewards used
                    promo_id: null,
                    cart_items: cartItems.map((item) => ({
                        kind: item.item_type,
                        product_id: item.item_type === "product" ? item.product_id : null,
                        service_id: item.item_type === "service" ? item.service_id : null,
                        salon_id: item.salon_id ?? item.service_salon_id ?? item.product_salon_id ?? item.salon?.id,
                        qty: item.quantity || 1,
                        unit_price: item.item_price,
                    })),
                },
                { headers: localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {} }
            );

            if (response.status === 201) {

                console.log("Order created", response.data);

                await createAppointmentsForServices();
                navigate("/payment-confirmation", { state: { bookingData } });
            } else {
                alert("Unexpected response.");
            }
        } catch (error) {
            console.error("Error creating order:", error);
            if (error.response) {
                alert(`Error: ${error.response.data.error || 'Payment Failed'}`);
            } else {
                alert("Error processing payment. Please try again.");
            }
        }
    };

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

            <div className="discount-box">
                <h2 className="discount-title">Discounts & Rewards</h2>
                <div className="discount-subtitle">
                    The following discounts are applied
                </div>
                <div className="discount-list">
                    {discounts.map(item => (
                        <DiscountItem
                            key={item.id}
                            id={item.id}
                            salon={item.salon}
                            pointsInfo={item.pointsInfo}
                            amount={item.amount}
                            checked={item.checked}
                            onToggle={toggleSingle}
                        />
                    ))}

                    {discounts.length === 0 && (
                        <div className="discount-empty">No loyalty rewards available.</div>
                    )}
                    <div className="discount-header">
                        <div className="select-all-left-group">
                            <input
                                type="checkbox"
                                className="discount-checkbox"
                                checked={allChecked}
                                onChange={toggleSelectAll}
                            />
                            <span className="select-all">Select All</span>
                        </div>
                        
                        <div className="discount-amount total-discount">
                            Total Discount: ${discountTotal.toFixed(2)}
                        </div>
                        
                    </div>
                </div>
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
                    {discountTotal > 0 && (
                        <span style={{ color: '#2ecc71' }}>
                            Rewards Applied: -${discountTotal.toFixed(2)} <br />
                        </span>
                    )}
                    <strong>Total (with tip): ${total.toFixed(2)}</strong>
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
                        <label>Select Saved Card</label>
                        <div className="dropdown-with-logo">
                            <select
                                className="card-dropdown"
                                value={selectedCardId}
                                onChange={handleCardSelect}
                            >
                                <option value="">Use a New Card</option>
                                {savedMethods
                                    .slice()
                                    .sort((a, b) => (b.is_default ? 1 : -1)) 
                                    .map((method) => (
                                        <option key={method.id} value={method.id}>
                                            {formatCardOption(method)}
                                        </option>
                                    ))}
                            </select>
                            <div className="logo-wrapper">
                                {selectedCardId ? (
                                    <img
                                        alt="card-logo"
                                        className="card-logo"
                                        src={brandLogo[(savedMethods.find((x) => x.id === Number(selectedCardId))?.brand || "").toLowerCase()] || ""}
                                    />
                                ) : null}
                            </div>
                        </div>
                        <label>Cardholder Name</label>
                        <input
                            name="name"
                            type="text"
                            placeholder="ex: John Doe"
                            value={cardDetails.name}
                            onChange={handleChange}
                            disabled={selectedCardId !== ""}
                        />
                    </div>
                    <div className="form-group">
                        <label>Card Number</label>
                        <input
                            name="number"
                            type="text"
                            maxLength={selectedCardId ? 16 : undefined}
                            placeholder="**** **** **** 1234"
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
                                placeholder="MM/YY"
                                value={cardDetails.expiry}
                                onChange={handleChange}
                                disabled={selectedCardId !== ""}
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
                <p>Your payment information is encrypted and never stored on our servers. We are PCI DSS compliant.</p>
            </div>

            <button className="pay-btn" onClick={confirmPayment}>
                Pay ${total.toFixed(2)}
            </button>
        </div>
    );
}

export default Checkout;
