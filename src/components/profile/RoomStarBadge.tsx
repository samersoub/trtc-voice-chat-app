import React, { useEffect, useState } from 'react';
import { Star, Sparkles, Award, Mic } from 'lucide-react';

interface RoomStarBadgeProps {
  userName?: string;
  description?: string;
  compact?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
}

const RoomStarBadge: React.FC<RoomStarBadgeProps> = ({ 
  userName = "", 
  description = "نجم الغرفة هذا الأسبوع",
  compact = false 
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [rotation, setRotation] = useState(0);
  const [glowScale, setGlowScale] = useState(1);

  useEffect(() => {
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 400 - 200,
      y: Math.random() * 400 - 200,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);

    // Rotation animation
    const rotationInterval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 50);

    // Glow animation
    const glowInterval = setInterval(() => {
      setGlowScale(prev => {
        const newScale = prev + 0.02;
        return newScale > 1.2 ? 1 : newScale;
      });
    }, 100);

    return () => {
      clearInterval(rotationInterval);
      clearInterval(glowInterval);
    };
  }, []);

  if (compact) {
    // Compact version for profile preview
    return (
      <div className="relative inline-flex items-center justify-center p-4">
        <div className="relative bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-full p-1 shadow-lg">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-full p-4">
            <Star className="w-12 h-12 fill-yellow-400 text-yellow-400" style={{
              filter: 'drop-shadow(0 0 10px rgba(250,204,21,0.6))'
            }} />
          </div>
        </div>
        <div className="absolute -top-1 -right-1">
          <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center min-h-[500px]">
      {/* Particles in background */}
      {particles.map((particle) => {
        const particleStyle = {
          position: 'absolute' as const,
          width: '4px',
          height: '4px',
          backgroundColor: 'rgb(253, 224, 71)',
          borderRadius: '50%',
          transform: `translate(${particle.x}px, ${particle.y}px)`,
          animation: `particle-float 3s ease-out infinite`,
          animationDelay: `${particle.delay}s`,
        };

        return <div key={particle.id} style={particleStyle} />;
      })}

      {/* Outer glow ring */}
      <div 
        className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-yellow-400/20 via-amber-400/20 to-orange-400/20 blur-2xl"
        style={{
          transform: `scale(${glowScale})`,
          opacity: 0.3 + (glowScale - 1) * 2,
        }}
      />

      {/* Main badge container */}
      <div className="relative z-10 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-full p-1 shadow-2xl animate-badge-entrance">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-full p-8 relative overflow-hidden">
          {/* Inner shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine" />

          {/* Content */}
          <div className="relative flex flex-col items-center gap-4 w-64">
            {/* Star icon with animation */}
            <div className="relative" style={{ transform: `rotate(${rotation}deg)` }}>
              <Star 
                className="w-20 h-20 fill-yellow-400 text-yellow-400" 
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(250,204,21,0.8))'
                }}
              />
              
              {/* Sparkles around the star */}
              {[0, 1, 2, 3].map((i) => {
                const angle = (i * 90 + rotation) * (Math.PI / 180);
                const distance = 64;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;
                
                return (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2"
                    style={{
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      animation: 'sparkle-pulse 2s ease-in-out infinite',
                      animationDelay: `${i * 0.5}s`,
                    }}
                  >
                    <Sparkles className="w-6 h-6 text-yellow-300" />
                  </div>
                );
              })}
            </div>

            {/* Award icon */}
            <div className="animate-fade-in-up animate-delay-600">
              <Award className="w-8 h-8 text-amber-400" />
            </div>

            {/* User name */}
            {userName && (
              <div className="text-center animate-fade-in-up animate-delay-800">
                <h2 className="text-white text-xl font-bold">{userName}</h2>
              </div>
            )}

            {/* Description */}
            {description && (
              <div className="text-center flex items-center gap-2 animate-fade-in-up animate-delay-1000">
                <Mic className="w-4 h-4 text-amber-400" />
                <p className="text-amber-200 text-sm">{description}</p>
              </div>
            )}

            {/* Decorative bottom stars */}
            <div className="flex gap-2 mt-2 animate-fade-in animate-delay-1200">
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  className="animate-star-pulse"
                  style={{
                    animationDelay: `${star * 0.2}s`,
                  }}
                >
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rotating rings */}
      <div 
        className="absolute w-96 h-96 border-2 border-yellow-400/20 rounded-full"
        style={{
          transform: `rotate(${rotation * 24}deg)`,
        }}
      />
      
      <div 
        className="absolute w-[26rem] h-[26rem] border-2 border-amber-400/10 rounded-full"
        style={{
          transform: `rotate(${-rotation * 18}deg)`,
        }}
      />

      <style>{`
        @keyframes particle-float {
          0%, 100% { opacity: 0; transform: translate(0, 0) scale(0); }
          50% { opacity: 1; transform: translate(var(--x), var(--y)) scale(1); }
        }

        @keyframes badge-entrance {
          from { transform: scale(0) rotate(-180deg); opacity: 0; }
          to { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes sparkle-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @keyframes star-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }

        .animate-badge-entrance {
          animation: badge-entrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
        }

        .animate-shine {
          animation: shine 2s ease-in-out 1s infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out both;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out both;
        }

        .animate-star-pulse {
          animation: star-pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default RoomStarBadge;
