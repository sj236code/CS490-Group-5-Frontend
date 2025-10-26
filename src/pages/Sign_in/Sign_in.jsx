import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import './Sign_in.css';

function Sign_in() {
    const [activeTab, setActiveTab] = useState('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Simple validation - replace with real auth logic
        if (email === 'test@test.com' && password === 'password123') {
            // Success - go to landing page
            navigate('/');
        } else {
            // Show error
            setError('The email or password you entered is incorrect.');
        }
    };

    const handleBack = () => {
        navigate('/');
    };

    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
        if (tab === 'signup') {
            navigate('/signup');
        }
    };

    return (
        <div className="signin-page">
            <div className="signin-container">
                <button className="back-button" onClick={handleBack}>
                    <ChevronLeft />
                </button>

                <h1 className="signin-title">Sign In</h1>

                <div className="tab-container">
                    <button 
                        className={`tab ${activeTab === 'signin' ? 'active' : ''}`}
                        onClick={() => setActiveTab('signin')}
                    >
                        Sign In
                    </button>
                    <button 
                        className={`tab ${activeTab === 'signup' ? 'active' : ''}`}
                        onClick={() => handleTabSwitch('signup')}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="signin-form">
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError('');
                            }}
                            className={`form-input ${error ? 'error-input' : ''}`}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            className={`form-input ${error ? 'error-input' : ''}`}
                            required
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="signin-button">
                        Sign In
                    </button>

                    <a href="/forgot-password" className="forgot-password">Forgot Password?</a>

                    {/* <p className="signup-text">
                        Dont have an account? <a href="/signup" className="signup-link">Sign Up</a>
                    </p> */}
                </form>
            </div>
        </div>
    );
}

export default Sign_in;