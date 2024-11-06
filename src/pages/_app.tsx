// ** React Imports
import { ReactNode, useState } from 'react'

// ** Next Imports
import Head from 'next/head'
import { Router, useRouter } from 'next/router'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react"

// ** Store Imports
import { Provider } from 'react-redux'

// ** Loader Import
import NProgress from 'nprogress'

// ** Config Imports
import 'src/configs/i18n'
import { defaultACLObj } from 'src/configs/acl'
import themeConfig from 'src/configs/themeConfig'

// ** Third Party Import
import { Toaster } from 'react-hot-toast'

// ** Contexts
import { AuthProvider } from 'src/contexts/AuthContext'

// ** Global css styles
import 'src/styles/globals.scss'
import "react-multi-carousel/lib/styles.css";

// ** redux
import { store } from 'src/stores'

// ** Components
import GuestGuard from 'src/components/auth/GuestGuard'
import AuthGuard from 'src/components/auth/AuthGuard'
import FallbackSpinner from 'src/components/fall-back'
import AclGuard from 'src/components/auth/AclGuard'
import ReactHotToast from 'src/components/react-hot-toast'
import NoGuard from 'src/components/auth/NoGuard'
// ** hooks
import { useSettings } from 'src/hooks/useSettings'
import { useTheme } from '@mui/material'

// ** theme
import ThemeComponent from 'src/theme/ThemeComponent'

// ** layouts
import UserLayout from 'src/views/layouts/UserLayout'

// ** Context
import { SettingsConsumer, SettingsProvider } from 'src/contexts/SettingsContext'

// axios instance
import { AxiosInterceptor } from 'src/helpers/axios'

// ** React Query
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

type ExtendedAppProps = AppProps & {
  Component: NextPage
}

type GuardProps = {
  authGuard: boolean
  guestGuard: boolean
  children: ReactNode
}

// ** Pace Loader
if (themeConfig.routingLoader) {
  Router.events.on('routeChangeStart', () => {
    NProgress.start()
  })
  Router.events.on('routeChangeError', () => {
    NProgress.done()
  })
  Router.events.on('routeChangeComplete', () => {
    NProgress.done()
  })
}

const Guard = ({ children, authGuard, guestGuard }: GuardProps) => {
  if (guestGuard) {
    return <GuestGuard fallback={<FallbackSpinner />}>{children}</GuestGuard>
  } else if (!guestGuard && !authGuard) {
    return <NoGuard fallback={<FallbackSpinner />}>{children}</NoGuard>
  } else {
    return <AuthGuard fallback={<FallbackSpinner />}>{children}</AuthGuard>
  }
}

export default function App(props: ExtendedAppProps) {
  const { Component, pageProps: { session, ...pageProps } } = props

  const { settings } = useSettings()
  const theme = useTheme()
  const router = useRouter()
  const slugProduct = (router?.query?.productId as string)?.replaceAll("-", " ")

  const [queryClient] = useState(() => new QueryClient())

  // Variables
  const getLayout = Component.getLayout ?? (page => <UserLayout>{page}</UserLayout>)

  const setConfig = Component.setConfig ?? undefined
  // Query

  const authGuard = Component.authGuard ?? true

  const guestGuard = Component.guestGuard ?? false

  const aclAbilities = Component.acl ?? defaultACLObj
  const permission = Component.permission ?? []

  const title = slugProduct ? `${themeConfig.templateName} - ${slugProduct}`
    : Component.title ?? `${themeConfig.templateName} - Khóa học Nextjs 14 PRO thực chiến`

  const keywords = Component.keywords ?? 'Material Design, MUI, ReactJS, Yup, NextJS 14, Typescript, lập trình thật dễ'

  const description = Component.description ?? `${themeConfig.templateName} – Khóa học Nextjs 14 PRO thực chiến với dự án website bán hàng`
  const urlImage = Component.urlImage ?? "/logo.png"

  const toastOptions = {
    success: {
      className: 'react-hot-toast',
      style: {
        background: '#DDF6E8',
        color: theme.palette.text.primary
      }
    },
    error: {
      className: 'react-hot-toast',
      style: {
        background: '#FDE4D5',
        color: theme.palette.text.primary
      }
    }
  }

  return (
    <Provider store={store}>
      <Head>
        <title>{title}</title>
        <meta
          name='description'
          content={description}
        />
        <meta name='keywords' content={keywords} />
        <meta name='viewport' content='initial-scale=1, width=device-width' />
        <meta name="author" content="Lập trình thật dễ" />
        <meta name="name" content="Khóa học NextJS 14 typescript PRO 2024" />
        <meta name="image" content={urlImage} />
        {/* facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={urlImage} />
        {/* twitter */}
        <meta property="twitter:card" content="website" />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={urlImage} />

        <link rel='icon' href='/vercel.svg' />
      </Head>

      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AxiosInterceptor>
            <SessionProvider session={session}>
              <SettingsProvider {...(setConfig ? { pageSettings: setConfig() } : {})}>
                <SettingsConsumer>
                  {({ settings }) => {
                    return (
                      <ThemeComponent settings={settings}>
                        <Guard authGuard={authGuard} guestGuard={guestGuard}>
                          <AclGuard permission={permission} aclAbilities={aclAbilities} guestGuard={guestGuard} authGuard={authGuard}>
                            {getLayout(<Component {...pageProps} />)}
                          </AclGuard>
                        </Guard>
                        <ReactHotToast>
                          <Toaster position={settings.toastPosition} toastOptions={toastOptions} />
                        </ReactHotToast>
                      </ThemeComponent>
                    )
                  }}
                </SettingsConsumer>
              </SettingsProvider>
            </SessionProvider>
          </AxiosInterceptor>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} buttonPosition='bottom-left' />
      </QueryClientProvider>
    </Provider>
  )
}
