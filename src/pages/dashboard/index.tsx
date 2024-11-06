// ** Import Next
import { NextPage } from 'next'
import { PERMISSIONS } from 'src/configs/permission'
import DashboardPage from 'src/views/pages/dashboard'

// ** views

type TProps = {}

const Index: NextPage<TProps> = () => {
 

  return <DashboardPage />
}

Index.permission = [PERMISSIONS.DASHBOARD]
export default Index

