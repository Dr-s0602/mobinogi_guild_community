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
  
  // 부캐릭터 추가/업데이트 처리
  const handleSubCharacterAdd = (newSubChar) => {
    // 삭제된 부캐릭터 처리 (이름이 __DELETED__로 시작하는 경우)
    if (newSubChar.name && newSubChar.name.startsWith('__DELETED__')) {
      // 원래 이름 추출
      const nameParts = newSubChar.name.split('__')
      if (nameParts.length >= 3) {
        const originalName = nameParts[2]
        
        // 해당 이름의 부캐릭터 제거
        setSubChars(prev => prev.filter(char => char.name !== originalName))
      }
      return
    }
    
    // 이미 있는 부캐릭터인지 확인
    const existingIndex = subChars.findIndex(char => char.name === newSubChar.name)
    
    if (existingIndex >= 0) {
      // 기존 부캐릭터 업데이트
      const updatedSubChars = [...subChars]
      updatedSubChars[existingIndex] = newSubChar
      setSubChars(updatedSubChars)
    } else {
      // 새 부캐릭터 추가
      setSubChars(prev => [...prev, newSubChar])
    }
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