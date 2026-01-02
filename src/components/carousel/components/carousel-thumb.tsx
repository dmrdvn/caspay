'use client';

import type { CarouselThumbProps } from '../types';

import { mergeClasses } from 'minimal-shared/utils';

import { styled } from '@mui/material/styles';
import ButtonBase from '@mui/material/ButtonBase';

import { carouselClasses } from '../classes';

// ----------------------------------------------------------------------

export function CarouselThumb({
  sx,
  src,
  index,
  selected,
  className,
  ...other
}: CarouselThumbProps) {
  // Prevent empty string src attribute error
  const imageSrc = src && src.trim() !== '' ? src : null;

  return (
    <ThumbRoot
      selected={selected}
      className={mergeClasses([carouselClasses.thumbs.item, className])}
      sx={sx}
      {...other}
    >
      {imageSrc ? (
        <img alt={`carousel-thumb-${index}`} src={imageSrc} className={carouselClasses.thumbs.image} />
      ) : (
        <div className={carouselClasses.thumbs.image} style={{ backgroundColor: '#f0f0f0' }} />
      )}
    </ThumbRoot>
  );
}

// ----------------------------------------------------------------------

const ThumbRoot = styled(ButtonBase, {
  shouldForwardProp: (prop: string) => !['selected', 'sx'].includes(prop),
})<Pick<CarouselThumbProps, 'selected'>>(({ theme }) => ({
  width: 64,
  height: 64,
  opacity: 0.48,
  flexShrink: 0,
  cursor: 'pointer',
  borderRadius: Number(theme.shape.borderRadius) * 1.25,
  transition: theme.transitions.create(['opacity', 'box-shadow'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.short,
  }),
  [`& .${carouselClasses.thumbs.image}`]: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 'inherit',
  },
  variants: [
    {
      props: { selected: true },
      style: { opacity: 1, boxShadow: `0 0 0 2px ${theme.vars.palette.primary.main}` },
    },
  ],
}));
