import { ChevronLeft } from 'lucide-react';
import LoginButton from './LoginButton.jsx';
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
                    <LoginButton onClick={navigateToLogin} style={{cursor: 'pointer'}}/>

                </div>
            </div>
        </div>
    );
}

export default NavBar;