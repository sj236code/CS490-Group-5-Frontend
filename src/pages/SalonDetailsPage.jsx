import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import SalonShopTab from '../components/salon_details/SalonShopTab';
import GalleryTab from '../components/salon_details/GalleryTab';
import ReviewsTab from '../components/salon_details/ReviewsTab';
import AboutTab from '../components/salon_details/AboutTab';

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

function SalonDetailsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { salon, userType, user } = location.state || {};

    const [salonDetails, setSalonDetails] = useState(salon);
    const [workingTab, setWorkingTab] = useState("About");

    const [services, setServices] = useState([]);

    const customerId = user?.profile_id ?? '-';
    const userRole = user?.role ?? '-';

    console.log("SALONDETAILS: CUSTOMER ID: ", customerId);
    console.log("SALONDETAILS USERTYPE: ", userRole);

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

    useEffect(() => {
        if (workingTab === "Shop" && salonDetails?.id){
            fetchServices();
        }
    }, [workingTab, salonDetails]);

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
            <div className="salon-details-header">
                <h1 className="salon-details-name">{salonDetails.title}</h1>
                <div className="salon-details-info">
                    <span className="salon-type-badge">{salonDetails.type}</span>
                    <div className="salon-rating-section">
                        <span className="rating-number">{salonDetails.avgRating ? salonDetails.avgRating.toFixed(1) : 'N/A'}</span>
                        <StarRating rating={salonDetails.avgRating ? Math.round(salonDetails.avgRating) : 0} />
                        <span className="review-text">
                            ({salonDetails.totalReviews || 0} Reviews)
                        </span>
                    </div>
                </div>
            </div>

            {/* Nvigation Tabs */}
            <div className="salon-details-tabs">
                <button className="salon-detail-tab-link" onClick={() => setWorkingTab('About')}>About</button>
                <button className="salon-detail-tab-link" onClick={() => setWorkingTab('Gallery')}>Gallery</button>
                <button className="salon-detail-tab-link" onClick={() => setWorkingTab('Reviews')}>Reviews</button>
                <button className="salon-detail-tab-link" onClick={() => setWorkingTab('Shop')}>Shop</button>
            </div>

            {/* Tab Content */}
            <div className="salon-details-tab-content">
                {workingTab =="About" && (
                    <div>
                        {/* <h2>About Page for: {salonDetails.title}</h2> */}
                        <AboutTab salon={salonDetails} />
                    </div>
                )}
                {workingTab =="Gallery" && (
                    <div>
                        {/* <h2>Gallery Page for: {salonDetails.title}</h2> */}
                        <GalleryTab salon={salonDetails} />
                    </div>
                )}
                {workingTab =="Reviews" && (
                    <div>
                        {/* <h2>Reviews Page for: {salonDetails.title}</h2> */}
                        <ReviewsTab salon={salonDetails} user={user} />
                    </div>
                )}
                {workingTab =="Shop" && (
                    <div>
                        <SalonShopTab salon={salonDetails} userType={userType} user={user}/>
                    </div>
                )}
            </div>

        </div>
    );
}

export default SalonDetailsPage;