import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PremiumIdService } from '@/services/PremiumIdService';
import { PremiumId } from '@/types/UserTypes';
import { AuthService } from '@/services/AuthService';
import { Shield, CreditCard, Gift, Star, RefreshCw, Trash2, Fingerprint } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function PremiumIdManager() {
    const [ids, setIds] = useState<PremiumId[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // Create Form State
    const [newId, setNewId] = useState('');
    const [idType, setIdType] = useState<PremiumId['type']>('admin');
    const [price, setPrice] = useState('');
    const [expiryDays, setExpiryDays] = useState('');

    // Manage Dialog State
    const [manageId, setManageId] = useState<PremiumId | null>(null);
    const [targetUserId, setTargetUserId] = useState('');
    const [isManageOpen, setIsManageOpen] = useState(false);

    const loadIds = async () => {
        setIsLoading(true);
        try {
            const data = await PremiumIdService.getAllIds();
            setIds(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadIds();
    }, []);

    const handleCreateId = async () => {
        try {
            if (!newId || newId.length !== 7) {
                toast({ title: 'خطأ', description: 'يجب أن يكون الرقم مكوناً من 7 خانات', variant: 'destructive' });
                return;
            }

            let expiresAt: Date | undefined;
            if (expiryDays) {
                expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));
            }

            const currentUser = AuthService.getCurrentUser();

            await PremiumIdService.createId(
                newId,
                idType,
                expiresAt,
                price ? parseInt(price) : undefined,
                currentUser?.id
            );

            toast({ title: 'تمت العملية', description: 'تم إنشاء الرقم المميز بنجاح' });
            setNewId('');
            setPrice('');
            loadIds();
        } catch (e: any) {
            toast({ title: 'خطأ', description: e.message, variant: 'destructive' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الرقم؟')) return;
        try {
            await PremiumIdService.revokeId(id);
            toast({ title: 'تم', description: 'تم إلغاء ربط الرقم (الحذف الكامل غير مفعل)' });
            loadIds();
        } catch (e) {
            // ignore
        }
    };

    const openManageDialog = (id: PremiumId) => {
        setManageId(id);
        setTargetUserId(id.user_id || '');
        setIsManageOpen(true);
    };

    const handleAssign = async () => {
        if (!manageId || !targetUserId) return;
        try {
            await PremiumIdService.assignId(manageId.id, targetUserId);
            toast({ title: 'تم', description: 'تم تخصيص الرقم للمستخدم بنجاح' });
            setIsManageOpen(false);
            loadIds();
        } catch (e: any) {
            toast({ title: 'خطأ', description: e.message, variant: 'destructive' });
        }
    };

    const handleUnassign = async () => {
        if (!manageId) return;
        if (!confirm('هل أنت متأكد من إلغاء تخصيص الرقم؟')) return;
        try {
            await PremiumIdService.revokeId(manageId.id);
            toast({ title: 'تم', description: 'تم إلغاء تخصيص الرقم' });
            setIsManageOpen(false);
            loadIds();
        } catch (e: any) {
            toast({ title: 'خطأ', description: e.message, variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-6" dir="rtl">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">إدارة الأرقام المميزة (Control Panel)</h2>
                <p className="text-muted-foreground">إنشاء وإدارة معرفات المستخدمين - الإصدار المحدث</p>
            </div>

            <Tabs defaultValue="list" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="list">قائمة الأرقام</TabsTrigger>
                    <TabsTrigger value="create">إنشاء رقم جديد</TabsTrigger>
                </TabsList>

                {/* List Tab */}
                <TabsContent value="list">
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">الأرقام النشطة (Assign Users)</h3>
                            <Button variant="outline" size="sm" onClick={loadIds}>
                                <RefreshCw className="w-4 h-4 ml-2" />
                                تحديث
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {ids.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">لا يوجد أرقام مميزة حالياً</p>
                            ) : (
                                <div className="grid gap-4">
                                    {ids.map(id => (
                                        <div key={id.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg font-mono">
                                                    {id.custom_id}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">ID: {id.custom_id}</span>
                                                        <Badge variant={id.status === 'active' ? 'default' : 'secondary'}>
                                                            {id.status === 'active' ? 'نشط' : 'غير نشط'}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">
                                                            {id.type === 'admin' ? 'إداري' : id.type === 'purchased' ? 'شراء' : 'جائزة'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        المالك: {id.user_id ? <span className="text-primary">{id.user_id.slice(0, 8)}...</span> : 'غير مخصص'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" onClick={() => openManageDialog(id)} className="bg-blue-600 hover:bg-blue-700 text-white">
                                                    <Fingerprint className="w-4 h-4 ml-2" />
                                                    تخصيص/إدارة
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(id.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </TabsContent>

                {/* Create Tab */}
                <TabsContent value="create">
                    <Card className="max-w-xl p-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">الرقم المميز (7 خانات)</label>
                                <div className="relative">
                                    <Fingerprint className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="7777777"
                                        className="pl-9 font-mono text-lg"
                                        maxLength={7}
                                        value={newId}
                                        onChange={e => setNewId(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">يجب أن يتكون الرقم من 7 أرقام بالضبط.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">نوع الرقم</label>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={idType === 'admin' ? 'default' : 'outline'}
                                        onClick={() => setIdType('admin')}
                                        className="flex-1"
                                    >
                                        <Shield className="w-4 h-4 ml-2" /> إداري
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={idType === 'purchased' ? 'default' : 'outline'}
                                        onClick={() => setIdType('purchased')}
                                        className="flex-1"
                                    >
                                        <CreditCard className="w-4 h-4 ml-2" /> مدفوع
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={idType === 'gifted' ? 'default' : 'outline'}
                                        onClick={() => setIdType('gifted')}
                                        className="flex-1"
                                    >
                                        <Gift className="w-4 h-4 ml-2" /> هدية/جائزة
                                    </Button>
                                </div>
                            </div>

                            {idType === 'purchased' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">السعر (عملات)</label>
                                    <Input
                                        type="number"
                                        placeholder="مثال: 5000"
                                        value={price}
                                        onChange={e => setPrice(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">مدة الصلاحية (بالأيام)</label>
                                <Input
                                    type="number"
                                    placeholder="اتركه فارغاً للصلاحية الدائمة"
                                    value={expiryDays}
                                    onChange={e => setExpiryDays(e.target.value)}
                                />
                            </div>

                            <div className="pt-4">
                                <Button onClick={handleCreateId} disabled={!newId || newId.length !== 7} className="w-full">
                                    <Star className="w-4 h-4 ml-2" />
                                    إنشاء الرقم المميز
                                </Button>
                            </div>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>إدارة الرقم المميز {manageId?.custom_id}</DialogTitle>
                        <DialogDescription>
                            تخصيص الرقم لمستخدم أو إلغاء التخصيص.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">معرف المستخدم الحالي (User ID)</label>
                            <Input
                                value={targetUserId}
                                onChange={(e) => setTargetUserId(e.target.value)}
                                placeholder="أدخل User UUID هنا (مثال: 550e8400...)"
                            />
                            <p className="text-xs text-muted-foreground">
                                أدخل الـ UUID الخاص بالمستخدم لتخصيص الرقم له.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2 sm:justify-start">
                        <Button onClick={handleAssign}>
                            حفظ وتخصيص
                        </Button>
                        <Button variant="destructive" onClick={handleUnassign} disabled={!manageId?.user_id}>
                            إلغاء التخصيص (Unassign)
                        </Button>
                        <Button variant="outline" onClick={() => setIsManageOpen(false)}>
                            إغلاق
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
