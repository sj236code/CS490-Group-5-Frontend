import HeroSection from '../components/landing/HeroSection';
import { useNavigate } from "react-router-dom";
import ServiceGrid from '../components/landing/ServiceGrid';
import SalonsSection from '../components/landing/SalonsSection';

function LandingPage({userType}){
    const navigate = useNavigate();

    const navTo = (path) => {
        navigate(path, {
            state: {
                userType,
            }
        });
    };

    return(
        <div>
            <HeroSection navTo={navTo} userType={userType} />
            <ServiceGrid navTo={navTo} userType={userType} />
            <SalonsSection navTo={navTo} userType={userType} />
        </div>  
    );
}

export default LandingPage