import { ChevronLeft, CircleUserRound, ShieldCheck, Logout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* NavBar component for an customer user */
function CustomerNavBar({onClose}){

    const navigate = useNavigate();

    const handleContactClick = () => {
        navigate('/contact');
        onClose(); 
    };

    const handleFAQClick = () => {
        navigate('/faq');
        onClose();
    };

    const handleLogout = async () => {
        try {
            await signOut(auth); // Sign out Firebase user
            navigate('/signup');  // Redirect to SignUp page
            onClose();            // Close navbar
        } 
        catch (error) {
            console.error("Logout failed:", error);
        }
    };

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
                <p className="nb-user-tag">Customer</p>
                <div className="nb-verified">
                    <ShieldCheck className="nb-verified-icon" />
                    <span>Verified</span>
                </div>
                </div>

            </div>

            {/* Footer */}
            <div className="nb-footer">
                <button onClick={handleContactClick} className="nb-footer-link">Contact</button>
                <button onClick={handleFAQClick} className="nb-footer-link">FAQ</button>
                <button onClick={handleLogout} className="nb-footer-link">
                {/* <LogOut className="logout-icon" /> */} 
                Logout
                </button>
                <div className="footer-copyright">
                Copyright <span className="copyright-icon">©</span>
                </div>
            </div>
        </div>
    );

}

export default CustomerNavBar;
