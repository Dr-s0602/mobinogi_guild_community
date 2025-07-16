import { useState } from 'react'
import PersonalTab from './PersonalTab'
import GuildTab from './GuildTab'
import Footer from './Footer'
import './MainPage.css'

function MainPage() {
  const [activeTab, setActiveTab] = useState('personal')

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
        <div className="header-right">
          {/* 캐릭터 아이콘들이 여기에 렌더링됨 */}
        </div>
      </header>
      
      <main className="main-content">
        {activeTab === 'personal' && <PersonalTab />}
        {activeTab === 'guild' && <GuildTab />}
      </main>
      
      <Footer />
    </div>
  )
}

export default MainPage