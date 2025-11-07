import { ChevronLeft, CircleUserRound, ShieldCheck, Logout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* NavBar component for an customer user */
function AdminNavBar({onClose}){

    const navigate = useNavigate();

    const navTo = (path) => {
        navigate(path);
        onClose();
    } 

    return (
        <div className="nav-bar">
            <button className="nav-close-button" onClick={onClose}>
                <ChevronLeft strokeWidth={3} />
            </button>

            {/* Profile Section */}
            <div className="nb-profile-section">
                <CircleUserRound className="nb-profile-icon" />
                <div className="nb-profile-info">
                <p className="nb-user-name">John Smith</p>
                <p className="nb-user-tag">Admin</p>
                <div className="nb-verified">
                    <ShieldCheck className="nb-verified-icon" />
                    <span>Verified</span>
                </div>
                </div>

            </div>

            {/* MyJade Account */}
            <div className="nb-section">
                <div className="nb-section-title">MyJade Account</div>
                <button className="nb-text-link" onClick={() => navTo('/adminDashboard')}>Dashboard</button>
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

export default AdminNavBar;
