import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Shield, Key, User, Activity, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Generate 3D nodes representing fiber-optic network junctions
    const particles: Particle3D[] = [];
    const particleCount = 100;
    const colors = ['#6366f1', '#38bdf8', '#a855f7', '#4f46e5'];

    for (let i = 0; i < particleCount; i++) {
      // Coordinates inside a virtual 3D cube from -250 to 250
      particles.push({
        x: (Math.random() - 0.5) * 500,
        y: (Math.random() - 0.5) * 500,
        z: (Math.random() - 0.5) * 500,
        size: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse to a range from -1 to 1
      mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    let angleY = 0.002; // Automatic slow Y rotation
    let angleX = 0.001; // Automatic slow X rotation
    const focalLength = 300; // Projection focal length

    const render = () => {
      ctx.fillStyle = '#020617'; // slate-950 deep base
      ctx.fillRect(0, 0, width, height);

      // Draw grid lines on the background for added depth
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Smooth mouse movement interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Rotate extra with mouse
      const currentAngleY = angleY + mouseRef.current.x * 0.005;
      const currentAngleX = angleX + mouseRef.current.y * 0.005;

      const cosY = Math.cos(currentAngleY);
      const sinY = Math.sin(currentAngleY);
      const cosX = Math.cos(currentAngleX);
      const sinX = Math.sin(currentAngleX);

      // Store projected coordinates
      const projected: { sx: number; sy: number; sz: number; color: string; size: number }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 3D rotation on Y-axis
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;

        // 3D rotation on X-axis
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        // Save rotated coordinates back for persistence
        p.x = x1;
        p.y = y2;
        p.z = z2;

        // Add 3D perspective depth zoom matching optical fiber nodes
        const depth = focalLength / (focalLength + z2 + 300);

        // Project to 2D Screen
        const sx = width / 2 + x1 * depth * 1.5;
        const sy = height / 2 + y2 * depth * 1.5;

        projected.push({
          sx,
          sy,
          sz: z2,
          color: p.color,
          size: p.size * depth * 2,
        });
      }

      // Draw lines between close nodes (constellation optical network effect)
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const pi = projected[i];
          const pj = projected[j];

          const dx = pi.sx - pj.sx;
          const dy = pi.sy - pj.sy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Draw a line if close enough on screen
          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.18;
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(pi.sx, pi.sy);
            ctx.lineTo(pj.sx, pj.sy);
            ctx.stroke();
          }
        }
      }

      // Draw particle nodes
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        if (p.sx < 0 || p.sx > width || p.sy < 0 || p.sy > height) continue;

        const glowAlpha = Math.max(0.1, 1 - (p.sz + 250) / 500);
        ctx.shadowBlur = p.size * 3;
        ctx.shadowColor = p.color;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0; // reset glow for performance
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (username.toLowerCase() === 'admin' && password === 'admin123') {
        onLoginSuccess();
      } else {
        setError('NOC Authentication Failure: Invalid Operator Username or Passkey.');
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* 3D Kinetic background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-0" />

      {/* Futuristic soft overlay glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/20 via-transparent to-purple-950/10 pointer-events-none z-1" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-2xl p-8 shadow-2xl flex flex-col gap-6">
          
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex p-3 bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 rounded-xl mb-3.5 shadow-inner">
              <Shield className="w-8 h-8 animate-pulse" />
            </div>
            <h1 className="text-xl font-semibold text-white tracking-tight">ISP Core Operator Portal</h1>
            <p className="text-xs text-slate-400 mt-1">Authorized Network Operations Center (NOC) Access Only</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs rounded-lg flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Operator Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-3 bg-slate-950/80 border border-slate-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  placeholder="e.g. NOC_ADMIN"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Security Passkey</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-3 bg-slate-950/80 border border-slate-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  Operator Authenticating...
                </>
              ) : (
                'Decrypt & Authorize Connection'
              )}
            </button>
          </form>

          {/* Core system details in footer */}
          <div className="border-t border-slate-800/60 pt-4 text-center">
            <span className="text-[10px] text-slate-500 font-mono block uppercase">
              GPON Chassis Node Control: v4.1.25-NOC
            </span>
            <span className="text-[9px] text-slate-600 mt-0.5 block">
              Default credentials: <strong className="text-slate-500 font-mono">admin</strong> / <strong className="text-slate-500 font-mono">admin123</strong>
            </span>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
