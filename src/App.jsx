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
import EmployeePaymentPortal from "./pages/EmployeePaymentPortal.jsx";
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
  const [userProfile, setUserProfile] = useState(null);
  const [ownerSalonId, setOwnerSalonId] = useState(null);

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

  // For salon details page, pass through user profile:
  useEffect(() => {
    // If not logged in, clear profile/salon
    if (!userId) {
      setUserProfile(null);
      setOwnerSalonId(null);
      return;
    }

    const fetchUserAndSalon = async () => {
    try {
      // get core user profile
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user-type/${userId}`);
      const data = await res.json();

      if (!res.ok) {
        console.error('Failed to fetch user profile:', data);
        setUserProfile(null);
        setOwnerSalonId(null);
        return;
      }

      console.log('User profile:', data);
      setUserProfile(data);

      // 2) if OWNER, fetch the salon id using new endpoint
      if (data.role === 'OWNER' && data.profile_id) {
      const ownerId = data.profile_id; // SalonOwners.id

        try {
          const res2 = await fetch(`${import.meta.env.VITE_API_URL}/api/salons/get_salon/${ownerId}`);
          const data2 = await res2.json();

          if (!res2.ok) {
            console.error('Failed to fetch salons for owner:', data2);
            setOwnerSalonId(null);
            return;
          }

          console.log('Salons for owner:', data2);

          // Endpoint returns: { salon_owner_id, salon_ids: [..] }
          if (Array.isArray(data2.salon_ids) && data2.salon_ids.length > 0) {
            setOwnerSalonId(data2.salon_ids[0]); // use first salon for now
          } 
          else {
            setOwnerSalonId(null);
          }
        } 
        catch (err) {
          console.error('Error fetching salons for owner:', err);
          setOwnerSalonId(null);
        }
      } 
      else {
        // Not an owner → clear ownerSalonId
        setOwnerSalonId(null);
      }
    } 
    catch (err) {
      console.error('Error fetching user profile:', err);
      setUserProfile(null);
      setOwnerSalonId(null);
    }
  };

    fetchUserAndSalon();
  }, [userId]);

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
        {/* Landing */}
        <Route path="/" element={<LandingPage userType={userType} userId={userId} user={userProfile}/>} />

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
        <Route path="/salon" element={<SalonDetailsPage userType={userType} user={userProfile}/>} />

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
        <Route path="/employee-payment-portal" element={<EmployeePaymentPortal />} />

        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />

        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment-confirmation" element={<PaymentConfirmation />} />

        
      </Routes>
    </>
  );
}

export default App;
