import React, { useEffect, useRef } from 'react';
import { ThemeConfig } from '../types/cleaner';

interface MatrixRainCanvasProps {
  theme: ThemeConfig;
  opacity?: number;
  speed?: number;
}

export const MatrixRainCanvas: React.FC<MatrixRainCanvasProps> = ({
  theme,
  opacity = 0.18,
  speed = 40,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Characters: Katakana, Cyrillic, Hex, Math
    const characters =
      'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>/*#{}[]+=~$_';
    const fontSize = 13;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = new Array(columns).fill(1).map(() => Math.floor(Math.random() * -50));

    let lastTime = 0;
    const render = (time: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (time - lastTime < speed) return;
      lastTime = time;

      // Dark fade overlay to create trailing trail
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        if (y > 0 && y < height + 50) {
          // Leading character is bright
          if (Math.random() > 0.85) {
            ctx.fillStyle = '#FFFFFF';
          } else {
            ctx.fillStyle = theme.accent;
          }
          ctx.fillText(text, x, y);
        }

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme.accent, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none transition-opacity duration-700"
      style={{ opacity }}
    />
  );
};
