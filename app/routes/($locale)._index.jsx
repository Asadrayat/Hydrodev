import {Await, useLoaderData, Link} from 'react-router';
import {Suspense} from 'react';
import {Image, useOptimisticVariant} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import HeroBanner from '~/components/HeroBanners';
import { Buttons } from '~/components/Buttons';
import { FeaturedCollection } from '~/components/FeaturedCollection';
console.log('[route] ($locale)._index.jsx loaded');
/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Hydrogen | Home'}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  console.log('[loader] start loader');
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}
async function loadBannerMeta({ context }) {

  const data = await context.storefront.query(HERO_BANNER_BY_HANDLE_QUERY, {
    variables: {
      handle: {
        type: "hero_banner",
        handle: "homepage-hero-banner", // <-- your metaobject handle
      },
    },
  });

  return data;
}
/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context}) {
  console.log('[loadCriticalData] start');

  const [{collections}, heroBanner] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    loadBannerMeta({ context }),
    // Add other queries here, so that they are loaded in parallel
  ]);
  console.log(
    '[loadCriticalData] featuredCollection title:',
    collections?.nodes?.[0]?.title,
  );
  console.log(
    '[loadCriticalData] heroBanner has metaobject:',
    !!heroBanner?.metaobject,
  );
  return {
    featuredCollection: collections.nodes[0],
    heroBanner,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  return (
    <div className="home">
      <HeroBanner heroBannerContent={data.heroBanner}/>
      <FeaturedCollection products={data.recommendedProducts} />
      {/* <RecommendedProducts products={data.recommendedProducts} /> */}
    </div>
  );
}

/**
 * @param {{
 *   products: Promise<RecommendedProductsQuery | null>;
 * }}
 */
function RecommendedProducts({products}) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <ProductItem key={product.id} product={product}  />
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}



const HERO_BANNER_BY_HANDLE_QUERY = `
  query HeroBannerByHandle($handle: MetaobjectHandleInput!) {
    metaobject(handle: $handle) {
      type
      handle
      caption: field(key: "caption") {
        value
      }
      title: field(key: "title") {
        value
      }
      subtitle: field(key: "subtitle") {
        value
      }

      desktopImage: field(key: "image_desktop") {
        reference {
          __typename
          ... on MediaImage {
            image {
              url
              altText
              width
              height
            }
          }
        }
      }

      mobileImage: field(key: "image_mobile") {
        reference {
          __typename
          ... on MediaImage {
            image {
              url
              altText
              width
              height
            }
          }
        }
      }

      ctaLabel: field(key: "cta_label") {
        value
      }
      ctaUrl: field(key: "cta_url") {
        value
      }
    }
  }
`;

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

  const RECOMMENDED_PRODUCTS_QUERY = `#graphql
    # Reusable variant fragment with all needed fields
    fragment RecommendedProductVariant on ProductVariant {
      id
      availableForSale
      selectedOptions {
        name
        value
      }
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
      image {
        url
        altText
        width
        height
      }
    }

    # Main product fragment for recommended grids
    fragment RecommendedProduct on Product {
      id
      title
      handle
      availableForSale

      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }

      featuredImage {
        id
        url
        altText
        width
        height
      }

      # Default fallback variant (used when no URL params)
      selectedOrFirstAvailableVariant {
        ...RecommendedProductVariant
      }

      # Critical for useOptimisticVariant to find the first *truly* available variant
      adjacentVariants {
        ...RecommendedProductVariant
      }

      # Enhanced options structure — REQUIRED to prevent "optionValues is missing" error
      options {
        name
        optionValues {
          name
          firstSelectableVariant {
            ...RecommendedProductVariant
          }
        }
      }
    }

    # Main query
    query RecommendedProducts(
      $country: CountryCode
      $language: LanguageCode
    ) @inContext(country: $country, language: $language) {
      products(first: 250, sortKey: UPDATED_AT, reverse: true) {
        nodes {
          ...RecommendedProduct
        }
      }
    }
  `;

// const RECOMMENDED_PRODUCTS_QUERY = `#graphql
//   fragment RecommendedProduct on Product {
//     id
//     title
//     handle
//     availableForSale
//     selectedOrFirstAvailableVariant {
//       id
//       availableForSale
//       selectedOptions {
//         name
//         value
//       }
//     }
//     priceRange {
//       minVariantPrice {
//         amount
//         currencyCode
//       }
//     }
//     featuredImage {
//       id
//       url
//       altText
//       width
//       height
//     }
//   }
//   query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
//     @inContext(country: $country, language: $language) {
//     products(first: 4, sortKey: UPDATED_AT, reverse: true) {
//       nodes {
//         ...RecommendedProduct
//       }
//     }
//   }
// `;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
