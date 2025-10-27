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
        setCurrentStep(currentStep-1);
    }

    const handleBooking = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/add-service`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: bookingData.user_id,
                    serviceId: service.id,
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
        const [apptTime, setApptTime] = useState(bookingData.app_time);
        const [stylist, setStylist] = useState(bookingData.stylist);

        return(
            <div className="booking-step">
                <h2>Book Appointment</h2>
                <p><strong>Service:</strong> {service.name}</p>
                <p><strong>Salon:</strong> {salon.name}</p>

                <label>Select Date</label>
                <input 
                    type="date"
                    value={apptDate}
                    onChange={(e) => setApptDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                />
                <label>Preferred Stylist (Optional):</label>
                <input 
                    type="text"
                    placeholder="Enter stylist name"
                    value={stylist}
                    onChange={(e) => setStylist(e.target.value)}
                />

                <button 
                    onClick={() => handleNext({ 
                        appt_date: apptDate, 
                        appt_time: apptTime, 
                        stylist: stylist 
                    })}
                    disabled={!apptDate || !apptTime}
                >
                    Next
                </button>
            </div>
        );
    }
    
    return(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}><X /></button>
                {currentStep === 1 && <Booking />}
                {currentStep === 2 && <PersonalInfo />}
                {currentStep === 3 && <Confirmation />}
                {currentStep === 4 && <ThankYou />}
            </div>
        </div>
    );
}

export default BookAppt;