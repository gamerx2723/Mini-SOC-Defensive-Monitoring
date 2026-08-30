import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  baseAlpha: number;
}

export const InteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; radius: number }>({
    x: -1000,
    y: -1000,
    radius: 200
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Particle Palette: Gold, Champagne Gold, Silver, Subtle White
    const particleColors = [
      'rgba(212, 175, 55, ', // Gold
      'rgba(245, 215, 127, ', // Light Champagne Gold
      'rgba(226, 232, 240, ', // Silver
      'rgba(255, 255, 255, '  // Crisp White
    ];

    let particles: Particle[] = [];

    const initParticles = () => {
      particles = [];
      const particleCount = Math.floor((width * height) / 9500); // Richer particle density

      for (let i = 0; i < particleCount; i++) {
        const baseAlpha = Math.random() * 0.55 + 0.25;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          size: Math.random() * 2.0 + 1.0,
          color: particleColors[Math.floor(Math.random() * particleColors.length)],
          alpha: baseAlpha,
          baseAlpha
        });
      }
    };

    initParticles();

    let time = 0;

    // Render loop
    const render = () => {
      time += 0.005;
      ctx.clearRect(0, 0, width, height);

      // 1. Ambient Background Glow Orbs (Gold & Silver mesh)
      const orb1X = width * 0.25 + Math.sin(time) * 80;
      const orb1Y = height * 0.3 + Math.cos(time * 0.8) * 60;
      const grad1 = ctx.createRadialGradient(orb1X, orb1Y, 0, orb1X, orb1Y, 450);
      grad1.addColorStop(0, 'rgba(212, 175, 55, 0.09)');
      grad1.addColorStop(0.6, 'rgba(212, 175, 55, 0.02)');
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const orb2X = width * 0.75 + Math.cos(time * 0.7) * 90;
      const orb2Y = height * 0.65 + Math.sin(time) * 70;
      const grad2 = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, 500);
      grad2.addColorStop(0, 'rgba(226, 232, 240, 0.07)');
      grad2.addColorStop(0.6, 'rgba(160, 160, 190, 0.02)');
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // 2. Interactive Mouse Gold Light Aura
      if (mouseRef.current.x > 0 && mouseRef.current.y > 0) {
        const mouseGradient = ctx.createRadialGradient(
          mouseRef.current.x,
          mouseRef.current.y,
          0,
          mouseRef.current.x,
          mouseRef.current.y,
          280
        );
        mouseGradient.addColorStop(0, 'rgba(212, 175, 55, 0.14)');
        mouseGradient.addColorStop(0.5, 'rgba(212, 175, 55, 0.04)');
        mouseGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = mouseGradient;
        ctx.fillRect(0, 0, width, height);
      }

      // 3. Render and link particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse proximity reaction
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouseRef.current.radius) {
          const force = (1 - dist / mouseRef.current.radius) * 0.85;
          p.x -= (dx / dist) * force * 1.8;
          p.y -= (dy / dist) * force * 1.8;
          p.alpha = Math.min(1, p.baseAlpha + force * 0.65);
        } else {
          p.alpha = p.baseAlpha;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distLinks = Math.hypot(p.x - p2.x, p.y - p2.y);

          if (distLinks < 125) {
            const linkAlpha = (1 - distLinks / 125) * 0.28;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(212, 175, 55, ${linkAlpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: 'radial-gradient(ellipse 90% 90% at 50% -10%, #0d0d16 0%, #050509 50%, #000000 100%)'
      }}
    />
  );
};
