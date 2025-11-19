import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import LandingSearchBar from './LandingSearchBar';

function HeroSection({userType}){
    const navigate = useNavigate();

    const navTo = (path) => {
        navigate(path, {
            state: {
                userType,
            }
        });
    };

    return(
        <section className="hero-section">
            <h1 className='hero-title'>
                Find & Book Local<br />Beauty Professionals
            </h1>
            <LandingSearchBar navTo={navTo} userType={userType}/>
        </section>
    );

}

export default HeroSection