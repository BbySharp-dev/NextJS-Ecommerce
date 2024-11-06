// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

// ** Actions

import { deleteNotificationAsync, getAllNotificationsAsync, markReadAllNotificationAsync, markReadNotificationAsync, serviceName } from 'src/stores/notification/actions'

const initialState = {
  isLoading: false,
  typeError: '',
  isSuccessRead: false,
  isErrorRead: false,
  messageErrorRead: '',
  isSuccessDelete: false,
  isErrorDelete: false,
  messageErrorDelete: '',
  isSuccessReadAll: false,
  isErrorReadAll: false,
  messageErrorReadAll: '',
  notifications: {
    data: [],
    total: 0,
    totalNew: 0
  }
}

export const deliveryTypeSlice = createSlice({
  name: serviceName,
  initialState,
  reducers: {
    resetInitialState: state => {
      state.isLoading = false
      state.isSuccessDelete = false
      state.isErrorDelete = true
      state.messageErrorDelete = ''
      state.isSuccessRead = false
      state.isErrorRead = true
      state.messageErrorRead = ''
      state.isSuccessReadAll = false
      state.isErrorReadAll = true
      state.messageErrorReadAll = ''
    }
  },
  extraReducers: builder => {
    // ** get all notification
    builder.addCase(getAllNotificationsAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(getAllNotificationsAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.notifications.data = action.payload?.data?.notifications || []
      state.notifications.total = action.payload?.data?.totalCount
      state.notifications.totalNew = action.payload?.data?.totalNew
    })
    builder.addCase(getAllNotificationsAsync.rejected, (state, action) => {
      state.isLoading = false
      state.notifications.data = []
      state.notifications.total = 0
      state.notifications.totalNew = 0
    })

    // ** read notification
    builder.addCase(markReadNotificationAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(markReadNotificationAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessRead= !!action.payload?.data?._id
      state.isErrorRead= !action.payload?.data?._id
      state.messageErrorRead= action.payload?.message
      state.typeError = action.payload?.typeError
    })

     // ** delete notification
     builder.addCase(deleteNotificationAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteNotificationAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDelete= !!action.payload?.data?._id
      state.isErrorDelete= !action.payload?.data?._id
      state.messageErrorDelete= action.payload?.message
      state.typeError = action.payload?.typeError
    })

    // ** read all notification
    builder.addCase(markReadAllNotificationAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(markReadAllNotificationAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessReadAll = !!action.payload?.data?.length
      state.isErrorReadAll = !action.payload?.data?.length
      state.messageErrorReadAll = action.payload?.message
      state.typeError = action.payload?.typeError
    })
  }
})

export const { resetInitialState } = deliveryTypeSlice.actions
export default deliveryTypeSlice.reducer
