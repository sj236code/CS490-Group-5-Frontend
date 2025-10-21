import jade_logo from '../../assets/jade_logo.png';
import MenuButton from './MenuButton.jsx';
import {useState , useEffect} from 'react';
import NavBar from './NavBar';


function Header(){

    // Is NavBar open
    const[navBar, setNavBar] = useState(false);

    // Toggle NavBar
    const toggleNavBar = () => {
        setNavBar(prev => !prev);
    };

    return(
        <>
            <header className='header'>
                {/* If MenuButton clicked, open NavBar */}
                <MenuButton onClick={toggleNavBar} /> 
                {/* Logo (todo: if clicked, return back to LandingPage) */}
                <div className='logo'>
                    <img src={jade_logo} className="logo-img" />    
                </div>
            </header>

            {/* NavBar implementation: Open & Close */}
            {navBar && <NavBar onClose={toggleNavBar} />}
        </>
    );
}

export default Header