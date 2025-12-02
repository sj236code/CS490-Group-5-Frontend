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

    const [paymentMethod, setPaymentMethod] = useState("card");
    const [tip, setTip] = useState();
    const [employeeName] = useState("");
    const [savedMethods, setSavedMethods] = useState([]);
    const [selectedCardId, setSelectedCardId] = useState("");

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

    const brandLogo = {
        visa: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg",
        mastercard: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",
        amex: "https://1000logos.net/wp-content/uploads/2016/10/American-Express-logo-1536x864.png",
        discover: "https://1000logos.net/wp-content/uploads/2020/11/Discover-Logo.jpg"
    };

    const convertISOToMMYY = (isoDateString) => {
        if (!isoDateString) return "";

        console.log("Converting ISO date:", isoDateString);

        const dateMatch = isoDateString.match(/^(\d{4})-(\d{2})-(\d{2})/);

        if (dateMatch) {
            const year = dateMatch[1].slice(-2);
            const month = dateMatch[2];

            const formatted = `${month}/${year}`;
            console.log("Converted from YYYY-MM-DD to MM/YY:", formatted);
            return formatted;
        }

        try {
            const date = new Date(isoDateString);

            if (isNaN(date.getTime())) {
                console.warn("Invalid date format could not be parsed:", isoDateString);
                return "";
            }

            const month = String(date.getMonth() + 1).padStart(2, '0');

            const year = String(date.getFullYear()).slice(-2);

            const formatted = `${month}/${year}`;
            console.log("Converted from ISO via Date Object to MM/YY:", formatted);

            return formatted;
        } catch (error) {
            console.error("Error converting date:", error);
            return "";
        }
    };

    useEffect(() => {
        if (!customer_id) {
            console.debug("No customer_id present; skipping fetch of saved payment methods.");
            return;
        }

        console.log("Customer ID found, starting fetch:", customer_id);

        console.log("Cart Items in Checkout:", cartItems);
        cartItems.forEach((item, index) => {
            console.log(`Item ${index}:`, {
                name: item.service_name || item.product_name,
                pictures: item.pictures,
                hasPictures: !!(item.pictures && item.pictures.length > 0)
            });
        });

        const fetchMethods = async () => {
            try {
                console.debug("fetching methods for customer_id:", customer_id);

                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/payments/${customer_id}/methods`,
                );

                console.debug("saved methods response:", response.data);

                const methods = Array.isArray(response.data) ? response.data : response.data.methods || [];
                setSavedMethods(methods);

                const defaultCard = methods.find((m) => m.is_default);
                if (defaultCard) {
                    console.log("Setting default card, calling convertISOToMMYY:", defaultCard);
                    setSelectedCardId(defaultCard.id);
                    setCardDetails((prev) => ({
                        ...prev,
                        name: defaultCard.card_name || "",
                        expiry: convertISOToMMYY(defaultCard.expiration || defaultCard.Expiration || defaultCard.expiry),
                        number: "************" + (defaultCard.last4 || ""), 
                        cvv: "",
                        zip: "",
                    }));
                } else {
                    console.log("No default card found in saved methods. Skipping expiry conversion.");
                }
            } catch (error) {
                console.error("Failed to fetch saved payment methods:", error);
                if (error.response) {
                    console.debug("server response:", error.response.status, error.response.data);
                }
            }
        };

        fetchMethods();
    }, [customer_id, cartItems]);

    const handleCardSelect = (e) => {
        const selectedId = e.target.value;
        setSelectedCardId(selectedId);

        if (!selectedId) {
            setCardDetails({ name: "", number: "", expiry: "", cvv: "", zip: "" });
            return;
        }

        const selectedMethod = savedMethods.find((m) => m.id === Number(selectedId));
        if (selectedMethod) {
            console.log("Selected method data:", selectedMethod);

            const formattedExpiry = convertISOToMMYY(selectedMethod.expiration || selectedMethod.Expiration || selectedMethod.expiry);
            console.log("Final formatted expiration for display: ", formattedExpiry);

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
            case "name":
                newValue = value.replace(/[^A-Za-z\s]/g, "");
                break;
            case "number":
                if (selectedCardId) {
                    const cleanInput = value.replace(/\D/g, "");
                    const last4Digits = cleanInput.slice(-4);
                    newValue = "************" + last4Digits;
                } else {
                    newValue = value.replace(/\D/g, "").slice(0, 16);
                }
                break;
            case "expiry":
                newValue = value.replace(/[^\d/]/g, "");

                if (newValue.length === 2 && !newValue.includes('/')) {
                    newValue = newValue + '/';
                }

                if (newValue.length > 5) {
                    newValue = newValue.slice(0, 5);
                }
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

    const formatCardOption = (method) => {
        const brand = method.brand ? method.brand.charAt(0).toUpperCase() + method.brand.slice(1).toLowerCase() : "Card";
        const defaultTag = method.is_default ? " (Default)" : "";
        return `${brand} ending in ${method.last4 || "xxxx"}${defaultTag}`;
    };

    const createAppointmentsForServices = async () => {
        const serviceItems = cartItems.filter(
            (item) => item.item_type === "service" && item.start_at
        );

        if (!serviceItems.length) {
            console.log("No service items in cart; skipping appointment creation.");
            return;
        }

        try {
            await Promise.all(
                serviceItems.map(async(item, index) => {
                    const salonIdForThisService = item.salon_id ?? item.service_salon_id ?? item.salon?.id ?? null;
                    const serviceIdForThisService = item.service_id ?? item.service?.id ?? item.serviceID ?? null;
                    const employeeIdForThisService = item.stylist_id ?? item.employee_id ?? item.employeeId ?? null;

                    const photosForThisService = item.images || [];
                    console.log(`Item ${index} images:`, photosForThisService);

                    const payload = {
                        customer_id,
                        salon_id: salonIdForThisService,
                        service_id: serviceIdForThisService,
                        employee_id: employeeIdForThisService, 
                        start_at: item.start_at,
                        notes: item.notes || null,
                        status: "Booked",
                    };

                    console.log(`Creating appointment #${index + 1}`, payload);

                    const appointmentResponse = await axios.post(
                        `${import.meta.env.VITE_API_URL}/api/appointments/add`, 
                        payload
                    ); 
                    
                    if(appointmentResponse.data.appointment_id && photosForThisService.length > 0 && item.cart_item_id) {
                        try {
                            await axios.post(
                                `${import.meta.env.VITE_API_URL}/api/cart/transfer-images-to-appointment`,
                                {
                                    cart_item_id: item.cart_item_id,
                                    appointment_id: appointmentResponse.data.appointment_id,
                                    image_urls: photosForThisService  
                                }
                            );
                            console.log(`Transferred ${photosForThisService.length} images to appointment ${appointmentResponse.data.appointment_id}`);
                        } catch (transferErr) {
                            console.error("Error transferring images to appointment:", transferErr);
                        }
                    } else {
                        console.log(`No images to transfer for appointment ${appointmentResponse.data.appointment_id} or missing cart_item_id`);
                    }
                    
                    return appointmentResponse;
                })
            );

            console.log("All service appointments created successfully.");
        } 
        catch (err) {
            console.error("Error creating one or more appointments:", err);
        }
    };
    
    const confirmPayment = async () => {
        if (!customer_id) {
            alert("Error: Customer ID is missing. Please return to your cart and check out again.");
            return;
        }

        if (paymentMethod === "card") {
            if (selectedCardId === "") {
                const { name, number, expiry, cvv, zip } = cardDetails;
                if (!name || !number || !expiry || !cvv || !zip || number.length < 16 || expiry.length < 5 || cvv.length < 3 || zip.length < 5) {
                    alert("Please fill out all NEW card details before proceeding.");
                    return;
                }
            } else {
                const { number, cvv } = cardDetails;
                const selectedMethod = savedMethods.find((m) => m.id === Number(selectedCardId));

                if (!selectedMethod) {
                     alert("Error: Saved card details not found.");
                     return;
                }

                if (cvv.length < 3) {
                    alert("Please enter the 3-digit CVV for the saved card.");
                    return;
                }

                const last4Input = number.slice(-4);
                const actualLast4 = selectedMethod.last4;
                
                if (last4Input !== actualLast4) {
                    alert("The last 4 digits you entered do not match the saved card's last 4 digits. Please check the number and try again.");
                    return;
                }
            }
        }


        const maskedCard =
            paymentMethod === "card"
                ? selectedCardId
                    ? `Saved Card ending in ${savedMethods.find(m => m.id === Number(selectedCardId))?.last4}`
                    : `${"*".repeat(12)} ${cardDetails.number.slice(-4)}`
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
                    weekday: "long", year: "numeric", month: "long", day: "numeric"
                });
                appointmentTime = dateObj.toLocaleTimeString("en-US", {
                    hour: "2-digit", minute: "2-digit"
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
            paymentMethod: selectedCardId ? "Saved Card" : paymentMethod,
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
                },
                {
                    headers: localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {}
                }
            );

            if (response.status === 201) {
                console.log("order created successfully", response.data);

                await createAppointmentsForServices();

                navigate("/payment-confirmation", { state: { bookingData } });
            } 
            else {
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
                                        src={
                                            brandLogo[
                                                (savedMethods.find((x) => x.id === Number(selectedCardId))?.brand || "")
                                                    .toLowerCase()
                                            ] || ""
                                        }
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
