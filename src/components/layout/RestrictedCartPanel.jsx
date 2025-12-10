import { ChevronRight, Shield, LogOut, Lock } from 'lucide-react';

function RestrictedCartPanel({ 
  onClose, 
  userType = 'Guest', 
  userId = null, 
  userName = null, 
  onLogout = null 
}) {

  // Determine the user label for display
  const userLabel = userName
    ? `${userType} (${userName})`
    : userId
    ? `${userType} (ID: ${userId})`
    : userType;

  const isGuest = userType === 'Guest' || userType === 'None';

  return (
    <div className="cart-panel">
      
      {/* Close Button */}
      <button 
        className="cart-panel-close-button" 
        onClick={onClose} 
        aria-label="Close cart"
      >
        <ChevronRight strokeWidth={3} />
      </button>

      {/* Header */}
      <div className="cart-header">
        <span className="cart-header-icon">
          <Shield size={16} />
        </span>
        <span className="cart-title">Cart</span>
      </div>

      {/* Main Content */}
      <div className="empty-card">
        
        {/* Lucide Lock Icon */}
        <div className="empty-icon">
          <Lock size={32} strokeWidth={2} />
        </div>

        <div className="empty-title">Cart Unavailable</div>

        <p className="empty-text">
          {isGuest ? (
            <>
              You are not signed in.<br />
              Please sign in as a <strong>Customer</strong> to use the cart.
            </>
          ) : (
            <>
              You are signed in as <strong>{userLabel}</strong>.<br />
              Only <strong>Customers</strong> are allowed to access the cart.
            </>
          )}
        </p>

        {!isGuest && onLogout && (
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
