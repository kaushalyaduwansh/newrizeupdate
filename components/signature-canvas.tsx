"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

interface SignatureCanvasProps {
  width: number;
  height: number;
}

const SignatureCanvas = forwardRef<HTMLCanvasElement, SignatureCanvasProps>(
  ({ width, height }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const lastX = useRef(0);
    const lastY = useRef(0);

    useImperativeHandle(ref, () => canvasRef.current!);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Calculate the device pixel ratio
      const dpr = window.devicePixelRatio || 1;
      
      // Set canvas size accounting for device pixel ratio
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      
      // Scale the context to ensure correct drawing operations
      ctx.scale(dpr, dpr);
      
      // Set canvas CSS size
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Setup drawing style
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      const getCoordinates = (e: MouseEvent | TouchEvent): { x: number; y: number } => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / (rect.width * dpr);
        const scaleY = canvas.height / (rect.height * dpr);

        if (e instanceof MouseEvent) {
          return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
          };
        } else {
          return {
            x: (e.touches[0].clientX - rect.left) * scaleX,
            y: (e.touches[0].clientY - rect.top) * scaleY,
          };
        }
      };

      const startDrawing = (e: MouseEvent | TouchEvent) => {
        isDrawing.current = true;
        const coords = getCoordinates(e);
        [lastX.current, lastY.current] = [coords.x, coords.y];
      };

      const draw = (e: MouseEvent | TouchEvent) => {
        if (!isDrawing.current) return;
        e.preventDefault();

        const coords = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(lastX.current, lastY.current);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();

        [lastX.current, lastY.current] = [coords.x, coords.y];
      };

      const stopDrawing = () => {
        isDrawing.current = false;
      };

      // Mouse events
      canvas.addEventListener("mousedown", startDrawing);
      canvas.addEventListener("mousemove", draw);
      canvas.addEventListener("mouseup", stopDrawing);
      canvas.addEventListener("mouseout", stopDrawing);

      // Touch events
      canvas.addEventListener("touchstart", startDrawing, { passive: false });
      canvas.addEventListener("touchmove", draw, { passive: false });
      canvas.addEventListener("touchend", stopDrawing);

      return () => {
        canvas.removeEventListener("mousedown", startDrawing);
        canvas.removeEventListener("mousemove", draw);
        canvas.removeEventListener("mouseup", stopDrawing);
        canvas.removeEventListener("mouseout", stopDrawing);
        canvas.removeEventListener("touchstart", startDrawing);
        canvas.removeEventListener("touchmove", draw);
        canvas.removeEventListener("touchend", stopDrawing);
      };
    }, [width, height]);

    return (
      <canvas
        ref={canvasRef}
        className="border border-border rounded-md bg-white touch-none"
      />
    );
  }
);

SignatureCanvas.displayName = "SignatureCanvas";

export default SignatureCanvas;