import { useState } from 'react';
import LandingSearchBar from './LandingSearchBar';

function HeroSection(){


    return(
        <section className="hero-section">
            <h1 className='hero-title'>
                Find & Book Local<br />Beauty Professionals
            </h1>
            <LandingSearchBar />
        </section>
    );

}

export default HeroSection