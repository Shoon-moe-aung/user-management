import { useUser } from '../context/UserProvider'
import { Navigate } from 'react-router-dom'

const RequireAuth = ({ children }) => {
  const { user } = useUser()

  if (!user?.isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default RequireAuth
