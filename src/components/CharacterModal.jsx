import { useState } from 'react'
import './CharacterModal.css'

function CharacterModal({ character, onSave, onClose }) {
  const [name, setName] = useState(character.name || '')
  const [job, setJob] = useState(character.job || '전사')
  
  const jobs = [
    '전사', '대검전사', '검술사', '궁수', '석궁사수', '장궁병',
    '마법사', '화염술사', '빙결술사', '전격술사', '힐러', '사제',
    '수도사', '음유시인', '댄서', '악사', '도적', '격투가', '듀얼블레이드'
  ]

  const handleSave = () => {
    onSave({ name, job })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>캐릭터 설정</h3>
        
        <div className="form-group">
          <label>캐릭터 이름</label>
          <input 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="캐릭터 이름을 입력하세요"
          />
        </div>
        
        <div className="form-group">
          <label>직업</label>
          <select value={job} onChange={e => setJob(e.target.value)}>
            {jobs.map(jobName => (
              <option key={jobName} value={jobName}>{jobName}</option>
            ))}
          </select>
        </div>
        
        <div className="modal-buttons">
          <button className="save-btn" onClick={handleSave}>저장</button>
          <button className="cancel-btn" onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  )
}

export default CharacterModal