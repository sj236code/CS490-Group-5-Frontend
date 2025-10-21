import { Menu } from 'lucide-react';

/* MenuButton component to open NavBar*/
function MenuButton({onClick}){

    return(

        <button 
            className='menu-icon'
            onClick={onClick}
        >
            <Menu strokeWidth={3} size={24}/>
        </button>

    );

}

export default MenuButton