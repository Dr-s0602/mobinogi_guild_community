import { useState } from 'react'
import LoginPage from './components/LoginPage'
import MainPage from './components/MainPage'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [characterData, setCharacterData] = useState({
    mainCharacter: null,
    subCharacters: []
  })

  const handleLogin = (data) => {
    setCharacterData({
      mainCharacter: data.mainCharacter,
      subCharacters: data.subCharacters || []
    })
    setIsLoggedIn(true)
    
    console.log('로그인 성공:', data)
  }

  return (
    <div className="app">
      {!isLoggedIn ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <MainPage 
          mainCharacter={characterData.mainCharacter}
          subCharacters={characterData.subCharacters}
        />
      )}
    </div>
  )
}

export default App