import ServiceCard from "./ServiceCard";
import { useState, useEffect } from 'react';
import { Scissors, Hand, Sparkles, Eye, User, Users, Brush, Star } from 'lucide-react';

// Under HeroSection, ServicesGrid with ServiceCard components organized
function ServiceGrid(){

    // Store service array
    const [services, setServices] = useState([]);

    //DOESNT WORK YET--FIX!
    const defaultIcons = {
        "Braids": Users,
        "Waxing": Hand,
        "Massage Therapy": Sparkles,
        "Men's Haircut": Scissors,
        "Nails": Hand,
        "Facial": User,
        "Eyelash Extensions": Eye,
        "Hair Treatment": Sparkles,
        "Makeup": Brush,
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
        <div className="service-grid">
            {services.map((service,index)=> (
                <ServiceCard
                    key={index}
                    icon={service.icon}
                    title={service.name}
                    onClick={() => handleServiceClick(service.name)} />
            ))}
        </div>
    );
}

export default ServiceGrid