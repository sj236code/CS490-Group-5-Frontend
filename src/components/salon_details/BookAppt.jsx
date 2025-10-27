import { useState } from 'react';
import { X } from 'lucide-react';

function BookAppt({isOpen, onClose, service, salon}){
    
    const [currentStep, setCurrentStep] = useState(1);
    const [bookingData, setBookingData] = useState({
        user_id: '',
        service_id: '',
        quantity: 1,
        appt_date: '',
        appt_time: '',
        stylist: '',
        pictures: [],
        notes: ''
    });

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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/add-service`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: bookingData.user_id,
                    service_id: service.id,
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

    const stylists = [
        { id: 1, name: 'Jane Smith', image: 'https://i.pravatar.cc/150?img=1' },
        { id: 2, name: 'Mike Johnson', image: 'https://i.pravatar.cc/150?img=2' },
        { id: 3, name: 'Sarah Williams', image: 'https://i.pravatar.cc/150?img=3' },
        { id: 4, name: 'Tom Brown', image: 'https://i.pravatar.cc/150?img=4' }
    ];

    // Booking Step 
    const Booking = () => {
        const [apptDate, setApptDate] = useState(bookingData.appt_date);
        const [apptTime, setApptTime] = useState(bookingData.appt_time);
        const [stylist, setStylist] = useState(bookingData.stylist);

        return (
            <div className="add-service-modal-overlay" onClick={handleBack}>
            <div className="add-service-modal-content" onClick={(e) => e.stopPropagation()}>
                
                {/* header */}
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
                    handleNext({ appt_date: apptDate, appt_time: apptTime, stylist });
                }}
                className="add-service-form"
                >
                <label className="add-service-label">Service: {service.name}</label>
                <label className="add-service-label">Salon: {salon.name}</label>

                <label className="add-service-label">Date:</label>
                <input
                    type="date"
                    value={apptDate}
                    onChange={(e) => setApptDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
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

                <label className="add-service-label">Preferred Stylist (Optional):</label>
                <input
                    type="text"
                    placeholder="Enter stylist name"
                    value={stylist}
                    onChange={(e) => setStylist(e.target.value)}
                    className="add-service-service-name-box"
                />

                <div className="add-service-actions">
                    <button type="button" onClick={handleBack} className="add-service-back-btn">
                    Back
                    </button>
                    <button
                    type="button"
                    onClick={() => handleNext({ appt_date: apptDate, appt_time: apptTime, stylist })}
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


    const PersonalInfo = ({ handleNext, handleBack, handleClose }) => (
        <div className="add-service-modal-content">
            <div className="add-service-modal-header">
            <h2 className="add-service-header-title">Enter Personal Info</h2>
            <button className="add-service-close-btn" onClick={handleClose}>
                <X size={24} />
            </button>
            </div>
            <hr className="add-service-divider" />
            <form className="add-service-form">
            <input type="text" placeholder="Full Name" className="book-appt-personal-info" required />
            <input type="email" placeholder="Email" className="book-appt-personal-info" required />
            <input type="tel" placeholder="Phone" className="book-appt-personal-info" required />
            <div className="add-service-actions">
                <button type="button" onClick={handleBack} className="add-service-back-btn">Back</button>
                <button type="button" onClick={() => handleNext({})} className="add-service-submit-btn">Next</button>
            </div>
            </form>
        </div>
    );

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
            <p><strong>Date:</strong> {bookingData.appt_date}</p>
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
            <h2 className="add-service-header-title">Thank You!</h2>
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