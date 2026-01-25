import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '../types'
import { usersApi } from '../api'

interface UserContextType {
  currentUser: User | null
  users: User[]
  loading: boolean
  error: string | null
  setCurrentUser: (user: User | null) => void
  refreshUsers: () => Promise<void>
  createUser: (name: string) => Promise<User>
  deleteUser: (userId: string) => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedUsers = await usersApi.getAll()
      setUsers(fetchedUsers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (name: string): Promise<User> => {
    const newUser = await usersApi.create(name)
    setUsers(prev => [...prev, newUser])
    return newUser
  }

  const deleteUser = async (userId: string): Promise<void> => {
    await usersApi.delete(userId)
    setUsers(prev => prev.filter(u => u.id !== userId))
    if (currentUser?.id === userId) {
      setCurrentUser(null)
    }
  }

  useEffect(() => {
    refreshUsers()
  }, [])

  // Persist selected user to localStorage
  useEffect(() => {
    const savedUserId = localStorage.getItem('currentUserId')
    if (savedUserId && users.length > 0) {
      const user = users.find(u => u.id === savedUserId)
      if (user) {
        setCurrentUser(user)
      }
    }
  }, [users])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUserId', currentUser.id)
    } else {
      localStorage.removeItem('currentUserId')
    }
  }, [currentUser])

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users,
        loading,
        error,
        setCurrentUser,
        refreshUsers,
        createUser,
        deleteUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
