import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SalonCard from '../components/landing/SalonCard';

function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { results, query, city } = location.state || {}; // Passed from LandingSearchBar

    const [salons, setSalons] = useState([]); // Full list of salons fetched from backend
    const [searchQuery, setSearchQuery] = useState(query || ''); // Store search query text

    // Store Filter States
    const [typeFilter, setTypeFilter] = useState('Any Type');
    const [priceFilter, setPriceFilter] = useState('Any Price');
    const [ratingFilter, setRatingFilter] = useState('Any Rating');
    const [distanceFilter, setDistanceFilter] = useState('Any Distance');
    const [sortBy, setSortBy] = useState('Best Match');

    // Effects- multiple needed 

    // Fetches all salons from backend- run on mount
    useEffect(() => {
        fetchSalons();
    }, []);

    // Anytime any filters change
    useEffect(() => {
        fetchSalons();
    }, [searchQuery, typeFilter, priceFilter, ratingFilter, distanceFilter, sortBy]);

    // Fetch Salons from backend
    const fetchSalons = async () => {
        try{
            const final_search_query = new URLSearchParams();

            // Handle Filtering Backend-- endpoint handles it now
            // Remember to delete frontend filtering function
            if (searchQuery){
                final_search_query.append("q", searchQuery);
            }
            if (typeFilter !== "Any Type"){
                final_search_query.append("type", typeFilter);
            }
            if (priceFilter !== "Any Price"){
                const priceMap = { '$' : 1, '$$' : 2, '$$$' : 3};
                final_search_query.append("price", priceMap[priceFilter]);
                //filtered = filtered.filter(salon => salon.priceLevel === priceMap[priceFilter]);
            }
            if (ratingFilter !== "Any Rating"){
                final_search_query.append("rating", ratingFilter);
            }
            if (distanceFilter !== "Any Distance"){
                final_search_query.append("distance", distanceFilter)
            }
            if (city && city !== "All Cities"){
                final_search_query.append("location", city);
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salons/search?${final_search_query.toString()}`);

            console.log('Full URL being sent:', `${import.meta.env.VITE_API_URL}/api/salons/search?${final_search_query.toString()}`);

            const data = await response.json();

            console.log('Search Page: Salons Successfully Received.');
            console.log('Search Results: ', data);

            const calculatePriceLevel = (avgPrice) => {
                if (!avgPrice) return null;
                if (avgPrice < 50) return 1;
                if (avgPrice < 100) return 2;
                return 3;
            };

            const formattedSalons = data.salons.map((salon) => ({
                id: salon.id,
                title: salon.name,
                type: salon.type,
                address: `${salon.address}, ${salon.city}`,
                avgRating: salon.avg_rating,
                totalReviews: salon.total_reviews,
                priceLevel: salon.price_level || calculatePriceLevel(salon.avg_service_price), // Add helper
                distance: salon.distance_miles || 0
            }));

            setSalons(formattedSalons);

            console.log('Salons received: ', formattedSalons);
        }
        catch(err){
            console.error('Error fetching salons: ', err);
        }
    };

    // If clicked, navigate to SalonDetails page: to be implemented!
    const handleSalonClick = (salon) => {
        console.log(`Clicked on salon ID:`, salon);
        // Reuse code from SalonsSection on LandingPage
        navigate('/salon', {
            state: { salon }
        });
    };

    return (
        <div>
            <section className="search-page-section">
                {/* Search Bar */}
                <div className="search-page-search-bar">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by Salon Name, Service, or Location..."
                        className="search-input" 
                    />
                </div>

                {/* Filter Dropdowns */}
                <div className="filters-container">
                
                    {/* Type Dropdown */}
                    <div className='filter-group'>
                        <label className='filter-name'>Type</label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className='selected-filter'>
                                <option>Any Type</option>
                                <option>Hair</option>
                                <option>Nails</option>
                                <option>Waxing</option>
                                <option>Spa</option>
                                <option>Barber</option>
                        </select>
                    </div>
                
                    {/* Price Dropdowns */}
                    <div className='filter-group'>
                        <label className='filter-name'>Price</label>
                        <select
                            value={priceFilter}
                            onChange={(e) => setPriceFilter(e.target.value)}
                            className='selected-filter'>
                                <option>Any Price</option>
                                <option>$$$</option>
                                <option>$$</option>
                                <option>$</option>
                        </select>
                    </div>

                    {/* Rating Dropdowns */}
                    <div className='filter-group'>
                        <label className='filter-name'>Rating</label>
                        <select
                            value={ratingFilter}
                            onChange={(e) => setRatingFilter(e.target.value)}
                            className='selected-filter'>
                                <option>Any Rating</option>
                                <option>4.5</option>
                                <option>4.0</option>
                                <option>3.5</option>
                                <option>3.0</option>
                        </select>
                    </div>

                    {/* Distance Dropdowns */}
                    <div className='filter-group'>
                        <label className='filter-name'>Distance</label>
                        <select
                            value={distanceFilter}
                            onChange={(e) => setDistanceFilter(e.target.value)}
                            className='selected-filter'>
                                <option>Any Distance</option>
                                <option>5</option>
                                <option>10</option>
                                <option>25</option>
                                <option>50</option>
                        </select>
                    </div>
                </div>

                {/* Salon Card Grid -- Reuse from LandingPage Grid */}
                <div className='salon-grid'>
                    {salons.map((salon) => (
                        <SalonCard 
                            key={salon.id}
                            title={salon.title}
                            type={salon.type}
                            address={salon.address}
                            avgRating={salon.avgRating}
                            totalReviews={salon.totalReviews}
                            onClick={() => handleSalonClick(salon)} 
                        />
                    ))}
                </div>

                {/* No Results Found */}
                {salons.length === 0 && (
                    <div className="no-results">
                        <p>No salons found matching the criteria given. Try Again.</p>
                        <button
                            onClick={() => {
                                setTypeFilter('Any Type');
                                setPriceFilter('Any Price');
                                setRatingFilter('Any Rating');
                                setDistanceFilter('Any Distance');
                                setSearchQuery('');
                            }}
                            className='clear-filters'
                        >Clear Filters</button>
                    </div>
                )}

            </section>
        </div>
    );
}

export default SearchPage;
