// ** Import Next
import { NextPage } from 'next'
import { ReactNode } from 'react'

// ** views
import BlankLayout from 'src/views/layouts/BlankLayout'
import ForgotPasswordPage from 'src/views/pages/forgot-password'

type TProps = {}

const ForgotPassword: NextPage<TProps> = () => {
  return <ForgotPasswordPage />
}

export default ForgotPassword


ForgotPassword.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>
ForgotPassword.guestGuard = true

