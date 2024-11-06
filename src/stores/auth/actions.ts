import { createAsyncThunk } from '@reduxjs/toolkit'

// ** services
import {
  changePasswordMe,
  forgotPasswordAuth,
  registerAuth,
  registerAuthFacebook,
  registerAuthGoogle,
  resetPasswordAuth,
  updateAuthMe
} from 'src/services/auth'

// ** Types
import { TChangePassword, TForgotPasswordAuth, TResetPasswordAuth } from 'src/types/auth'

export const serviceName = 'role'

export const registerAuthAsync = createAsyncThunk(`${serviceName}/register`, async (data: any) => {
  const response = await registerAuth(data)

  if (response?.data) {
    return response
  }

  return {
    data: null,
    message: response?.response?.data?.message,
    typeError: response?.response?.data?.typeError
  }
})

export const registerAuthGoogleAsync = createAsyncThunk(`${serviceName}/register-google`, async (idToken: string) => {
  const response = await registerAuthGoogle(idToken)

  if (response?.data) {
    return response
  }

  return {
    data: null,
    message: response?.response?.data?.message,
    typeError: response?.response?.data?.typeError
  }
})

export const registerAuthFacebookAsync = createAsyncThunk(
  `${serviceName}/register-facebook`,
  async (idToken: string) => {
    const response = await registerAuthFacebook(idToken)

    if (response?.data) {
      return response
    }

    return {
      data: null,
      message: response?.response?.data?.message,
      typeError: response?.response?.data?.typeError
    }
  }
)

export const updateAuthMeAsync = createAsyncThunk(`${serviceName}/update-me`, async (data: any) => {
  const response = await updateAuthMe(data)

  if (response?.data) {
    return response
  }

  return {
    data: null,
    message: response?.response?.data?.message,
    typeError: response?.response?.data?.typeError
  }
})

export const changePasswordMeAsync = createAsyncThunk(
  `${serviceName}/change-password-me`,
  async (data: TChangePassword) => {
    const response = await changePasswordMe(data)

    if (response?.status === 'Success') {
      return { ...response, data: 1 }
    }

    return {
      data: null,
      message: response?.response?.data?.message,
      typeError: response?.response?.data?.typeError
    }
  }
)

export const forgotPasswordAuthAsync = createAsyncThunk(
  `${serviceName}/forgot-password`,
  async (data: TForgotPasswordAuth) => {
    const response = await forgotPasswordAuth(data)

    if (response?.data) {
      return response
    }

    return {
      data: null,
      message: response?.response?.data?.message,
      typeError: response?.response?.data?.typeError
    }
  }
)

export const resetPasswordAuthAsync = createAsyncThunk(
  `${serviceName}/reset-password`,
  async (data: TResetPasswordAuth) => {
    const response = await resetPasswordAuth(data)

    if (response?.data) {
      return response
    }

    return {
      data: null,
      message: response?.response?.data?.message,
      typeError: response?.response?.data?.typeError
    }
  }
)
