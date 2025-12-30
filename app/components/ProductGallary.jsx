"user client"
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css/bundle';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import { useEffect, useState } from 'react';
import 'app/assets/product-gallary.css';
export const ProductGallery = ({ product, selectedVariant }) => {
  const mediaItems = product.media.edges?.map((edge) => edge.node);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [mainSwiper, setMainSwiper] = useState(null);

  useEffect(() => {
    if (!mainSwiper || !selectedVariant?.image?.url) return;
  
    const activeIndex = mediaItems?.findIndex(
      (media) => selectedVariant.image.url === media.image?.url
    );
  
    if (activeIndex !== -1 && activeIndex != null) {
      mainSwiper.slideToLoop(activeIndex, 500);
    }
  }, [selectedVariant, mediaItems, mainSwiper]);

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      {/* Main Gallery */}
      <Swiper
        onSwiper={setMainSwiper}
        spaceBetween={20}
        slidesPerView={1}
        navigation={true}
        pagination={{ clickable: true }}
        loop={true}
        thumbs={{
          swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null
        }}      
        modules={[Navigation, Pagination, Thumbs]}
        className="rounded-lg shadow-lg mb-4"
      >
        {mediaItems?.map((media, index) => {
          const isActiveImage = selectedVariant?.image?.url === media?.image?.url;

          return (
            <SwiperSlide key={index} className={`${isActiveImage ? '-4 ring-blue-500 ring-offset-2' : ''}`}>
              <div
                className={`relative w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden ${
                  isActiveImage ? 'ring-4 ring-blue-500 ring-offset-2' : ''
                } `}
              >
                {media.mediaContentType === 'IMAGE' ? (
                  <img
                    src={media.image?.url}
                    alt={media.alt || 'Product image'}
                    className="object-cover w-full h-full rounded-lg"
                    loading="lazy"
                  />
                ) : media.mediaContentType === 'VIDEO' ? (
                  <video
                    controls
                    preload="metadata"
                    className="object-cover w-full h-full rounded-lg"
                  >
                    {media.sources?.map((source, i) => (
                      <source key={i} src={source.url} type={source.mimeType} />
                    ))}
                  </video>
                ) : null}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Thumbnail Gallery */}
      {mediaItems && mediaItems.length > 1 && (
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={10}
          slidesPerView={4}
          watchSlidesProgress={true}
          breakpoints={{
            640: { slidesPerView: 5 },
            768: { slidesPerView: 6 },
            1024: { slidesPerView: 8 },
          }}
          modules={[Thumbs]}
          className="thumbnail-swiper"
        >
          {mediaItems?.map((media, index) => (
            <SwiperSlide key={index} className="cursor-pointer ">
              <div className="aspect-square bg-gray-200 rounded overflow-hidden opacity-60 transition-opacity group-hover:opacity-100 media__container_pdp">
                {media.mediaContentType === 'IMAGE' ? (
                  <img
                    src={media.image?.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="object-cover w-full h-full"
                    loading="lazy"
                  />
                ) : media.mediaContentType === 'VIDEO' ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white text-xs">
                    ▶ Video
                  </div>
                ) : null}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};