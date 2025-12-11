import { useState, useEffect } from "react";
import SalonCard from "./SalonCard";
import { useNavigate } from "react-router-dom";

function SalonsSection({ userType, user }) {
    const navigate = useNavigate();

    const navTo = (path) => {
        navigate(path, {
            state: {
                userType,
                user,
            },
        });
    };

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
        if (locationRequested) return;
        setLocationRequested(true);

        if (navigator.geolocation) {
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
        } else {
            console.log("geolocation not supported");
        }

        window.removeEventListener("click", handleUserClick);
    };

    window.addEventListener("click", handleUserClick);

    return () => {
        window.removeEventListener("click", handleUserClick);
    };
    }, [locationRequested]);

    // Async function to fetch salons (generic or near user) from backend API
    const fetchSalons = async (lat, long) => {
        try {
            let url = `${import.meta.env.VITE_API_URL}/api/salons/generic`;

            // If location allowed, use top-rated near user endpoint
            if (lat && long) {
            url = `${import.meta.env.VITE_API_URL}/api/salons/top-rated?user_lat=${lat}&user_long=${long}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            console.log("Salons Successfully Received.", data.salons.length);

            // Base formatting from salon search endpoints
            const baseSalons = data.salons.map((salon) => ({
                id: salon.id,
                title: salon.name,
                type: Array.isArray(salon.types) ? salon.types.join(", ") : salon.types,
                address: `${salon.address}, ${salon.city}`,
                avgRating: salon.avg_rating,
                totalReviews: salon.total_reviews,
            }));

            // Fetch hero image for each salon using existing image endpoint
            const salonsWithImages = await Promise.all(
                baseSalons.map(async (s) => {
                    try {
                        const imgRes = await fetch(
                            `${import.meta.env.VITE_API_URL}/api/salon_images/get_salon_home_image/${s.id}`
                        );
                        const imgData = await imgRes.json();

                        return {
                            ...s,
                            heroImageUrl: imgData.has_image ? imgData.image_url : null,
                        };
                    } catch (err) {
                        console.error("Failed to fetch hero image for salon", s.id, err);
                        return { ...s, heroImageUrl: null };
                    }
                })
            );

            setSalons(salonsWithImages);
        } 
        catch (err) {
            console.error("Error fetching Top Salons: ", err);
        }
    };

    // If clicked, navigate to SalonDetails page
    const handleSalonClick = (salon) => {
        console.log(`Clicked on salon: `, salon);
        navigate("/salon", {
            state: { salon, userType, user },
        });
    };

    return (
    <div>
        <section className="salons-section">
        <p className="salons-section-title">Browse Top-Rated Salons</p>
        <div className="salon-grid">
            {salons.slice(0, 4).map((salon) => (
            <SalonCard
                key={salon.id}
                title={salon.title}
                type={salon.type}
                address={salon.address}
                avgRating={salon.avgRating}
                totalReviews={salon.totalReviews}
                imageUrl={salon.heroImageUrl}
                onClick={() => handleSalonClick(salon)}
            />
            ))}
        </div>
        </section>
    </div>
    );
}

export default SalonsSection;
