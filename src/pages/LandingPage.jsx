import HeroSection from '../components/landing/HeroSection';
import ServiceGrid from '../components/landing/ServiceGrid';
import SalonsSection from '../components/landing/SalonsSection';

function LandingPage(){
    return(
        <div>
            <HeroSection />
            <ServiceGrid />
            <SalonsSection />
        </div>  
    );
}

export default LandingPage