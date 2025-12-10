import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import DashboardManageTab from '../components/salon_dashboard/DashboardManageTab';
import DashboardLoyaltyTab from '../components/salon_dashboard/DashboardLoyaltyTab';
import DashboardCalendarTab from '../components/salon_dashboard/DashboardCalendarTab';
import DashboardMetricsTab from '../components/salon_dashboard/DashboardMetricsTab';
import DashboardEmployeesTab from '../components/salon_dashboard/DashboardEmployeesTab';

function SalonDashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams(); 
    const { salon, user } = location.state || {};

    const [workingTab, setWorkingTab] = useState("Metrics");
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

    const StarRating = ({ rating }) => {
        const totalStars = 5;
        return (
            <div className="star-rating-display">
            {[...Array(totalStars)].map((_, index) => {
                const starValue = index + 1;
                return (
                <Star
                    key={index}
                    size={16}
                    fill={starValue <= rating ? '#4B5945' : '#E0E0E0'}
                    color={starValue <= rating ? '#4B5945' : '#E0E0E0'}
                />
                );
            })}
            </div>
        );
    };

    return (
        <div>
            <div className="salon-details-hero">
                <div className="salon-hero-overlay"></div>
            </div>

            <div className="salon-details-header">
                <h1 className="salon-details-name">{salonDetails.name}</h1>
                <div className="salon-details-info">
                    <div className="salon-rating-section">
                        {(() => {
                            const avgRating = salonDetails.avgRating ?? salonDetails.avg_rating ?? 0;

                            const totalReviews = salonDetails.totalReviews ?? salonDetails.total_reviews ?? 0;

                            return (
                            <>
                                <span className="rating-number">
                                {avgRating ? avgRating.toFixed(1) : 'N/A'}
                                </span>
                                <StarRating rating={avgRating ? Math.round(avgRating) : 0} />
                                <span className="review-text">
                                ({totalReviews} Reviews)
                                </span>
                            </>
                            );
                        })()}
                    </div>
                </div>
            </div>

            <div className="salon-details-tabs">
                {["Metrics", "Calendar", "Manage", "Loyalty", "Employees"].map(tab => (
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
                {workingTab === "Metrics" && <DashboardMetricsTab salon={salonDetails} user={user}/>}
                {workingTab === "Calendar" && <DashboardCalendarTab salon={salonDetails} user={user}/>}
                {workingTab === "Loyalty" && <DashboardLoyaltyTab salon={salonDetails} />}
                {workingTab === "Manage" && <DashboardManageTab salon={salonDetails} />}
                {workingTab === "Employees" && <DashboardEmployeesTab salon={salonDetails} user={user} />}
            </div>
        </div>
    );
}

export default SalonDashboard;