import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import DashboardManageTab from '../components/salon_dashboard/DashboardManageTab';

function SalonDashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams(); 
    const { salon } = location.state || {};

    const [workingTab, setWorkingTab] = useState("Manage");
    const [salonDetails, setSalonDetails] = useState(null);

    useEffect(() => {
        const salonId = searchParams.get('id');

        if (salonId) {
            // Fetch using ID from query param
            fetch(`${import.meta.env.VITE_API_URL}/api/salons/details/${salonId}`)
                .then(res => res.json())
                .then(data => setSalonDetails(data))
                .catch(err => console.error(err));
        } 
        else if (salon) {
            // Use salon from location.state
            if (salon.id && !salon.name) {
                fetch(`${import.meta.env.VITE_API_URL}/api/salons/details/${salon.id}`)
                    .then(res => res.json())
                    .then(data => setSalonDetails(data))
                    .catch(err => console.error(err));
            } else {
                setSalonDetails(salon);
            }
            console.log("Salon Details:", salon);
        } 
        else {
            console.error("No salon data provided.");
        }
    }, [location, searchParams]);

    useEffect(() => {
        if (workingTab === "Shop" && salonDetails?.id) {
            // fetchServices(); // only if this function is defined elsewhere
        }
    }, [workingTab, salonDetails]);

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

    return (
        <div>
            <div className="salon-details-hero">
                <div className="salon-hero-overlay"></div>
            </div>

            <div>
                <h1 className="salon-details-name">{salonDetails.name}</h1>
                <div className="salon-details-info">
                    <span style={{ marginRight: '5px' }}>{salonDetails.type}</span>
                    <span><Star size={16} fill="#96A78D"/> {salonDetails.avgRating || 'N/A'}</span>
                    <span style={{ marginLeft: '5px' }}>
                        {salonDetails.total_reviews || 0} Reviews
                    </span>
                </div>
            </div>

            <div className="salon-details-tabs">
                {["Metrics", "Calendar", "Manage", "Loyalty"].map(tab => (
                    <button
                        key={tab}
                        className="salon-detail-tab-link"
                        onClick={() => setWorkingTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="salon-details-tab-content">
                {workingTab === "Metrics" && <h2>Metrics Page for: {salonDetails.name}</h2>}
                {workingTab === "Calendar" && <h2>Calendar Page for: {salonDetails.name}</h2>}
                {workingTab === "Loyalty" && <h2>Loyalty Page for: {salonDetails.name}</h2>}
                {workingTab === "Manage" && <DashboardManageTab salon={salonDetails} />}
            </div>
        </div>
    );
}

export default SalonDashboard;
