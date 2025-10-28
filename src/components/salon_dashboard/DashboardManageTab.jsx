import { useState, useEffect } from 'react';
import {Star, ChevronLeft, ChevronRight} from 'lucide-react';
import DashboardServiceCard from './DashboardServiceCard';
import DashboardProductCard from './DashboardProductCard';
import AddServiceModal from './AddServiceModal';
import AddProductModal from './AddProductModal';
import EditServiceModal from './EditServiceModal';
import EditProductModal from './EditProductModal';


function DashboardManageTab({salon}){

    // Service Section
    const [services, setServices] = useState([]);
    const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
    const servicesPerPage = 3;

    // Product Section
    const [products, setProducts] = useState([]);
    const [currentProductIndex, setCurrentProductIndex] = useState(0);
    const productsPerPage = 3;

    // Adding Service & Product
    const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

    // Edit Service & Product
    const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);


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
            console.error("Unable to fetch products. Error: ", err);
        }
    };

    // Handle Modal Open & Close
    const handleAddService = () => {
        setIsAddServiceModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddServiceModalOpen(false);
        setIsAddProductModalOpen(false);
        setIsEditServiceModalOpen(false);
        setSelectedService(null);
        setIsEditProductModalOpen(false);
        setSelectedProduct(null);
    };

    const handleAddProduct = () => {
        setIsAddProductModalOpen(true);
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

    const currentProducts = products.slice(currentProductIndex, currentProductIndex + productsPerPage);

    // Edit Service
    const handleEditService = (service) => {
        setSelectedService(service);
        console.log("Updated service: ", service);
        setIsEditServiceModalOpen(true);
    };

    // Edit Product
    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        console.log("Updated product: ", product);
        setIsEditProductModalOpen(true);
    };

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '50rem', marginBottom: '1rem' }}>
                <h2 className="shop-service-title">Available Services:</h2>
                <button onClick={handleAddService} className="add-service-btn">
                        Add Service
                </button>
            </div>

            <div className="shop-carousel">
                
                {/* Left Arrow */}
                <button onClick={prevService}> <ChevronLeft size={32} /> </button>

                {/* Services Grid */}
                <div className="shop-grid">
                    {currentServices.map((service) => (
                        <DashboardServiceCard
                            key={service.id}
                            service={service}
                            onClick={() => handleEditService(service)}
                        />
                    ))}
                </div>

                {/* Right Arrow */}
                <button onClick={nextService}> <ChevronRight size={32} /> </button>
            </div>

            {/* Products */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '50rem', marginBottom: '1rem' }}>
                <h2 className="shop-service-title">Available Products:</h2>
                <button onClick={handleAddProduct} className="add-service-btn">
                        Add Product
                </button>
            </div>

            <div className="shop-carousel">
                
                {/* Left Arrow */}
                <button onClick={prevProduct}> <ChevronLeft size={32} /> </button>

                {/* Reuse Services Grid */}
                <div className="shop-grid">
                    {currentProducts.map((product) => (
                        <DashboardProductCard
                            key={product.id}
                            product={product}
                            onClick={() => handleEditProduct(product)}
                        />
                    ))}
                </div>

                {/* Right Arrow */}
                <button onClick={nextProduct}> <ChevronRight size={32} /> </button>
            </div>

            {/* AddService Modal */}
            <AddServiceModal   
                isOpen={isAddServiceModalOpen}
                onClose={handleCloseModal}
                salonId={salon?.id}
                onServiceAdded={fetchServices}
            />

            {/* AddProduct Modal */}
            <AddProductModal
                isOpen={isAddProductModalOpen}
                onClose={handleCloseModal}
                salonId={salon?.id}
                onProductAdded={fetchProducts}
            />

            {/* Edit Service Modal */}
            <EditServiceModal
                isOpen={isEditServiceModalOpen}
                onClose={handleCloseModal}
                service={selectedService}
                onServiceUpdated={fetchServices}
            />

            {/* Edit Product Modal */}
            <EditProductModal
                isOpen={isEditProductModalOpen}
                onClose={handleCloseModal}
                product={selectedProduct}
                onServiceUpdated={fetchProducts}
            />

        </div>
    );

}

export default DashboardManageTab;