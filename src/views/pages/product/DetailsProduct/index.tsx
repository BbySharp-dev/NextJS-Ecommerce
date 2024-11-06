// ** Next
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import Image from 'next/image'

// ** React
import { Fragment, useEffect, useMemo, useState } from 'react'

// ** Mui
import { Box, Button, Grid, IconButton, Rating, Typography, useTheme } from '@mui/material'

// ** Components
import CustomTextField from 'src/components/text-field'
import Icon from 'src/components/Icon'
import Spinner from 'src/components/spinner'
import CardRelatedProduct from 'src/views/pages/product/components/CardRelatedProduct'
import NoData from 'src/components/no-data'
import CardSkeletonRelated from 'src/views/pages/product/components/CardSkeletonRelated'
import CustomCarousel from 'src/components/custom-carousel'
import CommentInput from 'src/views/pages/product/components/CommentInput'
import CommentItem from 'src/views/pages/product/components/CommentItem'
import CardReview from 'src/views/pages/product/components/CardReview'

// ** Translate
import { t } from 'i18next'
import { useTranslation } from 'react-i18next'

// ** Utils
import { convertUpdateProductToCart, formatNumberToLocal, isExpiry, formatFilter, cloneDeep } from 'src/utils'
import { hexToRGBA } from 'src/utils/hex-to-rgba'

// ** Redux
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/stores'
import { updateProductToCart } from 'src/stores/order-product'
import { resetInitialState } from 'src/stores/reviews'
import { resetInitialState as resetInitialStateComment } from 'src/stores/comments'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'

// ** Services
import { getAllReviews } from 'src/services/reviewProduct'
import { getAllCommentsPublic } from 'src/services/commentProduct'

// ** Other
import { getLocalProductCart, setLocalProductToCart } from 'src/helpers/storage'

// ** Types
import { TProduct } from 'src/types/product'

// ** Configs
import { ROUTE_CONFIG } from 'src/configs/route'
import connectSocketIO from 'src/helpers/socket'
import { ACTION_SOCKET_COMMENT } from 'src/configs/socketIo'

// ** Types
import { TReviewItem } from 'src/types/reviews'
import toast from 'react-hot-toast'
import { OBJECT_TYPE_ERROR_REVIEW } from 'src/configs/error'

import { TCommentItemProduct } from 'src/types/comment'
import { createCommentAsync } from 'src/stores/comments/actions'

type TProps = {
  productData:TProduct
  productsRelated: TProduct[]
}


