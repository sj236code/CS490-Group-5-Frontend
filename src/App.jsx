import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react'
import './App.css'
import './components/Common.css'
import Header from './components/layout/Header.jsx'
import LandingPage from './pages/LandingPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import FAQPage from './pages/FAQPage.jsx'
import SearchPage from './pages/SearchPage.jsx'
import SalonDashboard from './pages/SalonDashboard.jsx';
import SalonDetailsPage from './pages/SalonDetailsPage.jsx'
import SignIn from './pages/Sign_in/Sign_in.jsx'
import ForgotPassword from './pages/Sign_in/Forgot_pass.jsx'
import VerifyOTP from './pages/Sign_in/Verify_otp.jsx';
import SignUp from './pages/Sign_up/Sign_up.jsx';
import RegisterSalon from './pages/Sign_up/Salon_registration.jsx';
import RegisterSalonSuccess from './pages/Sign_up/Salon_registration_success.jsx'
import EmployeeRegistration from './pages/Sign_up/Employee_registration.jsx';
import EmployeeRegistrationSuccess from './pages/Sign_up/Employee_registration_success.jsx';
import ResetPassword from './pages/Sign_in/Reset_pass.jsx';

// Firebase
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

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
    const userId = 1;

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
      <Header userType={userType} />
      <hr />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
    
        {/* Salon / Employee */}
        <Route path="/register-salon" element={<RegisterSalon />} />
        <Route path="/register-salon-success" element={<RegisterSalonSuccess />} />
        <Route path="/employee-registration" element={<EmployeeRegistration />} />
        <Route path="/employee-registration-success" element={<EmployeeRegistrationSuccess />} />
        <Route path="/reset-password" element={<ResetPassword />} />
    
        <Route path="/search" element={<SearchPage />} />
        <Route path="/salon" element={<SalonDetailsPage />} />
        <Route path="/salonDashboard" element={<SalonDashboard />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
      </Routes>
    </>
  );
}

export default App;
