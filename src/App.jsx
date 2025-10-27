import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/layout/Header.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import FAQPage from "./pages/FAQPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import SalonDetailsPage from "./pages/SalonDetailsPage.jsx";
import SignIn from "./pages/Sign_in/Sign_in.jsx";
import ForgotPassword from "./pages/Sign_in/Forgot_pass.jsx";
import VerifyOTP from "./pages/Sign_in/Verify_otp.jsx";
import SignUp from "./pages/Sign_up/Sign_up.jsx";
import RegisterSalon from "./pages/Sign_up/Salon_registration.jsx";
import RegisterSalonSuccess from "./pages/Sign_up/Salon_registration_success.jsx";
import EmployeeRegistration from "./pages/Sign_up/Employee_registration.jsx";

// Firebase
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [userType, setUserType] = useState("customer");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Header userType={userType} />
      <hr />
      <Routes>
        {/* If user is signed in, show LandingPage; else show SignUp */}
        <Route
          path="/"
          element={user ? <LandingPage user={user} /> : <Navigate to="/signup" replace />}
        />

        {/* Auth */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        {/* Salon / Employee */}
        <Route path="/register-salon" element={<RegisterSalon />} />
        <Route path="/register-salon-success" element={<RegisterSalonSuccess />} />
        <Route path="/employee-registration" element={<EmployeeRegistration />} />

        {/* Other */}
        <Route path="/search" element={<SearchPage />} />
        <Route path="/salon" element={<SalonDetailsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
      </Routes>

    </>
  );
}

export default App;
