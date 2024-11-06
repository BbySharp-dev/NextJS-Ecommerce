import { createAsyncThunk } from '@reduxjs/toolkit'


// ** Services
import { addComment, deleteComment, deleteMultipleComment, deleteMyComment, getAllComments, replyComment, updateComment, updateMyComment } from 'src/services/commentProduct'

// ** Types
import { TParamsAddComment, TParamsDeleteMultipleComment, TParamsGetComments, TParamsReplyComment, TParamsUpdateComment } from 'src/types/comment'

export const serviceName = 'comment'

export const createCommentAsync = createAsyncThunk(`${serviceName}/create`, async (data: TParamsAddComment) => {
  const response = await addComment(data)

  return response
})

export const replyCommentAsync = createAsyncThunk(`${serviceName}/reply`, async (data: TParamsReplyComment) => {
  const response = await replyComment(data)

  return response
})

export const getAllCommentCMSAsync = createAsyncThunk(
  `${serviceName}/get-all-cms`,
  async (data: { params: TParamsGetComments }) => {
    const response = await getAllComments(data)

    return response
  }
)

export const updateCommentAsync = createAsyncThunk(`${serviceName}/update`, async (data: TParamsUpdateComment) => {
  const response = await updateComment(data)

  return response
})

export const deleteCommentAsync = createAsyncThunk(`${serviceName}/delete`, async (id: string) => {
  const response = await deleteComment(id)

  return response
})

export const deleteMultipleCommentAsync = createAsyncThunk(
  `${serviceName}/delete-multiple`,
  async (ids: TParamsDeleteMultipleComment) => {
    const response = await deleteMultipleComment(ids)

    return response
  }
)

export const deleteMyCommentAsync = createAsyncThunk(`${serviceName}/delete-my-comment`, async (id: string) => {
  const response = await deleteMyComment(id)

  return response
})

export const updateMyCommentAsync = createAsyncThunk(
  `${serviceName}/update-my-comment`,
  async (data: TParamsUpdateComment) => {
    const response = await updateMyComment(data)

    return response
  }
)


