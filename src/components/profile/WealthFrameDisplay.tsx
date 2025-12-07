import React from 'react';
import { WealthLevel } from '@/services/WealthLevelService';

interface WealthFrameDisplayProps {
  level: WealthLevel;
  imageUrl: string;
  size?: 'small' | 'medium' | 'large';
  showEffects?: boolean;
}

export default function WealthFrameDisplay({ 
  level, 
  imageUrl, 
  size = 'medium',
  showEffects = true 
}: WealthFrameDisplayProps) {
  
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-32 h-32',
    large: 'w-40 h-40'
  };

  const badgeSizes = {
    small: 'text-xs px-2 py-0.5',
    medium: 'text-sm px-3 py-1',
    large: 'text-base px-4 py-1.5'
  };

  const iconSizes = {
    small: 'text-base',
    medium: 'text-2xl',
    large: 'text-3xl'
  };

  return (
    <div className="relative inline-block">
      {/* الإطار الخارجي */}
      <div 
        className={`${sizeClasses[size]} rounded-full p-1 bg-gradient-to-br ${level.gradient} relative ${
          showEffects ? 'shadow-[0_0_20px_rgba(0,0,0,0.3),0_0_40px_rgba(255,255,255,0.2)]' : ''
        }`}
      >
        {/* الإطار الداخلي */}
        <div className="w-full h-full rounded-full border-2 border-white/30 p-0.5 bg-white/10 backdrop-blur-sm">
          {/* الصورة */}
          <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            <img 
              src={imageUrl} 
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* تأثيرات الإضاءة */}
        {showEffects && (
          <>
            <div className="absolute inset-0 rounded-full animate-pulse opacity-30 wealth-glow" />
            {level.level >= 5 && (
              <div className="absolute inset-0 rounded-full">
                <div className="absolute inset-0 wealth-spin">
                  <div className="absolute top-0 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2" />
                  <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2" />
                  <div className="absolute left-0 top-1/2 w-2 h-2 bg-white rounded-full -translate-y-1/2" />
                  <div className="absolute right-0 top-1/2 w-2 h-2 bg-white rounded-full -translate-y-1/2" />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* أيقونة المستوى */}
      <div 
        className={`absolute -bottom-2 -right-2 ${badgeSizes[size]} rounded-full bg-gradient-to-br ${level.gradient} text-white font-bold flex items-center justify-center shadow-lg border-2 border-white`}
      >
        <span className={iconSizes[size]}>{level.icon}</span>
      </div>

      {/* شارة المستوى */}
      {level.level >= 3 && (
        <div 
          className={`absolute -top-2 -left-2 ${badgeSizes[size]} rounded-full bg-gradient-to-br ${level.gradient} text-white font-bold shadow-lg border-2 border-white`}
        >
          {level.level}
        </div>
      )}

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .wealth-spin {
          animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
