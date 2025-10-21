import jade_logo from '../../assets/jade_logo.png';
import { Menu } from 'lucide-react';

function Header(){
    return(
        <header className='header'>
            <div className='menu-icon'>
                <Menu strokeWidth={3}/>
            </div>
            <div className='logo'>
                <img src={jade_logo} className="logo-img" />    
            </div>
        </header>
    );
}

export default Header