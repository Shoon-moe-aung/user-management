import { useUser } from '../context/UserProvider'
import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import defaultAvatar from '../assets/profile.jpg'

export default function Profile() {
  const { user, logout } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [hasImage, setHasImage] = useState(false)
  const fileInputRef = useRef(null)
  const API_URL = import.meta.env.VITE_API_URL
  console.log(`URL => ${API_URL}`)

  async function onUpdateImage() {
    const file = fileInputRef.current?.files[0]
    if (!file) {
      alert('Please select a file.')
      return
    }
    const formData = new FormData()
    formData.append('file', file)
    try {
      const response = await fetch(`${API_URL}/api/user/profile/image`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
      if (response.ok) {
        alert('Image updated successfully.')
        fetchProfile()
      } else {
        alert('Failed to update image.')
      }
    } catch (err) {
      alert('Error uploading image.')
    }
  }

  async function fetchProfile() {
    const result = await fetch(`${API_URL}/api/user/profile`, {
      credentials: 'include',
    })
    if (result.status == 401) {
      logout()
    } else {
      const data = await result.json()
      if (data.profileImage != null) {
        console.log('has image...')
        setHasImage(true)
      }
      console.log('data: ', data)
      setIsLoading(false)
      setData(data)
      setEditForm({
        firstname: data.firstname ?? '',
        lastname: data.lastname ?? '',
        email: data.email ?? '',
        username: data.username ?? '',
      })
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleEditChange = (field) => (event) => {
    setEditForm((prev) => ({
      ...(prev ?? {}),
      [field]: event.target.value,
    }))
  }

  const saveProfile = async () => {
    if (!editForm || !data?._id) return
    try {
      const response = await fetch(`${API_URL}/api/user/${data._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editForm),
      })
      if (!response.ok) {
        alert('Failed to update profile.')
        return
      }
      const updated = await response.json()
      setData((prev) => ({ ...prev, ...(updated || editForm) }))
      setIsEditing(false)
    } catch (err) {
      alert('Error updating profile.')
    }
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="eyebrow">Profile</p>
          <h1>Account details</h1>
          <p className="subtitle">Review your profile and upload an image.</p>
        </div>
        <div className="header__actions">
          <div className="header__user">
            <span>Signed in as</span>
            <strong>{user?.email ?? data.email ?? 'User'}</strong>
          </div>
          <nav className="nav">
            <Link className="nav__link" to="/profile">Profile</Link>
            <Link className="nav__link" to="/users">Users</Link>
            <Link className="nav__link nav__link--danger" to="/logout">Logout</Link>
          </nav>
        </div>
      </header>

      <section className="panel profile">
        <div className="profile__header">
          <div>
            <p className="eyebrow">Profile</p>
            <h2>Your account</h2>
            <p className="subtitle">Update your avatar and review your details.</p>
          </div>
          <button className="ghost" onClick={fetchProfile} disabled={isLoading}>
            Refresh
          </button>
        </div>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="profile__grid">
            <div className="profile__card">
              <div className="profile__avatar">
                {hasImage ? (
                  <img
                    src={`${API_URL}${data.profileImage}`}
                    alt="Profile"
                  />
                ) : (
                  <img src={defaultAvatar} alt="Default profile" />
                )}
              </div>
              <div className="profile__meta">
                <h3>{data.firstname} {data.lastname}</h3>
                <p>{data.email}</p>
                <span className="status">Active</span>
              </div>
              <div className="profile__upload">
                <input
                  type="file"
                  id="profileImage"
                  name="profileImage"
                  ref={fileInputRef}
                />
                <button className="primary" onClick={onUpdateImage}>
                  Update Image
                </button>
              </div>
            </div>

            <div className="profile__card">
              <h3>Account Details</h3>
              <div className="profile__detail">
                <span>ID</span>
                <strong>{data._id}</strong>
              </div>
              {isEditing ? (
                <div className="profile__edit">
                  <label className="float-field">
                    <input
                      value={editForm?.firstname ?? ''}
                      onChange={handleEditChange('firstname')}
                      placeholder=" "
                    />
                    <span>First name</span>
                  </label>
                  <label className="float-field">
                    <input
                      value={editForm?.lastname ?? ''}
                      onChange={handleEditChange('lastname')}
                      placeholder=" "
                    />
                    <span>Last name</span>
                  </label>
                  <label className="float-field">
                    <input
                      value={editForm?.username ?? ''}
                      onChange={handleEditChange('username')}
                      placeholder=" "
                    />
                    <span>Username</span>
                  </label>
                  <label className="float-field">
                    <input
                      type="email"
                      value={editForm?.email ?? ''}
                      onChange={handleEditChange('email')}
                      placeholder=" "
                    />
                    <span>Email</span>
                  </label>
                  <div className="profile__actions">
                    <button className="primary" onClick={saveProfile}>
                      Save
                    </button>
                    <button
                      className="ghost"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="profile__detail">
                    <span>Email</span>
                    <strong>{data.email}</strong>
                  </div>
                  <div className="profile__detail">
                    <span>First Name</span>
                    <strong>{data.firstname}</strong>
                  </div>
                  <div className="profile__detail">
                    <span>Last Name</span>
                    <strong>{data.lastname}</strong>
                  </div>
                  <div className="profile__detail">
                    <span>Username</span>
                    <strong>{data.username ?? '—'}</strong>
                  </div>
                  <button className="ghost" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
