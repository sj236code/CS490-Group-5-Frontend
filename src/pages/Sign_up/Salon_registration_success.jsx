import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import './Salon_registration_success.css';

function RegisterSalonSuccess() {
    const navigate = useNavigate();

    function handleGoHome() {
        navigate('/');
    }

    return (
        <div className="salon-success-page">
            <div className="salon-success-container">
                <h1 className="salon-success-title">Register Salon</h1>
                <div className="salon-title-line"></div>

                <h2 className="salon-thank-you">Thank You !</h2>

                <div className="salon-checkmark">
                    <Check size={60} color="#FFFFFF" />
                </div>

                <div className="salon-message">
                    <p className="salon-message-bold">Verification Request Submitted!</p>
                    <p className="salon-message-normal">You will receive an email once approved.</p>
                </div>

                <button className="go-home-btn" onClick={handleGoHome}>
                    Go to Home
                </button>
            </div>
        </div>
    );
}

export default RegisterSalonSuccess;