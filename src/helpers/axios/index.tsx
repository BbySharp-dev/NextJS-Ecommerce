// ** libraries
import axios, { AxiosRequestConfig } from 'axios'
import { jwtDecode } from 'jwt-decode'

// ** config
import { BASE_URL, API_ENDPOINT } from 'src/configs/api'

// ** helper
import {
  clearLocalUserData,
  clearTemporaryToken,
  getLocalUserData,
  getTemporaryToken,
  setLocalUserData,
  setTemporaryToken
} from 'src/helpers/storage'

// ** Next
import { NextRouter, useRouter } from 'next/router'

// ** React
import { FC, useEffect } from 'react'

// types
import { UserDataType } from 'src/contexts/types'

// ** hooks
import { useAuth } from 'src/hooks/useAuth'

type TAxiosInterceptor = {
  children: React.ReactNode
}

const instanceAxios = axios.create({ baseURL: BASE_URL })

const handleRedirectLogin = (router: NextRouter, setUser: (data: UserDataType | null) => void) => {
  if (router.asPath !== '/') {
    router.replace({
      pathname: '/login',
      query: { returnUrl: router.asPath }
    })
  } else {
    router.replace('/login')
  }
  setUser(null)
  clearLocalUserData()
  clearTemporaryToken()
}

let isRefreshing = false
let failedQueue:any[] = []

const processQueue = (error:any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if(token) {
      prom.resolve(token)
    }else {
      prom.reject(error)
    }
  })
  failedQueue = []
}

const addRequestQueue = (config:AxiosRequestConfig):Promise<any> => {
  return new Promise((resolve, reject) => {
    failedQueue.push({
      resolve: (token:string) => {
        if(config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`
        }
        resolve(config)
      },
      reject: (err:any) => {
        reject(err)
      }
    })
  })
}

const AxiosInterceptor: FC<TAxiosInterceptor> = ({ children }) => {
  const router = useRouter()
  const { setUser, user } = useAuth()

  useEffect(() => {
    const reqInterceptor = instanceAxios.interceptors.request.use(async config => {
      const { accessToken, refreshToken } = getLocalUserData()
      const { temporaryToken } = getTemporaryToken()
      const isPublicApi = config?.params?.isPublic
      if (accessToken || temporaryToken) {
        let decodedAccessToken: any = {}
        if (accessToken) {
          decodedAccessToken = jwtDecode(accessToken)
        } else if (temporaryToken) {
          decodedAccessToken = jwtDecode(temporaryToken)
        }

        if (decodedAccessToken?.exp > Date.now() / 1000) {
          config.headers['Authorization'] = `Bearer ${accessToken ? accessToken : temporaryToken}`
        } else {
          if (refreshToken) {
            const decodedRefreshToken: any = jwtDecode(refreshToken)

            if (decodedRefreshToken?.exp > Date.now() / 1000) {
              if (!isRefreshing) {
                isRefreshing = true
                await axios
                  .post(
                    `${API_ENDPOINT.AUTH.INDEX}/refresh-token`,
                    {},
                    {
                      headers: {
                        Authorization: `Bearer ${refreshToken}`
                      }
                    }
                  )
                  .then(res => {
                    const newAccessToken = res?.data?.data?.access_token
                    if (newAccessToken) {
                      config.headers['Authorization'] = `Bearer ${newAccessToken}`
                      processQueue(null ,newAccessToken)
                      if (accessToken) {
                        setLocalUserData(JSON.stringify(user), newAccessToken, refreshToken)
                      }
                    } else {
                      handleRedirectLogin(router, setUser)
                    }
                  })
                  .catch(e => {
                    processQueue(e ,null)
                    handleRedirectLogin(router, setUser)
                  }).finally(() => {
                    isRefreshing = false
                  })
              }else {
                return await addRequestQueue(config)
              }

            } else {
              handleRedirectLogin(router, setUser)
            }
          } else {
            handleRedirectLogin(router, setUser)
          }
        }
      } else if (!isPublicApi) {
        handleRedirectLogin(router, setUser)
      }

      if (config?.params?.isPublic) {
        delete config.params.isPublic
      }

      return config
    })

    const resInterceptor = instanceAxios.interceptors.response.use(response => {
      return response
    })

    return () => {
      instanceAxios.interceptors.request.eject(reqInterceptor)
      instanceAxios.interceptors.response.eject(resInterceptor)
    }
  }, [])


  return <>{children}</>
}

export default instanceAxios
export { AxiosInterceptor }
