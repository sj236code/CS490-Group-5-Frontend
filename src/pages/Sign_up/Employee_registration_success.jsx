import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import './Employee_registration_success.css';

function EmployeeRegistrationSuccess() {
    const navigate = useNavigate();

    return (
        <div className="employee-success-page">
            <div className="employee-success-container">
                <h1 className="employee-success-title">Employee Registration Requested</h1>
                <div className="employee-title-line"></div>

                <h2 className="employee-thank-you">Thank You!</h2>

                <div className="employee-checkmark-circle">
                    <Check size={70} strokeWidth={3} color="#FFFFFF" />
                </div>

                <div className="employee-success-message">
                    <p className="employee-message-bold">Request Submitted!</p>
                    <p className="employee-message-normal">You will receive an email once approved.</p>
                </div>

                <button onClick={() => navigate('/')} className="employee-home-button">
                    Go to Home
                </button>
            </div>
        </div>
    );
}

export default EmployeeRegistrationSuccess;