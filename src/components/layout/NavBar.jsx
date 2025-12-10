import { ChevronLeft } from 'lucide-react';
import LoginButton from './LoginButton.jsx';
import NavLogin from './NavLogin.jsx';
import { useNavigate } from 'react-router-dom';

function NavBar({onClose}){

    const navigate = useNavigate();

    const navigateToLogin = () => {
        navigate('/signup');
    }

    return(
        <div className="nav-bar-overlay" onClick={onClose}>
            <div className="nav-bar" onClick={e => e.stopPropagation()}>
                <button className="nav-close-button" onClick={onClose}>
                    <ChevronLeft strokeWidth={3} />
                </button>
                <div>
                    <NavLogin onClick={navigateToLogin} style={{cursor: 'pointer'}}/>

                <div className="nb-pending-message">
                    <p className="nb-pending-title">You are not logged in. </p>
                    <p className="nb-pending-body">
                        Please sign in with your credentials to view your navigation tabs. 
                    </p>
                </div>

                </div>
            </div>
        </div>
    );
}

export default NavBar;