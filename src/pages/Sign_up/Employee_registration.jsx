import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import './Employee_registration.css';

function EmployeeRegistration() {
    const [formData, setFormData] = useState({
        salonId: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
        phone: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Employee registration submitted:', formData);
        navigate('/employee-registration-success');
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="employee-registration-page">
            <div className="employee-registration-container">
                <button className="back-button" onClick={handleBack}>
                    <ChevronLeft />
                </button>

                <h1 className="page-title">Employee-Salon Registration</h1>
                <div className="title-line"></div>

                <p className="instruction-text">
                    If your salon owner has a registered Jade Salon, ask your salon owner for the Salon ID
                </p>

                <form onSubmit={handleSubmit} className="registration-form">
                    <input
                        type="text"
                        name="salonId"
                        placeholder="Salon ID"
                        value={formData.salonId}
                        onChange={handleChange}
                        className="full-width-input"
                        required
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
                        />
                        <input
                            type="text"
                            name="address2"
                            placeholder="Address 2"
                            value={formData.address2}
                            onChange={handleChange}
                            className="half-width-input"
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
                        />
                        <input
                            type="text"
                            name="state"
                            placeholder="State"
                            value={formData.state}
                            onChange={handleChange}
                            className="half-width-input"
                            required
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
                        />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone No."
                            value={formData.phone}
                            onChange={handleChange}
                            className="half-width-input"
                            required
                        />
                    </div>

                    <button type="submit" className="submit-button-simple">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
}

export default EmployeeRegistration;