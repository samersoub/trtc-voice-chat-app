import React from 'react';

interface FemaleProfileFrameProps {
  imageUrl: string;
  isSpeaking?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const FemaleProfileFrame: React.FC<FemaleProfileFrameProps> = ({ 
  imageUrl, 
  isSpeaking = false,
  size = 'large'
}) => {
  const sizeClasses = {
    small: 'w-20 h-20',
    medium: 'w-32 h-32',
    large: 'w-40 h-40'
  };

  const waveCount = isSpeaking ? 4 : 0;

  return (
    <div className="relative flex flex-col items-center gap-4">
      <div className="relative">
        {/* موجات صوتية خارجية */}
        {isSpeaking && (
          <>
            {[1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className={`absolute inset-0 rounded-full animate-voice-wave-${index}`}
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(236, 72, 153, ${0.3 - index * 0.05}), 
                    rgba(167, 139, 250, ${0.3 - index * 0.05}), 
                    rgba(251, 207, 232, ${0.3 - index * 0.05})
                  )`,
                  filter: 'blur(8px)',
                  animation: `voiceWave${index} 2s ease-out infinite`,
                  animationDelay: `${index * 0.3}s`,
                }}
              />
            ))}
          </>
        )}

        <div
          className={`relative ${isSpeaking ? 'animate-pulse-subtle' : ''}`}
        >
          <div className={`relative ${sizeClasses[size]} rounded-full p-1 bg-gradient-to-br from-pink-300 via-purple-300 to-pink-200 shadow-lg`}>
            {isSpeaking && (
              <div
                className="absolute inset-0 rounded-full animate-spin-slow"
                style={{
                  background: 'conic-gradient(from 0deg, transparent, rgba(236, 72, 153, 0.5), transparent)',
                }}
              />
            )}
            
            <div className="relative w-full h-full rounded-full p-1 bg-white shadow-inner">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50">
                {/* صورة المستخدم */}
                <img 
                  src={imageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                {/* تأثير إضاءة علوي */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-pink-100/20" />
              </div>
            </div>
          </div>
        </div>

        {/* جزيئات متطايرة */}
        {isSpeaking && (
          <>
            {[...Array(8)].map((_, i) => {
              const angle = (i * 360) / 8;
              const distance = size === 'large' ? 80 : size === 'medium' ? 60 : 40;
              const x = Math.cos((angle * Math.PI) / 180) * distance;
              const y = Math.sin((angle * Math.PI) / 180) * distance;
              
              return (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full animate-particle"
                  style={{
                    background: `linear-gradient(135deg, #ec4899, #c084fc, #fbcfe8)`,
                    animation: `particle${i} 1.5s ease-out infinite`,
                    animationDelay: `${i * 0.2}s`,
                    '--particle-x': `${x}px`,
                    '--particle-y': `${y}px`,
                  } as React.CSSProperties}
                />
              );
            })}
          </>
        )}
      </div>

      <style>{`
        @keyframes voiceWave1 {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.45); opacity: 0; }
        }
        @keyframes voiceWave2 {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes voiceWave3 {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.75); opacity: 0; }
        }
        @keyframes voiceWave4 {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.9); opacity: 0; }
        }

        .animate-pulse-subtle {
          animation: pulseSubtle 1.5s ease-in-out infinite;
        }

        @keyframes pulseSubtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        ${[...Array(8)].map((_, i) => `
          @keyframes particle${i} {
            0% {
              transform: translate(0, 0);
              opacity: 0.8;
              transform: scale(1);
            }
            100% {
              transform: translate(var(--particle-x), var(--particle-y));
              opacity: 0;
              transform: scale(0.3);
            }
          }
        `).join('\n')}
      `}</style>
    </div>
  );
};

export default FemaleProfileFrame;
