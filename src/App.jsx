import { Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/layout/Header.jsx'
import SignIn from './pages/Sign_in/Sign_in.jsx'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={
          <div style={{ 
            minHeight: '80vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: '#D9E9CF'
          }}>
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <h1>Welcome to Your App!</h1>
              <p style={{ marginTop: '20px' }}>
                <a href="/signin">Go to Sign In Page →</a>
              </p>
            </div>
          </div>
        } />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </>
  )
}

export default App