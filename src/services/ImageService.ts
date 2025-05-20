export interface ImageMetadata {
  imageSrc: string;
  alt: string;
}

export const getBackgroundImage = (): ImageMetadata => ({
  imageSrc: '/hello.png',
  alt: 'Cherry blossom tree against blue sky'
}); 