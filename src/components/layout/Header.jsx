import jade_logo from '../../assets/jade_logo.png';
import MenuButton from './MenuButton.jsx';
import CartButton from './CartButton.jsx';
import {useState , useEffect} from 'react';
import NavBar from './NavBar'; // Unregistered User Nav Bar
import CustomerNavBar from './CustomerNavBar';
import EmployeeNavBar from './EmployeeNavBar';
import SalonOwnerNavBar from './SalonOwnerNavBar';
import {useNavigate} from 'react-router-dom';
import CartPanel from './CartPanel'; // Unregistered User Nav Bar
import CustomerCartPanel from './CustomerCartPanel';
import EmployeeCartPanel from './EmployeeCartPanel';
import SalonOwnerCartPanel from './SalonOwnerCartPanel';
import AdminCartPanel from './AdminCartPanel';
import LoginButton from './LoginButton.jsx';
import AdminNavBar from './AdminNavBar.jsx';


function Header({userType, userId, onPickRole, onCycleRole, onLogout }){

    // Is NavBar open
    const[navBar, setNavBar] = useState(false);

    // Is CartPanel open
    const[cartPanel, setCartPanel] = useState(false);

    const navigate = useNavigate();

    // Route to Landing Page
    const navigateToLanding = () => {
        navigate('/');
    }

    // Route to Sign In/ Sign Out Page
    const navigateToLogin = () => {
        navigate('/signup');
    }

    // Toggle NavBar
    const toggleNavBar = () => {
        setNavBar(prev => !prev);
    };

    // Toggle CartPanel
    const toggleCartPanel = () => {
        setCartPanel(prev => !prev);
    }

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user-type/${userId}`);
                const data = await res.json();
                if (!res.ok) {
                    console.error("Failed to fetch user profile:", data);
                    return;
                }
                console.log("User profile:", data);
                setUserProfile(data);
            } 
            catch (err) {
                console.error("Error fetching user profile:", err);
            }
        }
        fetchUserProfile();
    }, [userId, userType]);

    // NavBar based on User Tag
    const whichNavBar = () => {
        if(userType === 'CUSTOMER'){
            return <CustomerNavBar onClose={toggleNavBar} onLogout={onLogout} userId={userId} user={userProfile}/>
        }
        else if(userType === 'EMPLOYEE'){
            return <EmployeeNavBar onClose={toggleNavBar} onLogout={onLogout} userId={userId}  user={userProfile}/>
        }
        else if(userType === 'OWNER'){
            return <SalonOwnerNavBar onClose={toggleNavBar} onLogout={onLogout} userId={userId} user={userProfile}/>
        }
        else if(userType === 'ADMIN'){
            return <AdminNavBar onClose={toggleNavBar} onLogout={onLogout} user={userProfile}/>
        }
        else{
            return <NavBar onClose={toggleNavBar} />
        }
    }

    const whichCartPanel = () => {
        if(userType === 'CUSTOMER'){
            return <CustomerCartPanel onClose={toggleCartPanel} />
        }
        else if(userType === 'EMPLOYEE'){
            return <EmployeeCartPanel onClose={toggleCartPanel} userId={userId}/>
        }
        else if(userType === 'OWNER'){
            return <SalonOwnerCartPanel onClose={toggleCartPanel} userId={userId}/>
        }
        else if(userType === 'ADMIN'){
            return <AdminCartPanel onClose={toggleCartPanel} userId={userId}/>
        }
        else{
            return <CartPanel onClose={toggleCartPanel} />
        }
    }

    useEffect(() => {
        console.log(`Header loaded- UserId: ${userId}, UserType: ${userType}`);
    }, [userId, userType]);

    return(
        <>
            <header className='header'>
                {/* If MenuButton clicked, open NavBar */}
                <MenuButton onClick={toggleNavBar} /> 

                {/* simple role switch pills */}
                <div className="role-switch">
                    <button className={`role-btn ${userType === 'CUSTOMER' ? 'active' : ''}`} onClick={() => onPickRole('CUSTOMER')}>Customer</button>
                    <button className={`role-btn ${userType === 'OWNER' ? 'active' : ''}`} onClick={() => onPickRole('OWNER')}>Owner</button>
                    <button className={`role-btn ${userType === 'ADMIN' ? 'active' : ''}`} onClick={() => onPickRole('ADMIN')}>Admin</button>
                    <button className={`role-btn ${userType === 'EMPLOYEE' ? 'active' : ''}`} onClick={() => onPickRole('EMPLOYEE')}>Employee</button>
                </div>
                {/* Logo (todo: if clicked, return back to LandingPage) */}
                <div className='logo' onClick={navigateToLanding} style={{cursor: 'pointer'}}>
                    <img src={jade_logo} className="logo-img" />    
                </div>
                {/* Sign In/ Sign Out Button */}
                <div>
                    <LoginButton onClick={navigateToLogin} style={{cursor: 'pointer'}}/>
                </div>
                {/* If CartButton clicked, open CartPanel */}
                <CartButton onClick={toggleCartPanel} />
                
            </header>

            {/* NavBar implementation: Open & Close */}
            {navBar && whichNavBar()}

            {/* CartPanel implementation: Open & Close */}
            {cartPanel && whichCartPanel()}
        </>
    );
}

export default Header
