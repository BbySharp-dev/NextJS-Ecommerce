export type TItemOrderProduct = {
  name: string
  amount: number
  image: string
  price: number
  discount: number
  product: string
  slug: string
}

export type TItemProductMe = {
  name: string
  amount: number
  image: string
  price: number
  discount: number
  product: {
    _id: string
    countInStock: number
    slug: string
  }
}

export type TParamsCreateOrderProduct = {
  orderItems: TItemOrderProduct[]
  fullName: string
  address?: string
  city: string
  phone: string
  paymentMethod: string
  itemsPrice: number
  shippingPrice: number
  totalPrice: number
  user: string
  deliveryMethod: string
}

export type TParamsStatusOrderUpdate = {
  id: string
  isDelivered?: number
  isPaid?: number
  status?: number
}

export type TParamsEditOrderProduct = {
  shippingAddress: {
    address: string
    fullName: string
    phone: string
    city: string
  }
  id: string
}

export type TParamsGetOrderProducts = {
  limit?: number
  page?: number
  search?: string
  order?: string
}

export type TItemOrderProductMe = {
  _id: string
  shippingAddress: {
    fullName: string
    address: string
    city: {
      _id: string
      name: string
    }
    phone: string
  }
  orderItems: TItemProductMe[]
  paymentMethod: {
    _id: string
    name: string
    type: string
  }
  deliveryMethod: {
    _id: string
    name: string
    price: number
  }
  itemsPrice: number
  shippingPrice: number
  totalPrice: number
  user: {
    _id: string
    firstName: string
    lastName: string
    middleName: string
  }
  isPaid: number
  isDelivered: number
  status: number
  deliveryAt: Date
  paidAt: Date
}

export interface TItemOrderProducts extends TItemOrderProductMe {}
