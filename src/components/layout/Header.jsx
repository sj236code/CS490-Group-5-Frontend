import jade_logo from '../../assets/jade_logo.png';
import MenuButton from './MenuButton.jsx';
import CartButton from './CartButton.jsx';
import {useState , useEffect} from 'react';
<<<<<<< HEAD
import NavBar from './NavBar';
=======
import NavBar from './NavBar'; // Unregistered User Nav Bar
import CustomerNavBar from './CustomerNavBar';
import EmployeeNavBar from './EmployeeNavBar';
import SalonOwnerNavBar from './SalonOwnerNavBar';
import {useNavigate} from 'react-router-dom';
>>>>>>> origin/sign_in/Ethan
import CartPanel from './CartPanel';


function Header({userType}){

    // Is NavBar open
    const[navBar, setNavBar] = useState(false);

    // Is CartPanel open
    const[cartPanel, setCartPanel] = useState(false);

<<<<<<< HEAD
=======
    const navigate = useNavigate();

    // Route to Landing Page
    const navigateToLanding = () => {
        navigate('/');
    }

>>>>>>> origin/sign_in/Ethan
    // Toggle NavBar
    const toggleNavBar = () => {
        setNavBar(prev => !prev);
    };

    // Toggle CartPanel
    const toggleCartPanel = () => {
        setCartPanel(prev => !prev);
    }

<<<<<<< HEAD
=======
    // NavBar based on User Tag
    const whichNavBar = () => {
        if(userType === 'customer'){
            return <CustomerNavBar onClose={toggleNavBar} />
        }
        else if(userType === 'employee'){
            return <EmployeeNavBar onClose={toggleNavBar} />
        }
        else if(userType === 'salon owner'){
            return <SalonOwnerNavBar onClose={toggleNavBar} />
        }
        else{
            return <NavBar onClose={toggleNavBar} />
        }
    }

>>>>>>> origin/sign_in/Ethan
    return(
        <>
            <header className='header'>
                {/* If MenuButton clicked, open NavBar */}
                <MenuButton onClick={toggleNavBar} /> 
                {/* Logo (todo: if clicked, return back to LandingPage) */}
                <div className='logo' onClick={navigateToLanding} style={{cursor: 'pointer'}}>
                    <img src={jade_logo} className="logo-img" />    
                </div>
                {/* If CartButton clicked, open CartPanel */}
                <CartButton onClick={toggleCartPanel} />
            </header>

            {/* NavBar implementation: Open & Close */}
<<<<<<< HEAD
            {navBar && <NavBar onClose={toggleNavBar} />}
=======
            {navBar && whichNavBar()}
>>>>>>> origin/sign_in/Ethan

            {/* CartPanel implementation: Open & Close */}
            {cartPanel && <CartPanel onClose={toggleCartPanel} />}
        </>
    );
}

export default Header