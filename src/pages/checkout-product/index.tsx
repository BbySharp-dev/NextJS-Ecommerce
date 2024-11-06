// ** Import Next
import { NextPage } from 'next'
import { ReactNode } from 'react'

// ** views
import LayoutNotApp from 'src/views/layouts/LayoutNotApp'
import CheckoutProductPage from 'src/views/pages/checkout-product'

type TProps = {}

const Index: NextPage<TProps> = () => {
  return <CheckoutProductPage />
}

export default Index
Index.getLayout = (page: ReactNode) => <LayoutNotApp>{page}</LayoutNotApp>
