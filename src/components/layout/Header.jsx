import jade_logo from '../../assets/jade_logo.png';
import MenuButton from './MenuButton.jsx';
import CartButton from './CartButton.jsx';
import {useState , useEffect} from 'react';
import NavBar from './NavBar';
import CartPanel from './CartPanel';


function Header(){

    // Is NavBar open
    const[navBar, setNavBar] = useState(false);

    // Is CartPanel open
    const[cartPanel, setCartPanel] = useState(false);

    // Toggle NavBar
    const toggleNavBar = () => {
        setNavBar(prev => !prev);
    };

    // Toggle CartPanel
    const toggleCartPanel = () => {
        setCartPanel(prev => !prev);
    }

    return(
        <>
            <header className='header'>
                {/* If MenuButton clicked, open NavBar */}
                <MenuButton onClick={toggleNavBar} /> 
                {/* Logo (todo: if clicked, return back to LandingPage) */}
                <div className='logo'>
                    <img src={jade_logo} className="logo-img" />    
                </div>
                {/* If CartButton clicked, open CartPanel */}
                <CartButton onClick={toggleCartPanel} />
            </header>

            {/* NavBar implementation: Open & Close */}
            {navBar && <NavBar onClose={toggleNavBar} />}

            {/* CartPanel implementation: Open & Close */}
            {cartPanel && <CartPanel onClose={toggleCartPanel} />}
        </>
    );
}

export default Header