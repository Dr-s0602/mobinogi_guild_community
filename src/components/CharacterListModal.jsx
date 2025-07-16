import { useState } from 'react'
import './CharacterListModal.css'

function CharacterListModal({ characters, onSave, onClose }) {
  const [editedCharacters, setEditedCharacters] = useState([...characters])
  
  const jobs = [
    '전사', '대검전사', '검술사', '궁수', '석궁사수', '장궁병',
    '마법사', '화염술사', '빙결술사', '전격술사', '힐러', '사제',
    '수도사', '음유시인', '댄서', '악사', '도적', '격투가', '듀얼블레이드'
  ]

  const updateCharacter = (index, field, value) => {
    setEditedCharacters(prev => prev.map((char, i) => 
      i === index ? { ...char, [field]: value } : char
    ))
  }

  const handleSave = () => {
    onSave(editedCharacters)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="character-list-modal" onClick={e => e.stopPropagation()}>
        <h3>캐릭터 목록 관리</h3>
        
        <div className="character-edit-list">
          {editedCharacters.map((char, index) => (
            <div key={char.id} className="character-edit-item">
              <div className="character-number">캐릭터 {char.id}</div>
              <div className="edit-fields">
                <input 
                  type="text" 
                  placeholder="캐릭터 이름"
                  value={char.name}
                  onChange={e => updateCharacter(index, 'name', e.target.value)}
                />
                <select 
                  value={char.job} 
                  onChange={e => updateCharacter(index, 'job', e.target.value)}
                >
                  {jobs.map(jobName => (
                    <option key={jobName} value={jobName}>{jobName}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
        
        <div className="modal-buttons">
          <button className="save-btn" onClick={handleSave}>저장</button>
          <button className="cancel-btn" onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  )
}

export default CharacterListModal