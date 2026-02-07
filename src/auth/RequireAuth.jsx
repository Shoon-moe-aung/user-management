import { useUser } from '../context/UserProvider'
import Login from './Login'

const RequireAuth = ({ children }) => {
  const { user } = useUser()

  if (!user?.isLoggedIn) {
    return <Login />
  }

  return children
}

export default RequireAuth
