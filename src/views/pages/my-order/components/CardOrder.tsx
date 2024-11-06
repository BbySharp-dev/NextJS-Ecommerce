// ** Next
import { NextPage } from 'next'
import { useRouter } from 'next/router'

// ** React
import { useEffect, useState, useMemo } from 'react'

// ** Mui
import { Avatar, Box, Button, Divider, Typography, useTheme } from '@mui/material'

// ** Components
import ConfirmationDialog from 'src/components/confirmation-dialog'
import Icon from 'src/components/Icon'

// ** Translate
import { t } from 'i18next'

// ** Utils
import { convertUpdateMultipleProductsCart, convertUpdateProductToCart, formatNumberToLocal, isExpiry } from 'src/utils'
import { hexToRGBA } from 'src/utils/hex-to-rgba'

// ** Redux
import { cancelOrderProductOfMeAsync } from 'src/stores/order-product/actions'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/stores'
import { updateProductToCart } from 'src/stores/order-product'

// ** Other
import { TItemOrderProduct, TItemOrderProductMe, TItemProductMe } from 'src/types/order-product'
import { getLocalProductCart, setLocalProductToCart } from 'src/helpers/storage'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'

// ** Config
import { ROUTE_CONFIG } from 'src/configs/route'
import { STATUS_ORDER_PRODUCT } from 'src/configs/orderProduct'
import { useTranslation } from 'react-i18next'
import { PAYMENT_TYPES } from 'src/configs/payment'
import { createURLpaymentVNPay } from 'src/services/payment'
import Spinner from 'src/components/spinner'

type TProps = {
  dataOrder: TItemOrderProductMe
}

