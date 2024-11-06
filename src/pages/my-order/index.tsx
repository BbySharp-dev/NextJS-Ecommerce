// ** Import Next
import { NextPage } from 'next'
import { ReactNode } from 'react'

// ** views
import LayoutNotApp from 'src/views/layouts/LayoutNotApp'
import MyOrderPage from 'src/views/pages/my-order'

type TProps = {}

const Index: NextPage<TProps> = () => {
  return <MyOrderPage />
}

export default Index
Index.getLayout = (page: ReactNode) => <LayoutNotApp>{page}</LayoutNotApp>
