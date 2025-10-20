import jade_logo from '../../assets/jade_logo.png';

function Header(){
    return(
        <header className='header'>
            <div className='logo'>
                <img src={jade_logo} className="logo-img" />    
            </div>
        </header>
    );
}

export default Header