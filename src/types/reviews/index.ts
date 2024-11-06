export type TParamsAddReview = {
  product: string
  user: string
  content: string
  star: number
}

export interface TParamsUpdateReview {
  id: string
  content: string
  star: number
}

export type TParamsDeleteMultipleReview = {
  reviewIds: string[]
}

export type TParamsGetReviews = {
  limit?: number
  page?: number
  search?: string
  order?: string
  isPublic?: boolean
}

export type TReviewItem = {
  _id: string
  user: {
    firstName: string
    lastName: string
    middleName: string
    avatar: string
    _id: string
  }
  product: {
    id: string
    name: string
  }
  content: string
  star: number
  updatedAt: Date
}
