// ** Products
import {
  TParamsCreateOrderProduct,
  TParamsEditOrderProduct,
  TParamsGetOrderProducts,
  TParamsStatusOrderUpdate
} from 'src/types/order-product'

// api endPoint
import { API_ENDPOINT } from 'src/configs/api'

// Axios
import instanceAxios from 'src/helpers/axios'

export const getAllOrderProductsByMe = async (data: { params: TParamsGetOrderProducts }) => {
  try {
    const res = await instanceAxios.get(`${API_ENDPOINT.MANAGE_ORDER.ORDER.INDEX}/me`, data)

    return res.data
  } catch (error) {
    return error
  }
}

export const createOrderProduct = async (data: TParamsCreateOrderProduct) => {
  try {
    const res = await instanceAxios.post(`${API_ENDPOINT.MANAGE_ORDER.ORDER.INDEX}`, data)

    return res.data
  } catch (error: any) {
    return error?.response?.data
  }
}

export const updateStatusOrderProduct = async (data: TParamsStatusOrderUpdate) => {
  const { id, ...rests } = data
  try {
    const res = await instanceAxios.post(`${API_ENDPOINT.MANAGE_ORDER.ORDER.INDEX}/status/${id}`, rests)

    return res.data
  } catch (error: any) {
    return error?.response?.data
  }
}

export const getDetailsOrderProductByMe = async (id: string) => {
  try {
    const res = await instanceAxios.get(`${API_ENDPOINT.MANAGE_ORDER.ORDER.INDEX}/me/${id}`)

    return res.data
  } catch (error) {
    return error
  }
}

export const cancelOrderProductOfMe = async (id: string) => {
  try {
    const res = await instanceAxios.post(`${API_ENDPOINT.MANAGE_ORDER.ORDER.INDEX}/me/cancel/${id}`)

    return res.data
  } catch (error: any) {
    return error?.response?.data
  }
}

// admin cms
export const deleteOrderProduct = async (id: string) => {
  try {
    const res = await instanceAxios.delete(`${API_ENDPOINT.MANAGE_ORDER.ORDER.INDEX}/${id}`)

    return res.data
  } catch (error: any) {
    return error?.response?.data
  }
}

export const getDetailsOrderProduct = async (id: string) => {
  try {
    const res = await instanceAxios.get(`${API_ENDPOINT.MANAGE_ORDER.ORDER.INDEX}/${id}`)

    return res.data
  } catch (error: any) {
    return error?.response?.data
  }
}

export const getAllOrderProducts = async (data: { params: TParamsGetOrderProducts }) => {
  try {
    const res = await instanceAxios.get(`${API_ENDPOINT.MANAGE_ORDER.ORDER.INDEX}`, data)

    return res.data
  } catch (error) {
    return error
  }
}

export const updateOrderProduct = async (data: TParamsEditOrderProduct) => {
  const { id, ...rests } = data
  try {
    const res = await instanceAxios.put(`${API_ENDPOINT.MANAGE_ORDER.ORDER.INDEX}/${id}`, rests)

    return res.data
  } catch (error: any) {
    return error?.response?.data
  }
}
