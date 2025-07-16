import { useState } from 'react'
import CharacterModal from './CharacterModal'
import CharacterListModal from './CharacterListModal'
import './PersonalTab.css'

function PersonalTab() {
  const [characters, setCharacters] = useState([{ id: 1, name: '', job: '전사' }])
  const [showModal, setShowModal] = useState(false)
  const [editingCharacter, setEditingCharacter] = useState(null)
  const [showListModal, setShowListModal] = useState(false)
  const [isAccountQuestCollapsed, setIsAccountQuestCollapsed] = useState(false)
  const [draggedCharacter, setDraggedCharacter] = useState(null)
  
  // 계정 단위 퀘스트
  const [accountQuests, setAccountQuests] = useState({
    daily: [
      { 
        id: 1, 
        title: '조각난 보석 보물상자', 
        details: ['캐시샵', '10회', '4,000G'], 
        completed: false 
      },
      { 
        id: 2, 
        title: '일일 무료 패션', 
        details: ['캐시샵'], 
        completed: false 
      },
      { 
        id: 3, 
        title: '성수', 
        details: ['메이븐', '케이틴 특제 통밀빵 1개'], 
        completed: false 
      },
      { 
        id: 4, 
        title: '성수 10개', 
        details: ['엔델리온', '케이틴 특제 통미빵 10개'], 
        completed: false 
      }
    ],
    weekly: [
      { id: 1, task: '주간 던전', completed: false },
      { id: 2, task: '길드 기여도', completed: false }
    ]
  })
  
  const getDefaultCharacterTodos = () => ({
    daily: [
      { id: 1, task: '일일 던전', completed: false },
      { id: 2, task: '데일리 퀘스트', completed: false }
    ],
    weekly: [
      { id: 1, task: '주간 보스', completed: false },
      { id: 2, task: '주간 미션', completed: false }
    ]
  })
  
  // 일일/주간 퀘스트 슬롯들
  const [dailyQuests] = useState([
    { id: 1, name: '일일 미션', maxPerChar: 1 },
    { id: 2, name: '검은 구멍', maxPerChar: 3 },
    { id: 3, name: '소환의 결계', maxPerChar: 2 },
    { id: 4, name: '요일 던전', maxPerChar: 1 },
    { id: 5, name: '심층 던전', maxPerChar: 1 }
  ])
  
  const [weeklyQuests] = useState([
    { id: 6, name: '주간 미션', maxPerChar: 1 },
    { 
      id: 7, 
      name: '필드 보스', 
      maxPerChar: 3,
      subQuests: ['페리', '크라브바흐', '크라마', '드로흐에네']
    },
    { 
      id: 8, 
      name: '어비스', 
      maxPerChar: 3,
      subQuests: ['가라앉은 유적', '무너진 제단', '파멸의 전당']
    },
    { 
      id: 9, 
      name: '레이드', 
      maxPerChar: 2,
      subQuests: ['글라스기브네', '화이트 서큐버스']
    }
  ])
  
  // 각 캐릭터별 퀘스트 완료 횟수 저장
  const [questCompletions, setQuestCompletions] = useState({})
  // 서브퀘스트별 캐릭터 할당 저장 (questId-subQuestIndex: [characterIds])
  const [subQuestAssignments, setSubQuestAssignments] = useState({})
  // 계정 일일 퀘스트 캐릭터 할당 저장 (accountQuestId: characterId)
  const [accountQuestAssignments, setAccountQuestAssignments] = useState({})
  
  const addCharacter = () => {
    if (characters.length >= 5) return
    const newCharId = characters.length + 1
    const newChar = { id: newCharId, name: '', job: '전사' }
    setCharacters([...characters, newChar])
  }
  
  const openCharacterModal = (character) => {
    setEditingCharacter(character)
    setShowModal(true)
  }
  
  const saveCharacter = (data) => {
    setCharacters(prev => prev.map(char => 
      char.id === editingCharacter.id 
        ? { ...char, name: data.name, job: data.job }
        : char
    ))
  }
  
  const saveAllCharacters = (updatedCharacters) => {
    setCharacters(updatedCharacters)
  }
  
  const getCharacterColors = () => [
    '#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'
  ]
  
  const getCharacterIcon = (char) => {
    if (char.name && char.name.trim()) {
      return char.name.charAt(0)
    }
    return char.id.toString()
  }
  
  const getCharacterDisplay = (char) => {
    if (char.name) {
      return `${char.name}`
    }
    return `${char.id}`
  }

  const toggleAccountQuest = (type, id) => {
    setAccountQuests(prev => ({
      ...prev,
      [type]: prev[type].map(quest => 
        quest.id === id ? { ...quest, completed: !quest.completed } : quest
      )
    }))
  }
  
  const handleAccountQuestDrop = (e, questId) => {
    e.preventDefault()
    if (!draggedCharacter) return
    
    // 이미 할당된 캐릭터가 있는지 확인
    if (accountQuestAssignments[questId]) {
      setDraggedCharacter(null)
      return
    }
    
    setAccountQuestAssignments(prev => ({
      ...prev,
      [questId]: draggedCharacter.id
    }))
    
    setDraggedCharacter(null)
  }
  
  const removeAccountQuestAssignment = (questId) => {
    setAccountQuestAssignments(prev => {
      const newAssignments = { ...prev }
      delete newAssignments[questId]
      return newAssignments
    })
  }
  
  const handleDragStart = (character) => {
    setDraggedCharacter(character)
  }
  
  const handleDragOver = (e) => {
    e.preventDefault()
  }
  
  const handleDrop = (e, questId) => {
    e.preventDefault()
    if (!draggedCharacter) return
    
    const allQuests = [...dailyQuests, ...weeklyQuests]
    const quest = allQuests.find(q => q.id === questId)
    const charId = draggedCharacter.id
    const currentCount = questCompletions[`${charId}-${questId}`] || 0
    
    // 캐릭터별 최대 횟수 확인
    if (currentCount >= quest.maxPerChar) {
      setDraggedCharacter(null)
      return
    }
    
    setQuestCompletions(prev => ({
      ...prev,
      [`${charId}-${questId}`]: currentCount + 1
    }))
    
    setDraggedCharacter(null)
  }
  
  const removeQuestCompletion = (questId, characterId) => {
    const key = `${characterId}-${questId}`
    const currentCount = questCompletions[key] || 0
    
    if (currentCount > 0) {
      setQuestCompletions(prev => ({
        ...prev,
        [key]: currentCount - 1
      }))
    }
  }
  
  const getQuestCount = (questId, characterId) => {
    return questCompletions[`${characterId}-${questId}`] || 0
  }
  
  const handleSubQuestDrop = (e, questId, subQuestIndex) => {
    e.preventDefault()
    e.stopPropagation()
    if (!draggedCharacter) return
    
    const key = `${questId}-${subQuestIndex}`
    const currentAssignments = subQuestAssignments[key] || []
    
    // 이미 할당된 캐릭터인지 확인
    if (currentAssignments.includes(draggedCharacter.id)) {
      setDraggedCharacter(null)
      return
    }
    
    // 해당 퀘스트에서 캐릭터의 총 완료 횟수 확인
    const allQuests = [...dailyQuests, ...weeklyQuests]
    const quest = allQuests.find(q => q.id === questId)
    if (quest && quest.subQuests) {
      let totalCount = 0
      quest.subQuests.forEach((_, index) => {
        const subKey = `${questId}-${index}`
        const assignments = subQuestAssignments[subKey] || []
        totalCount += assignments.filter(id => id === draggedCharacter.id).length
      })
      
      // 최대 횟수 초과 확인
      if (totalCount >= quest.maxPerChar) {
        setDraggedCharacter(null)
        return
      }
    }
    
    setSubQuestAssignments(prev => ({
      ...prev,
      [key]: [...currentAssignments, draggedCharacter.id]
    }))
    
    setDraggedCharacter(null)
  }
  
  const removeSubQuestAssignment = (questId, subQuestIndex, characterId) => {
    const key = `${questId}-${subQuestIndex}`
    setSubQuestAssignments(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter(id => id !== characterId)
    }))
  }
  
  const getSubQuestAssignments = (questId, subQuestIndex) => {
    return subQuestAssignments[`${questId}-${subQuestIndex}`] || []
  }

  return (
    <div className="personal-container">
      <main className="todo-content">
        {/* 계정 단위 퀘스트 */}
        <div className="account-quests">
          <div 
            className="collapsible-header"
            onClick={() => setIsAccountQuestCollapsed(!isAccountQuestCollapsed)}
          >
            <h3>계정 퀘스트</h3>
            <span className={`collapse-icon ${isAccountQuestCollapsed ? 'collapsed' : ''}`}>▼</span>
          </div>
          {!isAccountQuestCollapsed && (
            <div className="quest-sections">
              <div className="quest-section">
                <h4>일일</h4>
                <div className="account-quest-slots">
                  {accountQuests.daily.map(quest => (
                    <div 
                      key={quest.id} 
                      className="account-quest-slot"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleAccountQuestDrop(e, quest.id)}
                    >
                      <div className="account-quest-header">
                        <div className="account-quest-info">
                          <div className="quest-title">
                            {quest.title}
                          </div>
                          <div className="quest-details">
                            {quest.details.map((detail, index) => (
                              <span key={index} className="detail-tag">{detail}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="account-quest-character">
                        {accountQuestAssignments[quest.id] && (
                          <div className="assigned-character">
                            {(() => {
                              const charIndex = characters.findIndex(c => c.id === accountQuestAssignments[quest.id])
                              const char = characters[charIndex]
                              return (
                                <div 
                                  className="account-character-tag"
                                  style={{ backgroundColor: getCharacterColors()[charIndex] }}
                                >
                                  <span>{getCharacterIcon(char)}</span>
                                  <button 
                                    className="remove-btn"
                                    onClick={() => removeAccountQuestAssignment(quest.id)}
                                  >
                                    ×
                                  </button>
                                </div>
                              )
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="quest-section">
                <h4>주간</h4>
                <ul className="todo-list">
                  {accountQuests.weekly.map(quest => (
                    <li key={quest.id} className="todo-item">
                      <label className="todo-label">
                        <input 
                          type="checkbox" 
                          checked={quest.completed}
                          onChange={() => toggleAccountQuest('weekly', quest.id)}
                        />
                        <span className={quest.completed ? 'completed' : ''}>{quest.task}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        
        {/* 일일/주간 퀘스트 슬롯들 */}
        <div className="quest-container">
          <div className="daily-quests">
            <h3>일일 퀘스트</h3>
            <div className="quest-slots">
              {dailyQuests.map(quest => (
                <div 
                  key={quest.id}
                  className="quest-slot"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, quest.id)}
                >
                  <div className="slot-header">
                    <h4>{quest.name}</h4>
                    <span className="slot-info">캐릭터당 {quest.maxPerChar}회</span>
                  </div>
                  {quest.subQuests && (
                    <div className="sub-quests">
                      {quest.subQuests.map((subQuest, index) => (
                        <span key={index} className="sub-quest-tag">{subQuest}</span>
                      ))}
                    </div>
                  )}
                  <div className="character-progress">
                    {characters.map((char, index) => {
                      const count = getQuestCount(quest.id, char.id)
                      return count > 0 ? (
                        <div 
                          key={char.id} 
                          className="progress-item"
                          style={{ backgroundColor: getCharacterColors()[index] }}
                        >
                          <span className="char-number">{getCharacterIcon(char)}</span>
                          <span className="progress-count">{count}/{quest.maxPerChar}</span>
                          <button 
                            className="remove-btn"
                            onClick={() => removeQuestCompletion(quest.id, char.id)}
                          >
                            -
                          </button>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="weekly-quests">
            <h3>주간 퀘스트</h3>
            <div className="quest-slots">
              {weeklyQuests.map(quest => (
                <div 
                  key={quest.id}
                  className="quest-slot"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, quest.id)}
                >
                  <div className="slot-header">
                    <h4>{quest.name}</h4>
                    <span className="slot-info">캐릭터당 {quest.maxPerChar}회</span>
                  </div>
                  {quest.subQuests ? (
                    <div className="sub-quest-slots">
                      {quest.subQuests.map((subQuest, subIndex) => (
                        <div 
                          key={subIndex}
                          className="sub-quest-slot"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleSubQuestDrop(e, quest.id, subIndex)}
                        >
                          <div className="sub-quest-name">{subQuest}</div>
                          <div className="sub-quest-characters">
                            {getSubQuestAssignments(quest.id, subIndex).map(charId => {
                              const charIndex = characters.findIndex(c => c.id === charId)
                              const char = characters[charIndex]
                              return (
                                <div 
                                  key={charId}
                                  className="sub-quest-character"
                                  style={{ backgroundColor: getCharacterColors()[charIndex] }}
                                >
                                  <span>{getCharacterIcon(char)}</span>
                                  <button 
                                    className="remove-btn"
                                    onClick={() => removeSubQuestAssignment(quest.id, subIndex, charId)}
                                  >
                                    ×
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="character-progress">
                      {characters.map((char, index) => {
                        const count = getQuestCount(quest.id, char.id)
                        return count > 0 ? (
                          <div 
                            key={char.id} 
                            className="progress-item"
                            style={{ backgroundColor: getCharacterColors()[index] }}
                          >
                            <span className="char-number">{getCharacterIcon(char)}</span>
                            <span className="progress-count">{count}/{quest.maxPerChar}</span>
                            <button 
                              className="remove-btn"
                              onClick={() => removeQuestCompletion(quest.id, char.id)}
                            >
                              -
                            </button>
                          </div>
                        ) : null
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* 캐릭터 아이콘들 - 헤더에 렌더링 */}
        <div className="character-icons-portal">
          <div className="icons-container">
            {characters.map((char, index) => (
              <div 
                key={char.id} 
                className="character-icon"
                draggable
                onDragStart={() => handleDragStart(char)}
              >
                <div 
                  className="icon-circle" 
                  style={{ backgroundColor: getCharacterColors()[index] }}
                >
                  {getCharacterIcon(char)}
                </div>
                <div className="icon-name">{getCharacterDisplay(char)}</div>
              </div>
            ))}
            {characters.length < 5 && (
              <div className="add-character-icon" onClick={addCharacter}>
                <div className="icon-circle add-circle">+</div>
                <div className="icon-name">추가</div>
              </div>
            )}
            <div className="settings-character-icon" onClick={() => setShowListModal(true)}>
              <div className="icon-circle settings-circle">⚙️</div>
              <div className="icon-name">설정</div>
            </div>
          </div>
        </div>
      </main>
      
      {showModal && (
        <CharacterModal 
          character={editingCharacter}
          onSave={saveCharacter}
          onClose={() => setShowModal(false)}
        />
      )}
      
      {showListModal && (
        <CharacterListModal 
          characters={characters}
          onSave={saveAllCharacters}
          onClose={() => setShowListModal(false)}
        />
      )}
    </div>
  )
}

export default PersonalTab