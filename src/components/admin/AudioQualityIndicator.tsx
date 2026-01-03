"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Signal, AlertTriangle, CheckCircle } from 'lucide-react';

interface AudioQualityMetric {
  roomId: string;
  userId: string;
  userName: string;
  jitter: number;
  latency: number;
  packetsLost: number;
  packetsSent: number;
  bitrate: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  timestamp: Date;
}

interface AudioQualityIndicatorProps {
  metrics: AudioQualityMetric[];
  roomName?: string;
}

const AudioQualityIndicator: React.FC<AudioQualityIndicatorProps> = ({ metrics, roomName }) => {
  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'fair':
        return <Signal className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'poor':
        return <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />;
      default:
        return <Signal className="h-4 w-4 sm:h-5 sm:w-5" />;
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'good': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'fair': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'poor': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 50) return 'text-green-500';
    if (latency < 100) return 'text-blue-500';
    if (latency < 200) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatBitrate = (bitrate: number) => {
    if (bitrate >= 1000) {
      return `${(bitrate / 1000).toFixed(1)} Mbps`;
    }
    return `${bitrate} kbps`;
  };

  if (metrics.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Signal className="h-10 w-10 mx-auto mb-3 text-gray-400" />
        <p className="text-sm text-gray-500">No audio quality data available</p>
      </Card>
    );
  }

  // Get latest metrics for each user
  const latestMetrics = metrics.reduce((acc, metric) => {
    const existing = acc.get(metric.userId);
    if (!existing || new Date(metric.timestamp) > new Date(existing.timestamp)) {
      acc.set(metric.userId, metric);
    }
    return acc;
  }, new Map<string, AudioQualityMetric>());

  return (
    <div className="space-y-3">
      {roomName && (
        <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-3">
          {roomName}
        </h3>
      )}

      <div className="grid grid-cols-1 gap-3">
        {Array.from(latestMetrics.values()).map((metric) => (
          <Card
            key={`${metric.roomId}-${metric.userId}`}
            className={cn(
              "p-3 sm:p-4 border-2",
              getQualityColor(metric.quality)
            )}
          >
            <div className="flex items-start justify-between gap-3">
              {/* User Info */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className={cn("flex-shrink-0", getQualityColor(metric.quality))}>
                  {getQualityIcon(metric.quality)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">
                    {metric.userName}
                  </p>
                  <p className={cn("text-xs font-medium capitalize", getQualityColor(metric.quality))}>
                    {metric.quality}
                  </p>
                </div>
              </div>

              {/* Quality Badge */}
              <div className={cn(
                "px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0",
                getQualityColor(metric.quality)
              )}>
                {metric.quality.toUpperCase()}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-xs text-gray-500 mb-1">Latency</p>
                <p className={cn("text-sm sm:text-base font-semibold", getLatencyColor(metric.latency))}>
                  {metric.latency}ms
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Jitter</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  {metric.jitter.toFixed(1)}ms
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Packet Loss</p>
                <p className={cn(
                  "text-sm sm:text-base font-semibold",
                  metric.packetsLost > 5 ? 'text-red-500' : 'text-green-500'
                )}>
                  {metric.packetsLost > 0 
                    ? `${((metric.packetsLost / metric.packetsSent) * 100).toFixed(2)}%`
                    : '0%'
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Bitrate</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  {formatBitrate(metric.bitrate)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AudioQualityIndicator;
