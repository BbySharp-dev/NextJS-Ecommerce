// ** Import Next
import { NextPage } from 'next'
import Head from 'next/head'
import { ReactNode } from 'react'
import { getDetailsProductPublicBySlug, getListRelatedProductBySlug } from 'src/services/product'
import { TProduct } from 'src/types/product'
import { getTextFromHTML } from 'src/utils'

// ** views
import LayoutNotApp from 'src/views/layouts/LayoutNotApp'
import DetailsProductPage from 'src/views/pages/product/DetailsProduct'

type TProps = {
  productData: TProduct
  listRelatedProduct: TProduct[]
}

const Index: NextPage<TProps> = ({ productData, listRelatedProduct }) => {
  const description = getTextFromHTML(productData.description)
  
  return (
    <>
      <Head>
        <title>{`Lập trình thật dễ - ${productData?.name}`}</title>
        <meta
          name='description'
          content={description}
        />
        <meta name='viewport' content='initial-scale=1, width=device-width' />
        <meta name="author" content="Lập trình thật dễ" />
        <meta name="name" content="Khóa học NextJS 14 typescript PRO 2024" />
        <meta name="image" content={productData.image} />
        {/* facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`Lập trình thật dễ - ${productData?.name}`} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={productData.image} />
        {/* twitter */}
        <meta property="twitter:card" content="website" />
        <meta property="twitter:title" content={`Lập trình thật dễ - ${productData?.name}`} />
        <meta property="twitter:description" content={productData.description} />
        <meta property="twitter:image" content={`Lập trình thật dễ - ${productData?.name}`} />
      </Head>
      <DetailsProductPage productData={productData} productsRelated={listRelatedProduct} />
    </>
  )
}

export default Index

Index.guestGuard = false
Index.authGuard = false
Index.getLayout = (page: ReactNode) => <LayoutNotApp>{page}</LayoutNotApp>

export async function getServerSideProps(context: any) {

  try {
    const slugId = context.query?.productId
    const res = await getDetailsProductPublicBySlug(
      slugId, true
    )
    const resRelated = await getListRelatedProductBySlug({ params: { slug: slugId } })

    const productData = res?.data
    const listRelatedProduct = resRelated?.data

    if (!productData?._id) {
      return {
        notFound: true
      }
    }

    return {
      props: {
        productData: productData,
        listRelatedProduct,
      }
    }
  } catch (error) {
    return {
      props: {
        productData: {},
        listRelatedProduct: []
      }
    }
  }
}
