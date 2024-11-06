// ** Import Next
import { NextPage } from 'next'
import { ReactNode } from 'react'

// ** views
import LayoutNotApp from 'src/views/layouts/LayoutNotApp'
import MyOrderDetailsPage from 'src/views/pages/my-order/DetailsOrder'

type TProps = {}

const Index: NextPage<TProps> = () => {
  return <MyOrderDetailsPage />
}

export default Index
Index.getLayout = (page: ReactNode) => <LayoutNotApp>{page}</LayoutNotApp>
