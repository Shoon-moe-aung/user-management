import { useRef, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useUser } from '../context/UserProvider'

export default function Signup() {
  const { user, signup } = useUser()
  const [controlState, setControlState] = useState({
    isSubmitting: false,
    isSuccess: false,
    errorMessage: '',
  })

  const firstnameRef = useRef()
  const lastnameRef = useRef()
  const usernameRef = useRef()
  const emailRef = useRef()
  const passRef = useRef()
  const confirmPassRef = useRef()

  async function onSignup() {
    const firstname = firstnameRef.current.value.trim()
    const lastname = lastnameRef.current.value.trim()
    const username = usernameRef.current.value.trim()
    const email = emailRef.current.value.trim()
    const password = passRef.current.value
    const confirmPassword = confirmPassRef.current.value

    if (!username || !email || !password) {
      setControlState({
        isSubmitting: false,
        isSuccess: false,
        errorMessage: 'Username, email, and password are required.',
      })
      return
    }

    if (password !== confirmPassword) {
      setControlState({
        isSubmitting: false,
        isSuccess: false,
        errorMessage: 'Passwords do not match.',
      })
      return
    }

    setControlState({
      isSubmitting: true,
      isSuccess: false,
      errorMessage: '',
    })

    const result = await signup({
      firstname,
      lastname,
      username,
      email,
      password,
    })

    setControlState({
      isSubmitting: false,
      isSuccess: result.ok,
      errorMessage: result.ok ? '' : result.message,
    })
  }

  if (user.isLoggedIn) {
    return <Navigate to="/profile" replace />
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Create Account</p>
        <h2>Sign up</h2>
        <p className="subtitle">Create an account to access the dashboard.</p>

        <label className="float-field">
          <input
            type="text"
            ref={firstnameRef}
            placeholder=" "
          />
          <span>First name</span>
        </label>

        <label className="float-field">
          <input
            type="text"
            ref={lastnameRef}
            placeholder=" "
          />
          <span>Last name</span>
        </label>

        <label className="float-field">
          <input
            type="text"
            ref={usernameRef}
            placeholder=" "
          />
          <span>Username</span>
        </label>

        <label className="float-field">
          <input
            type="email"
            ref={emailRef}
            placeholder=" "
          />
          <span>Email</span>
        </label>

        <label className="float-field">
          <input
            type="password"
            ref={passRef}
            placeholder=" "
          />
          <span>Password</span>
        </label>

        <label className="float-field">
          <input
            type="password"
            ref={confirmPassRef}
            placeholder=" "
          />
          <span>Confirm password</span>
        </label>

        <button className="primary" onClick={onSignup} disabled={controlState.isSubmitting}>
          {controlState.isSubmitting ? 'Creating account…' : 'Sign up'}
        </button>

        {controlState.errorMessage && <div className="alert">{controlState.errorMessage}</div>}
        {controlState.isSuccess && (
          <div className="alert alert--success">
            Account created. <Link to="/login">Go to Login</Link>
          </div>
        )}

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}
