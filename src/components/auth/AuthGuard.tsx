// ** Next Imports
import { useRouter } from 'next/router'

// ** React Imports
import { ReactNode, ReactElement, useEffect } from 'react'

// ** config
import { ACCESS_TOKEN, USER_DATA } from 'src/configs/auth'

// ** helpers
import { clearLocalUserData, clearTemporaryToken, getTemporaryToken } from 'src/helpers/storage'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'

interface AuthGuardProps {
  children: ReactNode
  fallback: ReactElement | null
}

const AuthGuard = (props: AuthGuardProps) => {
  // ** Props
  const { children, fallback } = props
  // ** auth
  const authContext = useAuth()

  // ** router
  const router = useRouter()

  useEffect(() => {
    const { temporaryToken } = getTemporaryToken()
    if (!router.isReady) {
      return
    }
    if (
      authContext.user === null &&
      !window.localStorage.getItem(ACCESS_TOKEN) &&
      !window.localStorage.getItem(USER_DATA) &&
      !temporaryToken
    ) {
      if (router.asPath !== '/' && router.asPath !== '/login') {
        router.replace({
          pathname: '/login',
          query: { returnUrl: router.asPath }
        })
      } else {
        router.replace('/login')
      }
      authContext.setUser(null)
      clearLocalUserData()
    }
  }, [router.route])

  useEffect(() => {
    const handleUnload = () => {
      clearTemporaryToken()
    }
    window.addEventListener('beforeunload', handleUnload)
    
    return () => {
      window.addEventListener('beforeunload', handleUnload)
    }
  }, [])

  if (authContext.loading || authContext.user === null) {
    return fallback
  }

  return <>{children}</>
}

export default AuthGuard
