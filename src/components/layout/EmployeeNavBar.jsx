import { ChevronLeft, CircleUserRound, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* NavBar component for an employee user */
function EmployeeNavBar({onClose, onLogout, userId, user}){

    const navigate = useNavigate();

    const navTo = (path) => {
        navigate(path, {state: {userId, user}});
        onClose();
    }
    
    const handleLogout = () => {
        console.log('Logout button clicked');
        if(onLogout) {
            onLogout();
            console.log('Logout succeeded');
        }
        onClose();
    };

    const displayName = user?.first_name ? `${user.first_name} ${user.last_name ?? ''}`.trim() : 'Employee';

  const employeeNumber = user?.profile_id ?? userId ?? '-';

    return(
        <div className="nav-bar">
            <button className="nav-close-button" onClick={onClose}>
                <ChevronLeft strokeWidth={3} />
            </button>

            {/* Profile Section */}
            <div className="nb-profile-section">
                <CircleUserRound className="nb-profile-icon" />
                <div className="nb-profile-info">
                    <p className="nb-user-name">{displayName}</p>
                    <p className="nb-user-tag">Employee #{employeeNumber}</p>
                    <div className="nb-verified">
                        <ShieldCheck className="nb-verified-icon" />
                        <span>Verified</span>
                    </div>
                </div>
            </div>

            {/* MyJade Account */}
            <div className="nb-section">
                <div className="nb-section-title">MyJade Account</div>
                <button className="nb-text-link" onClick={() => navTo('/employee-appointments')}>Appointments</button>
                <button className="nb-text-link" onClick={() => navTo('/employee-schedule')}>Scheduling</button>
                <button className="nb-text-link" onClick={() => navTo('/paymentportal')}>Payment Portal</button>
                <button className="nb-text-link" onClick={() => navTo('/messages')}>Messages</button>
                <button className="nb-text-link" onClick={handleLogout}>Log Out</button>

            </div>

            {/* Footer */}
            <div className="nb-footer">
                <button className="nb-footer-link" onClick={() => navTo('/contact')}>Contact</button>
                <button className="nb-footer-link" onClick={() => navTo('/faq')}>FAQ</button>
                <div className="nb-footer-link">Copyright ©</div>
            </div>  

        </div>
    );

}

export default EmployeeNavBar;