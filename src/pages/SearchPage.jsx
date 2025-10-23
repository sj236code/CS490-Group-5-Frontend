import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SalonCard from '../components/landing/SalonCard';

function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { results, query, city } = location.state || {}; // Passed from LandingSearchBar

    const [salons, setSalons] = useState([]); // Full list of salons fetched from backend
    const [filteredSalons, setFilteredSalons] = useState([]); // Updated with filters
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
        applyFiltersAndSort();
    }, [salons, typeFilter, priceFilter, ratingFilter, distanceFilter, sortBy, searchQuery]);

    // Fetch Salons from backend
    const fetchSalons = async () => {
        try{
            const response = await fetch('/api/salons/search');

            const data = await response.json();

            console.log('Search Page: Salons Successfully Received.');

            const formattedSalons = data.salons.map((salon) => ({
                id: salon.id,
                title: salon.name,
                type: salon.type,
                address: `${salon.address}, ${salon.city}`,
                avgRating: salon.avg_rating,
                totalReviews: salon.total_reviews,
                priceLevel: salon.price_level,
                distance: salon.distance || 0
            }));

            setSalons(formattedSalons);
        }
        catch(err){
            console.error('Error fetching salons: ', err);
        }
    };

    // Applies active filters and sorts 
    const applyFiltersAndSort = () => {
        let filtered = [...salons];

        // Filter salons based on search query
        if(searchQuery){
            filtered = filtered.filter(salon =>
                salon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                salon.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                salon.address.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by Type
        if (typeFilter !== 'Any Type'){
            filtered = filtered.filter(salon => salon.type === typeFilter);
        }

        // Filter by Price
        if (priceFilter !== 'Any Price'){
            const priceMap = { '$' : 1, '$$' : 2, '$$$' : 3};
            filtered = filtered.filter(salon => salon.priceLevel === priceMap[priceFilter]);
        }

        // Filter by Rating
        if (ratingFilter !== 'Any Rating'){
            const minRating = parseFloat(ratingFilter);
            filtered = filtered.filter(salon => salon.avgRating >= minRating);
        }

        // Filter by Distance
        if (distanceFilter !== 'Any Distance'){
            const maxDistance = parseFloat(distanceFilter);
            filtered = filtered.filter(salon => salon.distance <= maxDistance);
        }

        // Handle 'Sort By' Option
        switch(sortBy){
            case 'Highest Rated':
                // Sort by rating
                filtered.sort((a,b) => b.avgRating -a.avgRating); // b-a is desc
                break;
            case 'Most Reviews':
                // Sort by number of reviews
                filtered.sort((a,b) => b.totalReviews - a.totalReviews);
                break;
            case 'Price: Low to High':
                // Sort by price level: l -> h
                filtered.sort((a,b) => a.priceLevel -b.priceLevel);
                break;
            case 'Price: High to Low':
                // Sort by price level: h -> l
                filtered.sort((a,b) => b.priceLevel - a.priceLevel);
                break;
            default:
                // 'Best Match'
                break;
        }

        setFilteredSalons(filtered);
        
    }

    // If clicked, navigate to SalonDetails page: to be implemented!
    const handleSalonClick = (salonId) => {
        console.log(`Clicked on salon ID: ${salonId}`);
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
                    {filteredSalons.map((salon) => (
                        <SalonCard 
                            key={salon.id}
                            title={salon.title}
                            type={salon.type}
                            avgRating={salon.avgRating}
                            totalReviews={salon.totalReviews}
                            onClick={() => handleSalonClick(salon.id)} 
                        />
                    ))};
                </div>

                {/* No Results Found */}
                {filteredSalons.length === 0 && (
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
