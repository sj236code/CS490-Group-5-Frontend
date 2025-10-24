import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

function SalonDetailsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { salon } = location.state || {};

    const [salonDetails, setSalonDetails] = useState(salon);
    const [workingTab, setWorkingTab] = useState("About");

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
                <button className="salon-detail-tab-link" onClick={() => setWorkingTab('Services')}>Services</button>
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
                    </div>
                )}
                {workingTab =="Reviews" && (
                    <div>
                        <h2>Reviews Page for: {salonDetails.title}</h2>
                    </div>
                )}
                {workingTab =="Services" && (
                    <div>
                        <h2>Services Page for: {salonDetails.title}</h2>
                    </div>
                )}
            </div>

        </div>
    );
}

export default SalonDetailsPage;