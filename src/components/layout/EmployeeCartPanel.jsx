import RestrictedCartPanel from './RestrictedCartPanel';

/* CartPanel component for any user */
function EmployeeCartPanel({ onClose, userId, userName, onLogout }){

  return (
    <div className="cart-panel-overlay" onClick={onClose}>
      <RestrictedCartPanel
        onClose={onClose}
        userType="Employee"
        userId={userId}
        userName={userName}
        onLogout={onLogout}
      />
    </div>
    
  );
}

export default EmployeeCartPanel