import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import './Employee_registration_success.css';

function EmployeeRegistrationSuccess() {
    const navigate = useNavigate();

    const handleClose = () => {
        navigate('/');
    };

    return (
        <div className="success-page-simple">
            <div className="success-container-simple">
                <h1 className="success-title-simple">Employee Registration Requested</h1>
                <div className="title-line-simple"></div>

                <h2 className="thank-you-text">Thank You !</h2>

                <div className="checkmark-circle">
                    <Check size={60} color="#FFFFFF" />
                </div>

                <div className="success-message">
                    <p className="message-bold">Request Submitted!</p>
                    <p className="message-normal">You will receive an email once approved.</p>
                </div>
            </div>
        </div>
    );
}

export default EmployeeRegistrationSuccess;