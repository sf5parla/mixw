import React from 'react';
import { Helmet } from 'react-helmet-async';
import LazyImage from '../LazyImage/LazyImage';
import { useImageSEO } from '../../hooks/useImageOptimization';

const ImageSEOWrapper = ({
  src,
  alt,
  title,
  description,
  width,
  height,
  priority = false,
  context = {},
  children,
  ...props
}) => {
  const { generateImageMetadata } = useImageSEO();

  // Generate comprehensive SEO metadata
  const seoMetadata = generateImageMetadata(
    { src, alt, type: 'image/jpeg' },
    { title, description, width, height, ...context }
  );

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        {/* Open Graph */}
        <meta property="og:image" content={src} />
        <meta property="og:image:alt" content={alt} />
        {width && <meta property="og:image:width" content={width} />}
        {height && <meta property="og:image:height" content={height} />}
        <meta property="og:image:type" content="image/jpeg" />
        
        {/* Twitter Card */}
        <meta name="twitter:image" content={src} />
        <meta name="twitter:image:alt" content={alt} />
        
        {/* Additional SEO */}
        {description && <meta name="description" content={description} />}
        {title && <meta property="og:title" content={title} />}
        
        {/* Preload critical images */}
        {priority && (
          <link rel="preload" as="image" href={src} />
        )}
      </Helmet>

      {/* Image Component */}
      {children ? (
        children
      ) : (
        <LazyImage
          src={src}
          alt={alt}
          title={title}
          width={width}
          height={height}
          priority={priority}
          context={context}
          {...props}
        />
      )}

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoMetadata.structuredData)
        }}
      />
    </>
  );
};

export default ImageSEOWrapper;