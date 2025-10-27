import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react'
import './App.css'
import './components/Common.css'
import Header from './components/layout/Header.jsx'
import LandingPage from './pages/LandingPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import FAQPage from './pages/FAQPage.jsx'
import SearchPage from './pages/SearchPage.jsx'
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

function App() {
  // Temp hardcode until endpoint created
  const [userType, setUserType] = useState("customer");
  
  return (
    <>
      <Header userType={userType}/>
      <hr />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/salon" element={<SalonDetailsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/register-salon" element={<RegisterSalon />} />
        <Route path="/register-salon-success" element={<RegisterSalonSuccess />} />
        <Route path="/employee-registration" element={<EmployeeRegistration />} />
        <Route path="/employee-registration-success" element={<EmployeeRegistrationSuccess />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </>
  )
}

export default App
