import {getServerSideSiteMap} from "next-sitemap"
import { getAllProductsPublic } from 'src/services/product'


export const getServerSideProps = async (context) => {
    const {req, res} = context

    const allProducts = []
    await getAllProductsPublic({limit: -1, page: -1}).then((res) => {
        const data = res?.data?.products
        data?.map((item) => {
            allProducts.push(item.slug)
        })
    })

    const productUrls = allProducts.map((slug) => ({
        loc: `${process.env.SITE_URL}/product/${slug}`,
        lastMod: new Date().toISOString(),
        priority: 0.9,
    }))

    const homeUrl = {
        loc: `${process.env.SITE_URL}/home`,
        lastMod: new Date().toISOString(),
        priority: 0.9,
    }

    const urls = [homeUrl,...productUrls]

    return getServerSideSiteMap(req, res, urls)
}

const SiteMap = () => null
export default SiteMap