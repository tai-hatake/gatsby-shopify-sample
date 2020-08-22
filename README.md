# 手順

## Shopifyに登録する

- [Shopify](https://www.shopify.jp/)に登録する

- プライベートアプリ作成

`プライベートアプリ名`には適切な名称を入力して、`緊急連絡用開発者メール`にメールアドレスを入力します。

`Admin API`は、デフォルトのままにします。表示されている項目が`読み取り専用`になっているのを確認します。

`ストアフロントAPI`の欄にある、`このアプリがストアフロントAPIを使用して…`をチェックします。

`ストアフロントAPI権限`が表示されるので、デフォルトでチェックされているのに加えて、`商品タグを読む`にもチェックします。

## Gatsbyセットアップ（MacOS）

### 各ツールインストール

- HomeBrewのインストール

- XCodeのインストール

```bash
xcode-select --install
```

- Nodeのインストール

```bash
brew install node
```

- Gitのインストール

- Gatsby CLIインストール

```bash
npm install -g gatsby-cli
```

## Gatsbyサイト構築

- デフォルトスターターを使い作成

```bash
# gatsby new [ディレクトリ名]
gatsby new gatsby-shpoify
```

- Shopifyのプラグインをインストール

```bash
cd gatsby-shpoify
yarn add gatsby-source-shopify shopify-buy
```

- プラグイン設定

- `gatsby-config.js`に環境変数の読み込み処理を追加

```javascript
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})
```

- `.env.development`ファイルを作成する
  - `development`は、`gatsby development`で使用される
  - `production`は、`gatsby build`で使用される

```dot
SHOP_NAME = [ショップ名]
ACCESS_TOKEN = [アクセストークン]
```

`gatsby-config.js`にshopifyへのアクセス情報を追加

```javascript

plugins: [
  .
  .
  .
  `gatsby-plugin-sharp`,
  {
    resolve: `gatsby-plugin-manifest`,
    options: {
      name: `gatsby-starter-default`,
      short_name: `starter`,
      start_url: `/`,
      background_color: `#663399`,
      theme_color: `#663399`,
      display: `minimal-ui`,
      icon: `src/images/gatsby-icon.png`, // This path is relative to the root of the site.
    },
  },
  // ここから
  {
    resolve: `gatsby-source-shopify`,
    options: {
      shopName: process.env.SHOP_NAME,
      accessToken: process.env.ACCESS_TOKEN,
    },
  },
  // ここまで
]
```

## 商品ページを作成

- `src/pages/products.js`に一覧ページ作成

```js
import React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../components/layout"
const ProductsPage = ({ data }) => (
  <Layout>
    <h1>Products</h1>
    <ul>
      {data.allShopifyProduct.edges.map(({ node }) => (
        <li key={node.shopifyId}>
          <h3>
            <Link to={`/product/${node.handle}`}>{node.title}</Link>
            {" - "}{parseInt(node.priceRange.minVariantPrice.amount)}円
          </h3>
          <p>{node.description}</p>
        </li>
      ))}
    </ul>
  </Layout>
)
export default ProductsPage
export const query = graphql`
  {
    allShopifyProduct(sort: { fields: [title] }) {
      edges {
        node {
          title
          shopifyId
          description
          handle
          priceRange {
            minVariantPrice {
              amount
            }
          }
        }
      }
    }
  }
`
```

- `src/templates/product.js`詳細ページのテンプレート作成

```js
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
```

- `gatsby-node.js`に商品ごとに詳細ページを作成する処理を実装

```js
const path = require(`path`)
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  // Query for all products in Shopify
  const result = await graphql(`
    query {
      allShopifyProduct(sort: { fields: [title] }) {
        edges {
          node {
            title
            shopifyId
            handle
            description
            priceRange {
              minVariantPrice {
                amount
              }
            }
          }
        }
      }
    }
  `)
  result.data.allShopifyProduct.edges.forEach(({ node }) => {
    createPage({
      path: `/product/${node.handle}`,
      component: path.resolve(`./src/templates/product.js`),
      context: {
        product: node,
      },
    })
  })
}
```
