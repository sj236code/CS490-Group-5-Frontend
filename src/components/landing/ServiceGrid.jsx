import ServiceCard from "./ServiceCard";
import { useState, useEffect } from 'react';
import { Scissors, Hand, Sparkles, Star, Palette } from 'lucide-react';

// Under HeroSection, ServicesGrid with ServiceCard components organized
function ServiceGrid(){

    // Store service array
    const [services, setServices] = useState([]);

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

            const formattedService = data.categories.map((category, index) => ({
                name: category.name,
                icon_url: category.icon_url,
                icon: defaultIcons[category.name] || defaultIcons.default
            }));

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
                        onClick={() => handleServiceClick(service.name)} />
                ))}
            </div>
        </div>

    );
}

export default ServiceGrid