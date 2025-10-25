import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react'
import './App.css'
import Header from './components/layout/Header.jsx'
import LandingPage from './pages/LandingPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import FAQPage from './pages/FAQPage.jsx'
import SearchPage from './pages/SearchPage.jsx'
import SalonDetailsPage from './pages/SalonDetailsPage.jsx'
import SignIn from './pages/Sign_in/Sign_in.jsx'

function App() {
  // Temp hardcode until endpoint created
  const [userType, setUserType] = useState("customer");
  
  return (
    <>
      <Router>
        <Header userType={userType}/>
        <hr />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/salon" element={<SalonDetailsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
