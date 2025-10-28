import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';
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
            // API Call - Exactly matches your Flask auth.py /api/auth/login endpoint
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,      // auth.py checks AuthUser table for this email
                    password: password // auth.py uses bcrypt.checkpw() to compare hashed password
                })
            });

            const data = await response.json();

            // Check Flask response format: { "status": "success" or "error", "token": "..." }
            if (data.status === 'success') {
                // Success! Your auth.py returned a JWT token
                
                // Save JWT token to localStorage (for authenticated API calls)
                localStorage.setItem('token', data.token);
                
                // Decode token to get user info (token contains: user_id, email, role)
                // The token is created in auth.py with this payload:
                // {
                //   "user_id": user.id,
                //   "email": user.email,
                //   "role": user.role,
                //   "exp": datetime (1 hour from now)
                // }
                
                console.log('Sign in successful!');
                console.log('JWT Token saved:', data.token);
                
                // Optional: Fetch full user details using the token
                // You could call /api/auth/user-type/<user_id> here if needed
                
                // Navigate to home/dashboard
                navigate('/');
            } else {
                // Show error message from server
                // auth.py returns "Invalid credentials" if:
                // - Email not found in AuthUser table
                // - Password doesn't match (bcrypt comparison fails)
                setError(data.message || 'Invalid email or password');
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
                        Don't have an account? <a href="/signup" className="signup-link">Sign Up</a>
                    </p>
                </form>
            </div>
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

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="signin-button" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <button
            type="button"
            className="forgot-password-link"
            onClick={handleForgotPassword}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Forgot Password?'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Sign_in;
