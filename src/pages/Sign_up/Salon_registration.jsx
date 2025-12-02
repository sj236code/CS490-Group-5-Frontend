import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Upload, X } from 'lucide-react';
import './Salon_registration.css';

function RegisterSalon() {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [salonTypes, setSalonTypes] = useState([]);
    const fileInputRef = useRef(null);
    const serviceImageInputRefs = useRef([]);
    
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
        salonTags: [],
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
        
        // Step 4: Services - now with image support
        services: [
            { name: '', price: '', duration: '', description: '', image: null, imagePreview: null }
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
        businessConfirmed: false,
        businessLicense: null,
        businessLicensePreview: null
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salon_register/types`);
                const data = await response.json();
                if (data.status === 'success') {
                    setSalonTypes(data.types);
                }
            } catch (err) {
                console.error('Failed to fetch salon types:', err);
                setSalonTypes(['Hair', 'Nails', 'Waxing', 'Spa', 'Barber']);
            }
        };
        fetchTypes();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
    };

    const handleTagToggle = (tag) => {
        setFormData(prev => {
            const currentTags = prev.salonTags;
            const isSelected = currentTags.includes(tag);
            
            if (isSelected) {
                return {
                    ...prev,
                    salonTags: currentTags.filter(t => t !== tag)
                };
            } else {
                return {
                    ...prev,
                    salonTags: [...currentTags, tag]
                };
            }
        });
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

    const handleServiceImageClick = (index) => {
        if (serviceImageInputRefs.current[index]) {
            serviceImageInputRefs.current[index].click();
        }
    };

    const handleServiceImageSelected = (index, event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            setError('Please upload a JPG or PNG file for service images');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        const newServices = [...formData.services];
        newServices[index].image = file;
        newServices[index].imagePreview = URL.createObjectURL(file);
        
        setFormData(prev => ({
            ...prev,
            services: newServices
        }));
        setError('');
    };

    const handleRemoveServiceImage = (index) => {
        const newServices = [...formData.services];
        if (newServices[index].imagePreview) {
            URL.revokeObjectURL(newServices[index].imagePreview);
        }
        newServices[index].image = null;
        newServices[index].imagePreview = null;
        
        setFormData(prev => ({
            ...prev,
            services: newServices
        }));
    };

    const addService = () => {
        setFormData(prev => ({
            ...prev,
            services: [...prev.services, { name: '', price: '', duration: '', description: '', image: null, imagePreview: null }]
        }));
    };

    const handleChooseFilesClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileSelected = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            setError('Please upload a JPG, PNG, or PDF file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setFormData(prev => ({
            ...prev,
            businessLicense: file,
            businessLicensePreview: URL.createObjectURL(file)
        }));
        setError('');
    };

    const handleRemoveFile = () => {
        if (formData.businessLicensePreview) {
            URL.revokeObjectURL(formData.businessLicensePreview);
        }
        setFormData(prev => ({
            ...prev,
            businessLicense: null,
            businessLicensePreview: null
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
                if (!formData.salonName || !formData.address1 || !formData.city || !formData.state || !formData.zip || !formData.salonPhone) {
                    setError('Please fill in all required fields');
                    return false;
                }
                if (formData.salonTags.length === 0) {
                    setError('Please select at least one salon category');
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
            const hasFiles = formData.businessLicense || formData.services.some(s => s.image);
            
            if (hasFiles) {
                const formDataToSend = new FormData();
                
                formDataToSend.append('owner_first_name', formData.firstName);
                formDataToSend.append('owner_last_name', formData.lastName);
                formDataToSend.append('owner_email', formData.email);
                formDataToSend.append('owner_phone', formData.phone);
                formDataToSend.append('owner_password', formData.password);
                
                formDataToSend.append('salon_name', formData.salonName);
                formDataToSend.append('salon_tags', JSON.stringify(formData.salonTags));
                formDataToSend.append('salon_address1', formData.address1);
                formDataToSend.append('salon_address2', formData.address2);
                formDataToSend.append('salon_city', formData.city);
                formDataToSend.append('salon_state', formData.state);
                formDataToSend.append('salon_zip', formData.zip);
                formDataToSend.append('salon_phone', formData.salonPhone);
                
                formDataToSend.append('hours', JSON.stringify(formData.hours));
                
                const servicesWithoutImages = formData.services
                    .filter(s => s.name && s.price)
                    .map(s => ({
                        name: s.name,
                        price: s.price,
                        duration: s.duration,
                        description: s.description
                    }));
                
                formDataToSend.append('services', JSON.stringify(servicesWithoutImages));
                
                formData.services.forEach((service, index) => {
                    if (service.image && service.name && service.price) {
                        formDataToSend.append(`service_image_${index}`, service.image);
                    }
                });
                
                formDataToSend.append('payment_methods', JSON.stringify({
                    card: formData.paymentCard,
                    cash: formData.paymentCash,
                    venmo: formData.paymentVenmo,
                    zelle: formData.paymentZelle,
                    check: formData.paymentCheck,
                    other: formData.paymentOther,
                    other_details: formData.paymentOtherDetails
                }));
                
                formDataToSend.append('terms_agreed', formData.termsAgreed.toString());
                formDataToSend.append('business_confirmed', formData.businessConfirmed.toString());
                
                if (formData.businessLicense) {
                    formDataToSend.append('business_license', formData.businessLicense);
                }

                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salon_register/register`, {
                    method: 'POST',
                    body: formDataToSend
                });

                const data = await response.json();

                if (data.status === 'success' || response.ok) {
                    console.log('Salon registration successful:', data);
                    navigate('/register-salon-success');
                } else {
                    setError(data.message || data.error || 'Unable to register salon. Please try again.');
                }
            } else {
                const requestData = {
                    owner: {
                        name: `${formData.firstName} ${formData.lastName}`,
                        email: formData.email,
                        phone: formData.phone,
                        password: formData.password
                    },
                    salon: {
                        name: formData.salonName,
                        tags: formData.salonTags,
                        address: formData.address1,
                        city: formData.city,
                        state: formData.state,
                        zip: formData.zip,
                        phone: formData.salonPhone
                    },
                    hours: formData.hours,
                    services: formData.services.filter(s => s.name && s.price).map(s => ({
                        name: s.name,
                        price: s.price,
                        duration: s.duration,
                        description: s.description
                    })),
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

                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salon_register/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData)
                });

                const data = await response.json();

                if (data.status === 'success' || response.ok) {
                    console.log('Salon registration successful:', data);
                    navigate('/register-salon-success');
                } else {
                    setError(data.message || data.error || 'Unable to register salon. Please try again.');
                }
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
                                    className="full"
                                    value={formData.salonName}
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
                            
                            <p className="section-label">Select the category(s) that best describe your salon:</p>
                            <div className="tags-container">
                                {salonTypes.map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        className={`tag-pill ${formData.salonTags.includes(tag) ? 'selected' : ''}`}
                                        onClick={() => handleTagToggle(tag)}
                                        disabled={loading}
                                    >
                                        {tag}
                                    </button>
                                ))}
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
                                        <select 
                                            className="time-select"
                                            value={formData.hours[day].open}
                                            onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                                            disabled={formData.hours[day].closed || loading}
                                        >
                                            <option value="00:00">12:00 AM</option>
                                            <option value="00:30">12:30 AM</option>
                                            <option value="01:00">1:00 AM</option>
                                            <option value="01:30">1:30 AM</option>
                                            <option value="02:00">2:00 AM</option>
                                            <option value="02:30">2:30 AM</option>
                                            <option value="03:00">3:00 AM</option>
                                            <option value="03:30">3:30 AM</option>
                                            <option value="04:00">4:00 AM</option>
                                            <option value="04:30">4:30 AM</option>
                                            <option value="05:00">5:00 AM</option>
                                            <option value="05:30">5:30 AM</option>
                                            <option value="06:00">6:00 AM</option>
                                            <option value="06:30">6:30 AM</option>
                                            <option value="07:00">7:00 AM</option>
                                            <option value="07:30">7:30 AM</option>
                                            <option value="08:00">8:00 AM</option>
                                            <option value="08:30">8:30 AM</option>
                                            <option value="09:00">9:00 AM</option>
                                            <option value="09:30">9:30 AM</option>
                                            <option value="10:00">10:00 AM</option>
                                            <option value="10:30">10:30 AM</option>
                                            <option value="11:00">11:00 AM</option>
                                            <option value="11:30">11:30 AM</option>
                                            <option value="12:00">12:00 PM</option>
                                            <option value="12:30">12:30 PM</option>
                                            <option value="13:00">1:00 PM</option>
                                            <option value="13:30">1:30 PM</option>
                                            <option value="14:00">2:00 PM</option>
                                            <option value="14:30">2:30 PM</option>
                                            <option value="15:00">3:00 PM</option>
                                            <option value="15:30">3:30 PM</option>
                                            <option value="16:00">4:00 PM</option>
                                            <option value="16:30">4:30 PM</option>
                                            <option value="17:00">5:00 PM</option>
                                            <option value="17:30">5:30 PM</option>
                                            <option value="18:00">6:00 PM</option>
                                            <option value="18:30">6:30 PM</option>
                                            <option value="19:00">7:00 PM</option>
                                            <option value="19:30">7:30 PM</option>
                                            <option value="20:00">8:00 PM</option>
                                            <option value="20:30">8:30 PM</option>
                                            <option value="21:00">9:00 PM</option>
                                            <option value="21:30">9:30 PM</option>
                                            <option value="22:00">10:00 PM</option>
                                            <option value="22:30">10:30 PM</option>
                                            <option value="23:00">11:00 PM</option>
                                            <option value="23:30">11:30 PM</option>
                                        </select>
                                        <span>to</span>
                                        <select 
                                            className="time-select"
                                            value={formData.hours[day].close}
                                            onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                                            disabled={formData.hours[day].closed || loading}
                                        >
                                            <option value="00:00">12:00 AM</option>
                                            <option value="00:30">12:30 AM</option>
                                            <option value="01:00">1:00 AM</option>
                                            <option value="01:30">1:30 AM</option>
                                            <option value="02:00">2:00 AM</option>
                                            <option value="02:30">2:30 AM</option>
                                            <option value="03:00">3:00 AM</option>
                                            <option value="03:30">3:30 AM</option>
                                            <option value="04:00">4:00 AM</option>
                                            <option value="04:30">4:30 AM</option>
                                            <option value="05:00">5:00 AM</option>
                                            <option value="05:30">5:30 AM</option>
                                            <option value="06:00">6:00 AM</option>
                                            <option value="06:30">6:30 AM</option>
                                            <option value="07:00">7:00 AM</option>
                                            <option value="07:30">7:30 AM</option>
                                            <option value="08:00">8:00 AM</option>
                                            <option value="08:30">8:30 AM</option>
                                            <option value="09:00">9:00 AM</option>
                                            <option value="09:30">9:30 AM</option>
                                            <option value="10:00">10:00 AM</option>
                                            <option value="10:30">10:30 AM</option>
                                            <option value="11:00">11:00 AM</option>
                                            <option value="11:30">11:30 AM</option>
                                            <option value="12:00">12:00 PM</option>
                                            <option value="12:30">12:30 PM</option>
                                            <option value="13:00">1:00 PM</option>
                                            <option value="13:30">1:30 PM</option>
                                            <option value="14:00">2:00 PM</option>
                                            <option value="14:30">2:30 PM</option>
                                            <option value="15:00">3:00 PM</option>
                                            <option value="15:30">3:30 PM</option>
                                            <option value="16:00">4:00 PM</option>
                                            <option value="16:30">4:30 PM</option>
                                            <option value="17:00">5:00 PM</option>
                                            <option value="17:30">5:30 PM</option>
                                            <option value="18:00">6:00 PM</option>
                                            <option value="18:30">6:30 PM</option>
                                            <option value="19:00">7:00 PM</option>
                                            <option value="19:30">7:30 PM</option>
                                            <option value="20:00">8:00 PM</option>
                                            <option value="20:30">8:30 PM</option>
                                            <option value="21:00">9:00 PM</option>
                                            <option value="21:30">9:30 PM</option>
                                            <option value="22:00">10:00 PM</option>
                                            <option value="22:30">10:30 PM</option>
                                            <option value="23:00">11:00 PM</option>
                                            <option value="23:30">11:30 PM</option>
                                        </select>
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
                                        
                                        {!service.image ? (
                                            <>
                                                <button 
                                                    type="button" 
                                                    className="upload-btn" 
                                                    onClick={() => handleServiceImageClick(index)}
                                                    disabled={loading}
                                                >
                                                    <Upload size={14} /> Upload Images
                                                </button>
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png"
                                                    ref={(el) => serviceImageInputRefs.current[index] = el}
                                                    style={{ display: "none" }}
                                                    onChange={(e) => handleServiceImageSelected(index, e)}
                                                />
                                            </>
                                        ) : (
                                            <div className="service-image-preview-container">
                                                <span className="service-image-name">{service.image.name}</span>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleRemoveServiceImage(index)}
                                                    className="remove-service-image-btn"
                                                    disabled={loading}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {service.imagePreview && (
                                        <div className="service-image-preview">
                                            <img 
                                                src={service.imagePreview} 
                                                alt={`Service ${index + 1} preview`} 
                                                className="service-preview-img"
                                            />
                                        </div>
                                    )}
                                    
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
                                
                                {!formData.businessLicense ? (
                                    <>
                                        <button 
                                            type="button" 
                                            className="import-btn" 
                                            onClick={handleChooseFilesClick}
                                            disabled={loading}
                                        >
                                            <Upload size={16} /> Import Image
                                        </button>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,application/pdf"
                                            ref={fileInputRef}
                                            style={{ display: "none" }}
                                            onChange={handleFileSelected}
                                        />
                                    </>
                                ) : (
                                    <div className="file-preview-container">
                                        <div className="file-info">
                                            <span className="file-name">{formData.businessLicense.name}</span>
                                            <button 
                                                type="button"
                                                onClick={handleRemoveFile}
                                                className="remove-file-btn"
                                                disabled={loading}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        {formData.businessLicense.type.startsWith('image/') && (
                                            <img 
                                                src={formData.businessLicensePreview} 
                                                alt="Business license preview" 
                                                className="license-preview-img"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            <p className="file-helper-text">
                                Supported: JPG, PNG, PDF • Max size: 5MB
                            </p>
                            
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