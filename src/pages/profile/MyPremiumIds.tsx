import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Star, Check, Crown, Shield } from 'lucide-react';
import { AuthService } from '@/services/AuthService';
import { PremiumIdService } from '@/services/PremiumIdService';
import { PremiumId } from '@/types/UserTypes';
import { useLocale } from '@/contexts';
import { showSuccess, showError } from '@/utils/toast';
import { Button } from '@/components/ui/button';

export default function MyPremiumIds() {
    const navigate = useNavigate();
    const { locale, dir } = useLocale();
    const [ids, setIds] = useState<PremiumId[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activatingId, setActivatingId] = useState<string | null>(null);

    const currentUser = AuthService.getCurrentUser();

    useEffect(() => {
        loadIds();
    }, [currentUser?.id]);

    const loadIds = async () => {
        if (!currentUser?.id) return;
        setIsLoading(true);
        try {
            const data = await PremiumIdService.getIdsByUserId(currentUser.id);
            setIds(data);
        } catch (e) {
            console.error(e);
            showError('Failed to load IDs');
        } finally {
            setIsLoading(false);
        }
    };

    const handleActivate = async (customId: string) => {
        if (!currentUser?.id) return;
        setActivatingId(customId);
        try {
            await PremiumIdService.activateId(currentUser.id, customId);
            showSuccess(locale === 'ar' ? 'تم تفعيل الرقم بنجاح' : 'ID Activated Successfully');

            // Refresh to update UI state (re-read from storage/service)
            window.location.reload();
        } catch (e: any) {
            showError(e.message);
        } finally {
            setActivatingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50" dir={dir}>
            {/* Header */}
            <div className="bg-white px-4 py-4 shadow-sm flex items-center gap-4 sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
                >
                    {dir === 'rtl' ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                </button>
                <h1 className="text-lg font-bold">
                    {locale === 'ar' ? 'أرقامي المميزة' : 'My Special IDs'}
                </h1>
            </div>

            <div className="p-4 max-w-md mx-auto space-y-4">
                {/* Active ID Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Crown className="w-32 h-32" />
                    </div>
                    <p className="opacity-80 text-sm mb-1">{locale === 'ar' ? 'الرقم الحالي' : 'Current active ID'}</p>
                    <h2 className="text-4xl font-mono font-bold tracking-wider">
                        {currentUser?.displayId || currentUser?.id?.slice(0, 8)}
                    </h2>
                    <div className="mt-4 flex items-center gap-2 text-sm bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                        <Check className="w-4 h-4" />
                        {locale === 'ar' ? 'نشط ويظهر للجميع' : 'Active and visible to everyone'}
                    </div>
                </div>

                <h3 className="font-semibold text-slate-700 mt-6 px-2">
                    {locale === 'ar' ? 'قائمة الأرقام المملوكة' : 'Your Owned IDs'}
                </h3>

                {isLoading ? (
                    <div className="py-8 text-center text-slate-400">Loading...</div>
                ) : ids.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                        <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">
                            {locale === 'ar' ? 'لا تملك أي أرقام مميزة بعد' : 'You don\'t own any special IDs yet'}
                        </p>
                        <Button
                            variant="link"
                            className="mt-2 text-indigo-600"
                            onClick={() => navigate('/store')} // Assuming store link
                        >
                            {locale === 'ar' ? 'تصفح المتجر' : 'Browse Store'}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {ids.map(id => (
                            <div
                                key={id.id}
                                className={`bg-white p-4 rounded-xl border-2 transition-all hover:shadow-md flex items-center justify-between group ${currentUser?.displayId === id.custom_id
                                        ? 'border-indigo-500 ring-4 ring-indigo-50/50'
                                        : 'border-transparent hover:border-slate-200'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold font-mono ${id.type === 'admin' ? 'bg-red-100 text-red-600' :
                                            id.type === 'gifted' ? 'bg-pink-100 text-pink-600' :
                                                'bg-amber-100 text-amber-600'
                                        }`}>
                                        {id.type === 'admin' && <Shield className="w-5 h-5" />}
                                        {id.type === 'gifted' && <Star className="w-5 h-5" />}
                                        {id.type === 'purchased' && <Crown className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-800 tracking-wide font-mono">{id.custom_id}</h4>
                                        <span className="text-xs text-slate-500 capitalize px-2 py-0.5 bg-slate-100 rounded-full">
                                            {id.type}
                                        </span>
                                    </div>
                                </div>

                                {currentUser?.displayId === id.custom_id ? (
                                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                        <Check className="w-6 h-6" />
                                    </div>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={activatingId === id.custom_id}
                                        onClick={() => handleActivate(id.custom_id)}
                                        className={activatingId === id.custom_id ? 'animate-pulse' : ''}
                                    >
                                        {locale === 'ar' ? 'تفعيل' : 'Activate'}
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
