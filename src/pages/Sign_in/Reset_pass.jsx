import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reset_pass.css';

function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        
        console.log('Resetting password:', newPassword);
        navigate('/password-reset-success');
    };

    return (
        <div className="reset-page">
            <div className="reset-container">
                <h1 className="reset-title">Create New Password</h1>
                
                <p className="reset-description">
                    Your new password must be at least 8 characters long.
                </p>

                <form onSubmit={handleSubmit} className="reset-form">
                    <label className="reset-label">New Password</label>
                    
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                            setNewPassword(e.target.value);
                            setError('');
                        }}
                        className="password-input"
                        required
                    />

                    <label className="reset-label">Confirm New Password</label>
                    
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setError('');
                        }}
                        className="password-input"
                        required
                    />

                    {error && (
                        <div className="reset-error">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="reset-continue-btn">
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;