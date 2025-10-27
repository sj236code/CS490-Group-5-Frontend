import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import './Sign_in.css';

function Sign_in() {
    const [activeTab, setActiveTab] = useState('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            // API Call - matches your Flask auth.py /api/auth/login endpoint
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            // Check Flask response format: { "status": "success" or "error", "token": "..." }
            if (data.status === 'success') {
                // Success! Save JWT token
                localStorage.setItem('token', data.token);
                
                console.log('Sign in successful:', data);
                
                // Navigate to home/dashboard
                navigate('/');
            } else {
                // Show error message from server
                setError(data.message || 'Invalid credentials');
            }
        } catch (err) {
            console.error('Sign in error:', err);
            setError('Unable to sign in. Please check your connection and try again.');
        } finally {
            setLoading(false);
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
                            disabled={loading}
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
                            disabled={loading}
                        />
                    </div>

                    <a href="/forgot-password" className="forgot-password">Forgot Password?</a>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="signin-button" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>

                    <p className="signup-text">
                        Dont have an account? <a href="/signup" className="signup-link">SignUp</a>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Sign_in;