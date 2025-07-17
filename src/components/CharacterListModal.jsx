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

  const updateCharacterField = (index, field, value) => {
    setEditedCharacters(prev => prev.map((char, i) => 
      i === index ? { ...char, [field]: value } : char
    ))
  }

  const handleSave = async () => {
    setIsLoading(true)
    
    try {
      // 본캐릭터 직업 업데이트
      if (mainCharacter) {
        const mainCharIndex = editedCharacters.findIndex(char => 
          char.name === mainCharacter.name || char.id === mainCharacter.id
        )
        
        if (mainCharIndex >= 0) {
          const updatedMainChar = editedCharacters[mainCharIndex]
          try {
            const result = await updateCharacter(mainCharacter.name, {
              name: mainCharacter.name,
              job: updatedMainChar.job
            })
            
            console.log('본캐릭터 업데이트 결과:', result)
          } catch (error) {
            console.error('캐릭터 정보 업데이트 오류:', error)
          }
        }
        
        // 부캐릭터 정보 업데이트
        for (let i = 1; i < editedCharacters.length; i++) {
          const subChar = editedCharacters[i]
          
          // 이름이 있는 부캐릭터만 처리
          if (subChar.name && subChar.name.trim()) {
            try {
              // 기존 부캐릭터 업데이트 또는 새 부캐릭터 추가
              const result = await addSubCharacter(mainCharacter.name, {
                name: subChar.name,
                job: subChar.job || '전사'
              })
              
              console.log(`부캐릭터 ${subChar.name} 업데이트 결과:`, result)
            } catch (error) {
              console.error(`부캐릭터 ${subChar.name} 업데이트 오류:`, error)
            }
          }
        }
      }
      
      onSave(editedCharacters)
    } catch (error) {
      console.error('저장 중 오류 발생:', error)
    } finally {
      setIsLoading(false)
      onClose()
    }
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
  
  // 부캐릭터 삭제 함수
  const handleDeleteSubCharacter = async (index) => {
    // 본캐릭터(index 0)는 삭제 불가
    if (index === 0) return
    
    const charToDelete = editedCharacters[index]
    if (!charToDelete || !charToDelete.name) return
    
    if (window.confirm(`부캐릭터 "${charToDelete.name}"을(를) 삭제하시겠습니까?`)) {
      setIsLoading(true)
      
      try {
        // 시트에서 부캐릭터 삭제
        if (mainCharacter && mainCharacter.name) {
          // 삭제 요청 전송
          const deleteResult = await addSubCharacter(mainCharacter.name, {
            name: `__DELETED__${charToDelete.name}__${Date.now()}`,
            job: charToDelete.job
          })
          
          console.log(`부캐릭터 ${charToDelete.name} 삭제 요청 결과:`, deleteResult)
          
          // 캐릭터 목록에서 제거
          const updatedCharacters = [...editedCharacters]
          updatedCharacters[index] = { ...updatedCharacters[index], name: '', job: '전사' }
          setEditedCharacters(updatedCharacters)
          
          // 부모 컴포넌트에 삭제 알림
          if (onSubCharacterAdd && deleteResult.success) {
            // 삭제 요청을 부모에게 전달
            onSubCharacterAdd({
              name: `__DELETED__${charToDelete.name}__${Date.now()}`,
              job: charToDelete.job
            })
          }
        }
      } catch (error) {
        console.error(`부캐릭터 ${charToDelete.name} 삭제 오류:`, error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="character-list-modal" onClick={e => e.stopPropagation()}>
        <h3>캐릭터 목록 관리</h3>
        
        <div className="character-edit-list">
          {/* 부캐릭터 추가 버튼 - 더 눈에 띄게 상단에 배치 */}
          {mainCharacter && editedCharacters.length < 5 && (
            <div className="add-sub-character-container">
              <button 
                className="add-sub-button-prominent"
                onClick={toggleAddSubForm}
                disabled={isLoading || showAddSubForm}
              >
                + 부캐릭터 추가
              </button>
            </div>
          )}
          
          {editedCharacters.map((char, index) => (
            <div key={char.id} className="character-edit-item">
              <div className="character-number">캐릭터 {char.id}</div>
              <div className="edit-fields">
                <input 
                  type="text" 
                  placeholder="캐릭터 이름"
                  value={char.name}
                  onChange={e => updateCharacterField(index, 'name', e.target.value)}
                />
                <select 
                  value={char.job} 
                  onChange={e => updateCharacterField(index, 'job', e.target.value)}
                >
                  {jobs.map(jobName => (
                    <option key={jobName} value={jobName}>{jobName}</option>
                  ))}
                </select>
                
                {/* 부캐릭터 삭제 버튼 (본캐릭터는 제외) */}
                {index > 0 && char.name && (
                  <button 
                    type="button"
                    className="delete-character-btn"
                    onClick={() => handleDeleteSubCharacter(index)}
                    disabled={isLoading}
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* 기존 부캐릭터 추가 버튼은 제거 */}
        
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
        
        <div className="modal-buttons">
          <button 
            className="save-btn" 
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? '저장 중...' : '저장'}
          </button>
          <button 
            className="cancel-btn" 
            onClick={onClose}
            disabled={isLoading}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  )
}

export default CharacterListModal