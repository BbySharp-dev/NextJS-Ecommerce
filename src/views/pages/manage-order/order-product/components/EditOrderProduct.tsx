// ** React
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

// ** Form
import { yupResolver } from '@hookform/resolvers/yup'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'

// ** Mui
import {
  Box,
  Button,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  Switch,
  Typography,
  useTheme
} from '@mui/material'

// ** Component
import Icon from 'src/components/Icon'
import CustomModal from 'src/components/custom-modal'
import Spinner from 'src/components/spinner'
import CustomTextField from 'src/components/text-field'
import CustomSelect from 'src/components/custom-select'

// ** Services
import { getAllCities } from 'src/services/city'
import { getDetailsOrderProduct } from 'src/services/order-product'

// ** Redux
import { AppDispatch } from 'src/stores'
import { useDispatch } from 'react-redux'
import { updateOrderProductAsync } from 'src/stores/order-product/actions'

// ** Others
import { stringToSlug } from 'src/utils'


interface TCreateEditProduct {
  open: boolean
  onClose: () => void
  idOrder?: string
}

type TDefaultValue = {
  fullName: string,
  address: string,
  city: string,
  phone: ""
}

const EditOrderProduct = (props: TCreateEditProduct) => {
  // State
  const [loading, setLoading] = useState(false)
  const [optionCities, setOptionCities] = useState<{ label: string; value: string }[]>([])

  // ** Props
  const { open, onClose, idOrder } = props

  // Hooks
  const theme = useTheme()
  const { t, i18n } = useTranslation()

  // ** Redux
  const dispatch: AppDispatch = useDispatch()

  const schema = yup.object().shape({
    fullName: yup.string().required(t('Required_field')),
    phone: yup.string().required(t('Required_field')),
    address: yup.string().required(t('Required_field')),
    city: yup.string().required(t('Required_field')),
  })

  const defaultValues: TDefaultValue = {
    fullName: '',
    address: '',
    city: '',
    phone: ""
  }

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    getValues,
    setError,
    clearErrors
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  // handle
  const onSubmit = (data: any) => {
    if (!Object.keys(errors).length) {
      // update
      if(idOrder) {
        dispatch(
          updateOrderProductAsync({
            id: idOrder,
            shippingAddress: {
              fullName: data.fullName,
              phone: data.phone,
              address: data.address,
              city: data.city,
            },
          })
        )
      }
    }
  }

  // fetch api
  const fetchDetailsOrderProduct = async (id: string) => {
    setLoading(true)
    await getDetailsOrderProduct(id)
      .then(res => {
        const data = res.data
        if (data) {
          reset({
            fullName: data?.shippingAddress?.fullName,
            phone: data?.shippingAddress?.phone,
            city: data?.shippingAddress?.city,
            address: data?.shippingAddress?.address,
          })
        }
        setLoading(false)
      })
      .catch(e => {
        setLoading(false)
      })
  }

  const fetchAllCities = async () => {
    setLoading(true)
    await getAllCities({ params: { limit: -1, page: -1 } })
      .then(res => {
        const data = res?.data.cities
        if (data) {
          setOptionCities(data?.map((item: { name: string; _id: string }) => ({ label: item.name, value: item._id })))
        }
        setLoading(false)
      })
      .catch(e => {
        setLoading(false)
      })
  }

  useEffect(() => {
    if (!open) {
      reset({
        ...defaultValues
      })
    } else if (idOrder && open) {
      fetchDetailsOrderProduct(idOrder)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, idOrder])

  useEffect(() => {
    if(open) {
      fetchAllCities()
    }
  }, [open])

  return (
    <>
      {loading && <Spinner />}
      <CustomModal open={open} onClose={onClose}>
        <Box
          sx={{
            padding: '20px',
            borderRadius: '15px',
            backgroundColor: theme.palette.customColors.bodyBg
          }}
          minWidth={{ md: '40px', xs: '80vw' }}
          maxWidth={{ md: '40vw', xs: '80vw' }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative', paddingBottom: '20px' }}>
            <Typography variant='h4' sx={{ fontWeight: 600 }}>
              {' '}
              {t('Edit_order_product')}
            </Typography>
            <IconButton sx={{ position: 'absolute', top: '-4px', right: '-10px' }} onClick={onClose}>
              <Icon icon='material-symbols-light:close' fontSize={'30px'} />
            </IconButton>
          </Box>
          <form onSubmit={handleSubmit(onSubmit)} autoComplete='off' noValidate>
            <Box sx={{ backgroundColor: theme.palette.background.paper, borderRadius: '15px', py: 5, px: 4 }}>
              <Grid container spacing={5}>
                <Grid container item md={12} xs={12}>
                  <Box sx={{ height: '100%', width: '100%' }}>
                    <Grid container spacing={4}>
                      <Grid item md={12} xs={12}>
                        <Controller
                          control={control}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <CustomTextField
                              required
                              fullWidth
                              label={t('Name_user')}
                              onChange={e => {
                                const value = e.target.value
                                const replaced = stringToSlug(value)
                                onChange(value)
                              }}
                              onBlur={onBlur}
                              value={value}
                              placeholder={t('Enter_name_user')}
                              error={Boolean(errors?.fullName)}
                              helperText={errors?.fullName?.message}
                            />
                          )}
                          name='fullName'
                        />
                      </Grid>
                      <Grid item md={12} xs={12}>
                        <Controller
                          control={control}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <CustomTextField
                              required
                            
                              fullWidth
                              label={t('Address')}
                              onChange={onChange}
                              onBlur={onBlur}
                              value={value}
                              placeholder={t('Enter_address')}
                              error={Boolean(errors?.address)}
                              helperText={errors?.address?.message}
                            />
                          )}
                          name='address'
                        />
                      </Grid>
                      <Grid item md={12} xs={12}>
                        <Controller
                          control={control}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <CustomTextField
                              required
                              fullWidth
                              label={t('Phone')}
                              onChange={e => {
                                const numValue = e.target.value.replace(/\D/g, '')
                                onChange(numValue)
                              }}
                              inputProps={{
                                inputMode: 'numeric',
                                pattern: '[0-9]*',
                                minLength: 8
                              }}                       
                              onBlur={onBlur}
                              value={value}
                              placeholder={t('Enter_phone')}
                              error={Boolean(errors?.phone)}
                              helperText={errors?.phone?.message}
                            />
                          )}
                          name='phone'
                        />
                      </Grid>
                      <Grid item md={12} xs={12}>
                        <Controller
                          name='city'
                          control={control}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <Box>
                              <InputLabel
                                sx={{
                                  fontSize: '13px',
                                  marginBottom: '4px',
                                  display: 'block',
                                  color: errors?.city
                                    ? theme.palette.error.main
                                    : `rgba(${theme.palette.customColors.main}, 0.68)`
                                }}
                              >
                                {t('City')}
                              </InputLabel>
                              <CustomSelect
                                fullWidth
                                onChange={onChange}
                                options={optionCities}
                                error={Boolean(errors?.city)}
                                onBlur={onBlur}
                                value={value}
                                placeholder={t('Select')}
                              />
                              {errors?.city?.message && (
                                <FormHelperText
                                  sx={{
                                    color: errors?.city
                                      ? theme.palette.error.main
                                      : `rgba(${theme.palette.customColors.main}, 0.42)`
                                  }}
                                >
                                  {errors?.city?.message}
                                </FormHelperText>
                              )}
                            </Box>
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type='submit' variant='contained' sx={{ mt: 3, mb: 2 }}>
                {!idOrder ? t('Create') : t('Update')}
              </Button>
            </Box>
          </form>
        </Box>
      </CustomModal>
    </>
  )
}

export default EditOrderProduct
