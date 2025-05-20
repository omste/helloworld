import { getBackgroundImage } from './ImageService';

describe('ImageService', () => {
  describe('getBackgroundImage', () => {
    it('should return the correct image metadata', () => {
      const imageMetadata = getBackgroundImage();
      
      expect(imageMetadata).toEqual({
        imageSrc: '/hello.png',
        alt: 'Cherry blossom tree against blue sky'
      });
    });
  });
}); 