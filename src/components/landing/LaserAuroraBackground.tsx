import React, { useEffect, useRef } from 'react';

/**
 * LaserAuroraBackground
 * 
 * Renders smooth, continuous, animated glowing light trails (electric blue & vibrant purple)
 * sweeping dynamically across a deep charcoal/black base (#07080f).
 *
 * Implements:
 * - Multi-layer luminous laser curves with moving bezier control points
 * - High-intensity light pulses / photon packets racing along the paths with glowing tails
 * - Dynamic blend mode ('lighter' / 'screen') that creates white-hot cores where beams intersect
 * - Floating micro-particles / stardust with subtle twinkling
 * - Crisp retina display handling via devicePixelRatio
 * - Low-overhead physics & graceful throttling on inactive tabs
 */
export const LaserAuroraBackground: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let time = 0;

    // Mouse influence for subtle interactive fluid response
    const mouse = {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.4,
      targetX: window.innerWidth * 0.5,
      targetY: window.innerHeight * 0.4
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle high-DPI resize
    const handleResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Stardust floating particles
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.6 + 0.4,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.6 + 0.2,
      pulseSpeed: Math.random() * 0.03 + 0.01,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.5 ? '#00e5ff' : '#c084fc'
    }));

    // Photon packets racing along the laser curves
    const photonPackets = [
      { trailIndex: 0, progress: 0.1, speed: 0.0032, size: 3.5, color: '#00f5ff' },
      { trailIndex: 0, progress: 0.6, speed: 0.0028, size: 2.5, color: '#ffffff' },
      { trailIndex: 1, progress: 0.25, speed: 0.0035, size: 3.5, color: '#e879f9' },
      { trailIndex: 1, progress: 0.75, speed: 0.0025, size: 2.8, color: '#ffffff' },
      { trailIndex: 2, progress: 0.4, speed: 0.0038, size: 3.0, color: '#38bdf8' },
      { trailIndex: 3, progress: 0.85, speed: 0.0029, size: 3.2, color: '#c084fc' }
    ];

    // Compute dynamic cubic bezier control points for each sweeping laser trail
    const getTrailCurve = (index: number, t: number) => {
      // Ease mouse target
      mouse.x += (mouse.targetX - mouse.x) * 0.02;
      mouse.y += (mouse.targetY - mouse.y) * 0.02;

      const mXRatio = (mouse.x / width - 0.5) * 60;
      const mYRatio = (mouse.y / height - 0.5) * 40;

      if (index === 0) {
        // Main Electric Blue Laser Beam (Sweeps from upper left through center to bottom right)
        return {
          p0: { x: -width * 0.15, y: height * (0.22 + Math.sin(t * 0.45) * 0.08) },
          p1: {
            x: width * (0.28 + Math.cos(t * 0.35) * 0.06) + mXRatio,
            y: height * (0.10 + Math.sin(t * 0.6) * 0.12) + mYRatio
          },
          p2: {
            x: width * (0.65 + Math.sin(t * 0.4) * 0.08) + mXRatio * 0.8,
            y: height * (0.78 + Math.cos(t * 0.5) * 0.14) + mYRatio * 0.8
          },
          p3: { x: width * 1.15, y: height * (0.62 + Math.sin(t * 0.38) * 0.1) },
          colors: {
            aura: 'rgba(0, 229, 255, 0.28)',
            body: '#00e5ff',
            core: '#ffffff'
          }
        };
      } else if (index === 1) {
        // Vibrant Purple / Magenta Laser Beam (Cross-sweeping undulating wave)
        return {
          p0: { x: -width * 0.1, y: height * (0.75 + Math.cos(t * 0.42) * 0.09) },
          p1: {
            x: width * (0.32 + Math.sin(t * 0.5) * 0.07) + mXRatio * 0.5,
            y: height * (0.85 + Math.cos(t * 0.38) * 0.12) + mYRatio * 0.5
          },
          p2: {
            x: width * (0.58 + Math.cos(t * 0.44) * 0.08) + mXRatio,
            y: height * (0.20 + Math.sin(t * 0.52) * 0.15) + mYRatio
          },
          p3: { x: width * 1.15, y: height * (0.28 + Math.cos(t * 0.36) * 0.08) },
          colors: {
            aura: 'rgba(192, 132, 252, 0.32)',
            body: '#c084fc',
            core: '#ffd6ff'
          }
        };
      } else if (index === 2) {
        // Cyan / Sky-blue lower harmonic ribbon
        return {
          p0: { x: -width * 0.05, y: height * (0.45 + Math.sin(t * 0.3 + 1) * 0.1) },
          p1: {
            x: width * (0.42 + Math.cos(t * 0.4 + 2) * 0.09),
            y: height * (0.55 + Math.sin(t * 0.5 + 1) * 0.16)
          },
          p2: {
            x: width * (0.72 + Math.sin(t * 0.35 + 3) * 0.07),
            y: height * (0.38 + Math.cos(t * 0.48 + 2) * 0.12)
          },
          p3: { x: width * 1.1, y: height * (0.82 + Math.sin(t * 0.32 + 1) * 0.08) },
          colors: {
            aura: 'rgba(56, 189, 248, 0.22)',
            body: '#38bdf8',
            core: '#e0f2fe'
          }
        };
      } else {
        // Deep Violet / Indigo ambient crest
        return {
          p0: { x: -width * 0.12, y: height * (0.12 + Math.cos(t * 0.35) * 0.06) },
          p1: {
            x: width * (0.25 + Math.sin(t * 0.45) * 0.08),
            y: height * (0.42 + Math.cos(t * 0.55) * 0.14)
          },
          p2: {
            x: width * (0.78 + Math.cos(t * 0.32) * 0.06),
            y: height * (0.68 + Math.sin(t * 0.42) * 0.12)
          },
          p3: { x: width * 1.12, y: height * (0.45 + Math.cos(t * 0.28) * 0.09) },
          colors: {
            aura: 'rgba(147, 51, 234, 0.24)',
            body: '#9333ea',
            core: '#fae8ff'
          }
        };
      }
    };

    // Calculate a point on cubic bezier curve at position u (0 to 1)
    const getBezierPoint = (
      p0: { x: number; y: number },
      p1: { x: number; y: number },
      p2: { x: number; y: number },
      p3: { x: number; y: number },
      u: number
    ) => {
      const u2 = u * u;
      const u3 = u2 * u;
      const inv = 1 - u;
      const inv2 = inv * inv;
      const inv3 = inv2 * inv;

      return {
        x: inv3 * p0.x + 3 * inv2 * u * p1.x + 3 * inv * u2 * p2.x + u3 * p3.x,
        y: inv3 * p0.y + 3 * inv2 * u * p1.y + 3 * inv * u2 * p2.y + u3 * p3.y
      };
    };

    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Main render loop
    const render = () => {
      if (isVisible) {
        time += 0.012;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // 1. Draw floating ambient particles
        ctx.save();
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.speedX;
          p.y += p.speedY;
          p.phase += p.pulseSpeed;

          // Wrap edges
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          const currentOpacity = p.opacity * (0.6 + 0.4 * Math.sin(p.phase));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = currentOpacity;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fill();
        }
        ctx.restore();

        // 2. Render the laser light beams with additive blending ('lighter')
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // Draw 4 distinct flowing laser aurora trails
        for (let trailIdx = 0; trailIdx < 4; trailIdx++) {
          const curve = getTrailCurve(trailIdx, time);

          // Path Pass 1: Wide, cinematic diffuse glow
          ctx.beginPath();
          ctx.moveTo(curve.p0.x, curve.p0.y);
          ctx.bezierCurveTo(
            curve.p1.x, curve.p1.y,
            curve.p2.x, curve.p2.y,
            curve.p3.x, curve.p3.y
          );
          ctx.lineWidth = 32;
          ctx.strokeStyle = curve.colors.aura;
          ctx.shadowBlur = 50;
          ctx.shadowColor = curve.colors.body;
          ctx.stroke();

          // Path Pass 2: Medium glowing body
          ctx.beginPath();
          ctx.moveTo(curve.p0.x, curve.p0.y);
          ctx.bezierCurveTo(
            curve.p1.x, curve.p1.y,
            curve.p2.x, curve.p2.y,
            curve.p3.x, curve.p3.y
          );
          ctx.lineWidth = 6;
          ctx.strokeStyle = curve.colors.body;
          ctx.shadowBlur = 24;
          ctx.shadowColor = curve.colors.body;
          ctx.stroke();

          // Path Pass 3: Ultra-sharp intense neon core
          ctx.beginPath();
          ctx.moveTo(curve.p0.x, curve.p0.y);
          ctx.bezierCurveTo(
            curve.p1.x, curve.p1.y,
            curve.p2.x, curve.p2.y,
            curve.p3.x, curve.p3.y
          );
          ctx.lineWidth = 1.8;
          ctx.strokeStyle = curve.colors.core;
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#ffffff';
          ctx.stroke();
        }

        // 3. Render high-energy photon packets traveling along the trails
        for (let j = 0; j < photonPackets.length; j++) {
          const pkt = photonPackets[j];
          pkt.progress = (pkt.progress + pkt.speed) % 1;

          const curve = getTrailCurve(pkt.trailIndex, time);
          const pos = getBezierPoint(curve.p0, curve.p1, curve.p2, curve.p3, pkt.progress);

          // Draw trailing comet tail
          const tailSteps = 6;
          for (let step = 1; step <= tailSteps; step++) {
            const tailProgress = (pkt.progress - step * 0.008 + 1) % 1;
            const tailPos = getBezierPoint(curve.p0, curve.p1, curve.p2, curve.p3, tailProgress);
            const tailAlpha = (1 - step / tailSteps) * 0.5;

            ctx.beginPath();
            ctx.arc(tailPos.x, tailPos.y, Math.max(0.5, pkt.size * (1 - step / tailSteps)), 0, Math.PI * 2);
            ctx.fillStyle = pkt.color;
            ctx.globalAlpha = tailAlpha;
            ctx.shadowBlur = 10;
            ctx.shadowColor = pkt.color;
            ctx.fill();
          }

          // Draw photon head
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, pkt.size, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 1.0;
          ctx.shadowBlur = 22;
          ctx.shadowColor = pkt.color;
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
      style={{ backgroundColor: '#07080f' }}
      aria-hidden="true"
    >
      {/* 1. Deep ambient dark base with cinematic gradient underlays */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(120, 50, 255, 0.18), transparent 70%), radial-gradient(ellipse 60% 50% at 85% 60%, rgba(0, 229, 255, 0.14), transparent 65%), radial-gradient(ellipse 50% 40% at 15% 75%, rgba(147, 51, 234, 0.12), transparent 60%)'
        }}
      />

      {/* 2. Micro-grid overlay for high-tech holographic depth */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* 3. Real-time dynamic Laser Aurora Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full"
      />

      {/* 4. Soft cinematic vignette to keep center content crisp and high-contrast */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 45%, transparent 20%, rgba(7, 8, 15, 0.45) 75%, rgba(7, 8, 15, 0.85) 100%)'
        }}
      />
    </div>
  );
};
