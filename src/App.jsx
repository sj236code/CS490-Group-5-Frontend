import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
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
import AdminDashboard from './pages/AdminDashboard.jsx';
import MyAppointments from "./pages/MyAppointments";
import Checkout from './pages/checkout&payment/Checkout.jsx';
import CustomerLoyalty from './pages/CustomerLoyalty.jsx';
import MyWallet from './pages/MyWallet.jsx';
import EmployeeAvailability from "./pages/EmployeeAvailability";
import EmployeeAppointments from "./pages/EmployeeAppointments.jsx";
import UserGallery from "./pages/UserGallery.jsx";
import SalonSettings from "./pages/SalonSettings.jsx";
import SalonPayments from "./pages/SalonPayments.jsx";

// Firebase
import PaymentConfirmation from './pages/checkout&payment/PaymentConfirmation.jsx';

function parseJwt(token) {
  try {
    const base = token.split('.')[1];
    const json = atob(base.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

function App() {

  // Temp hardcode until endpoint created
  const [userType, setUserType] = useState(null);
  const [userId, setUserId] = useState(null);
  console.log("API URL:", import.meta.env.VITE_API_URL);

  const navigate = useNavigate();

  // On first load, hydrate from token from present
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const payload = parseJwt(token);
    if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
      ['token','user_id','role','email'].forEach(k => localStorage.removeItem(k));
      navigate('/signin');
      return;
    }

    setUserId(payload.user_id ?? null);
    setUserType(payload.role ?? null);
  }, [navigate]);

  // Verify role with backend
  useEffect(() => {
    if (!userId) return;
    fetch(`${import.meta.env.VITE_API_URL}/api/auth/user-type/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.status === 'success' && data.role) {
          setUserType(data.role);
        }
      })
      .catch(() => {});
  }, [userId]);

  const logout = () => {
    ['token', 'user_id', 'role', 'email'].forEach(k => localStorage.removeItem(k));
    setUserId(null);
    setUserType(null);
    console.log('User logged out successfully.');
    console.log('userId:', userId, '| userType:', userType);
    navigate('/');
  }

  return (
    <>
      <Header
        userType={userType}
        userId={userId}
        onPickRole={() => {}}
        onCycleRole={() => {}}
        onLogout={logout}
      />
      <hr />
      <Routes>
        {/* */}
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

        {/* Salon Owner Nav Bar Routes */}
        <Route path="/salonDashboard" element={<SalonDashboard />} />
        <Route path="/salonSettings" element={<SalonSettings />} />
        <Route path="/salonPayments" element={<SalonPayments />} />

        {/* Admin Nav Bar Routes */}
        <Route path="/adminDashboard" element={<AdminDashboard />} />

        {/* Customer Nav Bar Routes */}
        <Route path="/customerLoyalty" element={<CustomerLoyalty />} />
        <Route path="/myWallet" element={<MyWallet />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/userGallery" element={<UserGallery />} />

        {/* Employee Nav Bar Routes */}
        <Route path="/employee-appointments" element={<EmployeeAppointments />} />
        <Route path="/employee-availability" element={<EmployeeAvailability />} />

        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />

        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment-confirmation" element={<PaymentConfirmation />} />

        
      </Routes>
    </>
  );
}

export default App;
