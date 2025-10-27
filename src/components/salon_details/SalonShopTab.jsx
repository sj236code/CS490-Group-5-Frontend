import { useState, useEffect } from 'react';
import {Star, ChevronLeft, ChevronRight} from 'lucide-react';
import SalonServiceCard from './SalonServiceCard';
import SalonProductCard from './SalonProductCard';
import BookAppt from './BookAppt';

function SalonShopTab({salon}){

    // Service Section
    const [services, setServices] = useState([]);
    const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
    const [cart, setCart] = useState([]);
    const servicesPerPage = 3;

    // Booking Service Modal
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    // Product Section
    const [products, setProducts] = useState([]);
    const [currentProductIndex, setCurrentProductIndex] = useState(0);
    const productsPerPage = 3;

    // Load Services & Products when component mounts
    useEffect(() => {
        if (salon?.id){
            fetchServices();
            //fetchProducts();
        }
    }, [salon?.id]);

    // Fetch Services
    const fetchServices = async() => {
        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salons/details/${salon.id}/services`);
            const data = await response.json();

            setServices(data.services || []);
            console.log("Services loaded: ", data.services);
        }
        catch (err){
            console.error("Unable to fetch services. Error: ", err);
        }
    };

    // Fetch Products-- endpoint not created yet
    const fetchProducts = async() => {
        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salons/details/${salon.id}/products`);
            const data = await response.json();

            setProducts(data.products || []);
            console.log("Products loaded: ", data.products);
        }
        catch (err){
            console.error("Unable to fetch services. Error: ", err);
        }
    };

    // ServiceCard Handling
    const prevService = () => {
        if(currentServiceIndex - servicesPerPage >=0){
            setCurrentServiceIndex(currentServiceIndex - servicesPerPage);
        }
    };

    const nextService = () => {
        if(currentServiceIndex + servicesPerPage < services.length){
            setCurrentServiceIndex(currentServiceIndex + servicesPerPage);
        }
    };

    const addServiceToCart = (service, salon) => {
        setSelectedService(service);
        setIsBookingModalOpen(true);
        console.log("Booking modal for following service opening: ", service);
        // Implement Post to DB
    };

    const currentServices = services.slice(currentServiceIndex, currentServiceIndex + servicesPerPage);

    // ProductCard Handling
    const prevProduct = () => {
        if(currentProductIndex - productsPerPage >=0){
            setCurrentProductIndex(currentProductIndex - productsPerPage);
        }
    };

    const nextProduct = () => {
        if(currentProductIndex + productsPerPage < products.length){
            setCurrentProductIndex(currentProductIndex + productsPerPage);
        }
    };

    const addProductToCart = (product) => {
        console.log("Product added to cart: ", product);
        // Implement Post to DB
    };

    const currentProducts = products.slice(currentProductIndex, currentProductIndex + productsPerPage);

    // Handle Edge Case: A salon does not offer services or products
    if(services.length === 0 && products.length === 0){
        return(
            <div>
                <p>No services or products available.</p>
            </div>
        );
    }

    return (
        <div className="salon-shop-tab">
            {/* Services */}
            <h2 className="shop-service-title">Available Services:</h2>
            <div className="shop-carousel">
                
                {/* Left Arrow */}
                <button onClick={prevService}> <ChevronLeft size={32} /> </button>

                {/* Services Grid */}
                <div className="shop-grid">
                    {currentServices.map((service) => (
                        <SalonServiceCard
                            key={service.id}
                            service={service}
                            onClick={() => addServiceToCart(service, salon)}
                        />
                    ))}
                </div>

                {/* Right Arrow */}
                <button onClick={nextService}> <ChevronRight size={32} /> </button>
            </div>

            {/* Products */}
            <h2 className="shop-service-title">Available Products:</h2>
            <div className="shop-carousel">
                
                {/* Left Arrow */}
                <button onClick={prevProduct}> <ChevronLeft size={32} /> </button>

                {/* Reuse Services Grid */}
                <div className="shop-grid">
                    {currentProducts.map((product) => (
                        <SalonProductCard
                            key={product.id}
                            service={product}
                            onClick={() => addProductToCart(product)}
                        />
                    ))}
                </div>

                {/* Right Arrow */}
                <button onClick={nextProduct}> <ChevronRight size={32} /> </button>
            </div>

            <BookAppt
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                service={selectedService}
                salon={salon}
            />
        </div>
    );

}

export default SalonShopTab;