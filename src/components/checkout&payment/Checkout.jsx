import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

function Checkout() {

    const navigate = useNavigate();

    const [paymentMethod, setPaymentMethod] = useState("card");
    const [tip, setTip] = useState(0.0);

    const confirmPayment = () => {
        navigate("/payment-confirmation");
    }

    return(
        <div className="payment-container">
            <div className="payment-header">
                <div>
                    <h2>Payment</h2>
                    <p>Complete your payment to confirm booking</p> 
                </div> 
                <p className ="summary-text">130 min - $85</p>              
            </div>

            <div className="selected-section">
                <div className="selected-tags">
                    <p>Selected: </p>               {/*modify to have db values*/}
                    <span>Classic Fade</span>       {/*placeholders*/}
                    <span>Beard Trim</span>         
                    <span>Haircut & Style</span>
                </div>
            </div>

            <div className="secure-message">
                <p>Your payment information is encrypted and secure</p>
            </div>

            <div className="amount-section">
                <label>Add Tip?</label>
                <input className="tip-input" placeholder="0.0" value={tip}/>
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
                        <input type="text" placeholder="ex: John Doe" />
                    </div>
                    <div className="form-group">
                        <label>Card Number</label>
                        <input type="text" placeholder="1234 5678 9012 3456" />
                    </div>

                    <div className="card-details">
                        <div className="form-group">
                            <label>Expiration Date</label>
                            <input type="text" placeholder="MM/YY" />
                        </div>
                        <div className="form-group">
                            <label>CVV</label>
                            <input type="text" placeholder="123" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Billing ZIP Code</label>
                        <input type="text" placeholder="12345" />
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

            <button 
                className="pay-btn"
                onClick={confirmPayment}
            >
                Pay $85.00</button>
        </div>
    );
}

export default Checkout;