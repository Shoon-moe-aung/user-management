import { useRef, useState } from 'react'
import { useUser } from '../context/UserProvider'
import { Navigate, Link } from 'react-router-dom'

export default function Login() {
  const [controlState, setControlState] = useState({
    isLoggingIn: false,
    isLoginError: false,
    isLoginOk: false,
  })
  const emailRef = useRef()
  const passRef = useRef()
  const { user, login } = useUser()

  async function onLogin() {
    setControlState((prev) => {
      return {
        ...prev,
        isLoggingIn: true,
      }
    })
    const email = emailRef.current.value
    const pass = passRef.current.value
    const result = await login(email, pass)
    setControlState(() => {
      return {
        isLoggingIn: false,
        isLoginError: !result,
        isLoginOk: result,
      }
    })
  }

  if (!user.isLoggedIn)
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <p className="eyebrow">Welcome Back</p>
          <h2>Sign in to continue</h2>
          <p className="subtitle">Use your account to access the dashboard.</p>

          <label className="float-field">
            <input
              type="email"
              name="email"
              id="email"
              ref={emailRef}
              placeholder=" "
            />
            <span>Email</span>
          </label>
          <label className="float-field">
            <input
              type="password"
              name="password"
              id="password"
              ref={passRef}
              placeholder=" "
            />
            <span>Password</span>
          </label>

          <button className="primary" onClick={onLogin} disabled={controlState.isLoggingIn}>
            {controlState.isLoggingIn ? 'Signing in…' : 'Login'}
          </button>
          {controlState.isLoginError && <div className="alert">Login incorrect</div>}
          {user.isLoggedIn && <div className="alert">Login Success</div>}
          <p className="auth-switch">
            Need an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    )
  else
    return (
      <Navigate to="/profile" replace />
    )
}