const DetailsProductPage: NextPage<TProps> = ({productData, productsRelated}) => {
  // State
  const [loading, setLoading] = useState(false)
  const [dataProduct, setDataProduct] = useState<TProduct | any>({})
  const [listRelatedProduct, setRelatedProduct] = useState<TProduct[]>([])
  const [listReviews, setListReview] = useState<TReviewItem[]>([])
  const [listComment, setListComment] = useState<{ data: TCommentItemProduct[], total: number }>({
    data: [],
    total: 0
  })

  const [amountProduct, setAmountProduct] = useState(1)

  // ** Hooks
  const { i18n } = useTranslation()
  const router = useRouter()
  const slug = router.query?.productId as string
  const { user } = useAuth()

  // ** theme
  const theme = useTheme()

  // ** redux
  const { orderItems } = useSelector((state: RootState) => state.orderProduct)

  const {
    isSuccessEdit,
    isErrorEdit,
    isLoading,
    messageErrorEdit,
    isErrorDelete,
    isSuccessDelete,
    messageErrorDelete,
    typeError,
  } = useSelector((state: RootState) => state.reviews)

  const {
    isSuccessCreate: isSuccessCreateComment,
    isErrorCreate: isErrorCreateComment,
    messageErrorCreate: messageErrorCreateComment,
    isSuccessReply,
    isErrorReply,
    isLoading: isLoadingComment,
    messageErrorReply,
    isSuccessDelete: isSuccessDeleteComment,
    isErrorDelete: isErrorDeleteComment,
    messageErrorDelete: messageErrorDeleteComment,
    isSuccessEdit: isSuccessEditComment,
    isErrorEdit: isErrorEditComment,
    messageErrorEdit: messageErrorEditComment
  } = useSelector((state: RootState) => state.comments)

  const dispatch: AppDispatch = useDispatch()

  // fetch api

  const fetchGetAllListReviewByProduct = async (id: string) => {
    setLoading(true)
    await getAllReviews({
      params: {
        limit: -1, page: -1, order: "createdAt desc", isPublic: true, ...formatFilter({ productId: id }),
      }
    })
      .then(async response => {
        setLoading(false)
        const data = response?.data?.reviews
        if (data) {
          setListReview(data)
        }
      })
      .catch(() => {
        setLoading(false)
      })
  }

  const fetchListCommentProduct = async (productId:string) => {
    setLoading(true)
    await getAllCommentsPublic({ params: { limit: -1, page: -1, order: "createdAt desc", isPublic: true, productId: productId} })
      .then(async response => {
        setLoading(false)
        const data = response?.data
        if (data) {
          setListComment({
            data: data.comments,
            total: data.totalCount
          })
        }
      })
      .catch(() => {
        setLoading(false)
      })
  }

  // ** Handle
  const handleUpdateProductToCart = (item: TProduct) => {
    const productCart = getLocalProductCart()
    const parseData = productCart ? JSON.parse(productCart) : {}
    const discountItem = isExpiry(item.discountStartDate, item.discountEndDate) ? item.discount : 0

    const listOrderItems = convertUpdateProductToCart(orderItems, {
      name: item.name,
      amount: amountProduct,
      image: item.image,
      price: item.price,
      discount: discountItem,
      product: item._id,
      slug: item.slug
    })

    if (user?._id) {
      dispatch(
        updateProductToCart({
          orderItems: listOrderItems
        })
      )
      setLocalProductToCart({ ...parseData, [user?._id]: listOrderItems })
    } else {
      router.replace({
        pathname: '/login',
        query: { returnUrl: router.asPath }
      })
    }
  }

  const handleBuyProductToCart = (item: TProduct) => {
    handleUpdateProductToCart(item)
    router.push(
      {
        pathname: ROUTE_CONFIG.MY_CART,
        query: {
          selected: item._id
        }
      },
      ROUTE_CONFIG.MY_CART
    )
  }


  const handleComment = (comment: string) => {
    if (comment) {
      if (user) {
        dispatch(createCommentAsync({
          product: dataProduct._id,
          user: user?._id,
          content: comment
        }))
      } else {
        router.replace({
          pathname: ROUTE_CONFIG.LOGIN,
          query: { returnUrl: router.asPath }
        })
      }
    }
  }

  const findCommentByIdRecursive = (comments: TCommentItemProduct[], id: string): undefined | TCommentItemProduct => {
    const findComment: undefined | TCommentItemProduct = comments.find((item) => item._id === id)
    if (findComment) return findComment

    for (const comment of comments) {
      if (comment.replies && comment.replies.length > 0) {
        const findReply: undefined | TCommentItemProduct = findCommentByIdRecursive(comment.replies, id)
        if (findReply) return findReply
      }
    }

    return undefined
  }

  const deleteCommentByIdRecursive = (comments: TCommentItemProduct[], id: string): undefined | TCommentItemProduct => {
    const index = comments.findIndex((item) => item._id === id)
    if (index !== -1) {
      const item = comments[index]
      comments.splice(index, 1)

      return item
    }

    for (const comment of comments) {
      if (comment.replies && comment.replies.length > 0) {
        const findReply: undefined | TCommentItemProduct = deleteCommentByIdRecursive(comment.replies, id)
        if (findReply) return findReply
      }
    }

    return undefined
  }

  const deleteManyCommentRecursive = (comments: TCommentItemProduct[], ids: string[]) => {
    let deletedCount: number = 0
    ids.forEach((id) => {
      const index = comments.findIndex((item) => item._id === id)
      if (index !== -1) {
        comments.splice(index, 1)
        deletedCount += 1
      }
    })

    for (const comment of comments) {
      if (comment.replies && comment.replies.length > 0) {
        deleteManyCommentRecursive(comment.replies, ids)
      }
    }

    return deletedCount
  }

  const renderCommentItem = (item: TCommentItemProduct, level: number) => {
    level += 1

    return (
      <Box sx={{ marginLeft: `${level * 80}px` }}>
        <CommentItem item={item} />
        {item.replies && item?.replies?.length > 0 && (
          <>
            {item.replies?.map((reply) => {
              return (
                <>{renderCommentItem(reply, level)}</>
              )
            })}
          </>
        )}
      </Box>
    )
  }

  useEffect(() => {
    const socket = connectSocketIO()
    const cloneListComment = cloneDeep(listComment)

    socket.on(ACTION_SOCKET_COMMENT.CREATE_COMMENT, (data) => {
      const newListComment = cloneListComment.data
      newListComment.unshift({ ...data })

      setListComment({
        data: newListComment,
        total: cloneListComment.total + 1
      })
    })


    socket.on(ACTION_SOCKET_COMMENT.REPLY_COMMENT, (data) => {
      const parentId = data.parent
      const findParent = cloneListComment?.data?.find((item: TCommentItemProduct) => item?._id === parentId)
      if (findParent) {
        findParent?.replies?.push({ ...data })
        setListComment({
          data: cloneListComment.data,
          total: cloneListComment.total + 1
        })
      }
    })

    socket.on(ACTION_SOCKET_COMMENT.UPDATE_COMMENT, (data) => {
      const findComment = findCommentByIdRecursive(cloneListComment.data, data._id)
      if (findComment) {
        findComment.content = data.content
        setListComment(cloneListComment)
      }
    })

    socket.on(ACTION_SOCKET_COMMENT.DELETE_COMMENT, (data) => {
      const deleteComment = deleteCommentByIdRecursive(cloneListComment.data, data._id)
      if (deleteComment) {
        const totalDelete = (deleteComment?.replies ? deleteComment?.replies?.length : 0) + 1
        setListComment({
          data: cloneListComment.data,
          total: cloneListComment.total - totalDelete
        })
      }
    })

    socket.on(ACTION_SOCKET_COMMENT.DELETE_MULTIPLE_COMMENT, (data) => {
      const deletedCount = deleteManyCommentRecursive(cloneListComment.data, data)
      setListComment({
        data: cloneListComment.data,
        total: cloneListComment.total - deletedCount
      })
    })

    return () => {
      socket.disconnect()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listComment])

  useEffect(() => {
    if(productData?._id) {
      setDataProduct(productData)
    }
  },[productData])

  useEffect(() => {
    if(productsRelated.length > 0) {
      setRelatedProduct(productsRelated)
    }
  }, [productsRelated])

  useEffect(() => {
    if (dataProduct._id) {
      fetchListCommentProduct(dataProduct._id)
      fetchGetAllListReviewByProduct(dataProduct._id)
    }
  }, [dataProduct._id])

  const memoIsExpiry = useMemo(() => {
    return isExpiry(dataProduct.discountStartDate, dataProduct.discountEndDate)
  }, [dataProduct])

  useEffect(() => {
    if (isSuccessEdit) {
      toast.success(t('Update_review_success'))
      fetchGetAllListReviewByProduct(dataProduct._id)
      dispatch(resetInitialState())
    } else if (isErrorEdit && messageErrorEdit && typeError) {
      const errorConfig = OBJECT_TYPE_ERROR_REVIEW[typeError]
      if (errorConfig) {
        toast.error(t(errorConfig))
      } else {
        toast.error(t('Update_review_error'))

      }
      dispatch(resetInitialState())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessEdit, isErrorEdit, messageErrorEdit, typeError])

  useEffect(() => {
    if (isSuccessDelete) {
      toast.success(t('Delete_review_success'))
      fetchGetAllListReviewByProduct(dataProduct._id)
      dispatch(resetInitialState())
    } else if (isErrorDelete && messageErrorDelete) {
      toast.error(t('Delete_review_error'))
      dispatch(resetInitialState())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessDelete, isErrorDelete, messageErrorDelete])

  useEffect(() => {
    if (isSuccessDeleteComment) {
      toast.success(t('Delete_comment_success'))
      dispatch(resetInitialStateComment())
    } else if (isErrorDeleteComment && messageErrorDeleteComment) {
      toast.error(t('Delete_comment_error'))
      dispatch(resetInitialStateComment())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessDeleteComment, isErrorDeleteComment, messageErrorDeleteComment])

  useEffect(() => {
    if (isSuccessCreateComment) {
      toast.success(t('Create_comment_success'))
      // fetchListCommentProduct()
      dispatch(resetInitialStateComment())
    } else if (isErrorCreateComment && messageErrorCreateComment) {
      toast.error(t('Create_comment_error'))
      dispatch(resetInitialStateComment())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessCreateComment, isErrorCreateComment, messageErrorCreateComment])

  useEffect(() => {
    if (isSuccessEditComment) {
      toast.success(t('Update_comment_success'))
      dispatch(resetInitialStateComment())
    } else if (isErrorEditComment && messageErrorEditComment) {
      toast.error(t('Update_comment_error'))
      dispatch(resetInitialStateComment())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessEditComment, isErrorEditComment, messageErrorEditComment, typeError])

  useEffect(() => {
    if (isSuccessReply) {
      toast.success(t('Create_reply_success'))
      dispatch(resetInitialStateComment())
    } else if (isErrorReply && messageErrorReply) {
      toast.error(t('Create_reply_error'))
      dispatch(resetInitialStateComment())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessReply, isErrorReply, messageErrorReply])

  return (
    <>
      {(loading || isLoadingComment) && <Spinner />}
      <Grid container>
        <Box
          marginTop={{ md: 5, xs: 4 }}
        >
          <Typography sx={{ color: theme.palette.primary.main, fontWeight: "600", marginBottom: "8px"}}>{t("Product_details")}{" / "}{dataProduct.type?.name}{" "}/{" "}{dataProduct?.name}</Typography>
        </Box>
        <Grid
          container
          item
          md={12}
          xs={12}
          sx={{ backgroundColor: theme.palette.background.paper, borderRadius: '15px', py: 5, px: 4 }}
        >

          <Box sx={{ height: '100%', width: '100%' }}>
            <Grid container spacing={8}>
              <Grid item md={5} xs={12}>
                <Image
                  src={dataProduct?.image}
                  alt='banner'
                  width={0}
                  height={0}
                  style={{
                    height: '100%',
                    maxHeight: '400px',
                    width: '100%',
                    objectFit: 'contain',
                    borderRadius: '15px'
                  }}
                />
              </Grid>
              <Grid item md={7} xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography
                    variant='h5'
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 'bold',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      '-webkitLineClamp': '2',
                      '-webkitBoxOrient': 'vertical'
                    }}
                  >
                    {dataProduct.name}
                  </Typography>
                </Box>
                <Typography variant='body2' color='text.secondary'>
                  {dataProduct.countInStock > 0 ? (
                    <>{t('Still')}{" "} <b>{dataProduct?.countInStock}</b>{" "}<span>{t("product_in_stock")}</span></>
                  ) : (
                    <Box
                      sx={{
                        backgroundColor: hexToRGBA(theme.palette.error.main, 0.42),
                        width: '60px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '2px',
                        my: 1
                      }}
                    >
                      <Typography
                        variant='h6'
                        sx={{
                          color: theme.palette.error.main,
                          fontSize: '12px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Hết hàng
                      </Typography>
                    </Box>
                  )}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  {!!dataProduct?.averageRating && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant='h5'
                        sx={{
                          color: theme.palette.primary.main,
                          fontWeight: 'bold',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          '-webkitLineClamp': '2',
                          '-webkitBoxOrient': 'vertical',
                          textDecoration: 'underline',
                          fontSize: '16px'
                        }}
                      >
                        {dataProduct.averageRating}
                      </Typography>
                      <Rating
                        name='read-only'
                        sx={{ fontSize: '16px' }}
                        defaultValue={dataProduct?.averageRating}
                        precision={0.5}
                        readOnly
                      />
                    </Box>
                  )}
                  <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                    {dataProduct.totalReviews > 0 ? (
                      <span>
                        <b>{dataProduct.totalReviews}</b>
                        {" "}
                        {t('Review')}
                      </span>
                    ) : (
                      <span>{t('not_review')}</span>
                    )}
                  </Typography>
                  {' | '}
                  {dataProduct.sold && (
                    <Typography variant='body2' color='text.secondary'>
                      <>{t('Sold_product')}</> <b>{dataProduct.sold}</b> <>{t('Product')}</>
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px', mt: 2 }}>
                  <Icon icon='carbon:location' />

                  <Typography
                    variant='h6'
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                  >
                    {dataProduct?.location?.name}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mt: 2,
                    backgroundColor: theme.palette.customColors.bodyBg,
                    padding: '8px',
                    borderRadius: '8px'
                  }}
                >
                  {dataProduct.discount > 0 && memoIsExpiry && (
                    <Typography
                      variant='h6'
                      sx={{
                        color: theme.palette.error.main,
                        fontWeight: 'bold',
                        textDecoration: 'line-through',
                        fontSize: '18px'
                      }}
                    >
                      {formatNumberToLocal(dataProduct.price)} VND
                    </Typography>
                  )}
                  <Typography
                    variant='h4'
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 'bold',
                      fontSize: '24px'
                    }}
                  >
                    {dataProduct.discount > 0 && memoIsExpiry ? (
                      <>{formatNumberToLocal((dataProduct.price * (100 - dataProduct.discount)) / 100)}</>
                    ) : (
                      <>{formatNumberToLocal(dataProduct.price)}</>
                    )}{' '}
                    VND
                  </Typography>
                  {dataProduct.discount > 0 && memoIsExpiry && (
                    <Box
                      sx={{
                        backgroundColor: hexToRGBA(theme.palette.error.main, 0.42),
                        width: '36px',
                        height: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '2px'
                      }}
                    >
                      <Typography
                        variant='h6'
                        sx={{
                          color: theme.palette.error.main,
                          fontSize: '10px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        - {dataProduct.discount} %
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ flexBasis: '10%', mt: 8, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconButton
                    onClick={() => {
                      if (amountProduct > 1) {
                        setAmountProduct(prev => prev - 1)
                      }
                    }}
                    sx={{
                      backgroundColor: `${theme.palette.primary.main} !important`,
                      color: `${theme.palette.common.white}`
                    }}
                  >
                    <Icon icon='ic:sharp-minus' />
                  </IconButton>
                  <CustomTextField
                    type='number'
                    value={amountProduct}
                    onChange={e => {
                      setAmountProduct(+e.target.value)
                    }}
                    inputProps={{
                      inputMode: 'numeric',
                      min: 1,
                      max: dataProduct.countInStock
                    }}
                    margin='normal'
                    sx={{
                      '.MuiInputBase-input.MuiFilledInput-input': {
                        width: '20px'
                      },
                      '.MuiInputBase-root.MuiFilledInput-root': {
                        borderRadius: '0px',
                        borderTop: 'none',
                        borderRight: 'none',
                        borderLeft: 'none',
                        '&.Mui-focused': {
                          backgroundColor: `${theme.palette.background.paper} !important`,
                          boxShadow: 'none !important'
                        }
                      },
                      'input::-webkit-outer-spin-button, input::-webkit-inner-spin-button': {
                        WebkitAppearance: 'none',
                        margin: 0
                      },
                      'input[type=number]': {
                        MozAppearance: 'textfield'
                      }
                    }}
                  />
                  <IconButton
                    onClick={() => {
                      if (amountProduct < dataProduct.countInStock) {
                        setAmountProduct(prev => prev + 1)
                      }
                    }}
                    sx={{
                      backgroundColor: `${theme.palette.primary.main} !important`,
                      color: `${theme.palette.common.white}`
                    }}
                  >
                    <Icon icon='ic:round-plus' />
                  </IconButton>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    mt: 8,
                    paddingBottom: '10px'
                  }}
                >
                  <Button
                    onClick={() => handleUpdateProductToCart(dataProduct)}
                    variant='outlined'
                    sx={{
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      fontWeight: 'bold'
                    }}
                    disabled={dataProduct.countInStock < 1}
                  >
                    <Icon icon='bx:cart' fontSize={24} style={{ position: 'relative', top: '-2px' }} />
                    {t('Add_to_cart')}
                  </Button>
                  <Button
                    disabled={dataProduct.countInStock < 1}
                    variant='contained'
                    sx={{
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      fontWeight: 'bold'
                    }}
                    onClick={() => handleBuyProductToCart(dataProduct)}
                  >
                    <Icon icon='icon-park-outline:buy' fontSize={20} style={{ position: 'relative', top: '-2px' }} />
                    {t('Buy_now')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>
        <Grid container md={12} xs={12} mt={6}>
          <Grid container>
            <Grid
              container
              item
              md={9}
              xs={12}

            >
              <Box sx={{ width: "100%" }}>
                <Box sx={{ backgroundColor: theme.palette.background.paper, borderRadius: '15px', py: 5, px: 4 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mt: 2,
                      backgroundColor: theme.palette.customColors.bodyBg,
                      padding: '8px',
                      borderRadius: '8px'
                    }}
                  >
                    <Typography
                      variant='h6'
                      sx={{
                        color: `rgba(${theme.palette.customColors.main}, 0.68)`,
                        fontWeight: 'bold',
                        fontSize: '18px'
                      }}
                    >
                      {t('Description_product')}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      mt: 4,
                      color: `rgba(${theme.palette.customColors.main}, 0.42)`,
                      fontSize: '14px',
                      backgroundColor: theme.palette.customColors.bodyBg,
                      padding: 4,
                      borderRadius: '10px'
                    }}
                    dangerouslySetInnerHTML={{ __html: dataProduct.description }}
                  />
                </Box>
                <Box
                  display={{ md: "block", xs: "none" }}
                  sx={{ backgroundColor: theme.palette.background.paper, borderRadius: '15px', py: 5, px: 4, width: "100%" }}
                  marginTop={{ md: 5, xs: 4 }}
                >
                  <Typography
                    variant='h6'
                    sx={{
                      color: `rgba(${theme.palette.customColors.main}, 0.68)`,
                      fontWeight: 'bold',
                      fontSize: '18px'
                    }}
                  >
                    {t('Review_product')} <b style={{ color: theme.palette.primary.main }}>{listReviews?.length}</b> {t("ratings")}
                  </Typography>
                  <Box sx={{ width: "100%" }}>
                    <CustomCarousel
                      arrows
                      showDots={true}
                      ssr={true}
                      responsive={{
                        superLargeDesktop: {
                          breakpoint: { max: 4000, min: 3000 },
                          items: 4
                        },
                        desktop: {
                          breakpoint: { max: 3000, min: 1024 },
                          items: 3
                        },
                        tablet: {
                          breakpoint: { max: 1024, min: 464 },
                          items: 2
                        },
                        mobile: {
                          breakpoint: { max: 464, min: 0 },
                          items: 1
                        }
                      }}
                    >
                      {listReviews.map((review: TReviewItem) => {
                        return (
                          <Box key={review._id} sx={{ margin: "0 10px" }}>
                            <CardReview item={review} />
                          </Box>
                        )
                      })}
                    </CustomCarousel>
                  </Box>
                </Box>
                <Box
                  display={{ md: "block", xs: "none" }}
                  sx={{ backgroundColor: theme.palette.background.paper, borderRadius: '15px', py: 5, px: 4, width: "100%" }}
                  marginTop={{ md: 5, xs: 4 }}
                >
                  <Typography
                    variant='h6'
                    sx={{
                      color: `rgba(${theme.palette.customColors.main}, 0.68)`,
                      fontWeight: 'bold',
                      fontSize: '18px',
                      mb: "8px"
                    }}
                  >
                    {t('Comment_product')} <b style={{ color: theme.palette.primary.main }}>{listComment?.total}</b> {t("comments")}
                  </Typography>
                  <Box sx={{ width: "100%" }}>
                    <CommentInput onApply={handleComment} />
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "30px" }}>
                      {listComment?.data?.map((comment: TCommentItemProduct) => {
                        const level: number = -1

                        return (
                          <Fragment key={comment._id}>
                            {renderCommentItem(comment, level)}
                          </Fragment>
                        )
                      })}
                    </Box>

                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid container item md={3} xs={12} mt={{ md: 0, xs: 5 }}>
              <Box
                sx={{
                  height: '100%',
                  width: '100%',
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: '15px',
                  py: 5,
                  px: 4
                }}
                marginLeft={{ md: 5, xs: 0 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mt: 2,
                    backgroundColor: theme.palette.customColors.bodyBg,
                    padding: '8px',
                    borderRadius: '8px'
                  }}
                >
                  <Typography
                    variant='h6'
                    sx={{
                      color: `rgba(${theme.palette.customColors.main}, 0.68)`,
                      fontWeight: 'bold',
                      fontSize: '18px'
                    }}
                  >
                    {t('Product_same')}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    mt: 4
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {Array.from({ length: 6 }).map((_, index) => {
                        return (
                          <CardSkeletonRelated key={index} />
                        )
                      })}
                    </Box>
                  ) : (
                    <>
                      {listRelatedProduct.length > 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {listRelatedProduct.map(item => {
                            return <CardRelatedProduct key={item._id} item={item} />
                          })}
                        </Box>
                      ) : (
                        <Box sx={{ width: '100%', mt: 10 }}>
                          <NoData widthImage='60px' heightImage='60px' textNodata={t('No_product')} />
                        </Box>
                      )}
                    </>
                  )}

                </Box>
              </Box>
            </Grid>
            <Box
              display={{ md: "none", xs: "block" }}
              sx={{ backgroundColor: theme.palette.background.paper, borderRadius: '15px', py: 5, px: 4, width: "100%" }}
              marginTop={{ md: 5, xs: 4 }}
            >
              <Typography
                variant='h6'
                sx={{
                  color: `rgba(${theme.palette.customColors.main}, 0.68)`,
                  fontWeight: 'bold',
                  fontSize: '18px'
                }}
              >
                {t('Review_product')} <b style={{ color: theme.palette.primary.main }}>{listReviews?.length}</b> {t("ratings")}
              </Typography>
              <Box sx={{ width: "100%" }}>
                <CustomCarousel
                  arrows
                  showDots={true}
                  ssr={true}
                  responsive={{
                    superLargeDesktop: {
                      breakpoint: { max: 4000, min: 3000 },
                      items: 4
                    },
                    desktop: {
                      breakpoint: { max: 3000, min: 1024 },
                      items: 3
                    },
                    tablet: {
                      breakpoint: { max: 1024, min: 464 },
                      items: 2
                    },
                    mobile: {
                      breakpoint: { max: 464, min: 0 },
                      items: 1
                    }
                  }}
                >
                  {listReviews.map((review: TReviewItem) => {
                    return (
                      <Box key={review._id} sx={{ margin: "0 10px" }}>
                        <CardReview item={review} />
                      </Box>
                    )
                  })}
                </CustomCarousel>
              </Box>
            </Box>
            <Box
              display={{ md: "none", xs: "block" }}
              sx={{ backgroundColor: theme.palette.background.paper, borderRadius: '15px', py: 5, px: 4, width: "100%" }}
              marginTop={{ md: 5, xs: 4 }}
            >
              <Typography
                variant='h6'
                sx={{
                  color: `rgba(${theme.palette.customColors.main}, 0.68)`,
                  fontWeight: 'bold',
                  fontSize: '18px'
                }}
              >
                {t('Comment_product')} <b style={{ color: theme.palette.primary.main }}>{listComment?.total}</b> {t("comments")}
              </Typography>
              <Box sx={{ width: "100%" }}>
                <CommentInput onApply={handleComment} />
                <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "30px", maxHeight: "300px", overflow: "auto" }}>
                  {listComment?.data?.map((comment: TCommentItemProduct) => {
                    const level: number = -1

                    return (
                      <Fragment key={comment._id}>
                        {renderCommentItem(comment, level)}
                      </Fragment>
                    )
                  })}
                </Box>

              </Box>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default DetailsProductPage
