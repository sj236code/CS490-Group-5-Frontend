import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react'
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
  const [userType, setUserType] = useState(null);
  console.log("API URL:", import.meta.env.VITE_API_URL);

  useEffect(() => {
    // Temporarily Hardcode for testing -> Change when Merge with Auth Branch
    // 1 -> Customer
    // 2 -> Admin (WIP)
    // 4 -> Salon Owner
    // 6 -> Employee
    const userId = 4;

    fetch(`${import.meta.env.VITE_API_URL}/api/auth/user-type/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Response from /user-type:", data);
        if (data.status === "success"){
          setUserType(data.role);
        }
        else{
          setUserType("user");
        }
      })
  },[]);

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
