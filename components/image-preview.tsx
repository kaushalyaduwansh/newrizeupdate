"use client";

import { useEffect, useRef } from 'react';

interface ImagePreviewProps {
  src: string;
  bgColor: string;
  withBackground: boolean;
}

const ImagePreview = ({ src, bgColor, withBackground }: ImagePreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      // Set canvas size to match image dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      if (withBackground) {
        // Fill background if enabled
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // Draw the image
      ctx.drawImage(img, 0, 0);

      // Remove background (make white pixels transparent)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Check if pixel is white or near white
        if (r > 240 && g > 240 && b > 240) {
          data[i + 3] = 0; // Set alpha to 0 (transparent)
        }
      }

      ctx.putImageData(imageData, 0, 0);
    };

    img.src = src;
  }, [src, bgColor, withBackground]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-auto border border-border rounded-md bg-white"
    />
  );
};

export default ImagePreview;