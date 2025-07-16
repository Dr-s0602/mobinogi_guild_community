import './LoginPage.css'

function LoginPage({ onLogin }) {
  return (
    <div className="login-container">
      <h1 className="guild-title">미라쥬나이트</h1>
      <div className="login-box">
        <button className="login-btn" onClick={onLogin}>
          로그인
        </button>
      </div>
    </div>
  )
}

export default LoginPage