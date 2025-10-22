import { Search, MapPin } from 'lucide-react';
import { useState } from 'react';

function LandingSearchBar(){

    const[wordEntered, setWordEntered] = useState(""); // User Search Query
    const[selectedCity, setSelectedCity] = useState("Newark, NJ"); // Default City 
    const[showCityDropdown, setShowCityDropdown] = useState(false); // Whether city dropdown is visible
    const[showResults, setShowResults] = useState(false); // Whether search results are visible
    const[searchResults, setSearchResults] = useState([]) // Stores filtered search results

    // Hardcoded cities options-- to be changed with api call- Ricardo 
    const cities = [
        'Newark, NJ',
        'New York, NY',
        'Philadelphia, PA',
        'Hoboken, NJ',
        'Paterson, NJ',
        'Elizabeth, NJ'
    ]

    // Everytime user types in search bar
    const handleSearchQueryChange = (event) =>{
        const searchWord = event.target.value;
        setWordEntered(searchWord);

        // MOCK SEARCH LOGIC - Replace this with your actual API call or search function
        if (searchWord.trim()) { // Only search if there's actual text (not just spaces)
            // Create mock results - in production, this would come from your database/API
            const mockResults = [
                { value: 'Hair Salon', type: 'service' },
                { value: 'Nail Salon', type: 'service' },
                { value: 'Spa & Massage', type: 'service' },
                { value: 'Barbershop', type: 'service' },
                { value: 'Beauty Salon', type: 'service' }
            ].filter(item => 
                // Filter results to only show items that contain the search text
                item.searchWord.toLowerCase().includes(searchWord.toLowerCase())
            ).slice(0, 5); // Limit to maximum 5 results
            
            // Update the search results state
            setSearchResults(mockResults);
            // Show the results dropdown
            setShowResults(true);
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

    // When user clicks search
    const handleSearch = () => {
        console.log('Searching for: ', wordEntered, 'in', selectedCity);
        setShowResults(false);
    };

    const handleResultClick = (result) => {
        setShowResults(false);
        console.log('Clicked the following Result: ', result);
    };

    // Depreciated feature- optional: find another way 
    // When user presses enter to search
    // const handleKeyPress=(e) => {
    //     if(e.key == 'Enter'){
    //         handleSearch();
    //     }
    // };

    return(
        <>
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
                        onFocus={() => wordEntered && setShowResults(true)}
                    />
                </div>

                <div className="divider"></div>

                {/* Right Half of the SearchBar: Cities of VALID Salons */}
                <div className="city-wrapper">
                    <div className="city-section">
                        <MapPin className="location-icon" />
                        <div 
                            className="location-dropdown" 
                            onClick={() => setShowCityDropdown(!showCityDropdown)}>
                            <span className='location-text'>{selectedCity}</span>
                        </div>
                    </div>

                    {/* Show City Dropdown */}
                    {showCityDropdown && (
                        <div className="city-dropdown">
                            <ul className="city-list">
                            {cities.map((city, index) => (
                                <li
                                    key={index}
                                    // Add 'selected' class if this is the currently selected city
                                    className={`city-item ${city === selectedCity ? 'selected' : ''}`}
                                    onClick={() => handleCitySelect(city)} // Handle city selection
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
        </>
    );

}

export default LandingSearchBar