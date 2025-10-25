import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import './Sign_in.css';

function Sign_in() {
    const [activeTab, setActiveTab] = useState('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add authentication logic here
        console.log('Sign in attempted with:', { email, password });
    };

    const handleBack = () => {
        navigate('/'); // Go back to Landing page
    };

    return (
        <div className="signin-page">
            <div className="signin-container">
                <button className="back-button" onClick={handleBack}>
                    <ChevronLeft strokeWidth={3} />
                </button>

                <h1 className="signin-title">Sign in</h1>

                <div className="tab-container">
                    <button 
                        className={`tab ${activeTab === 'signin' ? 'active' : ''}`}
                        onClick={() => setActiveTab('signin')}
                    >
                        Sign in
                    </button>
                    <button 
                        className={`tab ${activeTab === 'signup' ? 'active' : ''}`}
                        onClick={() => setActiveTab('signup')}
                    >
                        Sign up
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="signin-form">
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>

                    {/* Add Forgot Password Logic Here */}
                    <a href="#" className="forgot-password">Forgot Password?</a>

                    <button type="submit" className="signin-button">
                        Sign in
                    </button>

                    <p className="signup-text">
                        Dont have an account? <a href="#" className="signup-link">SignUp</a>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Sign_in;