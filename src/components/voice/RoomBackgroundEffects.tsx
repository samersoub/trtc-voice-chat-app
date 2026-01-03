"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface RoomBackgroundEffectsProps {
  variant?: "default" | "nebula" | "galaxy";
  className?: string;
}

const RoomBackgroundEffects: React.FC<RoomBackgroundEffectsProps> = ({
  variant = "default",
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particle system
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;
    }

    const particles: Particle[] = [];
    const particleCount = 50;

    // Color schemes based on variant
    const colorSchemes = {
      default: ["rgba(99, 102, 241, ", "rgba(139, 92, 246, ", "rgba(59, 130, 246, "],
      nebula: ["rgba(236, 72, 153, ", "rgba(168, 85, 247, ", "rgba(59, 130, 246, "],
      galaxy: ["rgba(147, 51, 234, ", "rgba(79, 70, 229, ", "rgba(59, 130, 246, "],
    };

    const colors = colorSchemes[variant];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + particle.opacity + ")";
        ctx.fill();

        // Draw connecting lines to nearby particles
        particles.forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = particle.color + (0.1 * (1 - distance / 150)) + ")";
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [variant]);

  return (
    <>
      {/* Gradient overlay */}
      <div
        className={cn(
          "absolute inset-0 -z-20",
          variant === "default" &&
            "bg-gradient-to-br from-[rgba(99,102,241,0.1)] via-[rgba(139,92,246,0.1)] to-transparent",
          variant === "nebula" &&
            "bg-gradient-to-br from-[rgba(236,72,153,0.15)] via-[rgba(168,85,247,0.12)] to-transparent",
          variant === "galaxy" &&
            "bg-gradient-to-br from-[rgba(147,51,234,0.12)] via-[rgba(79,70,229,0.1)] to-transparent",
          className
        )}
      />

      {/* Animated particles canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ backdropFilter: "blur(30px)" }}
      />

      {/* Additional blur layer */}
      <div
        className="absolute inset-0 -z-30 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900"
        style={{ backdropFilter: "blur(40px)" }}
      />
    </>
  );
};

export default RoomBackgroundEffects;
