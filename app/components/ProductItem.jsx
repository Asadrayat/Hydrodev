import {Link} from 'react-router';
import {
  CartForm,
  Image,
  Money,
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';

/**
 * @param {{
 *   product:
 *     | CollectionItemFragment
 *     | ProductItemFragment
 *     | RecommendedProductFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
export function ProductItem({product, loading = 'lazy'}) {
  const variantUrl = useVariantUrl(product.handle);
  const {open} = useAside();

  // FIX: Properly select the first truly available variant
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );
  // console.log(selectedVariant);
  
  const image = product.featuredImage;
  const isAvailable = selectedVariant?.availableForSale;

  return (
    <div className="product-item">
      <Link
        key={product.id}
        prefetch="intent"
        to={variantUrl}
        className="product-item-link"
      >
        {image ? (
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
          />
        ) : (
          <div className="product-item-placeholder" aria-hidden="true" />
        )}

        <h4>{product.title}</h4>
        <small>
          <Money data={product.priceRange.minVariantPrice} />
        </small>
      </Link>

      {/* Improved Sold-Out Handling */}
      {isAvailable ? (
        <AddToCartButton
          onClick={() => open('cart')}
          lines={[
            {
              merchandiseId: selectedVariant.id,
              quantity: 1,
              selectedVariant,
            },
          ]}
          className="add-to-cart-button"
        >
          Add to cart
        </AddToCartButton>
      ) : (
        <div className="sold-out-badge" aria-label="This product is sold out">
          Sold out
        </div>
      )}
    </div>
  );
}


/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductFragment} RecommendedProductFragment */
