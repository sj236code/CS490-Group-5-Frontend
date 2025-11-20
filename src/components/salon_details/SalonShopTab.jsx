import { useState, useEffect } from 'react';
import {Star, X, ChevronLeft, ChevronRight} from 'lucide-react';
import SalonServiceCard from './SalonServiceCard';
import SalonProductCard from './SalonProductCard';
import BookAppt from './BookAppt';
import PurchaseProduct from './PurchaseProduct';

function ErrorModal({ message, onClose }) {
    if (!message) return null;

    return (
        <div className="error-modal-backdrop" onClick={onClose}>
            <div className="error-modal" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="error-modal-close" onClick={onClose}>
                    <X size={18} />
                </button>

                <h3 className="error-modal-title">Heads up</h3>
                <p className="error-modal-message">{message}</p>

                <button type="button" className="error-modal-ok" onClick={onClose}>OK</button>
            </div>
        </div>
    );
}

function SalonShopTab({salon, userType, user}){

    const customerId = user?.profile_id ?? '-';

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

    // Purchase Product Modal
    const [isPurchaseProductModalOpen, setPurchaseProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [errorMessage, setErrorMessage] = useState("");

    // Load Services & Products when component mounts
    useEffect(() => {
        if (salon?.id){
            fetchServices();
            fetchProducts();
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

    // console.log("SalonShopTab userType:", userType, typeof userType);
    const userRole = user?.role ?? '-';
    console.log("SALONDETAILS USERTYPE: ", userRole);

    const addServiceToCart = (service, salon) => {
        if(userRole != "CUSTOMER"){
            setErrorMessage("Sign in as a customer to continue with checkout.");
            return;
        }
        setErrorMessage("");
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
        if(userRole != "CUSTOMER"){
            setErrorMessage("Sign in as a customer to continue with checkout.");
            return;
        }
        setErrorMessage("");
        console.log("PurchaseProduct Modal opening for: ", product);
        setSelectedProduct(product);
        setPurchaseProductModalOpen(true);
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
            <ErrorModal message={errorMessage} onClose={() => setErrorMessage("")} />
            
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
                            product={product}
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
                customerId={customerId}
            />

            <PurchaseProduct
                isOpen={isPurchaseProductModalOpen}
                onClose={() => setPurchaseProductModalOpen(false)}
                product={selectedProduct}
                salon={salon}
                customerId={customerId}
            />
        </div>
    );

}

export default SalonShopTab;