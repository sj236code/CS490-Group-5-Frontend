import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import './Sign_up.css';

function SignUp() {
    const [activeTab, setActiveTab] = useState('signup');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
        password: '',
        confirmPassword: '',
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
        
        // Validate required fields (first_name, last_name, email, password are required)
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            setError('First name, last name, email, and password are required');
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
            // API Call - Matches updated auth.py with new auth_user table structure
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: formData.firstName,         // → auth_user.first_name
                    last_name: formData.lastName,           // → auth_user.last_name
                    email: formData.email,                  // → auth_user.email & Customers.email
                    phone_number: formData.phoneNumber,     // → auth_user.phone_number & Customers.phone
                    address: formData.address || null,      // → auth_user.address (optional)
                    password: formData.password,            // → auth_user.password_hash (hashed)
                    role: formData.role                     // → auth_user.role & Customers.role
                })
            });

            const data = await response.json();

            // Check Flask response: { "status": "success" or "error" }
            if (data.status === 'success') {
                console.log('Sign up successful!');
                console.log('User created in auth_user table with:');
                console.log('- first_name:', formData.firstName);
                console.log('- last_name:', formData.lastName);
                console.log('- email:', formData.email);
                console.log('- phone_number:', formData.phoneNumber);
                console.log('- address:', formData.address);
                
                // Navigate to home
                navigate('/', { 
                    state: { 
                        message: 'Account created successfully!',
                        userName: `${formData.firstName} ${formData.lastName}`
                    } 
                });
            } else {
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
        if (tab === 'signin') navigate('/signin');
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
                    {/* First Name - Required */}
                    <div className="form-group">
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="input-field"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Last Name - Required */}
                    <div className="form-group">
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="input-field"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Email - Required */}
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

                    {/* Phone Number - Optional */}
                    <div className="form-group">
                        <input
                            type="tel"
                            name="phoneNumber"
                            placeholder="Phone Number (Optional)"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="input-field"
                            disabled={loading}
                        />
                    </div>

                    {/* Address - Optional */}
                    <div className="form-group">
                        <input
                            type="text"
                            name="address"
                            placeholder="Address (Optional)"
                            value={formData.address}
                            onChange={handleChange}
                            className="input-field"
                            disabled={loading}
                        />
                    </div>

                    {/* Password - Required */}
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

                    {/* Confirm Password - Required */}
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

                    {error && <div className="error-box">{error}</div>}

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div className="links">
                        <p className="link-text">
                            Have an account? <a href="/signin" className="link">Sign In</a>
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
