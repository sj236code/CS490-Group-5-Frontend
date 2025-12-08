import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Verify_otp.css';

function VerifyOTP() {
    const API_BASE = import.meta.env.VITE_API_URL;

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || 'you@example.com';
    const inputRefs = useRef([]);

    const handleChange = (index, value) => {
        if (value.length > 1) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        const newOtp = [...otp];
        
        for (let i = 0; i < pastedData.length; i++) {
            if (i < 6) {
                newOtp[i] = pastedData[i];
            }
        }
        
        setOtp(newOtp);
        const nextEmptyIndex = newOtp.findIndex(val => !val);
        if (nextEmptyIndex !== -1) {
            inputRefs.current[nextEmptyIndex]?.focus();
        } else {
            inputRefs.current[5]?.focus();
        }
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
        setError('Please enter all 6 digits');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp: otpCode })
        });

        const data = await response.json();

        if (response.ok) {
            navigate('/reset-password', { state: { email } });
        } else {
            setError(data.error || 'Invalid Code');
        }
    } catch (err) {
        setError('Something went wrong. Please try again.');
    }
};  

    const handleResend = () => {
        setOtp(['', '', '', '', '', '']);
        setError('');
        inputRefs.current[0]?.focus();
        console.log('Resending OTP to:', email);
        alert('OTP has been resent to your email!');
    };

    return (
        <div className="otp-page">
            <div className="otp-container">
                <h1 className="otp-title">Check your Email</h1>
                
                <p className="otp-description">
                    We've sent a 6-digit OTP to {email}. The code expires in 10 minutes.
                </p>

                <form onSubmit={handleSubmit} className="otp-form">
                    <label className="otp-label">Enter OTP Code</label>
                    
                    <div className="otp-inputs">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="otp-box"
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="error-msg">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="verify-btn">
                        Verify Code
                    </button>

                    <p className="resend-text">
                        Didn't get the code? <button type="button" onClick={handleResend} className="resend-btn">Resend</button>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default VerifyOTP;