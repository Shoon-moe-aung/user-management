import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import RequireAuth from './auth/RequireAuth'
import Profile from './components/Profile'
import UserManagement from './components/UserManagement'
import Login from './auth/Login'
import Logout from './components/Logout'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/profile" replace />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
      <Route
        path="/users"
        element={
          <RequireAuth>
            <UserManagement />
          </RequireAuth>
        }
      />
      <Route
        path="/logout"
        element={
          <RequireAuth>
            <Logout />
          </RequireAuth>
        }
      />
    </Routes>
  )
}

export default App
