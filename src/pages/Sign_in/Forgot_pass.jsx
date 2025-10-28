import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import './Forgot_pass.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Sending OTP to:', email);
        navigate('/verify-otp', { state: { email } });
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="forgot-page">
            <div className="forgot-container">
                <button className="back-button" onClick={handleBack}>
                    <ChevronLeft />
                </button>

                <h1 className="forgot-title">Forgot Password</h1>
                
                <p className="forgot-description">
                    Enter your email address and we'll send you a one-time password (OTP) to reset it.
                </p>

                <form onSubmit={handleSubmit} className="forgot-form">
                    <label className="label">
                        Email Address <span className="required-star">*</span>
                    </label>
                    
                    <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="email-input"
                        required
                    />

                    <button type="submit" className="continue-btn">
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;