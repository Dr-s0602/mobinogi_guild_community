import { useState } from 'react'
import LoginPage from './components/LoginPage'
import MainPage from './components/MainPage'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  return (
    <div className="app">
      {!isLoggedIn ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <MainPage />
      )}
    </div>
  )
}

export default App
