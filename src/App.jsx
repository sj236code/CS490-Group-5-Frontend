import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react'
import './App.css'
import Header from './components/layout/Header.jsx'
import LandingPage from './pages/LandingPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import FAQPage from './pages/FAQPage.jsx'
import SearchPage from './pages/SearchPage.jsx'
import SalonDetailsPage from './pages/SalonDetailsPage.jsx';
import SalonDashboard from './pages/SalonDashboard.jsx';

function App() {

  // Temp hardcode until endpoint created
  const [userType, setUserType] = useState("salon owner");

  console.log("API URL:", import.meta.env.VITE_API_URL);

  return (
    <>
      <Router>
        <Header userType={userType}/>
        <hr />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/salon" element={<SalonDetailsPage />} />
          <Route path="/salonDashboard" element={<SalonDashboard />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
