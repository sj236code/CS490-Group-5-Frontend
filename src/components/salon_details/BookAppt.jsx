import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function BookAppt({isOpen, onClose, service, salon, customerId}){
    
    // console.log("Booking Appt for: ", customerId);

    const [currentStep, setCurrentStep] = useState(1);
    const [bookingData, setBookingData] = useState({
        user_id: customerId,
        service_id: '',
        quantity: 1,
        appt_date: '',
        appt_time: '',
        stylist: '',
        pictures: [],
        notes: ''
    });

    useEffect(() => {
        if(isOpen){
            setBookingData(prev => ({
                ...prev,
                service_id: service?.id ?? '',
            }));
            setCurrentStep(1);
        }
    },[isOpen, service]);

    if (!isOpen){
        return null;
    }

    const handleNext = (stepData) => {
        setBookingData({...bookingData, ...stepData});
        setCurrentStep(currentStep+1);
    }

    const handleBack = () => {
        if (currentStep === 1) {
            handleClose();
        } else {
            setCurrentStep((prev) => prev - 1);
        }
    };
    
    const handleClose = () => {
        setCurrentStep(1);
        onClose();        
    };

    const handleBooking = async () => {

        try {
            const startAtISO = `${bookingData.appt_date}T${bookingData.appt_time}:00`;

            const payload = {
                customer_id: bookingData.user_id,         // Mapped from user_id
                salon_id: salon.id,                       // Use the salon prop ID
                service_id: bookingData.service_id,       // Already in bookingData
                employee_id: bookingData.stylist,         // Backend expects employee_id, but you're sending name. We'll use the name for now or assume a lookup happens.
                start_at: startAtISO,                     // The combined date/time string
                notes: bookingData.notes || null,         // Notes field
                status: 'Booked'
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if(!response.ok) {
                console.error('API Error:', data.error, data.details);
                alert(`Booking failed: ${data.error || 'Server error'}`);
                return;
            }
        }
        catch (err) {
            console.error('Network or Parse error:', err);
            alert('An unexpected error occurred. Please try again.');
        }
        

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/add-service`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: bookingData.user_id,
                    service_id: bookingData.service_id,
                    quantity: bookingData.quantity || 1, 
                    appt_date: bookingData.appt_date,
                    appt_time: bookingData.appt_time,
                    stylist: bookingData.stylist || null,
                    pictures: bookingData.pictures || [],
                    notes: bookingData.notes || null
                })
            });
            
            const data = await response.json();
            console.log('Booking saved:', data);
            setCurrentStep(4); // Go to confirmation
        } 
        catch (err) {
            console.error('Booking error:', err);
        }
    };

    const ProgressBar = () => {
        const steps = [
            {num: 1, label: 'Select Details'},
            {num: 2, label: 'Personal Info'},
            {num: 3, label: 'Confirm'}
        ];

        return (
            <div className="progress-bar">
                {steps.map((step,index) => (
                    <div key={step.num} className="progress-step-wrapper">
                        <div className={`progress-circle ${currentStep >= step.num ? 'active' : ''}`}>
                            {currentStep > step.num ? '✓' : ''}
                        </div>
                        <span className="progress-label">{step.label}</span>
                        {index < steps.length - 1 && (
                            <div className={`progress-line ${currentStep > step.num ? 'active' : ''}`}></div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    // Booking Step 
    // Booking Step
    const Booking = () => {
        const [apptDate, setApptDate] = useState(bookingData.appt_date);
        const [apptTime, setApptTime] = useState(bookingData.appt_time);
        const [stylist, setStylist] = useState(bookingData.stylist);
        const [employees, setEmployees] = useState([]);
        const [loadingEmployees, setLoadingEmployees] = useState(true);
        const [error, setError] = useState(null);

        useEffect(() => {
            const fetchEmployees = async () => {
                try {
                    const salon_id = salon.id; // use the actual salon ID
                    const response = await fetch(
                        `${import.meta.env.VITE_API_URL}/api/appointments/${salon_id}/employees`
                    );

                    if (!response.ok) {
                        throw new Error(`Error: ${response.status}`);
                    }

                    const data = await response.json();
                    setEmployees(data);
                } catch (err) {
                    console.error("Error fetching employees:", err);
                    setError("Failed to load stylists. Please try again later.");
                } finally {
                    setLoadingEmployees(false);
                }
            };

            fetchEmployees();
        }, [salon.id]);

        const ValidateAndNext = () => {
            if (!apptDate || !apptTime) {
                alert("Please fill out all fields before proceeding.");
                return;
            }
            handleNext({ appt_date: apptDate, appt_time: apptTime, stylist });
        };

        return (
            <div className="add-service-modal-overlay" onClick={handleBack}>
                <div className="add-service-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="add-service-modal-header">
                        <h2 className="add-service-header-title">Book Appointment</h2>
                        <button className="add-service-close-btn" onClick={handleBack}>
                            <X size={24} />
                        </button>
                    </div>

                    <hr className="add-service-divider" />

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            ValidateAndNext();
                        }}
                        className="add-service-form"
                    >
                        <label className="add-service-label">Service: {service.name}</label>
                        <label className="add-service-label">Salon: {salon.title}</label>
                        <label className="add-service-label">Date:</label>
                        <input
                            type="date"
                            value={apptDate}
                            onChange={(e) => setApptDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            className="add-service-price-box"
                            required
                        />

                        <label className="add-service-label">Time:</label>
                        <input
                            type="time"
                            value={apptTime}
                            onChange={(e) => setApptTime(e.target.value)}
                            className="add-service-price-box"
                            required
                        />

                        <label className="add-service-label">Preferred Stylist:</label>
                        {loadingEmployees ? (
                            <p>Loading stylists...</p>
                        ) : error ? (
                            <p className="error-message">{error}</p>
                        ) : employees.length > 0 ? (
                            <select
                                value={stylist}
                                onChange={(e) => setStylist(e.target.value)}
                                className="add-service-service-name-box"
                            >
                                <option value="">Any employee</option>
                                {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.first_name}
                                </option>
                                ))}
                            </select>
                        ) : (
                            <p>No stylists available for this salon.</p>
                        )}

                        <div className="add-service-actions">
                            <button type="button" onClick={handleBack} className="add-service-back-btn">
                                Back
                            </button>
                            <button
                                type="submit"
                                className="add-service-submit-btn"
                            >
                                Next
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };


    const PersonalInfo = ({ handleNext, handleBack, handleClose }) => {

        const [fullName, setFullName] = useState("");
        const [email, setEmail] = useState("");
        const [phone, setPhone] = useState("");

        const ValidateAndNext = () => {
            if(!fullName.trim() || !email.trim() || !phone.trim()) {
                alert("Please fill out all fields before proceeding.");
                return;
            }
            handleNext({ fullName, email, phone });
        };

        return(
            <div className="add-service-modal-content">
                <div className="add-service-modal-header">
                    <h2 className="add-service-header-title">Enter Personal Info</h2>
                    <button className="add-service-close-btn" onClick={handleClose}>
                        <X size={24} />
                    </button>
                </div>
                <hr className="add-service-divider" />
                <form className="add-service-form">
                    <input 
                        type="text" 
                        placeholder="Full Name" 
                        className="book-appt-personal-info" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required 
                    />
                    <input 
                        type="email" 
                        placeholder="Email" 
                        className="book-appt-personal-info"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                    <input 
                        type="tel" 
                        placeholder="Phone" 
                        className="book-appt-personal-info"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}  
                        required 
                    />
                    <div className="add-service-actions">
                        <button 
                            type="button" 
                            onClick={handleBack} 
                            className="add-service-back-btn"
                        >
                            Back
                        </button>
                        <button 
                            type="button" 
                            onClick={ValidateAndNext} 
                            className="add-service-submit-btn"
                        >
                            Next
                        </button>
                    </div>
                </form>
            </div>
        ); 
    };

    const Confirmation = ({ bookingData, handleBooking, handleBack, handleClose }) => (
        <div className="add-service-modal-content">
            <div className="add-service-modal-header">
                <h2 className="add-service-header-title">Confirm Appointment</h2>
                <button className="add-service-close-btn" onClick={handleClose}>
                    <X size={24} />
                </button>
                </div>
                <hr className="add-service-divider" />
                <div className="add-service-form">
                    <p>
                        <strong>
                            Date: 
                        </strong> 
                        {bookingData.appt_date}
                    </p>
                    <p><strong>Time:</strong> {bookingData.appt_time}</p>
                    <p><strong>Stylist:</strong> {bookingData.stylist || 'None'}</p>
                    <div className="add-service-actions">
                        <button type="button" onClick={handleBack} className="add-service-back-btn">Back</button>
                        <button type="button" onClick={handleBooking} className="add-service-submit-btn">Confirm</button>
                    </div>
            </div>
        </div>
    );

    const ThankYou = ({ onClose }) => (
        <div className="add-service-modal-content">
            <div className="add-service-modal-header">
                <h2 className="add-service-header-title">  
                    Thank You!
                </h2>
                <button className="add-service-close-btn" onClick={onClose}>
                    <X size={24} />
                </button>
            </div>
            <hr className="add-service-divider" />
            <div className="add-service-form">
                <p>Your appointment has been successfully booked.</p>
                <button onClick={onClose} className="add-service-submit-btn">Close</button>
            </div>
        </div>
    );
        
    return(
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* <button className="close-btn" onClick={handleClose}><X /></button> */}
                {currentStep === 1 && <Booking />}
                {currentStep === 2 && <PersonalInfo handleNext={handleNext} handleBack={handleBack} handleClose={handleClose}/>}
                {currentStep === 3 && <Confirmation bookingData={bookingData} handleBooking={handleBooking} handleBack={handleBack} handleClose={handleClose}/>}
                {currentStep === 4 && <ThankYou onClose={handleClose}/>}
            </div>
        </div>
    );
}

export default BookAppt;