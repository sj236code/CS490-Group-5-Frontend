import { useState } from 'react';
import LandingSearchBar from './LandingSearchBar';

function HeroSection({userType, user}){
  
    console.log("HeroSection- ", user?.profile_id ?? '-');

    return(
        <section className="hero-section">
            <h1 className='hero-title'>
                Find & Book Local<br />Beauty Professionals
            </h1>
            <LandingSearchBar userType={userType} user={user}/>
        </section>
    );

}

export default HeroSection