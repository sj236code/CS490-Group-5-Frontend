import React from 'react';
import { useLocation } from 'react-router-dom';

function SearchPage() {
  const location = useLocation();
  const { results, query, city } = location.state || {}; // Passed from LandingSearchBar

  return (
    <div style={{ padding: '20px' }}>
      <h1>Search Page Test</h1>
      <p><strong>Query:</strong> {query || 'No query'}</p>
      <p><strong>City:</strong> {city || 'All Cities'}</p>

      <h2>Results:</h2>
      {results && results.length > 0 ? (
        <ul>
          {results.map((item, index) => (
            <li key={index}>
              {item.value} ({item.type || 'N/A'})
            </li>
          ))}
        </ul>
      ) : (
        <p>No results passed.</p>
      )}
    </div>
  );
}

export default SearchPage;