const CardOrder: NextPage<TProps> = props => {
  // ** Props
  const { dataOrder } = props

  // State
  const [openCancel, setOpenCancel] = useState(false)
  const [loading, setLoading] = useState(false)

  // ** Hooks
  const router = useRouter()
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const PAYMENT_DATA = PAYMENT_TYPES()

  // ** theme
  const theme = useTheme()

  // ** redux
  const dispatch: AppDispatch = useDispatch()
  const { isSuccessCancelMe, orderItems } = useSelector((state: RootState) => state.orderProduct)

  const handleConfirmCancel = () => {
    dispatch(cancelOrderProductOfMeAsync(dataOrder._id))
  }

  // ** handle
  const handleCloseDialog = () => {
    setOpenCancel(false)
  }

  useEffect(() => {
    if (isSuccessCancelMe) {
      handleCloseDialog()
    }
  }, [isSuccessCancelMe])

  const handleUpdateProductToCart = (items: TItemOrderProduct[]) => {
    const productCart = getLocalProductCart()
    const parseData = productCart ? JSON.parse(productCart) : {}

    const listOrderItems = convertUpdateMultipleProductsCart(orderItems, items)

    if (user) {
      dispatch(
        updateProductToCart({
          orderItems: listOrderItems
        })
      )
      setLocalProductToCart({ ...parseData, [user?._id]: listOrderItems })
    }
  }

  const handleBuyAgain = () => {
    handleUpdateProductToCart(dataOrder.orderItems.map((item) => ({
      name: item.name,
      amount: item.amount,
      image: item.image,
      price: item.price,
      discount: item.discount,
      product: item?.product?._id,
      slug: item?.product?.slug,
    })))
    router.push(
      {
        pathname: ROUTE_CONFIG.MY_CART,
        query: {
          selected: dataOrder?.orderItems?.map((item: TItemProductMe) => item?.product?._id)
        }
      },
      ROUTE_CONFIG.MY_CART
    )
  }

  const handleNavigateDetailsOrder = () => {
    router.push(`${ROUTE_CONFIG.MY_ORDER}/${dataOrder._id}`)
  }

  const handlePaymentTypeOrder = (type: string) => {
    switch (type) {
      case PAYMENT_DATA.VN_PAYMENT.value: {
        handlePaymentVNPay()
        break
      }
      default:
        break
    }
  }

  const handlePaymentVNPay = async () => {
    setLoading(true)
    await createURLpaymentVNPay({
      totalPrice:
        dataOrder.totalPrice,
      orderId: dataOrder?._id,
      language: i18n.language === "vi" ? "vn" : i18n.language
    }).then((res) => {
      if (res?.data) {
        window.open(res?.data, '_blank')
      }
      setLoading(false)
    })

  }

  const memeDisabledBuyAgain = useMemo(() => {
    return dataOrder?.orderItems?.some((item) => !item.product.countInStock)
  }, [dataOrder.orderItems])

  return (
    <>
      {loading && <Spinner />}
      <ConfirmationDialog
        open={openCancel}
        handleClose={handleCloseDialog}
        handleCancel={handleCloseDialog}
        handleConfirm={handleConfirmCancel}
        title={t('Title_cancel_order')}
        description={t('Confirm_cancel_order')}
      />
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          padding: '40px',
          width: '100%',
          borderRadius: '15px'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
          {!!dataOrder.isDelivered && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Icon icon='carbon:delivery'></Icon>
              <Typography>
                <span style={{ color: theme.palette.success.main }}>{t('Order_has_been_delivery')}</span>
                <span>{' | '}</span>
              </Typography>
            </Box>
          )}
          {!!dataOrder.isPaid && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Icon icon='streamline:payment-10'></Icon>
              <Typography>
                <span style={{ color: theme.palette.success.main }}>{t('Order_has_been_paid')}</span>
                <span>{' | '}</span>
              </Typography>
            </Box>
          )}
          <Typography sx={{ textTransform: 'uppercase', color: theme.palette.primary.main, fontWeight: 600 }}>
            {t(`${(STATUS_ORDER_PRODUCT as any)[dataOrder.status].label}`)}
          </Typography>
        </Box>
        <Divider />
        <Box mt={2} mb={2} sx={{ display: 'flex', flexDirection: 'column', gap: 4, cursor: "pointer" }} onClick={handleNavigateDetailsOrder}>
          {dataOrder?.orderItems?.map((item: TItemProductMe) => {
            return (
              <Box key={item?.product?._id} sx={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Box
                  sx={{
                    border: `1px solid rgba(${theme.palette.customColors.main}, 0.2)`
                  }}
                >
                  <Avatar
                    sx={{
                      width: '80px',
                      height: '80px'
                    }}
                    src={item.image}
                  />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: '18px',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      display: 'block'
                    }}
                  >
                    {item.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography
                      variant='h6'
                      sx={{
                        color: item.discount > 0 ? theme.palette.error.main : theme.palette.primary.main,
                        textDecoration: item.discount > 0 ? 'line-through' : 'normal',
                        fontSize: '14px'
                      }}
                    >
                      {formatNumberToLocal(item.price)} VND
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {item.discount > 0 && (
                        <Typography
                          variant='h4'
                          sx={{
                            color: theme.palette.primary.main,
                            fontSize: '14px'
                          }}
                        >
                          {formatNumberToLocal((item.price * (100 - item.discount)) / 100)}
                        </Typography>
                      )}
                      {item.discount > 0 && (
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
                            - {item.discount} %
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: '14px'
                    }}
                  >
                    x {item.amount}
                  </Typography>
                </Box>
              </Box>
            )
          })}
        </Box>
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '2px', mt: 4 }}>
          <Typography sx={{ fontSize: '18px', fontWeight: 600 }}>{t('Sum_money')}:</Typography>
          <Typography sx={{ fontSize: '18px', fontWeight: 600, color: theme.palette.primary.main }}>
            {formatNumberToLocal(dataOrder.totalPrice)} VND
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mt: 6, justifyContent: 'flex-end' }}>
          {[0].includes(dataOrder.status) && dataOrder?.paymentMethod?.type !== PAYMENT_DATA.PAYMENT_LATER.value && (
            <Button
              variant='outlined'
              onClick={() => handlePaymentTypeOrder(dataOrder?.paymentMethod?.type)}
              sx={{
                height: 40,
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                backgroundColor: 'transparent !important',
              }}
            >
              {t('Payment')}
            </Button>
          )}
          {[0, 1].includes(dataOrder.status) && (
            <Button
              variant='outlined'
              onClick={() => setOpenCancel(true)}
              sx={{
                height: 40,
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                color: '#da251d !important',
                backgroundColor: 'transparent !important',
                border: '1px solid #da251d !important'
              }}
            >
              {t('Cancel_order')}
            </Button>
          )}
          <Button
            variant='contained'
            onClick={handleBuyAgain}
            sx={{
              height: 40,
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              fontWeight: 'bold'
            }}
            disabled={memeDisabledBuyAgain}
          >
            {t('Buy_again')}
          </Button>
          <Button
            variant='outlined'
            sx={{
              height: 40,
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              fontWeight: 'bold'
            }}
          >
            {t('View_details')}
          </Button>
        </Box>
      </Box>
    </>
  )
}

export default CardOrder
