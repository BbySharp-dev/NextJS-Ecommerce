import axios from 'axios'

// ** Config
import { API_ENDPOINT } from 'src/configs/api'
import instanceAxios from 'src/helpers/axios'

// ** Types
import { TLoginAuth, TRegisterAuth, TChangePassword, TForgotPasswordAuth, TResetPasswordAuth } from 'src/types/auth'

export const loginAuth = async (data: TLoginAuth) => {
  const res = await axios.post(`${API_ENDPOINT.AUTH.INDEX}/login`, data)

  return res.data
}

export const loginAuthGoogle = async (data: {idToken: string, deviceToken?:string}) => {
  const res = await axios.post(`${API_ENDPOINT.AUTH.INDEX}/login-google`, data)

  return res.data
}

export const loginAuthFacebook = async (data: {idToken: string, deviceToken?:string}) => {
  const res = await axios.post(`${API_ENDPOINT.AUTH.INDEX}/login-facebook`, data)

  return res.data
}

export const updateDeviceToken = async (data: {deviceToken:string}) => {
  const res = await instanceAxios.post(`${API_ENDPOINT.AUTH.INDEX}/update-device`, data)

  return res.data
}

export const logoutAuth = async () => {
  try {
    const res = await instanceAxios.post(`${API_ENDPOINT.AUTH.INDEX}/logout`)

    return res.data
  } catch (error) {
    return null
  }
}

export const registerAuth = async (data: TRegisterAuth) => {
  try {
    const res = await axios.post(`${API_ENDPOINT.AUTH.INDEX}/register`, data)

    return res.data
  } catch (error) {
    return error
  }
}

export const registerAuthGoogle = async (idToken: string) => {
  try {
    const res = await axios.post(`${API_ENDPOINT.AUTH.INDEX}/register-google`, { idToken })

    return res.data
  } catch (error) {
    return error
  }
}

export const registerAuthFacebook = async (idToken: string) => {
  try {
    const res = await axios.post(`${API_ENDPOINT.AUTH.INDEX}/register-facebook`, { idToken })

    return res.data
  } catch (error) {
    return error
  }
}

export const updateAuthMe = async (data: any) => {
  try {
    const res = await instanceAxios.put(`${API_ENDPOINT.AUTH.INDEX}/me`, data)

    return res.data
  } catch (error) {
    return error
  }
}

export const getAuthMe = async () => {
  try {
    const res = await instanceAxios.get(`${API_ENDPOINT.AUTH.INDEX}/me`)

    return res.data
  } catch (error) {
    return error
  }
}

export const changePasswordMe = async (data: TChangePassword) => {
  try {
    const res = await instanceAxios.patch(`${API_ENDPOINT.AUTH.INDEX}/change-password`, data)

    return res.data
  } catch (error) {
    return error
  }
}

export const forgotPasswordAuth = async (data: TForgotPasswordAuth) => {
  try {
    const res = await axios.post(`${API_ENDPOINT.AUTH.INDEX}/forgot-password`, data)

    return res.data
  } catch (error) {
    return error
  }
}

export const resetPasswordAuth = async (data: TResetPasswordAuth) => {
  try {
    const res = await axios.post(`${API_ENDPOINT.AUTH.INDEX}/reset-password`, data)

    return res.data
  } catch (error) {
    return error
  }
}
