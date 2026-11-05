import React, { useEffect, useRef } from 'react';

export interface BurstEvent {
  id: number;
  x: number;
  y: number;
  color?: string;
}

interface ParticleBurstCanvasProps {
  bursts: BurstEvent[];
  onClearBurst: (id: number) => void;
  performanceMode?: boolean;
}

export const ParticleBurstCanvas: React.FC<ParticleBurstCanvasProps> = ({
  bursts,
  onClearBurst,
  performanceMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (performanceMode || bursts.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Spawn 24 soft glowing stardust particles per burst
    const activeParticles: {
      burstId: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      color: string;
      life: number;
      maxLife: number;
    }[] = [];

    const colors = ['#34d399', '#818cf8', '#c084fc', '#38bdf8', '#fbbf24'];

    bursts.forEach((b) => {
      for (let i = 0; i < 24; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4.5 + 1.5;
        activeParticles.push({
          burstId: b.id,
          x: b.x,
          y: b.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 2.5 + 1,
          alpha: 1,
          color: b.color || colors[Math.floor(Math.random() * colors.length)],
          life: 0,
          maxLife: 40 + Math.random() * 20,
        });
      }
    });

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let aliveCount = 0;

      for (let i = 0; i < activeParticles.length; i++) {
        const p = activeParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94; // friction
        p.vy *= 0.94;
        p.life += 1;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        if (p.alpha > 0.01) {
          aliveCount++;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fill();
        }
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      if (aliveCount > 0) {
        animationId = requestAnimationFrame(render);
      } else {
        bursts.forEach((b) => onClearBurst(b.id));
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [bursts, onClearBurst, performanceMode]);

  if (performanceMode || bursts.length === 0) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
};
