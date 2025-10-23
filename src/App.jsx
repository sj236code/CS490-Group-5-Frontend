import { useState } from 'react'
import './App.css'
import Header from './components/layout/Header.jsx'
import LandingPage from './pages/LandingPage.jsx'

function App() {

  // Temp hardcode until endpoint created
  const [userType, setUserType] = useState("salon owner");

  return (
    <>
      <Header userType={userType}/>
      <hr />
      <LandingPage />
    </>
  )
}

export default App
