import HeroSection from '../components/landing/HeroSection';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import ServiceGrid from '../components/landing/ServiceGrid';
import SalonsSection from '../components/landing/SalonsSection';
import TypeCard from '../components/landing/TypeCard';

function LandingPage({userType, userId, user}){
    const navigate = useNavigate();    
    const [ownerSalonId, setOwnerSalonId] = useState(null);
    const [userProfile, setUserProfile] = useState(null);

    // State for types
    const [types, setTypes] = useState([]);

    // Url for links
    const typeImages = {
        'Barber': 'https://www.shutterstock.com/image-vector/barber-pole-icon-classic-shop-600nw-2498395151.jpg',
        'Hair Color': 'https://media.istockphoto.com/id/1076982524/vector/hair-dye-icon-element-of-video-products-outline-icon-for-mobile-concept-and-web-apps-thin.jpg?s=612x612&w=0&k=20&c=4Czq0zH_0TNrZoOrB_BwomVmwfzmLu6VkpVWz63lqw4=',
        'Lashes': 'https://media.istockphoto.com/id/1162516082/vector/eyelashes-and-mascara-vector-icon.jpg?s=612x612&w=0&k=20&c=_mdYObwDbo6RFkViiHBhHzlaFbXGqpNHYNORgsaXmLQ=',
        'Mani/Pedi': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_WfdDLP2zVEExiQjnEfmkWFKeAyNiTHtcYA&s',
        'Nails': 'https://img.freepik.com/premium-vector/manicure-icon-set-finger-nail-colours-vector-symbol-salon-woman-fingernail-glamour-paint-pictogram-female-beautiful-nail-art-gel-polish-care-sign_268104-3860.jpg',
        'Other': 'https://icons.veryicon.com/png/o/education-technology/education-3/other-47.png',
        'Salon': 'https://media.istockphoto.com/id/1202387135/vector/scissors-and-comb-icon-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=-x5Y2GLNKdrDdnqG6pMsF1uAIDtedM3qwlMqgN8ZBJk=',
        'Spa': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmeGK7PrmNP8thGZGfQGWLym_1LLExByuJFA&s',
        'Threading': 'https://www.shutterstock.com/image-vector/closeup-female-eye-thread-eyebrow-600nw-1290410422.jpg',
        'Waxing': 'https://cdn-icons-png.flaticon.com/512/6595/6595127.png',
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
            setTypes(data.types || []);
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
            <ServiceGrid navTo={navTo} userType={userType} user={userProfile}/>
            <SalonsSection navTo={navTo} userType={userType} user={userProfile}/>

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
        </div>  
    );
}

export default LandingPage;