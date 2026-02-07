import { useEffect, useMemo, useState } from 'react'
import '../App.css'
import { createUser, deleteUser, listUsers, updateUser } from '../api/userApi'
import { useUser } from '../context/UserProvider'
import { Link } from 'react-router-dom'

const emptyCreate = {
  username: '',
  email: '',
  password: '',
  firstname: '',
  lastname: '',
}

const UserManagement = () => {
  const { user } = useUser()
  const [users, setUsers] = useState([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(5)

  const [createForm, setCreateForm] = useState(emptyCreate)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(null)

  const loadUsers = async (nextPage = page) => {
    setLoading(true)
    setError('')
    try {
      const data = await listUsers({ page: nextPage, limit })
      setUsers(data.users)
      setTotalUsers(data.total)
    } catch (err) {
      setError(err?.message ?? 'Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers(page)
  }, [page])

  const filteredUsers = useMemo(() => users, [users])

  const pageCount = Math.max(1, Math.ceil(totalUsers / limit))
  const canGoBack = page > 1
  const canGoForward = page < pageCount

  const handleCreateChange = (field) => (event) => {
    setCreateForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await createUser(createForm)
      setCreateForm(emptyCreate)
      await loadUsers(page)
    } catch (err) {
      setError(err?.message ?? 'Failed to create user.')
    } finally {
      setSaving(false)
    }
  }

  const beginEdit = (userItem) => {
    setEditingId(userItem._id ?? userItem.id)
    setEditForm({
      username: userItem.username ?? '',
      email: userItem.email ?? '',
      firstname: userItem.firstname ?? '',
      lastname: userItem.lastname ?? '',
      status: userItem.status ?? '',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
  }

  const handleEditChange = (field) => (event) => {
    setEditForm((prev) => ({
      ...(prev ?? {}),
      [field]: event.target.value,
    }))
  }

  const saveEdit = async () => {
    if (!editForm) return
    setSaving(true)
    setError('')
    try {
      const updated = await updateUser(editingId, editForm)
      const resolved = updated && typeof updated === 'object' ? updated : null
      setUsers((prev) =>
        prev.map((userItem) => {
          const userId = userItem._id ?? userItem.id
          if (userId !== editingId) return userItem
          return resolved
            ? { ...userItem, ...resolved }
            : { ...userItem, ...editForm }
        })
      )
      cancelEdit()
    } catch (err) {
      setError(err?.message ?? 'Failed to update user.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (userItem) => {
    const confirmed = window.confirm(
      `Delete ${userItem.username ?? ''} ${userItem.email ?? ''}? This action cannot be undone.`
    )
    if (!confirmed) return

    setSaving(true)
    setError('')
    try {
      const userId = userItem._id ?? userItem.id
      await deleteUser(userId)
      setUsers((prev) => prev.filter((item) => (item._id ?? item.id) !== userId))
      setTotalUsers((prev) => Math.max(0, prev - 1))
    } catch (err) {
      setError(err?.message ?? 'Failed to delete user.')
    } finally {
      setSaving(false)
    }
  }

  const isCreateValid =
    createForm.username.trim().length >= 2 &&
    createForm.firstname.trim().length >= 1 &&
    createForm.lastname.trim().length >= 1 &&
    createForm.email.includes('@') &&
    createForm.password.trim().length >= 6

  const isEditValid =
    editForm &&
    editForm.username.trim().length >= 2 &&
    editForm.firstname.trim().length >= 1 &&
    editForm.lastname.trim().length >= 1 &&
    editForm.email.includes('@')

  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="eyebrow">User Management</p>
          <h1>Manage users from your backend</h1>
          <p className="subtitle">
            Create, update, and remove users directly from the UI.
          </p>
        </div>
        <div className="header__actions">
          <div className="header__user">
            <span>Signed in as</span>
            <strong>{user?.email ?? 'User'}</strong>
          </div>
          <nav className="nav">
            <Link className="nav__link" to="/profile">Profile</Link>
            <Link className="nav__link" to="/users">Users</Link>
            <Link className="nav__link nav__link--danger" to="/logout">Logout</Link>
          </nav>
          <button className="ghost" onClick={() => loadUsers(page)} disabled={loading}>
            Refresh
          </button>
        </div>
      </header>

      <section className="panel">
        <div className="panel__title">
          <h2>Create User</h2>
        </div>
        <form className="form" onSubmit={handleCreate}>
          <label className="float-field">
            <input
              value={createForm.username}
              onChange={handleCreateChange('username')}
              placeholder=" "
              required
            />
            <span>Username</span>
          </label>
          <label className="float-field">
            <input
              type="email"
              value={createForm.email}
              onChange={handleCreateChange('email')}
              placeholder=" "
              required
            />
            <span>Email</span>
          </label>
          <label className="float-field">
            <input
              type="password"
              value={createForm.password}
              onChange={handleCreateChange('password')}
              placeholder=" "
              required
            />
            <span>Password</span>
          </label>
          <label className="float-field">
            <input
              value={createForm.firstname}
              onChange={handleCreateChange('firstname')}
              placeholder=" "
              required
            />
            <span>First name</span>
          </label>
          <label className="float-field">
            <input
              value={createForm.lastname}
              onChange={handleCreateChange('lastname')}
              placeholder=" "
              required
            />
            <span>Last name</span>
          </label>
          <div className="form__actions">
            <button className="primary" type="submit" disabled={!isCreateValid || saving}>
              {saving ? 'Saving…' : 'Create User'}
            </button>
            <button className="ghost" type="button" onClick={() => setCreateForm(emptyCreate)}>
              Clear
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel__head">
          <div>
            <h2>Existing Users</h2>
          </div>
        </div>

        {error ? <div className="alert">{error}</div> : null}

        <div className="table">
          <div className="table__row table__head">
            <div>User</div>
            <div>Username</div>
            <div>Email</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {filteredUsers.length === 0 && !loading ? (
            <div className="table__empty">No users found.</div>
          ) : null}

          {filteredUsers.map((userItem) => {
            const userId = userItem._id ?? userItem.id
            const isEditing = editingId === userId
            const fullName = [userItem.firstname, userItem.lastname]
              .filter(Boolean)
              .join(' ')
            return (
              <div className="table__row" key={userId}>
                <div className="cell">
                  {isEditing ? (
                    <div className="stack">
                      <input
                        value={editForm?.firstname ?? ''}
                        onChange={handleEditChange('firstname')}
                        placeholder="First name"
                      />
                      <input
                        value={editForm?.lastname ?? ''}
                        onChange={handleEditChange('lastname')}
                        placeholder="Last name"
                      />
                    </div>
                  ) : (
                    <div className="user">
                      <strong>{fullName || '—'}</strong>
                      <span>{userItem.email}</span>
                    </div>
                  )}
                </div>
                <div className="cell">
                  {isEditing ? (
                    <input
                      value={editForm?.username ?? ''}
                      onChange={handleEditChange('username')}
                    />
                  ) : (
                    <span className="pill">{userItem.username ?? '—'}</span>
                  )}
                </div>
                <div className="cell">
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm?.email ?? ''}
                      onChange={handleEditChange('email')}
                    />
                  ) : (
                    userItem.email ?? '—'
                  )}
                </div>
                <div className="cell">
                  {isEditing ? (
                    <input
                      value={editForm?.status ?? ''}
                      onChange={handleEditChange('status')}
                      placeholder="ACTIVE"
                    />
                  ) : (
                    <span className="status">
                      {(userItem.status ?? 'UNKNOWN').toString().toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="cell actions">
                  {isEditing ? (
                    <>
                      <button
                        className="primary"
                        onClick={saveEdit}
                        disabled={!isEditValid || saving}
                      >
                        Save
                      </button>
                      <button className="ghost" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="ghost" onClick={() => beginEdit(userItem)}>
                        Edit
                      </button>
                      <button className="danger" onClick={() => handleDelete(userItem)}>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="pager">
          <button className="ghost" onClick={() => setPage(1)} disabled={!canGoBack}>
            First
          </button>
          <button className="ghost" onClick={() => setPage((p) => p - 1)} disabled={!canGoBack}>
            Previous
          </button>
          <span>
            Page {page} of {pageCount}
          </span>
          <button className="ghost" onClick={() => setPage((p) => p + 1)} disabled={!canGoForward}>
            Next
          </button>
          <button className="ghost" onClick={() => setPage(pageCount)} disabled={!canGoForward}>
            Last
          </button>
        </div>
      </section>
    </div>
  )
}

export default UserManagement
