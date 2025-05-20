import Image from 'next/image';
import { FC } from 'react';

interface BackgroundProps {
  imageSrc: string;
  alt: string;
}

export const Background: FC<BackgroundProps> = ({ imageSrc, alt }) => {
  return (
    <div className="fixed inset-0 w-full h-full -z-10">
      <Image
        src={imageSrc}
        alt={alt}
        fill
        priority
        quality={75}
        className="object-cover"
        sizes="(max-width: 640px) 640px, (max-width: 1080px) 1080px, 1920px"
        loading="eager"
      />
      <div className="absolute inset-0 bg-black/30" /> {/* Overlay for better text readability */}
    </div>
  );
}; 