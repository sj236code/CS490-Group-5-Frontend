import RestrictedCartPanel from './RestrictedCartPanel';

/* CartPanel component for any user */
function EmployeeCartPanel({ onClose, userId, userName, onLogout }){

  return (
    <RestrictedCartPanel
      onClose={onClose}
      userType="Employee"
      userId={userId}
      userName={userName}
      onLogout={onLogout}
    />
  );

}

export default EmployeeCartPanel