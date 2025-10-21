import jade_logo from '../../assets/jade_logo.png';
import MenuButton from './MenuButton.jsx';
import {useState , useEffect} from 'react';
import NavBar from './NavBar';


function Header(){

    const[navBar, setNavBar] = useState(false);

    const toggleNavBar = () => {
        setNavBar(prev => !prev);
    };

    return(
        <>
            <header className='header'>
                <MenuButton onClick={toggleNavBar} />
                <div className='logo'>
                    <img src={jade_logo} className="logo-img" />    
                </div>
            </header>
            {navBar && <NavBar onClose={toggleNavBar} />}
        </>
    );
}

export default Header