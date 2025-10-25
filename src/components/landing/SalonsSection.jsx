import { useState, useEffect } from 'react';
import SalonCard from "./SalonCard";
import { useNavigate } from 'react-router-dom';

function SalonsSection(){

    const navigate = useNavigate();

    // Store salon array
    const [salons, setSalons] = useState([]);
    // Has the location request been sent
    const [locationRequested, setLocationRequested] = useState(false);
    
    // Runs once component mounts
    useEffect(() => {
        fetchSalons();
    }, []);

    // Location request when user first interacts with page
    useEffect(() => {
        const handleUserClick = () => {
            if(locationRequested) return;
            setLocationRequested(true);
        
            if(navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const long = position.coords.longitude;
                        console.log("location allowed: ", lat, long);
                        console.log("displaying top salons near you");
                        fetchSalons(lat, long);
                    },
                    (error) => {
                        console.log("location not allowed.", error);
                        console.log("displaying generic top salons");
                    }
                );
            }
            else{
                console.log("geolocation not supported");
                fetchSalons();
            }
            window.removeEventListener('click', handleUserClick);
        }; 

        window.addEventListener('click', handleUserClick);
        
        return () => {
            window.removeEventListener('click', handleUserClick);
        };
        
    }, [locationRequested]);

    // Async function to fetch top salons-generic (not specific to a loc) from backend API
    const fetchSalons = async (lat, long) => {
        try{
            let url=`${import.meta.env.VITE_API_URL}/api/salons/generic`;

            // If location allowed, use top-rated near user endpoint
            if(lat && long){
                url=`${import.meta.env.VITE_API_URL}/api/salons/top-rated?user_lat=${lat}&user_long=${long}`;
            }

            const response = await fetch(url);

            const data = await response.json();

            console.log('Salons Successfully Received.', data.salons.length);

            const formattedSalons = data.salons.map((salon) =>({
                id: salon.id,
                title: salon.name,
                type: salon.type,
                address: `${salon.address}, ${salon.city}`,
                avgRating: salon.avg_rating,
                totalReviews: salon.total_reviews
            }));

            setSalons(formattedSalons);
        }
        catch (err){
            console.error('Error fetching Generic Top Salons: ', err);
        }
    };

    // If clicked, navigate to SalonDetails page: to be implemented!
    const handleSalonClick = (salon) => {
        console.log(`Clicked on salon ID: `, salon);
        //navigate line goes here
        navigate('/salon', {
            state: { salon }
        });
    };

    return(
        <div>
            <section className="salons-section">
                <p className='salons-section-title'>Browse Top-Rated Salons</p>
                <div className='salon-grid'>
                    {salons.map((salon) => (
                        <SalonCard
                            key={salon.id}
                            title={salon.title}
                            type={salon.type}
                            address={salon.address}
                            avgRating={salon.avgRating}
                            totalReviews={salon.totalReviews}
                            onClick={() => handleSalonClick(salon)} 
                        />
                    ))}
                </div>
            </section>
        </div>
    );

}

export default SalonsSection