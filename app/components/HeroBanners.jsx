import React from 'react';

const HeroBanner = ({heroBannerContent,
  caption = heroBannerContent?.metaobject.caption.value,
  title = heroBannerContent?.metaobject.title.value,
  subtitle = heroBannerContent?.metaobject.subtitle.value,
  desktop_image = heroBannerContent?.metaobject?.desktopImage?.reference?.image?.url,
  mobile_image = heroBannerContent?.metaobject.mobileImage?.reference?.image?.url,
  cta_label = heroBannerContent?.metaobject.ctaLabel.value,
  cta_url = heroBannerContent?.metaobject.ctaUrl.value,
}) => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Images */}
      <picture className="absolute inset-0">
        <source media="(min-width: 768px)" srcSet={desktop_image} />
        <img 
          src={mobile_image} 
          alt="" 
          className="w-full h-full object-cover"
        />
      </picture>
      
      {/* Overlay */}
      <div className="absolute inset-0"></div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl">
          {/* Caption */}
          <p className="text-sm sm:text-base uppercase tracking-wider text-white font-medium mb-4">
            {caption}
          </p>
          
          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {title}
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-white mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
          
          {/* CTA Button */}
          <a
            href={cta_url}
            className="inline-block mt-12 bg-white text-gray-900 font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors duration-300 text-lg shadow-lg"
          >
            {cta_label}
          </a>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;