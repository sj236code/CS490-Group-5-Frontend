import { ChevronLeft } from 'lucide-react';
import LoginButton from './LoginButton.jsx';

/* NavBar component for an unregistered user */
function NavBar({onClose}){

    // Route to Sign In/ Sign Out Page
    const navigateToLogin = () => {
        navigate('/signup');
    }

    return(
        <div className="nav-bar">
            <button className="nav-close-button" onClick={onClose}>
                <ChevronLeft strokeWidth={3} />
            </button>
            <div>
                <LoginButton onClick={navigateToLogin} style={{cursor: 'pointer'}}/>
            </div>
        </div>
        
    );

}

export default NavBar;