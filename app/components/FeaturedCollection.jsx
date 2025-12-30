// Swiper imports
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Pagination, Autoplay} from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import {useAside} from './Aside';
import {useVariantUrl} from '~/lib/variants';
import {
  getAdjacentAndFirstAvailableVariants,
  Image,
  Money,
  useOptimisticVariant,
} from '@shopify/hydrogen';
import {Await, Link} from 'react-router';
import {Suspense} from 'react';
import {AddToCartButton} from './AddToCartButton';
import './../assets/featured_card.css';
export function FeaturedCollection({products}) {
  const {open} = useAside();

  return (
    <section className="recommended-products-slider py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
      <Suspense
        fallback={<div className="text-center py-20">Loading products...</div>}
      >
        <Await resolve={products}>
          {(resolvedProducts) => {
            console.log(resolvedProducts);

            if (!resolvedProducts?.products?.nodes?.length) {
              return <p className="text-center py-10">No products found.</p>;
            }
            return (
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1.2}
                centeredSlides={false}
                loop={products?.nodes?.length > 3} // Only loop if enough items
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                }}
                navigation={{
                  prevEl: '.swiper-button-prev-custom',
                  nextEl: '.swiper-button-next-custom',
                }}
                pagination={{clickable: true}}
                breakpoints={{
                  640: {slidesPerView: 2.2, spaceBetween: 20},
                  768: {slidesPerView: 3.2, spaceBetween: 30},
                  1024: {slidesPerView: 4.2, spaceBetween: 30},
                  1280: {slidesPerView: 5, spaceBetween: 30},
                }}
                className="relative"
              >
                {resolvedProducts?.products?.nodes?.map((product) => {
                  const variantUrl = useVariantUrl(product.handle);

                  const selectedVariant = useOptimisticVariant(
                    product.selectedOrFirstAvailableVariant,
                    getAdjacentAndFirstAvailableVariants(product),
                  );

                  const image = product.featuredImage;
                  const isAvailable = selectedVariant?.availableForSale;

                  return (
                    <SwiperSlide key={product.id}>
                      <div className="product-item flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                        <Link
                          to={variantUrl}
                          prefetch="intent"
                          className="flex flex-col flex-grow"
                        >
                          {image ? (
                            <Image
                              alt={image.altText || product.title}
                              aspectRatio="1/1"
                              data={image}
                              loading="lazy"
                              sizes="(min-width: 1024px) 20vw, (min-width: 768px) 30vw, 50vw"
                              className="object-cover w-full"
                            />
                          ) : (
                            <div className="bg-gray-200 aspect-square" />
                          )}

                          <div className="p-4 flex flex-col flex-grow">
                            <h4 className="font-medium text-lg line-clamp-2">
                              {product.title}
                            </h4>
                            <small className="text-gray-600 mt-1">
                              <Money
                                data={product.priceRange.minVariantPrice}
                              />
                            </small>
                          </div>
                        </Link>

                        <div className="p-4 pt-0 atc__btn_wrap">
                          {isAvailable ? (
                            <AddToCartButton
                              className="w-full"
                              onClick={() => open('cart')}
                              lines={[
                                {
                                  merchandiseId: selectedVariant.id,
                                  quantity: 1,
                                  selectedVariant,
                                },
                              ]}
                            >
                              {' '}
                              Add to cart
                            </AddToCartButton>
                          ) : (
                            <div className="w-full bg-gray-200 text-gray-600 text-center py-3 rounded-md font-medium">
                              Sold out
                            </div>
                          )}
                        </div>
                      </div>
                    </SwiperSlide>
                  );
                })}

                {/* Custom Navigation Buttons */}
                <div className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/80 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-white">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </div>
                <div className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/80 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-white">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Swiper>
            );
          }}
        </Await>
      </Suspense>
    </section>
  );
}
