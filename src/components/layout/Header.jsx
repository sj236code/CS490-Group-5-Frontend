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

    // UserProfile with name, id, role, etc- result of userTypes endpoint
    const [userProfile, setUserProfile] = useState(null);

    // Is NavBar open
    const[navBar, setNavBar] = useState(false);

    // Is CartPanel open
    const[cartPanel, setCartPanel] = useState(false);

    const [ownerSalonId, setOwnerSalonId] = useState(null);

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

// Fetch user profile + salon id (for OWNER)
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
            const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/auth/user-type/${userId}`
            );
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
                const res2 = await fetch(
                `${import.meta.env.VITE_API_URL}/api/salons/get_salon/${ownerId}`
                );
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
            } catch (err) {
                console.error('Error fetching salons for owner:', err);
                setOwnerSalonId(null);
            }
            } else {
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

    // NavBar based on User Tag
    const whichNavBar = () => {
        if(userType === 'CUSTOMER'){
            return <CustomerNavBar onClose={toggleNavBar} onLogout={onLogout} userId={userId} user={userProfile}/>
        }
        else if(userType === 'EMPLOYEE'){
            return <EmployeeNavBar onClose={toggleNavBar} onLogout={onLogout} userId={userId}  user={userProfile}/>
        }
        else if(userType === 'OWNER'){
            return <SalonOwnerNavBar onClose={toggleNavBar} onLogout={onLogout} userId={userId} user={userProfile} salonId={ownerSalonId}/>
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
                {/* <div className="role-switch">
                    <button className={`role-btn ${userType === 'CUSTOMER' ? 'active' : ''}`} onClick={() => onPickRole('CUSTOMER')}>Customer</button>
                    <button className={`role-btn ${userType === 'OWNER' ? 'active' : ''}`} onClick={() => onPickRole('OWNER')}>Owner</button>
                    <button className={`role-btn ${userType === 'ADMIN' ? 'active' : ''}`} onClick={() => onPickRole('ADMIN')}>Admin</button>
                    <button className={`role-btn ${userType === 'EMPLOYEE' ? 'active' : ''}`} onClick={() => onPickRole('EMPLOYEE')}>Employee</button>
                </div> */}
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
