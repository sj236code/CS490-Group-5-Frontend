import ServiceCard from "./ServiceCard";
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Scissors, Hand, Sparkles, Star, Palette } from 'lucide-react';

// Under HeroSection, ServicesGrid with ServiceCard components organized
function ServiceGrid({user}){

    const navigate = useNavigate();

    // Store service array
    const [services, setServices] = useState([]);

    const serviceMapping = {
        "extension": { icon: Sparkles, filterType: "Hair" },
        "haircut": { icon: Scissors, filterType: "Hair" },
        "color": { icon: Palette, filterType: "Hair" },
        "nails": { icon: Hand, filterType: "Nails" },
    };

    //DOESNT WORK YET--FIX!
    const defaultIcons = {
        "extensions": Sparkles,
        "haircut": Scissors,
        "color": Palette,
        "nails": Hand,
        "default": Star
    };

    // Runs once component mounts
    useEffect(() => {
        fetchCategories();
    }, []);


    // Async function to fetch service categories from backend API
    const fetchCategories = async () => {
        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salons/categories`);

            const data = await response.json();

            console.log('Services Successfully Received.');
            console.log('Raw categories from backend:', data.categories);

            const categories = data.categories || data.data?.categories || [];

            const formattedService = categories.map((category) => {
                const normalizedName = category.name.trim().toLowerCase();
                const mapping = serviceMapping[normalizedName];
                return {
                    name: category.name.charAt(0).toUpperCase() + category.name.slice(1), // Capitalize for display
                    originalName: category.name, // Keep original for mapping
                    icon_url: category.icon_url,
                    icon: defaultIcons[normalizedName] || defaultIcons.default,
                    filterType: mapping?.filterType || "Any Type"
                };
            });

            setServices(formattedService);
            //console.log('End of Async Function.');
        }
        catch (err){
            console.error('Error fetching categories: ', err);
        }
    };

    const handleServiceClick = (service) => {
        console.log(`Clicked on: ${service.name}`);
        // Add navigation to search page with clicked on filtered results
        navigate('/search', {
            state: {
                presetTypeFilter: service.filterType,
                query: service.name,
                user
            }
        });
    };

    return(
        <div>
            <p className='text-1'>Find Pros by Service</p>
            <div className="service-grid">
                {services.slice(0, 4).map((service) => (
                    <ServiceCard
                        key={service.id || service.name}
                        service={service}
                        title={service.name}
                        onClick={() => handleServiceClick(service)}
                    />
                ))}
            </div>
        </div>
    );
}

export default ServiceGrid