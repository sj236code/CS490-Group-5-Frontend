import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import './Sign_in.css';

function parseJwt(token) {
  try {
    const base = token.split('.')[1];
    const json = atob(base.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

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
            if (data.status === 'success' && data.token) {
                // Success! Your auth.py returned a JWT token
                
                // Save JWT token to localStorage (for authenticated API calls)
                localStorage.setItem('token', data.token);

                
                // Decode payload: { user_id, email, role, exp }
                const payload = parseJwt(data.token);

                if (!payload) throw new Error('Invalid token payload');

                // Persist user info for the rest of the app
                localStorage.setItem('user_id', String(payload.user_id));
                localStorage.setItem('role', payload.role);
                localStorage.setItem('email', payload.email);

                console.log(`User signed in- ID: ${payload.user_id}, Role: ${payload.role}`)

                // (Optional) guard against expired tokens
                if (payload.exp && payload.exp * 1000 < Date.now()) {
                    throw new Error('Session expired. Please sign in again.');
                }
                
                console.log('Sign in successful!');
                console.log('JWT Token saved:', data.token);
                
                // Optional: Fetch full user details using the token
                // You could call /api/auth/user-type/<user_id> here if needed
                
                // Navigate to home/dashboard
                navigate('/', {replace: true});
            } else {
                // Show error message from server
                // auth.py returns "Invalid credentials" if:
                // - Email not found in AuthUser table
                // - Password doesn't match (bcrypt comparison fails)
                setError(data.message || 'Invalid email or password');
            }
        } 
        catch (err) {
            console.error('Sign in error:', err);
            setError(err.message || 'Unable to sign in. Please check your connection and try again.');
        } 
        finally {
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
  );
}

export default Sign_in;
