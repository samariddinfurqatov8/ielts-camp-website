import React, { useState } from 'react';

// Rasm yuklanmasa ishlatiladigan neytral o‘rinbosar (inline SVG, tashqi so‘rovsiz).
const FALLBACK_SRC =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
      '<rect width="400" height="300" fill="#e2e8f0"/>' +
      '<text x="200" y="158" font-family="sans-serif" font-size="18" font-weight="700" fill="#94a3b8" text-anchor="middle">IELTS CAMP</text>' +
      '</svg>'
  );

type SmartImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
};

/**
 * <img> o‘rami: rasm yuklanmasa konsolga aniq xato yozadi va faqat shundagina
 * o‘rinbosar rasmni ko‘rsatadi.
 */
export const SmartImage: React.FC<SmartImageProps> = ({ src, alt, onError, ...rest }) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showFallback = failedSrc === src;

  return (
    <img
      {...rest}
      src={showFallback ? FALLBACK_SRC : src}
      alt={alt}
      onError={(e) => {
        if (!showFallback) {
          console.error(`[IELTS CAMP] Rasm yuklanmadi: "${src}" (alt: "${alt}"). Fayl yo‘li yoki build natijasini tekshiring.`);
          setFailedSrc(src);
        }
        onError?.(e);
      }}
    />
  );
};
