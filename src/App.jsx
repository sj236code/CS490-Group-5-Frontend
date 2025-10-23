import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Header from './components/layout/Header.jsx'
import LandingPage from './pages/LandingPage.jsx'
import SearchPage from './pages/SearchPage.jsx'

function App() {

  return (
    <>
      <Router>
        <Header/>
        <hr />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
