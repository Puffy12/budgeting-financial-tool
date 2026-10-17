import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../../context/UserContext'

type Tab = 'login' | 'signup'
type Flow = 'main' | 'set-pin'

interface SetPinState {
  userId: string
  name: string
}

export function useHomeSession() {
  const { authenticatedUsers, knownUsers, login, signup, setPin, switchUser, removeKnownUser } = useUser()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('login')
  const [flow, setFlow] = useState<Flow>('main')
  const [setPinState, setSetPinState] = useState<SetPinState | null>(null)
  const [username, setUsername] = useState('')
  const [pin, setPin_] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [setPinValue, setSetPinValue] = useState('')
  const [confirmSetPin, setConfirmSetPin] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const usernameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (authenticatedUsers.length > 0) {
      const lastUserId = localStorage.getItem('currentUserId')
      if (lastUserId) {
        const found = authenticatedUsers.find((entry) => entry.user.id === lastUserId)
        if (found) {
          switchUser(lastUserId)
          navigate(`/app/${lastUserId}`)
        }
      }
    }
  }, [authenticatedUsers, switchUser, navigate])

  const handleLogin = useCallback(async (event: React.FormEvent) => {
    event.preventDefault()
    if (!username.trim() || pin.length !== 4) return
    setErrorMsg('')
    setSubmitting(true)
    try {
      const result = await login(username.trim(), pin)
      if (result.needsPin && result.userId && result.name) {
        setSetPinState({ userId: result.userId, name: result.name })
        setFlow('set-pin')
        setSetPinValue('')
        setConfirmSetPin('')
      } else if (result.user) {
        navigate(`/app/${result.user.id}`)
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }, [username, pin, login, navigate])

  const handleSignup = useCallback(async (event: React.FormEvent) => {
    event.preventDefault()
    if (!username.trim() || pin.length !== 4 || confirmPin.length !== 4) return
    if (pin !== confirmPin) {
      setErrorMsg('PINs do not match')
      return
    }
    setErrorMsg('')
    setSubmitting(true)
    try {
      const user = await signup(username.trim(), pin)
      navigate(`/app/${user.id}`)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setSubmitting(false)
    }
  }, [username, pin, confirmPin, signup, navigate])

  const handleSetPin = useCallback(async (event: React.FormEvent) => {
    event.preventDefault()
    if (!setPinState || setPinValue.length !== 4 || confirmSetPin.length !== 4) return
    if (setPinValue !== confirmSetPin) {
      setErrorMsg('PINs do not match')
      return
    }
    setErrorMsg('')
    setSubmitting(true)
    try {
      const user = await setPin(setPinState.userId, setPinValue)
      navigate(`/app/${user.id}`)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to set PIN')
    } finally {
      setSubmitting(false)
    }
  }, [setPinState, setPinValue, confirmSetPin, setPin, navigate])

  const handleQuickSwitch = async (userId: string, name: string) => {
    const authed = authenticatedUsers.find((entry) => entry.user.id === userId)
    if (authed) {
      switchUser(userId)
      navigate(`/app/${userId}`)
      return
    }
    const known = knownUsers.find((entry) => entry.id === userId)
    if (known?.pin) {
      setErrorMsg('')
      setSubmitting(true)
      try {
        const result = await login(known.name, known.pin)
        if (result.user) {
          navigate(`/app/${result.user.id}`)
          return
        }
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Login failed')
      } finally {
        setSubmitting(false)
      }
    }
    setTab('login')
    setUsername(name)
    setPin_('')
    setErrorMsg('')
  }

  const resetForm = () => {
    setUsername('')
    setPin_('')
    setConfirmPin('')
    setErrorMsg('')
    setFlow('main')
    setSetPinState(null)
    setSetPinValue('')
    setConfirmSetPin('')
  }

  const switchTab = (newTab: Tab) => {
    resetForm()
    setTab(newTab)
  }

  return {
    authenticatedUsers, knownUsers, removeKnownUser, tab, setTab, flow, setPinState,
    username, setUsername, pin, setPin_, confirmPin, setConfirmPin, setPinValue, setSetPinValue,
    confirmSetPin, setConfirmSetPin, submitting, errorMsg, usernameRef, handleLogin, handleSignup,
    handleSetPin, handleQuickSwitch, resetForm, switchTab,
  }
}
