import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import './Sign_up.css';

function SignUp() {
    const [activeTab, setActiveTab] = useState('signup');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        gender: '',
        role: 'CUSTOMER'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Validate required fields
        if (!formData.name || !formData.email || !formData.password) {
            setError('Name, email, and password are required');
            return;
        }

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        // Validate password length
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setLoading(true);
        
        try {
            // API Call - matches your Flask auth.py /api/auth/signup endpoint
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || null,
                    password: formData.password,
                    gender: formData.gender || null,
                    role: formData.role
                })
            });

            const data = await response.json();

            // Check Flask response format: { "status": "success" or "error", "message": "..." }
            if (data.status === 'success') {
                console.log('Sign up successful:', data);
                
                // Navigate to success page with user data
                navigate('/signup-success', { 
                    state: { 
                        userName: formData.name,
                        userEmail: formData.email 
                    } 
                });
            } else {
                // Show error message from server
                setError(data.message || 'Unable to create account. Please try again.');
            }
        } catch (err) {
            console.error('Sign up error:', err);
            setError('Unable to sign up. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
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
                <button className="back-button" onClick={handleBack}>
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
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            className="input-field"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            className="input-field"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number (Optional)"
                            value={formData.phone}
                            onChange={handleChange}
                            className="input-field"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="input-field"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="input-field"
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="error-box">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
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