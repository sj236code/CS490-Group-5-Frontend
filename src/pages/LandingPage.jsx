import HeroSection from '../components/landing/HeroSection';
import ServiceGrid from '../components/landing/ServiceGrid';

function LandingPage(){
    return(
        <div>
            <HeroSection />
            <p className='text-1'>Find Pros by Service</p>
            <ServiceGrid />
        </div>  
    );
}

export default LandingPage