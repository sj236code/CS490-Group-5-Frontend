import ServiceCard from "./ServiceCard";
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Scissors, Hand, Sparkles, Star, Palette } from 'lucide-react';

// Under HeroSection, ServicesGrid with ServiceCard components organized
function ServiceGrid(){

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
            const response = await fetch('/api/salons/categories');

            const data = await response.json();

            console.log('Services Successfully Received.');
            console.log('Raw categories from backend:', data.categories);

            const formattedService = data.categories.map((category) => {
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

    const handleServiceClick = (serviceName) => {
        console.log(`Clicked on: ${serviceName}`);
        // Add navigation to search page with clicked on filtered results
        navigate('search', {
            state: {
                presetTypeFilter: serviceName.filterType,
                query: serviceName.name
            }
        });
    };

    return(
        <div>
            <p className='text-1'>Find Pros by Service</p>
            <div className="service-grid">
                {services.map((service,index)=> (
                    <ServiceCard
                        key={index}
                        icon={service.icon}
                        title={service.name}
                        onClick={() => handleServiceClick(service)} />
                ))}
            </div>
        </div>

    );
}

export default ServiceGrid