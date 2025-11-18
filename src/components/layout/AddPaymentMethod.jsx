import { useState, useRef } from "react";

function AddPaymentMethod({ customerId, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    brand: "",
    expiration: "", // YYYY-MM-DD
    isDefault: false,
  });

  // Uncontrolled input for full card number (so we don't store PAN in state)
  const cardRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Keep other fields in state as before
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // remove nondigits
  const digitsOnly = (s) => (s || "").replace(/\D/g, "");

  // Format card input as "1234 1234 1234 1234" while typing
  const handleCardInput = (e) => {
    const raw = digitsOnly(e.target.value).slice(0, 16); // max 16 digits
    const grouped = raw.match(/.{1,4}/g)?.join(" ") || "";
    e.target.value = grouped;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Read the full card number from the ref (uncontrolled)
    const cardEl = cardRef.current;
    const rawValue = cardEl ? cardEl.value : "";
    const digits = digitsOnly(rawValue);

    // require 16 digits
    if (digits.length !== 16) {
      // show user-friendly error
      alert("Please enter a valid 16-digit card number.");
      return;
    }

    const last4 = digits.slice(-4);

    const payload = {
      brand: formData.brand,
      last4: last4,
      expiration: formData.expiration, // must be "YYYY-MM-DD"
      is_default: formData.isDefault ? 1 : 0,
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/${customerId}/methods`,
        {
          method: "POST",
          headers: {"Content-Type": "application/json",}, body: JSON.stringify(payload),
        }
      );

      if (res.status === 404) {
        console.error("Customer not found");
        return;
      }

      if (res.status === 400) {
        const errBody = await res.json();
        console.error("Validation error:", errBody);
        return;
      }

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error("Failed to create payment method:", errBody);
        return;
      }

      const created = await res.json();
      console.log("Created payment method:", created); 

      // Clear the full PAN from the input right away
      if (cardEl) {
        cardEl.value = "";
      }

      // Notify parent so it can refresh list & hide form
      if (onSuccess) {
        onSuccess(created);
      }

      // Reset other fields
      setFormData({
        brand: "",
        expiration: "",
        isDefault: false,
      });
    } catch (err) {
      console.error("Error creating payment method:", err);
    }
  };

  return (
    <form className="wallet-add-form" onSubmit={handleSubmit}>
      <div className="wallet-form-row">
        <label className="wallet-label">
          Card number
          <input
            ref={cardRef}
            type="text"
            name="cardNumber"
            onInput={handleCardInput}
            className="wallet-input"
            placeholder="1234 5678 9012 3456"
            inputMode="numeric"
            aria-label="Card number (16 digits)"
            required
          />
        </label>
      </div>

      <div className="wallet-form-row">
        <label className="wallet-label">
          Brand
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="wallet-input"
            placeholder="Visa, Mastercard..."
            required
          />
        </label>
      </div>

      <div className="wallet-form-row">
        <label className="wallet-label">
          Expiration (YYYY-MM-DD)
          <input
            type="text"
            name="expiration"
            value={formData.expiration}
            onChange={handleChange}
            className="wallet-input"
            placeholder="2029-02-22"
            required
          />
        </label>
      </div>

      <div className="wallet-form-row wallet-checkbox-row">
        <label>
          <input
            type="checkbox"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleChange}
          />{" "}
          Set as default
        </label>
      </div>

      <div className="wallet-form-actions">
        <button type="submit" className="wallet-set-btn">Save Card</button>
        <button type="button" className="wallet-remove-btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default AddPaymentMethod;
