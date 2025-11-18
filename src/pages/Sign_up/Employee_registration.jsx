import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import './Employee_registration.css';

function EmployeeRegistration() {
    const [currentStep, setCurrentStep] = useState(1); // 1 = email/password, 2 = employee info
    
    const [formData, setFormData] = useState({
        // Step 1: Account Creation
        email: '',
        password: '',
        confirmPassword: '',
        
        // Step 2: Employee Info
        firstName: '',
        lastName: '',
        phoneNumber: '',
        salonId: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
        
        // Role is EMPLOYEE
        role: 'EMPLOYEE'
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

    // Validate Step 2 (Employee Info)
    const validateStep2 = () => {
        if (!formData.firstName || !formData.lastName) {
            setError('First name and last name are required');
            return false;
        }

        if (!formData.phoneNumber) {
            setError('Phone number is required');
            return false;
        }

        if (!formData.salonId) {
            setError('Salon ID is required');
            return false;
        }

        if (!formData.address1 || !formData.city || !formData.state || !formData.zip) {
            setError('Address, city, state, and zip are required');
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
            // Combine address fields
            const fullAddress = formData.address2 
                ? `${formData.address1}, ${formData.address2}, ${formData.city}, ${formData.state} ${formData.zip}`
                : `${formData.address1}, ${formData.city}, ${formData.state} ${formData.zip}`;

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    phone_number: formData.phoneNumber,
                    address: fullAddress,
                    salon_id: parseInt(formData.salonId), // Convert to integer and send to backend
                    role: 'EMPLOYEE' // IMPORTANT: Role is set to EMPLOYEE
                })
            });

            const data = await response.json();

            if (data.status === 'success') {
                console.log('Employee registration successful!');
                navigate('/', { 
                    state: { 
                        message: 'Employee account created successfully!',
                        userName: `${formData.firstName} ${formData.lastName}`,
                        salonId: formData.salonId
                    } 
                });
            } else {
                setError(data.message || 'Unable to create account. Please try again.');
            }
        } catch (err) {
            console.error('Employee registration error:', err);
            setError('Unable to register. Please check your connection and try again.');
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

    return (
        <div className="employee-registration-page">
            <div className="employee-registration-container">
                <button className="back-button" onClick={handleBack} disabled={loading}>
                    <ChevronLeft />
                </button>

                <h1 className="page-title">Employee Registration</h1>
                <div className="title-line"></div>

                {/* STEP 1: Email & Password */}
                {currentStep === 1 && (
                    <div className="registration-form">
                        <p className="instruction-text">
                            Create your employee account
                        </p>

                        <div className="form-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                className="full-width-input"
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
                                className="full-width-input"
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
                                className="full-width-input"
                                required
                                disabled={loading}
                            />
                        </div>

                        {error && <div className="error-box">{error}</div>}

                        <button 
                            type="button" 
                            className="submit-button-simple" 
                            onClick={handleStep1Continue}
                            disabled={loading}
                        >
                            {loading ? 'Checking...' : 'Continue'}
                        </button>

                        <div className="links">
                            <p className="link-text">
                                Already have an account? <a href="/signin" className="link">Sign In</a>
                            </p>
                        </div>
                    </div>
                )}

                {/* STEP 2: Employee Info */}
                {currentStep === 2 && (
                    <form onSubmit={handleSubmit} className="registration-form">
                        <p className="instruction-text">
                            Ask your salon owner for the Salon ID
                        </p>

                        <div className="form-group">
                            <input
                                type="text"
                                name="firstName"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="full-width-input"
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
                                className="full-width-input"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <input
                                type="tel"
                                name="phoneNumber"
                                placeholder="Phone Number"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="full-width-input"
                                required
                                disabled={loading}
                            />
                        </div>

                        <input
                            type="number"
                            name="salonId"
                            placeholder="Salon ID"
                            value={formData.salonId}
                            onChange={handleChange}
                            className="full-width-input"
                            required
                            disabled={loading}
                        />

                        <div className="form-row">
                            <input
                                type="text"
                                name="address1"
                                placeholder="Address 1"
                                value={formData.address1}
                                onChange={handleChange}
                                className="half-width-input"
                                required
                                disabled={loading}
                            />
                            <input
                                type="text"
                                name="address2"
                                placeholder="Address 2 (Optional)"
                                value={formData.address2}
                                onChange={handleChange}
                                className="half-width-input"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-row">
                            <input
                                type="text"
                                name="city"
                                placeholder="City"
                                value={formData.city}
                                onChange={handleChange}
                                className="half-width-input"
                                required
                                disabled={loading}
                            />
                            <input
                                type="text"
                                name="state"
                                placeholder="State"
                                value={formData.state}
                                onChange={handleChange}
                                className="half-width-input"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-row">
                            <input
                                type="text"
                                name="zip"
                                placeholder="Zip"
                                value={formData.zip}
                                onChange={handleChange}
                                className="half-width-input"
                                required
                                disabled={loading}
                            />
                        </div>

                        {error && <div className="error-box">{error}</div>}

                        <button type="submit" className="submit-button-simple" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Employee Account'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default EmployeeRegistration;