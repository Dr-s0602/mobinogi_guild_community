import { useState } from 'react'
import { addSubCharacter, updateCharacter } from '../services/electronService'
import './CharacterListModal.css'

function CharacterListModal({ characters, mainCharacter, onSave, onClose, onSubCharacterAdd }) {
  const [editedCharacters, setEditedCharacters] = useState([...characters])
  const [newSubCharacter, setNewSubCharacter] = useState({ name: '', job: '전사' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAddSubForm, setShowAddSubForm] = useState(false)
  
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

  const handleSave = async () => {
    // 본캐릭터 직업 업데이트
    if (mainCharacter) {
      const mainCharIndex = editedCharacters.findIndex(char => 
        char.name === mainCharacter.name || char.id === mainCharacter.id
      )
      
      if (mainCharIndex >= 0) {
        const updatedMainChar = editedCharacters[mainCharIndex]
        try {
          await updateCharacter(mainCharacter.name, {
            name: mainCharacter.name,
            job: updatedMainChar.job
          })
        } catch (error) {
          console.error('캐릭터 정보 업데이트 오류:', error)
        }
      }
    }
    
    onSave(editedCharacters)
    onClose()
  }
  
  const toggleAddSubForm = () => {
    setShowAddSubForm(!showAddSubForm)
    setError('')
    setNewSubCharacter({ name: '', job: '전사' })
  }
  
  const handleAddSubCharacter = async (e) => {
    e.preventDefault()
    
    if (!newSubCharacter.name.trim()) {
      setError('캐릭터 이름을 입력해주세요.')
      return
    }
    
    if (!mainCharacter || !mainCharacter.name) {
      setError('본캐릭터 정보가 없습니다.')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      const result = await addSubCharacter(mainCharacter.name, newSubCharacter)
      
      if (result.success) {
        // 부모 컴포넌트에 알림
        if (onSubCharacterAdd) {
          onSubCharacterAdd(result.subCharacter)
        }
        
        // 폼 초기화
        setNewSubCharacter({ name: '', job: '전사' })
        setShowAddSubForm(false)
      } else {
        setError(result.error || '부캐릭터 추가 실패')
      }
    } catch (error) {
      console.error('부캐릭터 추가 오류:', error)
      setError(`오류: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
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
        
        {mainCharacter && (
          <div className="sub-character-section">
            <button 
              className="add-sub-button"
              onClick={toggleAddSubForm}
              disabled={isLoading}
            >
              부캐릭터 추가
            </button>
            
            {showAddSubForm && (
              <div className="sub-character-form">
                <h4>부캐릭터 추가</h4>
                <form onSubmit={handleAddSubCharacter}>
                  <div className="form-group">
                    <input 
                      type="text" 
                      placeholder="부캐릭터 이름"
                      value={newSubCharacter.name}
                      onChange={e => setNewSubCharacter({...newSubCharacter, name: e.target.value})}
                      disabled={isLoading}
                    />
                    <select 
                      value={newSubCharacter.job}
                      onChange={e => setNewSubCharacter({...newSubCharacter, job: e.target.value})}
                      disabled={isLoading}
                    >
                      {jobs.map(jobName => (
                        <option key={jobName} value={jobName}>{jobName}</option>
                      ))}
                    </select>
                  </div>
                  {error && <div className="error-message">{error}</div>}
                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="submit-button"
                      disabled={isLoading}
                    >
                      {isLoading ? '처리 중...' : '추가'}
                    </button>
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={toggleAddSubForm}
                      disabled={isLoading}
                    >
                      취소
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
        
        <div className="modal-buttons">
          <button className="save-btn" onClick={handleSave}>저장</button>
          <button className="cancel-btn" onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  )
}

export default CharacterListModal