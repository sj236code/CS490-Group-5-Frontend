import { useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";

function MyWallet() {
  const [methods, setMethods] = useState([
    {
      id: 1,
      brand: "VISA",
      last4: "4532",
      name: "Sarah Mitchell",
      exp: "12/2026",
      added: "Jun 14, 2024",
      isDefault: true,
    },
    {
      id: 2,
      brand: "MC",
      last4: "5412",
      name: "Sarah Mitchell",
      exp: "08/2027",
      added: "Sep 19, 2024",
      isDefault: false,
    },
  ]);

  const setDefault = (id) =>
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));

  const removeMethod = (id) =>
    setMethods((prev) => prev.filter((m) => m.id !== id));

  const addMethod = () => alert("Add Payment Method clicked");

  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <div>
          <h2 className="wallet-title">My Wallet</h2>
          <p className="wallet-subtitle">Manage your payment methods</p>
        </div>
        <button className="wallet-add-btn" onClick={addMethod}>
          <Plus size={18} />
          Add Payment Method
        </button>
      </div>

      {methods.map((m) => (
        <div key={m.id} className="wallet-card">
          <div className={`wallet-brand ${m.brand === "VISA" ? "visa" : "mc"}`}>
            {m.brand}
          </div>

          <div className="wallet-info">
            <div className="wallet-number">
              •••• •••• •••• {m.last4}
              {m.isDefault && <span className="wallet-default-badge">Default</span>}
            </div>
            <div className="wallet-text">{m.name}</div>
            <div className="wallet-text">Expires {m.exp}</div>
            <div className="wallet-text">Added {m.added}</div>
          </div>

          <div className="wallet-actions">
            {!m.isDefault && (
              <button className="wallet-set-btn" onClick={() => setDefault(m.id)}>
                <Check size={16} /> Set Default
              </button>
            )}
            <button className="wallet-remove-btn" onClick={() => removeMethod(m.id)}>
              <Trash2 size={16} /> Remove
            </button>
          </div>
        </div>
      ))}

      <div className="wallet-security-box">
        <div className="wallet-security-header">
          <div className="wallet-info-icon">i</div>
          <div className="wallet-security-title">Security Information</div>
        </div>
        <p className="wallet-text">
          Your payment information is encrypted and securely stored. We never
          store your full card number or CVV.
        </p>
        <p className="wallet-text">
          Your default payment method will be automatically selected during
          checkout, but you can always choose a different card.
        </p>
      </div>
    </div>
  );
}

export default MyWallet;
