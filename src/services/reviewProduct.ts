// ** Types
import {
  TParamsAddReview,
  TParamsDeleteMultipleReview,
  TParamsGetReviews,
  TParamsUpdateReview
} from 'src/types/reviews'

// api endPoint
import { API_ENDPOINT } from 'src/configs/api'

// Axios
import instanceAxios from 'src/helpers/axios'

export const addReview = async (data: TParamsAddReview) => {
  try {
    const res = await instanceAxios.post(`${API_ENDPOINT.MANAGE_ORDER.REVIEW.INDEX}`, data)

    return res.data
  } catch (error) {
    return error
  }
}

export const updateMyReview = async (data: TParamsUpdateReview) => {
  try {
    const { id, ...rests } = data

    const res = await instanceAxios.put(`${API_ENDPOINT.MANAGE_ORDER.REVIEW.INDEX}/me/${id}`, rests)

    return res.data
  } catch (error: any) {
    return error?.response?.data
  }
}

export const deleteMyReview = async (id: string) => {
  try {
    const res = await instanceAxios.delete(`${API_ENDPOINT.MANAGE_ORDER.REVIEW.INDEX}/me/${id}`)

    return res.data
  } catch (error) {
    return error
  }
}

export const deleteReview = async (id: string) => {
  try {
    const res = await instanceAxios.delete(`${API_ENDPOINT.MANAGE_ORDER.REVIEW.INDEX}/${id}`)

    return res.data
  } catch (error: any) {
    return error?.response?.data
  }
}

export const getAllReviews = async (data: { params: TParamsGetReviews }) => {
  try {
    const res = await instanceAxios.get(`${API_ENDPOINT.MANAGE_ORDER.REVIEW.INDEX}`, data)

    return res.data
  } catch (error) {
    return error
  }
}

export const getDetailsReview = async (id: string) => {
  try {
    const res = await instanceAxios.get(`${API_ENDPOINT.MANAGE_ORDER.REVIEW.INDEX}/${id}`)

    return res.data
  } catch (error) {
    return error
  }
}

export const updateReview = async (data: TParamsUpdateReview) => {
  const { id, ...rests } = data
  try {
    const res = await instanceAxios.put(`${API_ENDPOINT.MANAGE_ORDER.REVIEW.INDEX}/${id}`, rests)

    return res.data
  } catch (error: any) {
    return error?.response?.data
  }
}

export const deleteMultipleReview = async (data: TParamsDeleteMultipleReview) => {
  try {
    const res = await instanceAxios.delete(`${API_ENDPOINT.MANAGE_ORDER.REVIEW.INDEX}/delete-many`, { data })
    if (res?.data?.status === 'Success') {
      return {
        data: []
      }
    }

    return {
      data: null
    }
  } catch (error: any) {
    return error?.response?.data
  }
}
