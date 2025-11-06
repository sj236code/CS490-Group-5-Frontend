import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import './Sign_up.css';

function SignUp() {
    const [activeTab, setActiveTab] = useState('signup');
    const [currentStep, setCurrentStep] = useState(1); // 1 = email/password, 2 = personal info
    
    const [formData, setFormData] = useState({
        // Step 1: Email & Password
        email: '',
        password: '',
        confirmPassword: '',
        
        // Step 2: Personal Info
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
        
        // Role determined by page context
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

    // Validate Step 1 (Email & Password)
    const validateStep1 = () => {
        if (!formData.email || !formData.password || !formData.confirmPassword) {
            setError('Email and password are required');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match!');
            return false;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return false;
        }

        return true;
    };

    // Check if email is unique in database
    const checkEmailUnique = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/check-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });

            const data = await response.json();
            
            if (data.exists) {
                setError('This email is already registered');
                return false;
            }
            
            return true;
        } catch (err) {
            console.error('Email check error:', err);
            setError('Unable to verify email. Please try again.');
            return false;
        }
    };

    // Handle Step 1 Continue
    const handleStep1Continue = async () => {
        if (!validateStep1()) return;
        
        setLoading(true);
        
        // Check if email is unique
        const isUnique = await checkEmailUnique();
        
        setLoading(false);
        
        if (isUnique) {
            setCurrentStep(2); // Move to Step 2
            setError('');
        }
    };

    // Validate Step 2 (Personal Info)
    const validateStep2 = () => {
        if (!formData.firstName || !formData.lastName) {
            setError('First name and last name are required');
            return false;
        }
        return true;
    };

    // Handle Final Submit (Step 2)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateStep2()) return;
        
        setLoading(true);
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    phone_number: formData.phoneNumber || null,
                    address: formData.address || null,
                    role: formData.role
                })
            });

            const data = await response.json();

            if (data.status === 'success') {
                console.log('✅ Sign up successful!');
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
        if (currentStep === 2) {
            setCurrentStep(1); // Go back to Step 1
            setError('');
        } else {
            navigate(-1); // Go back to previous page
        }
    };

    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
        if (tab === 'signin') navigate('/signin');
    };

    return (
        <div className="signup-page">
            <div className="signup-container">
                <button className="back-button" onClick={handleBack} disabled={loading}>
                    <ChevronLeft />
                </button>

                <h1 className="signup-title">Sign Up</h1>

                {/* Progress Indicator */}
                <div className="step-indicator">
                    <div className={`step-dot ${currentStep >= 1 ? 'active' : ''}`}></div>
                    <div className={`step-line ${currentStep >= 2 ? 'active' : ''}`}></div>
                    <div className={`step-dot ${currentStep >= 2 ? 'active' : ''}`}></div>
                </div>

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

                {/* STEP 1: Email & Password */}
                {currentStep === 1 && (
                    <div className="signup-form">
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

                        {error && <div className="error-box">{error}</div>}

                        <button 
                            type="button" 
                            className="submit-btn" 
                            onClick={handleStep1Continue}
                            disabled={loading}
                        >
                            {loading ? 'Checking...' : 'Continue'}
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
                    </div>
                )}

                {/* STEP 2: Personal Info */}
                {currentStep === 2 && (
                    <form onSubmit={handleSubmit} className="signup-form">
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

                        {error && <div className="error-box">{error}</div>}

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default SignUp;