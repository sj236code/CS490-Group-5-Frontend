import HeroSection from '../components/landing/HeroSection';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import ServiceGrid from '../components/landing/ServiceGrid';
import SalonsSection from '../components/landing/SalonsSection';
import TypeCard from '../components/landing/TypeCard';   // <-- ADDED

function LandingPage({userType, userId, user}){
    const navigate = useNavigate();    
    const [ownerSalonId, setOwnerSalonId] = useState(null);
    const [userProfile, setUserProfile] = useState(null);

    // ============================
    // ADDED: state for types
    // ============================
    const [types, setTypes] = useState([]);

    // ============================================================
    // ADDED: Your image URLs placeholder object
    // ============================================================
    const typeImages = {
        'Hair': 'PASTE_YOUR_HAIR_IMAGE_URL_HERE',
        'Nails': 'PASTE_YOUR_NAILS_IMAGE_URL_HERE',
        'Waxing': 'PASTE_YOUR_WAXING_IMAGE_URL_HERE',
        'Spa': 'PASTE_YOUR_SPA_IMAGE_URL_HERE',
        'Barber': 'PASTE_YOUR_BARBER_IMAGE_URL_HERE',
    };
    // ============================================================

    // ============================
    // ADDED: fetch types
    // ============================
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

    // ============================
    // ADDED: handle type card click
    // ============================
    const handleTypeClick = (type) => {
        console.log('Clicked on type:', type.name);

        navigate('/search', {
            state: {
                typeFilter: type.name,
                cities: [],       // your existing logic had this
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
                user:userProfile
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

            {/* ======================================================
                ADDED: Browse by Type Section
               ====================================================== */}
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
