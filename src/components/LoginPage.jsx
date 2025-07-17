import { useState } from 'react'
import { readSheet, appendSheet, isElectron, login } from '../services/electronService'
import './LoginPage.css'

function LoginPage({ onLogin }) {
  const [characterName, setCharacterName] = useState('')
  const [testResult, setTestResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  
  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError('')
    
    if (!characterName.trim()) {
      setLoginError('캐릭터 이름을 입력해주세요.')
      setIsLoading(false)
      return
    }
    
    try {
      if (!isElectron()) {
        throw new Error('Electron 환경이 아닙니다. 브라우저에서는 이 기능을 사용할 수 없습니다.')
      }
      
      console.log('로그인 시도:', characterName)
      
      // 로그인 요청
      const result = await login(characterName)
      console.log('로그인 결과:', result)
      
      if (result.success) {
        // 로그인 성공
        onLogin({
          mainCharacter: result.character,
          subCharacters: result.subCharacters || []
        })
      } else {
        // 로그인 실패
        setLoginError(result.error || '길드에 가입되지 않은 캐릭터입니다. 길드에 가입해주세요.')
      }
    } catch (error) {
      console.error('로그인 오류:', error)
      
      if (!isElectron()) {
        setLoginError('브라우저에서는 로그인할 수 없습니다. Electron 앱으로 실행해주세요.')
      } else {
        setLoginError(`로그인 오류: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  const testConnection = async () => {
    setIsLoading(true)
    setTestResult('')
    
    try {
      if (!isElectron()) {
        throw new Error('Electron 환경이 아닙니다. 브라우저에서는 이 기능을 사용할 수 없습니다.')
      }
      
      const data = await readSheet('ID!A1:B5')
      console.log('Google Sheets 연결 성공:', data)
      
      if (data && data.length > 0) {
        setTestResult(`연결 성공! 데이터: ${JSON.stringify(data)}`)
      } else {
        setTestResult('연결 성공! 데이터가 비어있습니다.')
      }
    } catch (error) {
      console.error('Google Sheets 연결 실패:', error)
      
      if (!isElectron()) {
        setTestResult(`브라우저에서는 Google Sheets API를 직접 호출할 수 없습니다. 
        Electron 앱으로 실행해주세요.`)
      } else {
        setTestResult(`연결 실패: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <h1 className="guild-title">미라쥬나이트</h1>
      <div className="login-box">
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="characterName">캐릭터 이름</label>
            <input
              type="text"
              id="characterName"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="캐릭터 이름을 입력하세요"
              disabled={isLoading}
            />
          </div>
          
          {loginError && <div className="error-message">{loginError}</div>}
          
          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        
        <div className="test-section">
          <button 
            className="test-btn" 
            onClick={testConnection}
            disabled={isLoading}
          >
            {isLoading ? '테스트 중...' : 'Google Sheets 연결 테스트'}
          </button>
          
          {testResult && (
            <div className={`test-result ${testResult.includes('실패') ? 'error' : 'success'}`}>
              {testResult}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginPage