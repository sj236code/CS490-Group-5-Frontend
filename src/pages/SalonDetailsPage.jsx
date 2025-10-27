import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import SalonShopTab from '../components/salon_details/SalonShopTab';
import GalleryTab from '../components/salon_details/GalleryTab';

function SalonDetailsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { salon } = location.state || {};

    const [salonDetails, setSalonDetails] = useState(salon);
    const [workingTab, setWorkingTab] = useState("About");

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
                <button className="salon-detail-tab-link" onClick={() => setWorkingTab('About')}>About</button>
                <button className="salon-detail-tab-link" onClick={() => setWorkingTab('Gallery')}>Gallery</button>
                <button className="salon-detail-tab-link" onClick={() => setWorkingTab('Reviews')}>Reviews</button>
                <button className="salon-detail-tab-link" onClick={() => setWorkingTab('Shop')}>Shop</button>
            </div>

            {/* Tab Content */}
            <div className="salon-details-tab-content">
                {workingTab =="About" && (
                    <div>
                        <h2>About Page for: {salonDetails.title}</h2>
                    </div>
                )}
                {workingTab =="Gallery" && (
                    <div>
                        <h2>Gallery Page for: {salonDetails.title}</h2>
                        <GalleryTab salon={salonDetails} />
                    </div>
                )}
                {workingTab =="Reviews" && (
                    <div>
                        <h2>Reviews Page for: {salonDetails.title}</h2>
                    </div>
                )}
                {workingTab =="Shop" && (
                    <div>
                        <SalonShopTab salon={salonDetails} />
                    </div>
                )}
            </div>

        </div>
    );
}

export default SalonDetailsPage;