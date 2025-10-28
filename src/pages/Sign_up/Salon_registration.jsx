import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import './Salon_registration.css';

function RegisterSalon() {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // All form data in ONE state - preserves data when going back/forward
    const [formData, setFormData] = useState({
        // Step 1: Owner Info
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        
        // Step 2: Salon Details
        salonName: '',
        salonType: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
        salonPhone: '',
        
        // Step 3: Hours
        hours: {
            monday: { open: '09:00', close: '17:00', closed: false },
            tuesday: { open: '09:00', close: '17:00', closed: false },
            wednesday: { open: '09:00', close: '17:00', closed: false },
            thursday: { open: '09:00', close: '17:00', closed: false },
            friday: { open: '09:00', close: '17:00', closed: false },
            saturday: { open: '09:00', close: '17:00', closed: false },
            sunday: { open: '', close: '', closed: true }
        },
        
        // Step 4: Services
        services: [
            { name: '', price: '', duration: '', description: '' }
        ],
        
        // Step 5: Payment
        paymentCard: false,
        paymentCash: false,
        paymentVenmo: false,
        paymentZelle: false,
        paymentCheck: false,
        paymentOther: false,
        paymentOtherDetails: '',
        
        // Step 6: Verification
        termsAgreed: false,
        businessConfirmed: false
    });

    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
    };

    const handleHoursChange = (day, field, value) => {
        setFormData(prev => ({
            ...prev,
            hours: {
                ...prev.hours,
                [day]: {
                    ...prev.hours[day],
                    [field]: value
                }
            }
        }));
    };

    const handleServiceChange = (index, field, value) => {
        const newServices = [...formData.services];
        newServices[index][field] = value;
        setFormData(prev => ({
            ...prev,
            services: newServices
        }));
    };

    const addService = () => {
        setFormData(prev => ({
            ...prev,
            services: [...prev.services, { name: '', price: '', duration: '', description: '' }]
        }));
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setError('');
        } else {
            navigate(-1);
        }
    };

    const handleContinue = () => {
        if (!validateCurrentStep()) {
            return;
        }

        if (currentStep < 6) {
            setCurrentStep(currentStep + 1);
            setError('');
        } else {
            handleSubmit();
        }
    };

    const validateCurrentStep = () => {
        switch (currentStep) {
            case 1:
                if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
                    setError('Please fill in all required fields');
                    return false;
                }
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    return false;
                }
                if (formData.password.length < 8) {
                    setError('Password must be at least 8 characters');
                    return false;
                }
                break;
            case 2:
                if (!formData.salonName || !formData.salonType || !formData.address1 || !formData.city || !formData.state || !formData.zip || !formData.salonPhone) {
                    setError('Please fill in all required fields');
                    return false;
                }
                break;
            case 4:
                const hasValidService = formData.services.some(s => s.name && s.price);
                if (!hasValidService) {
                    setError('Please add at least one service with name and price');
                    return false;
                }
                break;
            case 5:
                const hasPaymentMethod = formData.paymentCard || formData.paymentCash || formData.paymentVenmo || formData.paymentZelle || formData.paymentCheck || formData.paymentOther;
                if (!hasPaymentMethod) {
                    setError('Please select at least one payment method');
                    return false;
                }
                break;
            case 6:
                if (!formData.termsAgreed || !formData.businessConfirmed) {
                    setError('Please agree to both terms to continue');
                    return false;
                }
                break;
        }
        return true;
    };

    const handleSubmit = async () => {
        setError('');
        setLoading(true);
        
        try {
            // Prepare data matching Flask pattern and new auth_user table
            const requestData = {
                owner: {
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    email: formData.email,
                    phone_number: formData.phone,
                    address: null,  // Salon address is separate
                    password: formData.password,
                    role: 'OWNER'
                },
                salon: {
                    name: formData.salonName,
                    type: formData.salonType,
                    address: `${formData.address1}${formData.address2 ? ' ' + formData.address2 : ''}`,
                    city: formData.city,
                    state: formData.state,
                    zip: formData.zip,
                    phone: formData.salonPhone
                },
                hours: formData.hours,
                services: formData.services.filter(s => s.name && s.price),
                payment_methods: {
                    card: formData.paymentCard,
                    cash: formData.paymentCash,
                    venmo: formData.paymentVenmo,
                    zelle: formData.paymentZelle,
                    check: formData.paymentCheck,
                    other: formData.paymentOther,
                    other_details: formData.paymentOtherDetails
                },
                terms_agreed: formData.termsAgreed,
                business_confirmed: formData.businessConfirmed
            };

            // API Call - matches your salon_register.py /api/salon_register/register endpoint
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salon_register/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();

            // Check Flask response format
            if (data.status === 'success' || response.ok) {
                console.log('Salon registration successful:', data);
                navigate('/register-salon-success');
            } else {
                setError(data.message || data.error || 'Unable to register salon. Please try again.');
            }
        } catch (err) {
            console.error('Salon registration error:', err);
            setError('Unable to register salon. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-salon-page">
            <div className="register-salon-container">
                <button className="back-button" onClick={handleBack} disabled={loading}>
                    <ChevronLeft />
                </button>

                <h1 className="title">Register Salon</h1>

                <div className="progress-bar">
                    <div className={`step ${currentStep >= 1 ? 'active' : ''}`}></div>
                    <div className="step-line"></div>
                    <div className={`step ${currentStep >= 2 ? 'active' : ''}`}></div>
                    <div className="step-line"></div>
                    <div className={`step ${currentStep >= 3 ? 'active' : ''}`}></div>
                    <div className="step-line"></div>
                    <div className={`step ${currentStep >= 4 ? 'active' : ''}`}></div>
                    <div className="step-line"></div>
                    <div className={`step ${currentStep >= 5 ? 'active' : ''}`}></div>
                    <div className="step-line"></div>
                    <div className={`step ${currentStep >= 6 ? 'active' : ''}`}></div>
                </div>

                <div className="step-labels">
                    <span className={currentStep === 1 ? 'current-label' : ''}>Owner Info.</span>
                    <span className={currentStep === 2 ? 'current-label' : ''}>Salon Details</span>
                    <span className={currentStep === 3 ? 'current-label' : ''}>Hours</span>
                    <span className={currentStep === 4 ? 'current-label' : ''}>Services</span>
                    <span className={currentStep === 5 ? 'current-label' : ''}>Payment</span>
                    <span className={currentStep === 6 ? 'current-label' : ''}>Verification</span>
                </div>

                <div className="form-content">
                    {/* STEP 1: Owner Info */}
                    {currentStep === 1 && (
                        <div className="form-step">
                            <div className="row">
                                <input 
                                    type="text" 
                                    name="firstName"
                                    placeholder="First Name" 
                                    className="half"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    required
                                />
                                <input 
                                    type="text" 
                                    name="lastName"
                                    placeholder="Last Name" 
                                    className="half"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    required
                                />
                            </div>
                            <div className="row">
                                <input 
                                    type="email" 
                                    name="email"
                                    placeholder="Email Address" 
                                    className="half"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    required
                                />
                                <input 
                                    type="tel" 
                                    name="phone"
                                    placeholder="Phone Number" 
                                    className="half"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    required
                                />
                            </div>
                            <div className="row">
                                <input 
                                    type="password" 
                                    name="password"
                                    placeholder="Password" 
                                    className="half"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    required
                                />
                                <input 
                                    type="password" 
                                    name="confirmPassword"
                                    placeholder="Confirm Password" 
                                    className="half"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Salon Details */}
                    {currentStep === 2 && (
                        <div className="form-step">
                            <div className="row">
                                <input 
                                    type="text" 
                                    name="salonName"
                                    placeholder="Salon Name" 
                                    className="half"
                                    value={formData.salonName}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    required
                                />
                                <input 
                                    type="text" 
                                    name="salonType"
                                    placeholder="Salon Type" 
                                    className="half"
                                    value={formData.salonType}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    required
                                />
                            </div>
                            <div className="row">
                                <input 
                                    type="text" 
                                    name="address1"
                                    placeholder="Address 1" 
                                    className="half"
                                    value={formData.address1}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    required
                                />
                                <input 
                                    type="text" 
                                    name="address2"
                                    placeholder="Address 2" 
                                    className="half"
                                    value={formData.address2}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                />
                            </div>
                            <div className="row">
                                <input 
                                    type="text" 
                                    name="city"
                                    placeholder="City" 
                                    className="half"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    required
                                />
                                <input 
                                    type="text" 
                                    name="state"
                                    placeholder="State" 
                                    className="half"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    required
                                />
                            </div>
                            <div className="row">
                                <input 
                                    type="text" 
                                    name="zip"
                                    placeholder="Zip" 
                                    className="half"
                                    value={formData.zip}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    required
                                />
                                <input 
                                    type="tel" 
                                    name="salonPhone"
                                    placeholder="Phone No." 
                                    className="half"
                                    value={formData.salonPhone}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Hours */}
                    {currentStep === 3 && (
                        <div className="form-step">
                            <p className="section-label">Hours</p>
                            <div className="hours-list">
                                {Object.keys(formData.hours).map(day => (
                                    <div key={day} className="hours-row">
                                        <span className="day-name">{day.charAt(0).toUpperCase() + day.slice(1).slice(0, 3)}.</span>
                                        <input 
                                            type="time" 
                                            className="time-input"
                                            value={formData.hours[day].open}
                                            onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                                            disabled={formData.hours[day].closed || loading}
                                        />
                                        <span>to</span>
                                        <input 
                                            type="time" 
                                            className="time-input"
                                            value={formData.hours[day].close}
                                            onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                                            disabled={formData.hours[day].closed || loading}
                                        />
                                        <label className="closed-label">
                                            <input 
                                                type="checkbox"
                                                checked={formData.hours[day].closed}
                                                onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                                                disabled={loading}
                                            /> 
                                            Closed
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Services */}
                    {currentStep === 4 && (
                        <div className="form-step">
                            <p className="section-label">Services:</p>
                            {formData.services.map((service, index) => (
                                <div key={index} className="service-block">
                                    <input 
                                        type="text" 
                                        placeholder="Service Name" 
                                        className="full"
                                        value={service.name}
                                        onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                                        disabled={loading}
                                    />
                                    <div className="row">
                                        <input 
                                            type="number" 
                                            placeholder="Price" 
                                            className="third"
                                            value={service.price}
                                            onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                                            disabled={loading}
                                        />
                                        <input 
                                            type="number" 
                                            placeholder="Duration (minutes)" 
                                            className="third"
                                            value={service.duration}
                                            onChange={(e) => handleServiceChange(index, 'duration', e.target.value)}
                                            disabled={loading}
                                        />
                                        <button type="button" className="upload-btn" disabled={loading}>+ Upload Images</button>
                                    </div>
                                    <textarea 
                                        placeholder="Description/ Notes" 
                                        className="full textarea"
                                        value={service.description}
                                        onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                                        disabled={loading}
                                    ></textarea>
                                </div>
                            ))}
                            <button type="button" onClick={addService} className="add-another" disabled={loading}>
                                + Add Another
                            </button>
                        </div>
                    )}

                    {/* STEP 5: Payment */}
                    {currentStep === 5 && (
                        <div className="form-step">
                            <p className="section-label">Select All Accepted Payment Methods:</p>
                            <div className="checkbox-grid">
                                <label>
                                    <input 
                                        type="checkbox" 
                                        name="paymentCard"
                                        checked={formData.paymentCard}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                    /> 
                                    Card
                                </label>
                                <label>
                                    <input 
                                        type="checkbox" 
                                        name="paymentVenmo"
                                        checked={formData.paymentVenmo}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                    /> 
                                    Venmo
                                </label>
                                <label>
                                    <input 
                                        type="checkbox" 
                                        name="paymentCheck"
                                        checked={formData.paymentCheck}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                    /> 
                                    Check
                                </label>
                                <label>
                                    <input 
                                        type="checkbox" 
                                        name="paymentCash"
                                        checked={formData.paymentCash}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                    /> 
                                    Cash
                                </label>
                                <label>
                                    <input 
                                        type="checkbox" 
                                        name="paymentZelle"
                                        checked={formData.paymentZelle}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                    /> 
                                    Zelle
                                </label>
                                <label>
                                    <input 
                                        type="checkbox" 
                                        name="paymentOther"
                                        checked={formData.paymentOther}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                    /> 
                                    Other
                                </label>
                            </div>
                            <p className="other-label">If Other, Explain Below:</p>
                            <textarea 
                                name="paymentOtherDetails"
                                className="full textarea" 
                                placeholder=""
                                value={formData.paymentOtherDetails}
                                onChange={handleInputChange}
                                disabled={loading}
                            ></textarea>
                        </div>
                    )}

                    {/* STEP 6: Verification */}
                    {currentStep === 6 && (
                        <div className="form-step">
                            <div className="upload-section">
                                <span>Upload Business License:</span>
                                <button type="button" className="import-btn" disabled={loading}>+ Import Image</button>
                            </div>
                            <div className="checkbox-list">
                                <label>
                                    <input 
                                        type="checkbox"
                                        name="termsAgreed"
                                        checked={formData.termsAgreed}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                    />
                                    I agree to the JADE Terms of Service and Privacy Policy. By registering, I confirm I am an authorized representative of this salon.
                                </label>
                                <label>
                                    <input 
                                        type="checkbox"
                                        name="businessConfirmed"
                                        checked={formData.businessConfirmed}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                    />
                                    I confirm that the salon is a legitimate, operational business.
                                </label>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="error-message-salon">
                            {error}
                        </div>
                    )}
                </div>

                <div className="button-row">
                    <button type="button" onClick={handleBack} className="back-btn-bottom" disabled={loading}>
                        Back
                    </button>
                    <button type="button" onClick={handleContinue} className="continue-button" disabled={loading}>
                        {loading ? 'Submitting...' : (currentStep === 6 ? 'Submit' : 'Continue')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RegisterSalon;