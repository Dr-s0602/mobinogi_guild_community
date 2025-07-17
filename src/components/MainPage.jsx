import { useState, useEffect } from 'react'
import PersonalTab from './PersonalTab'
import GuildTab from './GuildTab'
import Footer from './Footer'
import './MainPage.css'

function MainPage({ mainCharacter, subCharacters }) {
  const [activeTab, setActiveTab] = useState('personal')
  const [mainChar, setMainChar] = useState(mainCharacter)
  const [subChars, setSubChars] = useState(subCharacters || [])
  
  // props가 변경되면 상태 업데이트
  useEffect(() => {
    setMainChar(mainCharacter)
    setSubChars(subCharacters || [])
  }, [mainCharacter, subCharacters])

  // 캐릭터 정보 업데이트 처리
  const handleCharacterUpdate = (updatedChar) => {
    setMainChar(updatedChar)
  }
  
  // 부캐릭터 추가 처리
  const handleSubCharacterAdd = (newSubChar) => {
    setSubChars(prev => [...prev, newSubChar])
  }

  return (
    <div className="main-container">
      <header className="main-header">
        <div className="header-left">
          <h1 className="guild-name">미라쥬나이트</h1>
          <nav className="tab-nav">
            <button 
              className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              개인
            </button>
            <button 
              className={`tab-btn ${activeTab === 'guild' ? 'active' : ''}`}
              onClick={() => setActiveTab('guild')}
            >
              길드
            </button>
          </nav>
        </div>
        <div className="header-right" id="character-icons-container">
          {mainChar && (
            <div className="current-character">
              {mainChar.name} ({mainChar.job || '전사'})
            </div>
          )}
        </div>
      </header>
      
      <main className="main-content">
        {activeTab === 'personal' && (
          <PersonalTab 
            mainCharacter={mainChar}
            subCharacters={subChars}
            onCharacterUpdate={handleCharacterUpdate}
            onSubCharacterAdd={handleSubCharacterAdd}
          />
        )}
        {activeTab === 'guild' && <GuildTab />}
      </main>
      
      <Footer />
    </div>
  )
}

export default MainPage