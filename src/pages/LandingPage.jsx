import HeroSection from '../components/landing/HeroSection';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import ServiceGrid from '../components/landing/ServiceGrid';
import SalonsSection from '../components/landing/SalonsSection';

function LandingPage({userType, userId, user}){
    const navigate = useNavigate();    
    const [ownerSalonId, setOwnerSalonId] = useState(null);
    const [userProfile, setUserProfile] = useState(null);

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
            // get core user profile
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

            // 2) if OWNER, fetch the salon id using new endpoint
            if (data.role === 'OWNER' && data.profile_id) {
            const ownerId = data.profile_id; // SalonOwners.id

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

                // Endpoint returns: { salon_owner_id, salon_ids: [..] }
                if (Array.isArray(data2.salon_ids) && data2.salon_ids.length > 0) {
                    setOwnerSalonId(data2.salon_ids[0]); // use first salon for now
                } 
                else {
                    setOwnerSalonId(null);
                }
            } catch (err) {
                console.error('Error fetching salons for owner:', err);
                setOwnerSalonId(null);
            }
            } else {
            // Not an owner → clear ownerSalonId
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
        </div>  
    );
}

export default LandingPage