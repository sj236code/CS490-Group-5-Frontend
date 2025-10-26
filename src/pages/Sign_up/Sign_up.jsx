import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import './SignUp_SIMPLE.css';

function SignUp() {
    const [activeTab, setActiveTab] = useState('signup');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('Passwords do not match!');
            return;
        }
        
        console.log('Sign up attempted with:', { email, password });
        navigate('/signup-success');
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
        if (tab === 'signin') {
            navigate('/signin');
        }
    };

    return (
        <div className="signup-page">
            <div className="signup-container">
                <button className="back-btn" onClick={handleBack}>
                    <ChevronLeft />
                </button>

                <h1 className="signup-title">Sign Up</h1>

                <div className="tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'signin' ? 'active' : ''}`}
                        onClick={() => handleTabSwitch('signin')}
                    >
                        Sign In
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
                        onClick={() => setActiveTab('signup')}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="signup-form">
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError('');
                            }}
                            className="input-field"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            className="input-field"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setError('');
                            }}
                            className="input-field"
                            required
                        />
                    </div>

                    {error && (
                        <div className="error-box">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="submit-btn">
                        Sign Up
                    </button>

                    <div className="links">
                        <p className="link-text">
                            Have an account? <a href="/signin" className="link">SignIn</a>
                        </p>
                        <p className="link-text">
                            Salon Owner? <a href="/register-salon" className="link">Register Salon</a>
                        </p>
                        <p className="link-text">
                            Employee? <a href="/employee-registration" className="link">Create Employee Acct</a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignUp;