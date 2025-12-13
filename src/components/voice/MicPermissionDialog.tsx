import React, { useState } from 'react';
import { Mic, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MicPermissionDialogProps {
  onPermissionGranted: () => void;
  onPermissionDenied: () => void;
}

export const MicPermissionDialog: React.FC<MicPermissionDialogProps> = ({
  onPermissionGranted,
  onPermissionDenied
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestMicPermission = async () => {
    setIsRequesting(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false 
      });
      
      // إيقاف الـ stream مؤقتاً (سيتم إعادة تشغيله في TRTC)
      stream.getTracks().forEach(track => track.stop());
      
      onPermissionGranted();
    } catch (err) {
      const error = err as { name?: string };
      console.error('Microphone permission denied:', err);
      setError(error.name === 'NotAllowedError' 
        ? 'تم رفض صلاحية الميكروفون. يرجى السماح بالوصول من إعدادات المتصفح.'
        : 'فشل الوصول للميكروفون. تأكد من أن الميكروفون متصل وغير مستخدم من تطبيق آخر.'
      );
      onPermissionDenied();
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-3xl p-8 max-w-md mx-4 shadow-2xl border-2 border-purple-500/30">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <Mic className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-white text-2xl font-bold text-center mb-3">
          صلاحية الميكروفون مطلوبة
        </h2>

        {/* Description */}
        <p className="text-white/80 text-center mb-6 leading-relaxed">
          للانضمام إلى الغرفة الصوتية والتحدث مع الآخرين، نحتاج إلى صلاحية الوصول للميكروفون.
        </p>

        {/* Features */}
        <div className="bg-black/30 rounded-2xl p-4 mb-6 space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <p className="text-white/90 text-sm">تحدث مع الأصدقاء في الوقت الفعلي</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <p className="text-white/90 text-sm">صوت عالي الجودة وواضح</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <p className="text-white/90 text-sm">يمكنك كتم الميكروفون في أي وقت</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            onClick={requestMicPermission}
            disabled={isRequesting}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            {isRequesting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>جاري الطلب...</span>
              </div>
            ) : (
              'السماح بالوصول للميكروفون'
            )}
          </Button>

          <Button
            onClick={onPermissionDenied}
            variant="outline"
            disabled={isRequesting}
            className="w-full bg-transparent border-2 border-white/30 hover:bg-white/10 text-white py-6 rounded-xl font-bold"
          >
            الدخول بدون صوت (استماع فقط)
          </Button>
        </div>

        {/* Privacy Note */}
        <p className="text-white/50 text-xs text-center mt-4">
          🔒 نحن نحترم خصوصيتك. يمكنك تغيير هذه الصلاحية في أي وقت من إعدادات المتصفح.
        </p>
      </div>
    </div>
  );
};

export default MicPermissionDialog;
