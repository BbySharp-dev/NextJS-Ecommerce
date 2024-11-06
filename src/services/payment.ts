import { API_ENDPOINT } from 'src/configs/api'
import instanceAxios from 'src/helpers/axios'
import { TParamsCreateURLPayment, TParamsGetIpnVNPay } from 'src/types/payment'

export const createURLpaymentVNPay = async (data: TParamsCreateURLPayment) => {
  try {
    const res = await instanceAxios.post(`${API_ENDPOINT.PAYMENT.VN_PAY.INDEX}/create_payment_url`, data)

    return res.data
  } catch (error) {
    return error
  }
}

export const getVNPayIpnPayment = async (data: { params: TParamsGetIpnVNPay }) => {
  try {
    const res = await instanceAxios.get(`${API_ENDPOINT.PAYMENT.VN_PAY.INDEX}/vnpay_ipn`, data)

    return res.data
  } catch (error) {
    return error
  }
}
