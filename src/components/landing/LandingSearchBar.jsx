import { Search, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingSearchBar({userType}) {

    const [wordEntered, setWordEntered] = useState(""); // User Search Query
    const [selectedCity, setSelectedCity] = useState(null); // Default City 
    const [showCityDropdown, setShowCityDropdown] = useState(false); // Whether city dropdown is visible
    const [showResults, setShowResults] = useState(false); // Whether search results are visible
    const [searchResults, setSearchResults] = useState([]) // Stores filtered search results
    const [cities, setCities] = useState([]); // Cities of Valid Salons
    const [userLocation, setUserLocation] = useState([]); // User Location

    const navigate = useNavigate();

    // Runs once component mounts
    useEffect(() => {
        fetchCities();
    }, []);

    const fetchCities = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salons/cities`);
            const data = await response.json();
            console.log('Cities Successfully Received.', data.cities.length);
            setCities(data.cities);
        }
        catch (err) {
            console.error('Error fetching cities: ', err);
        }
    };

    // Everytime user types in search bar
    const handleSearchQueryChange = async (event) => {
        const searchWord = event.target.value;
        setWordEntered(searchWord);

        if (showCityDropdown) {
            setShowCityDropdown(false);
        }

        if (searchWord.trim()) {
            try {
                // Build URL with query parameters
                let url = `${import.meta.env.VITE_API_URL}/api/autocomplete?q=${encodeURIComponent(searchWord)}`;

                if (selectedCity) {
                    url += `&city=${encodeURIComponent(selectedCity)}`;
                }

                console.log('url:', url);

                const response = await fetch(url);
                const data = await response.json();

                console.log('Autocomplete results received:', data);

                const formattedResults = data.map(item => ({
                    value: item.name || item.value,
                    type: item.type,
                    id: item.id
                }));

                setSearchResults(formattedResults);
                setShowResults(true);
            }
            catch (err) {
                console.error('Error fetching autocomplete results:', err);
                setSearchResults([]);
                setShowResults(false);
            }
        }
        else {
            // If input is empty, clear results and hide dropdown
            setSearchResults([]);
            setShowResults(false);
        }
    };

    // When the user clicks on city dropdown
    const handleCitySelect = (city) => {
        setSelectedCity(city);
        setShowCityDropdown(false);
    };

    // When user clicks search, traverse to SearchPage
    const handleSearch = () => {
        if (!wordEntered.trim()) return;

        const searchLocation = selectedCity || 'All Cities';
        console.log('Searching for:', wordEntered, 'in', searchLocation);
        setShowResults(false);

        navigate('/search', {
            state: {
                results: searchResults,
                cities: cities,
                query: wordEntered,
                city: searchLocation,
                userType
            }
        });
    };

    const handleResultClick = (result) => {
        setShowResults(false);
        setWordEntered(result.value)
    };

    return (
        <>
            <div className="search-bar-wrapper">
                {/* Entire Search Bar */}
                <div className="landing-search-bar">
                    {/* Left Half of the SearchBar: Search Salon & Service */}
                    <div className="search-section">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Service, salon, ..."
                            value={wordEntered}
                            onChange={handleSearchQueryChange}
                            onFocus={() => {
                                if (wordEntered) setShowResults(true);
                                setShowCityDropdown(false); 
                            }}
                        />
                    </div>

                    <div className="divider"></div>

                    {/* Right Half of the SearchBar: Cities of VALID Salons */}
                    <div className="city-wrapper">
                        <div className="city-section">
                            <MapPin className="location-icon" />
                            <div
                                className="location-dropdown"
                                onClick={() => {
                                    setShowCityDropdown(prev => !prev);
                                    setSearchResults(false);
                                }}>
                                <span className='location-text'>{selectedCity || 'All Cities'}</span>
                            </div>
                        </div>

                        {/* Show City Dropdown */}
                        {showCityDropdown && (
                            <div className="city-dropdown">
                                <ul className="city-list">
                                    {/* All Cities => selectedCity is null */}
                                    <li
                                        className={`city-item ${selectedCity === null ? 'selected' : ''}`}
                                        onClick={() => handleCitySelect(null)}>
                                        <MapPin size={18} className="city-icon" />
                                        All Cities
                                    </li>
                                    {/* selectedCity */}
                                    {cities.map((city, index) => (
                                        <li
                                            key={index}
                                            className={`city-item ${city === selectedCity ? 'selected' : ''}`}
                                            onClick={() => handleCitySelect(city)}
                                        >
                                            <MapPin size={18} className="city-icon" />
                                            {city}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Search Button */}
                    <button onClick={handleSearch} className="search-button">
                        <Search className='search-button' />
                    </button>
                </div>

                {/* Show Search Results */}
                {showResults && searchResults.length > 0 && (
                    <ul className='results-list'>
                        {searchResults.map((item, index) => (
                            <li
                                key={index}
                                className="result-item"
                                onClick={() => handleResultClick(item)}>
                                <div className="result-content">
                                    <strong>{item.value}</strong>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}

export default LandingSearchBar