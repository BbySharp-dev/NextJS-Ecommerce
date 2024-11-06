// ** Redux Imports
import { Dispatch } from 'redux'
import { createSlice } from '@reduxjs/toolkit'

// ** Axios Imports
import { changePasswordMeAsync, forgotPasswordAuthAsync, registerAuthAsync, registerAuthFacebookAsync, registerAuthGoogleAsync, resetPasswordAuthAsync, serviceName, updateAuthMeAsync } from 'src/stores/auth/actions'

// ** Type
import { UserDataType } from 'src/contexts/types'

type TInitialData = {
  isLoading: boolean,
  isSuccess: boolean,
  isError: boolean,
  message: string,
  typeError: string,
  isSuccessUpdateMe: boolean,
  isErrorUpdateMe: boolean,
  messageUpdateMe: string,
  isSuccessChangePassword: boolean,
  isErrorChangePassword: boolean,
  messageChangePassword: string,
  userData: UserDataType | null,
  isSuccessResetPassword: boolean,
  isErrorResetPassword: boolean,
  messageResetPassword: string,
  isSuccessForgotPassword: boolean,
  isErrorForgotPassword: boolean,
  messageForgotPassword: string,
}
const initialState:TInitialData = {
  isLoading: false,
  isSuccess: true,
  isError: false,
  message: '',
  typeError: '',
  isSuccessUpdateMe: true,
  isErrorUpdateMe: false,
  messageUpdateMe: '',
  isSuccessChangePassword: true,
  isErrorChangePassword: false,
  messageChangePassword: '',
  userData: null,
  isSuccessForgotPassword: true,
  isErrorForgotPassword: false,
  messageForgotPassword: '',
  isSuccessResetPassword: true,
  isErrorResetPassword: false,
  messageResetPassword: '',
}

export const authSlice = createSlice({
  name: serviceName,
  initialState,
  reducers: {
    resetInitialState: state => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = true
      state.message = ''
      state.typeError = ''
      state.isSuccessUpdateMe = false
      state.isErrorUpdateMe = true
      state.messageUpdateMe = ''
      state.isSuccessChangePassword = false
      state.isErrorChangePassword = true
      state.messageChangePassword = ''
      state.isSuccessForgotPassword = false
      state.isErrorForgotPassword = true
      state.messageForgotPassword = ''
      state.isSuccessResetPassword = false
      state.isErrorResetPassword = true
      state.messageResetPassword = ''
    }
  },
  extraReducers: builder => {
    // ** register
    builder.addCase(registerAuthAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(registerAuthAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccess = !!action.payload?.data?.email
      state.isError = !action.payload?.data?.email
      state.message = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(registerAuthAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = true
      state.message = ''
      state.typeError = ''
    })

    // ** register
    builder.addCase(registerAuthGoogleAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(registerAuthGoogleAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccess = !!action.payload?.data?.email
      state.isError = !action.payload?.data?.email
      state.message = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(registerAuthGoogleAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = true
      state.message = ''
      state.typeError = ''
    })

    // ** register facebook
    builder.addCase(registerAuthFacebookAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(registerAuthFacebookAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccess = !!action.payload?.data?.email
      state.isError = !action.payload?.data?.email
      state.message = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(registerAuthFacebookAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = true
      state.message = ''
      state.typeError = ''
    })

    // ** update me
    builder.addCase(updateAuthMeAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(updateAuthMeAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessUpdateMe = !!action.payload?.data?.email
      state.isErrorUpdateMe = !action.payload?.data?.email
      state.messageUpdateMe = action.payload?.message
      state.typeError = action.payload?.typeError
      state.userData = action.payload.data
    })
    builder.addCase(updateAuthMeAsync.rejected, (state, action) => {
      state.isLoading = false
      state.typeError = ''
      state.isSuccessUpdateMe = false
      state.isErrorUpdateMe = false
      state.messageUpdateMe = ''
      state.userData = null
    })

    // ** change password me
    builder.addCase(changePasswordMeAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(changePasswordMeAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessChangePassword = !!action.payload?.data
      state.isErrorChangePassword = !action.payload?.data
      state.messageChangePassword = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(changePasswordMeAsync.rejected, (state, action) => {
      state.isLoading = false
      state.typeError = ''
      state.isSuccessChangePassword = false
      state.isErrorChangePassword = false
      state.messageChangePassword = ''
    })

     // ** reset password
     builder.addCase(resetPasswordAuthAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(resetPasswordAuthAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessResetPassword = !!action.payload?.data?.email
      state.isErrorResetPassword = !action.payload?.data?.email
      state.messageResetPassword = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(resetPasswordAuthAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isSuccessResetPassword = false
      state.isErrorResetPassword = true
      state.messageResetPassword = ''
      state.typeError = ''
    })

     // ** forgot password
     builder.addCase(forgotPasswordAuthAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(forgotPasswordAuthAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessForgotPassword = !!action.payload?.data?.email
      state.isErrorForgotPassword = !action.payload?.data?.email
      state.messageForgotPassword = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(forgotPasswordAuthAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isSuccessForgotPassword = false
      state.isErrorForgotPassword = true
      state.message = ''
      state.typeError = ''
    })
  }
})

export const { resetInitialState } = authSlice.actions
export default authSlice.reducer
