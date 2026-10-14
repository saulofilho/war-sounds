import React, { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';

export interface TrenchDebrisCanvasRef {
  triggerBlast: (
    intensity: 'heavy' | 'violent',
    options?: {
      xRatio?: number; // 0.0 (left) to 1.0 (right), defaults to 0.5 (center)
      burstMultiplier?: number;
    }
  ) => void;
  clear: () => void;
}

interface TrenchDebrisCanvasProps {
  shakeIntensity?: 'none' | 'light' | 'heavy' | 'violent';
  triggerKey?: number | string;
  className?: string;
  onActiveStateChange?: (active: boolean) => void;
}

// Particle representation
interface Particle {
  id: number;
  type: 'dust_plume' | 'earth_clod' | 'wood_splinter' | 'spark_ember' | 'ceiling_trickle';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  targetRadius?: number;
  growthRate?: number;
  alpha: number;
  decayRate: number;
  rotation: number;
  vRot: number;
  gravity: number;
  drag: number;
  color: string;
  secondaryColor?: string;
  width?: number;
  height?: number;
  points?: number[][]; // Polygon vertices for irregular rock/earth clods
}

let nextParticleId = 1;

export const TrenchDebrisCanvas = forwardRef<TrenchDebrisCanvasRef, TrenchDebrisCanvasProps>(
  ({ shakeIntensity, triggerKey, className = '', onActiveStateChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationFrameRef = useRef<number | null>(null);
    const isRunningRef = useRef<boolean>(false);
    const lastTriggerKeyRef = useRef<number | string | undefined>(undefined);
    const lastShakeRef = useRef<string | undefined>(undefined);

    // Eject a burst of dust and debris
    const triggerBlast = useCallback(
      (
        intensity: 'heavy' | 'violent',
        options?: { xRatio?: number; burstMultiplier?: number }
      ) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);
        if (width <= 0 || height <= 0) return;

        const xRatio = options?.xRatio !== undefined ? Math.max(0.05, Math.min(0.95, options.xRatio)) : 0.5;
        const multiplier = options?.burstMultiplier || 1.0;
        const originX = width * xRatio;
        const isViolent = intensity === 'violent';

        // Particle counts scaled by blast intensity
        const plumeCount = Math.floor((isViolent ? 45 : 24) * multiplier);
        const clodCount = Math.floor((isViolent ? 55 : 30) * multiplier);
        const splinterCount = Math.floor((isViolent ? 28 : 14) * multiplier);
        const sparkCount = Math.floor((isViolent ? 32 : 12) * multiplier);
        const trickleCount = Math.floor((isViolent ? 40 : 18) * multiplier);

        const newParticles: Particle[] = [];

        // Earth / Dust palette (clay, mud, charcoal, sand)
        const dustTones = [
          'rgba(165, 140, 112, ', // trench dust / dry clay
          'rgba(135, 112, 88, ',  // dark loamy soil
          'rgba(105, 88, 70, ',   // wet trench mud
          'rgba(180, 160, 135, ', // fine chalk / limestone powder
          'rgba(75, 68, 60, ',    // carbonized explosion soot
        ];

        const clodTones = [
          '#2c1c11', // wet black soil
          '#3e2a1b', // dark trench mud
          '#4f3928', // sandy clay
          '#1e1814', // scorched charcoal
          '#604a37', // dried earth
        ];

        const splinterTones = [
          '#8B5A2B', // wood oak
          '#5C3A21', // dark timber
          '#A0522D', // sienna plank
          '#795548', // weathered wood
        ];

        // 1. BILLOWING DUST PLUMES (Poeira subindo em volutas volumétricas)
        for (let i = 0; i < plumeCount; i++) {
          const spawnSpread = (Math.random() - 0.5) * (width * (isViolent ? 0.75 : 0.45));
          const spawnX = Math.max(10, Math.min(width - 10, originX + spawnSpread));
          // Dust erupts violently from the bottom of the trench and sandbags
          const spawnY = height - Math.random() * (height * 0.25);
          
          const upwardSpeed = (isViolent ? Math.random() * 9 + 6 : Math.random() * 6 + 4);
          const lateralSpread = (Math.random() - 0.5) * (isViolent ? 8 : 4.5);
          const baseColor = dustTones[Math.floor(Math.random() * dustTones.length)];

          newParticles.push({
            id: nextParticleId++,
            type: 'dust_plume',
            x: spawnX,
            y: spawnY,
            vx: lateralSpread,
            vy: -upwardSpeed,
            radius: Math.random() * 14 + 10,
            targetRadius: Math.random() * 50 + (isViolent ? 70 : 45),
            growthRate: Math.random() * 0.9 + 0.6,
            alpha: Math.random() * 0.35 + (isViolent ? 0.45 : 0.35),
            decayRate: Math.random() * 0.005 + 0.004,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.02,
            gravity: -0.015, // warm air / blast convection gives slight negative buoyancy initially
            drag: 0.965,     // atmospheric deceleration as the plume expands
            color: baseColor,
          });
        }

        // 2. HEAVY EARTH CLODS & DEBRIS (Torrões de terra e cascalho arremessados)
        for (let i = 0; i < clodCount; i++) {
          const spawnX = originX + (Math.random() - 0.5) * 60;
          const spawnY = height - Math.random() * 40;
          
          // Ejection velocity in violent arcs
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * (isViolent ? 1.6 : 1.2);
          const speed = (isViolent ? Math.random() * 18 + 10 : Math.random() * 13 + 7);
          const baseColor = clodTones[Math.floor(Math.random() * clodTones.length)];
          const size = Math.random() * (isViolent ? 9 : 6) + 3;

          // Irregular polygon vertices for rugged rock/dirt chunks
          const numPoints = Math.floor(Math.random() * 3) + 5;
          const points: number[][] = [];
          for (let p = 0; p < numPoints; p++) {
            const rad = (p / numPoints) * Math.PI * 2;
            const variance = 0.6 + Math.random() * 0.8;
            points.push([Math.cos(rad) * size * variance, Math.sin(rad) * size * variance]);
          }

          newParticles.push({
            id: nextParticleId++,
            type: 'earth_clod',
            x: spawnX,
            y: spawnY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: size,
            alpha: 1.0,
            decayRate: Math.random() * 0.008 + 0.004,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.35,
            gravity: 0.42 + Math.random() * 0.2, // Heavy gravity pulls chunks back down
            drag: 0.992,
            color: baseColor,
            points,
          });
        }

        // 3. WOOD SPLINTERS & SANDBAG CANVAS SHRED (Estilhaços de madeira do tabuado e sacos)
        for (let i = 0; i < splinterCount; i++) {
          const spawnX = originX + (Math.random() - 0.5) * 80;
          const spawnY = height - Math.random() * 60;
          const speed = Math.random() * (isViolent ? 16 : 10) + 6;
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;

          newParticles.push({
            id: nextParticleId++,
            type: 'wood_splinter',
            x: spawnX,
            y: spawnY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            width: Math.random() * 2.5 + 1.2,
            height: Math.random() * (isViolent ? 16 : 10) + 5,
            radius: 3,
            alpha: 0.95,
            decayRate: Math.random() * 0.009 + 0.006,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.45,
            gravity: 0.35,
            drag: 0.985,
            color: splinterTones[Math.floor(Math.random() * splinterTones.length)],
          });
        }

        // 4. INCANDESCENT SPARKS / EMBERS (Fagulhas e brasas quentes subindo)
        for (let i = 0; i < sparkCount; i++) {
          const spawnX = originX + (Math.random() - 0.5) * 50;
          const spawnY = height - Math.random() * 30;
          const speed = Math.random() * (isViolent ? 19 : 12) + 8;
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;

          newParticles.push({
            id: nextParticleId++,
            type: 'spark_ember',
            x: spawnX,
            y: spawnY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: Math.random() * 2.5 + 1,
            alpha: 1.0,
            decayRate: Math.random() * 0.02 + 0.015,
            rotation: 0,
            vRot: 0,
            gravity: 0.12,
            drag: 0.97,
            color: Math.random() > 0.4 ? '#ffb703' : '#fb8500',
            secondaryColor: '#fff',
          });
        }

        // 5. CEILING & PARAPET COLLAPSE TRICKLE (Poeira e terra escorrendo do teto/parapeito)
        for (let i = 0; i < trickleCount; i++) {
          newParticles.push({
            id: nextParticleId++,
            type: 'ceiling_trickle',
            x: Math.random() * width,
            y: -Math.random() * 30, // Spawns above top frame, cascading down over soldier
            vx: (Math.random() - 0.5) * 1.5,
            vy: Math.random() * 4 + 2.5,
            radius: Math.random() * 3.5 + 1.2,
            alpha: Math.random() * 0.6 + 0.3,
            decayRate: Math.random() * 0.007 + 0.004,
            rotation: Math.random() * Math.PI,
            vRot: (Math.random() - 0.5) * 0.1,
            gravity: 0.28,
            drag: 0.995,
            color: dustTones[Math.floor(Math.random() * dustTones.length)],
          });
        }

        // Append new particles
        particlesRef.current.push(...newParticles);

        // Start render loop if paused
        if (!isRunningRef.current) {
          isRunningRef.current = true;
          onActiveStateChange?.(true);
          startAnimationLoop();
        }
      },
      [onActiveStateChange]
    );

    // Clear all active particles
    const clear = useCallback(() => {
      particlesRef.current = [];
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      isRunningRef.current = false;
      onActiveStateChange?.(false);
    }, [onActiveStateChange]);

    useImperativeHandle(ref, () => ({
      triggerBlast,
      clear,
    }));

    // Trigger on prop updates (when screenShake changes to heavy or violent)
    useEffect(() => {
      if (
        (shakeIntensity === 'heavy' || shakeIntensity === 'violent') &&
        (shakeIntensity !== lastShakeRef.current || triggerKey !== lastTriggerKeyRef.current)
      ) {
        triggerBlast(shakeIntensity);
      }
      lastShakeRef.current = shakeIntensity;
      lastTriggerKeyRef.current = triggerKey;
    }, [shakeIntensity, triggerKey, triggerBlast]);

    // Resize canvas respecting device pixel ratio
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const resize = () => {
        const parent = canvas.parentElement;
        if (!parent) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = parent.clientWidth;
        const h = parent.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      };

      resize();
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }, []);

    // Main particle physics and render cycle
    const startAnimationLoop = () => {
      const loop = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          isRunningRef.current = false;
          return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          isRunningRef.current = false;
          return;
        }

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        const particles = particlesRef.current;
        let aliveIndex = 0;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          // Apply physics
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= p.drag;
          p.vy = p.vy * p.drag + p.gravity;
          p.rotation += p.vRot;
          p.alpha -= p.decayRate;

          // Expand plume radius
          if (p.type === 'dust_plume' && p.targetRadius && p.growthRate) {
            if (p.radius < p.targetRadius) {
              p.radius += p.growthRate;
            }
          }

          // Check if still within bounds and visible
          const isAlive =
            p.alpha > 0.01 &&
            p.y < height + 100 &&
            p.y > -150 &&
            p.x > -100 &&
            p.x < width + 100;

          if (isAlive) {
            // Render particle based on type
            if (p.type === 'dust_plume') {
              // Soft volumetric billowing dust
              ctx.save();
              const grad = ctx.createRadialGradient(p.x, p.y, p.radius * 0.1, p.x, p.y, p.radius);
              grad.addColorStop(0, `${p.color}${Math.min(1, p.alpha * 1.2)})`);
              grad.addColorStop(0.45, `${p.color}${p.alpha * 0.75})`);
              grad.addColorStop(0.85, `${p.color}${p.alpha * 0.25})`);
              grad.addColorStop(1, `${p.color}0)`);

              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            } else if (p.type === 'earth_clod') {
              // Irregular tumbling earth chunk
              ctx.save();
              ctx.translate(p.x, p.y);
              ctx.rotate(p.rotation);
              ctx.fillStyle = p.color;
              ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));

              if (p.points && p.points.length > 2) {
                ctx.beginPath();
                ctx.moveTo(p.points[0][0], p.points[0][1]);
                for (let k = 1; k < p.points.length; k++) {
                  ctx.lineTo(p.points[k][0], p.points[k][1]);
                }
                ctx.closePath();
                ctx.fill();
              } else {
                ctx.beginPath();
                ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
                ctx.fill();
              }
              ctx.restore();
            } else if (p.type === 'wood_splinter') {
              // High velocity wood splinter
              ctx.save();
              ctx.translate(p.x, p.y);
              ctx.rotate(p.rotation);
              ctx.fillStyle = p.color;
              ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
              const w = p.width || 2;
              const h = p.height || 8;
              ctx.fillRect(-w / 2, -h / 2, w, h);
              ctx.restore();
            } else if (p.type === 'spark_ember') {
              // Fiery glowing spark
              ctx.save();
              ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 6;
              ctx.fillStyle = p.color;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
              ctx.fill();

              // Hot white core
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.radius * 0.4, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            } else if (p.type === 'ceiling_trickle') {
              // Trickling ceiling dirt
              ctx.save();
              ctx.fillStyle = `${p.color}${p.alpha})`;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }

            // Compact array in-place for performance
            particles[aliveIndex++] = p;
          }
        }

        particles.length = aliveIndex;
        ctx.restore();

        if (particles.length > 0) {
          animationFrameRef.current = requestAnimationFrame(loop);
        } else {
          // Put to sleep when idle to preserve CPU
          isRunningRef.current = false;
          onActiveStateChange?.(false);
          ctx.clearRect(0, 0, width, height);
        }
      };

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className={`pointer-events-none absolute inset-0 z-25 overflow-hidden ${className}`}
        style={{ width: '100%', height: '100%' }}
      />
    );
  }
);

TrenchDebrisCanvas.displayName = 'TrenchDebrisCanvas';
