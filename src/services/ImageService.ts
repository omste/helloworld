export interface ImageMetadata {
  imageSrc: string;
  alt: string;
}

export class ImageService {
  private static instance: ImageService;

  private constructor() {}

  public static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  public getBackgroundImage(): ImageMetadata {
    return {
      imageSrc: '/hello.png',
      alt: 'Cherry blossom tree against blue sky'
    };
  }
} 