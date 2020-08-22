import React from "react"
import Layout from "../components/layout"
const ProductTemplate = ({ pageContext }) => {
  const { product } = pageContext
  return (
      <Layout>
        <h1>{product.title}</h1>
        <div>{parseInt(product.priceRange.minVariantPrice.amount)}円</div>
        <div>{product.description}</div>
      </Layout>
  )
}
export default ProductTemplate
