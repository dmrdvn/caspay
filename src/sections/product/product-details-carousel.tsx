import type { IProductItem } from 'src/types/product';

import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';

import { Image } from 'src/components/image';
import { Lightbox, useLightbox } from 'src/components/lightbox';
import {
  Carousel,
  useCarousel,
  CarouselThumb,
  CarouselThumbs,
  CarouselArrowNumberButtons,
} from 'src/components/carousel';

// ----------------------------------------------------------------------

type Props = {
  images?: IProductItem['images'];
  productName?: string;
};

export function ProductDetailsCarousel({ images, productName }: Props) {
  const carousel = useCarousel({ thumbs: { slidesToShow: 'auto' } });

  // Filter out empty/invalid images and create slides
  const validImages = images?.filter((img) => img && img.trim() !== '') || [];
  const hasValidImages = validImages.length > 0;

  // If no valid images, show product initials avatar
  const productInitials = productName
    ? productName
        .split(' ')
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'P';

  const slides = hasValidImages
    ? validImages.map((img) => ({ src: img }))
    : [];

  const lightbox = useLightbox(slides);

  useEffect(() => {
    if (lightbox.open) {
      carousel.mainApi?.scrollTo(lightbox.selected, true);
    }
  }, [carousel.mainApi, lightbox.open, lightbox.selected]);

  return (
    <>
      <div>
        <Box sx={{ mb: 2.5, position: 'relative' }}>
          {hasValidImages ? (
            <>
              <CarouselArrowNumberButtons
                {...carousel.arrows}
                options={carousel.options}
                totalSlides={carousel.dots.dotCount}
                selectedIndex={carousel.dots.selectedIndex + 1}
                sx={{ right: 16, bottom: 16, position: 'absolute' }}
              />

              <Carousel carousel={carousel} sx={{ borderRadius: 2 }}>
                {slides.map((slide, index) => (
                  <Image
                    key={slide.src || `slide-${index}`}
                    alt={slide.src || 'Product image'}
                    src={slide.src}
                    ratio="1/1"
                    onClick={() => lightbox.onOpen(slide.src)}
                    sx={{ cursor: 'zoom-in', minWidth: 320 }}
                  />
                ))}
              </Carousel>
            </>
          ) : (
            <Box
              sx={{
                borderRadius: 2,
                bgcolor: 'background.neutral',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 320,
                aspectRatio: '1/1',
              }}
            >
              <Avatar
                variant="rounded"
                sx={{
                  width: 160,
                  height: 160,
                  fontSize: '3rem',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                }}
              >
                {productInitials}
              </Avatar>
            </Box>
          )}
        </Box>

        {hasValidImages && (
          <CarouselThumbs
            ref={carousel.thumbs.thumbsRef}
            options={carousel.options?.thumbs}
            slotProps={{ disableMask: true }}
            sx={{ width: 360 }}
          >
            {slides.map((item, index) => (
              <CarouselThumb
                key={item.src}
                index={index}
                src={item.src}
                selected={index === carousel.thumbs.selectedIndex}
                onClick={() => carousel.thumbs.onClickThumb(index)}
              />
            ))}
          </CarouselThumbs>
        )}
      </div>

      <Lightbox
        index={lightbox.selected}
        slides={slides}
        open={lightbox.open}
        close={lightbox.onClose}
        onGetCurrentIndex={(index) => lightbox.setSelected(index)}
      />
    </>
  );
}
