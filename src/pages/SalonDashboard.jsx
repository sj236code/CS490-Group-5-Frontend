import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import DashboardManageTab from '../components/salon_dashboard/DashboardManageTab';

function SalonDashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const { salon } = location.state || {};

    const [workingTab, setWorkingTab] = useState("Manage");
    const [salonDetails, setSalonDetails] = useState(null);

    const [services, setServices] = useState([]);

    // Do I have to handle possible error if no valid salon is passed?
    useEffect(() => {
        if (!salon){
            console.error("No Salon Data provided.");
        }
        else{
            setSalonDetails(salon);
            console.log("Salon Details: ", salon);
        }
    }, [salon]);

    useEffect(() => {
        if (workingTab === "Shop" && salonDetails?.id){
            fetchServices();
        }
    }, [workingTab, salonDetails]);

    // Add check for salonDetails
    if (!salonDetails) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <p style={{ color: 'red' }}>No salon data found</p>
                <button onClick={() => navigate('/search')}>
                    Return to Search
                </button>
            </div>
        );
    }

    const fetchServices = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salons/details/${salonDetails.id}/services`);
            const data = await response.json();

            setServices(data.services || []);
        }
        catch (error) {
            console.error("Failed to fetch services.", error);
        }
    };

    const addToCart = (service) => {
        console.log("Added to cart:", service);
    }

    return (
        <div>

            {/* Hero */}
            <div className="salon-details-hero">
                <div className="salon-hero-overlay"></div>
            </div>

            {/* Salon Info */}
            <div>
                <h1 className="salon-details-name">{salonDetails.title}</h1>
                <div className="salon-details-info">
                    <span style={{marginRight: '5px'}}>{salonDetails.type}</span>
                    <span><Star size={16} fill="#96A78D"/> {salonDetails.avgRating || 'N/A'}</span>
                    <span style={{marginLeft: '5px'}}>
                        {salonDetails.totalReviews || 0} Reviews
                    </span>
                </div>
            </div>

            {/* Nvigation Tabs */}
            <div className="salon-details-tabs">
                <button className="salon-detail-tab-link" onClick={() => setWorkingTab('Metrics')}>Metrics</button>
                <button className="salon-detail-tab-link" onClick={() => setWorkingTab('Calendar')}>Calendar</button>
                <button className="salon-detail-tab-link" onClick={() => setWorkingTab('Manage')}>Manage</button>
                <button className="salon-detail-tab-link" onClick={() => setWorkingTab('Loyalty')}>Loyalty</button>
            </div>

            {/* Tab Content */}
            <div className="salon-details-tab-content">
                {workingTab =="Metrics" && (
                    <div>
                        <h2>Metrics Page for: {salonDetails.title}</h2>
                    </div>
                )}
                {workingTab =="Calendar" && (
                    <div>
                        <h2>Calendar Page for: {salonDetails.title}</h2>
                    </div>
                )}
                {workingTab =="Loyalty" && (
                    <div>
                        <h2>Loyalty Page for: {salonDetails.title}</h2>
                    </div>
                )}
                {workingTab =="Manage" && (
                    <div>
                        <DashboardManageTab salon={salonDetails} />
                    </div>
                )}
            </div>

        </div>
    );
}

export default SalonDashboard;