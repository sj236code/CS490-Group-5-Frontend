import HeroSection from '../components/landing/HeroSection';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import ServiceGrid from '../components/landing/ServiceGrid';
import SalonsSection from '../components/landing/SalonsSection';
import TypeCard from '../components/landing/TypeCard';

// Import type images from assets folder
import Barber_img from '../assets/Barber.png';
import Hair_color_img from '../assets/Hair_color.png';
import Hair_removal_img from '../assets/Hair_removal.png';
import Lashes_img from '../assets/Lashes.png';
import Nails_img from '../assets/Nails.png';
import Other_img from '../assets/Other.png';
import Salon_img from '../assets/Salon.png';
import Spa_img from '../assets/Spa.png';

function LandingPage({userType, userId, user}){
    const navigate = useNavigate();    
    const [ownerSalonId, setOwnerSalonId] = useState(null);
    const [userProfile, setUserProfile] = useState(null);

    // State for types
    const [types, setTypes] = useState([]);

    // File for images
    const typeImages = {
        'Barber': Barber_img,
        'Hair Color': Hair_color_img,
        'Hair Removal': Hair_removal_img,
        'Lashes': Lashes_img,
        'Nails': Nails_img,
        'Other': Other_img,
        'Salon': Salon_img,
        'Spa': Spa_img,
    };
    // ============================================================

    // Fetch types on component mount
    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salons/types`);
            const data = await response.json();

            console.log('Types Successfully Received:', data.types?.length);
            
            // Sort types alphabetically, but put "Other" at the end
            const sortedTypes = (data.types || []).sort((a, b) => {
                if (a.name === 'Other') return 1;  // Move "Other" to end
                if (b.name === 'Other') return -1; // Keep "Other" at end
                return a.name.localeCompare(b.name); // Alphabetical for the rest
            });
            
            setTypes(sortedTypes);
        } catch (err) {
            console.error('Error fetching types:', err);
        }
    };

    // Handle type card click - navigate to search page with type filter
    const handleTypeClick = (type) => {
        console.log('Clicked on type:', type.name);

        navigate('/search', {
            state: {
                typeFilter: type.name,
                cities: [],
                userType: userType,
                user: user
            }
        });
    };

    const navTo = (path) => {
        navigate(path, {
            state: {
                userType,
                userId,
                user: userProfile
            }
        });
    };

    console.log("LANDING PAGE- ", user?.profile_id ?? '-');

    // Fetch user profile + salon id (for OWNER)
    useEffect(() => {
        // If not logged in, clear profile/salon
        if (!userId) {
            setUserProfile(null);
            setOwnerSalonId(null);
            return;
        }

        const fetchUserAndSalon = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user-type/${userId}`);
                const data = await res.json();

                if (!res.ok) {
                    console.error('Failed to fetch user profile:', data);
                    setUserProfile(null);
                    setOwnerSalonId(null);
                    return;
                }

                console.log('User profile:', data);
                setUserProfile(data);

                if (data.role === 'OWNER' && data.profile_id) {
                    const ownerId = data.profile_id;

                    try {
                        const res2 = await fetch(
                            `${import.meta.env.VITE_API_URL}/api/salons/get_salon/${ownerId}`
                        );
                        const data2 = await res2.json();

                        if (!res2.ok) {
                            console.error('Failed to fetch salons for owner:', data2);
                            setOwnerSalonId(null);
                            return;
                        }

                        console.log('Salons for owner:', data2);

                        if (Array.isArray(data2.salon_ids) && data2.salon_ids.length > 0) {
                            setOwnerSalonId(data2.salon_ids[0]);
                        } 
                        else {
                            setOwnerSalonId(null);
                        }
                    } catch (err) {
                        console.error('Error fetching salons for owner:', err);
                        setOwnerSalonId(null);
                    }
                } else {
                    setOwnerSalonId(null);
                }
            } 
            catch (err) {
                console.error('Error fetching user profile:', err);
                setUserProfile(null);
                setOwnerSalonId(null);
            }
        };

        fetchUserAndSalon();
    }, [userId]);

    return(
        <div>
            <HeroSection navTo={navTo} userType={userType} user={userProfile || user}/>
            
            {/* Browse by Type Section */}
            <section className="types-section">
                <h2>Browse by Type</h2>
                <div className="types-grid">
                    {types.map((type) => (
                        <TypeCard
                            key={type.id}
                            type={type}
                            imageUrl={typeImages[type.name]}
                            onClick={() => handleTypeClick(type)}
                        />
                    ))}
                </div>
            </section>
            
            <ServiceGrid navTo={navTo} userType={userType} user={userProfile}/>
            <SalonsSection navTo={navTo} userType={userType} user={userProfile}/>
        </div>  
    );
}

export default LandingPage;