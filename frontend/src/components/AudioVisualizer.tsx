import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../services/audioEngine';

interface Props {
  isPlaying: boolean;
}

export const AudioVisualizer: React.FC<Props> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = audioEngine.getAnalyser();
    const bufferLength = analyser ? analyser.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animId = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (isPlaying && analyser) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Idle gentle animation
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.sin(Date.now() / 400 + i) * 12 + 16;
        }
      }

      const barWidth = (width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (height * 0.85);

        // Gradient from Bollywood gold to saffron to ruby
        const grad = ctx.createLinearGradient(0, height - barHeight, 0, height);
        grad.addColorStop(0, '#f59e0b');
        grad.addColorStop(0.5, '#f97316');
        grad.addColorStop(1, '#ef4444');

        ctx.fillStyle = grad;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = isPlaying ? 8 : 2;

        ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying]);

  return (
    <div className="w-full flex items-center justify-center py-2">
      <canvas
        ref={canvasRef}
        width={360}
        height={50}
        className="w-full max-w-sm h-12 rounded-lg bg-slate-950/40 border border-slate-800/80"
      />
    </div>
  );
};
