import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import './Salon_registration.css';

function RegisterSalon() {
    const [currentStep, setCurrentStep] = useState(1);
    const [ownerInfo, setOwnerInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [salonDetails1, setSalonDetails1] = useState({
        salonName: '',
        salonType: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
        phone: ''
    });
    const [salonDetails2, setSalonDetails2] = useState({
        hours: {
            monday: { open: '', close: '', closed: false },
            tuesday: { open: '', close: '', closed: false },
            wednesday: { open: '', close: '', closed: false },
            thursday: { open: '', close: '', closed: false },
            friday: { open: '', close: '', closed: false },
            saturday: { open: '', close: '', closed: false },
            sunday: { open: '', close: '', closed: false }
        }
    });
    const [services, setServices] = useState([
        { name: '', price: '', duration: '', description: '', images: [] }
    ]);
    const [payment, setPayment] = useState({
        card: false,
        cash: false,
        venmo: false,
        zelle: false,
        check: false,
        other: false,
        otherDetails: ''
    });
    const [verification, setVerification] = useState({
        license: null,
        termsAgreed: false,
        businessConfirmed: false
    });

    const navigate = useNavigate();

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            navigate(-1);
        }
    };

    const handleContinue = () => {
        if (currentStep < 5) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        console.log('Salon registration submitted');
        navigate('/register-salon-success');
    };

    const addService = () => {
        setServices([...services, { name: '', price: '', duration: '', description: '', images: [] }]);
    };

    return (
        <div className="register-salon-page">
            <div className="register-salon-container">
                <button className="back-btn" onClick={handleBack}>
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
                </div>

                <div className="step-labels">
                    <span className={currentStep === 1 ? 'current-label' : ''}>Owner Info.</span>
                    <span className={currentStep === 2 ? 'current-label' : ''}>Salon Details</span>
                    <span className={currentStep === 3 ? 'current-label' : ''}>Services</span>
                    <span className={currentStep === 4 ? 'current-label' : ''}>Payment</span>
                    <span className={currentStep === 5 ? 'current-label' : ''}>Verification</span>
                </div>

                <div className="form-content">
                    {currentStep === 1 && (
                        <div className="form-step">
                            <div className="row">
                                <input type="text" placeholder="First Name" className="half" />
                                <input type="text" placeholder="Last Name" className="half" />
                            </div>
                            <div className="row">
                                <input type="email" placeholder="Email Address" className="half" />
                                <input type="tel" placeholder="Phone Number" className="half" />
                            </div>
                            <div className="row">
                                <input type="password" placeholder="Password" className="half" />
                                <input type="password" placeholder="Confirm Password" className="half" />
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="form-step">
                            {salonDetails2.hours ? (
                                <>
                                    <p className="section-label">Hours</p>
                                    <div className="hours-list">
                                        {Object.keys(salonDetails2.hours).map(day => (
                                            <div key={day} className="hours-row">
                                                <span className="day-name">{day.charAt(0).toUpperCase() + day.slice(1).slice(0, 3)}.</span>
                                                <input type="time" className="time-input" placeholder="Open" />
                                                <span>to</span>
                                                <input type="time" className="time-input" placeholder="Close" />
                                                <label className="closed-label">
                                                    <input type="checkbox" /> Closed
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="row">
                                        <input type="text" placeholder="Salon Name" className="half" />
                                        <input type="text" placeholder="Salon Type" className="half" />
                                    </div>
                                    <div className="row">
                                        <input type="text" placeholder="Address 1" className="half" />
                                        <input type="text" placeholder="Address 2" className="half" />
                                    </div>
                                    <div className="row">
                                        <input type="text" placeholder="City" className="half" />
                                        <input type="text" placeholder="State" className="half" />
                                    </div>
                                    <div className="row">
                                        <input type="text" placeholder="Zip" className="half" />
                                        <input type="tel" placeholder="Phone No." className="half" />
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="form-step">
                            <p className="section-label">Services:</p>
                            {services.map((service, index) => (
                                <div key={index} className="service-block">
                                    <input type="text" placeholder="Service Name" className="full" />
                                    <div className="row">
                                        <input type="text" placeholder="Price" className="third" />
                                        <input type="text" placeholder="Duration (minutes)" className="third" />
                                        <button type="button" className="upload-btn">+ Upload Images</button>
                                    </div>
                                    <textarea placeholder="Description/ Notes" className="full textarea"></textarea>
                                </div>
                            ))}
                            <button type="button" onClick={addService} className="add-another">+ Add Another</button>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="form-step">
                            <p className="section-label">Select All Accepted Payment Methods:</p>
                            <div className="checkbox-grid">
                                <label><input type="checkbox" /> Card</label>
                                <label><input type="checkbox" /> Venmo</label>
                                <label><input type="checkbox" /> Check</label>
                                <label><input type="checkbox" /> Cash</label>
                                <label><input type="checkbox" /> Zelle</label>
                                <label><input type="checkbox" /> Other</label>
                            </div>
                            <p className="other-label">If Other, Explain Below:</p>
                            <textarea className="full textarea" placeholder=""></textarea>
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="form-step">
                            <div className="upload-section">
                                <span>Upload Business License:</span>
                                <button type="button" className="import-btn">+ Import Image</button>
                            </div>
                            <div className="checkbox-list">
                                <label>
                                    <input type="checkbox" />
                                    I agree to the JADE Terms of Service and Privacy Policy. By registering, I confirm I am an authorized representative of this salon.
                                </label>
                                <label>
                                    <input type="checkbox" />
                                    I confirm that the salon is a legitimate, operational business.
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                <div className="button-row">
                    <button type="button" onClick={handleBack} className="back-button">Back</button>
                    <button type="button" onClick={handleContinue} className="continue-button">
                        {currentStep === 5 ? 'Submit' : 'Continue'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RegisterSalon;