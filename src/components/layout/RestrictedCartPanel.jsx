import { ChevronRight, Shield, LogOut } from 'lucide-react';

function RestrictedCartPanel({ onClose, userType = 'User', userId, userName, onLogout }) {
  const label = userName
    ? `${userType} (${userName})`
    : userId
    ? `${userType} (ID: ${userId})`
    : userType;

  return (
    <div className="cart-panel">
      <button className="cart-panel-close-button" onClick={onClose} aria-label="Close cart">
        <ChevronRight strokeWidth={3} />
      </button>

      <div className="cart-header">
        <span className="cart-header-icon"><Shield size={16} /></span>
        <span className="cart-title">Cart</span>
      </div>

      <div className="empty-card">
        <div className="empty-icon">🔒</div>
        <div className="empty-title">Cart unavailable</div>
        <p className="empty-text">
          You are signed in as <strong>{label}</strong>.<br />
          Please log out and sign in as a <strong>Customer</strong> to use the cart.
        </p>

        {onLogout && (
          <button className="logout-button" onClick={onLogout}>
            <LogOut size={16} style={{ marginRight: 6 }} />
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

export default RestrictedCartPanel;
