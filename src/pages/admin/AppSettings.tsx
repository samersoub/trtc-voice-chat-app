"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AppSettingsService, type AppSettings } from "@/services/AppSettingsService";
import { showSuccess, showError } from "@/utils/toast";
import { Separator } from "@/components/ui/separator";

const AppSettings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await AppSettingsService.getSettings();
      setSettings(data);
    } catch (e) {
      showError(e instanceof Error ? e.message : "فشل تحميل الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const updated = await AppSettingsService.updateSettings(settings, "admin");
      setSettings(updated);
      showSuccess("✅ تم حفظ الإعدادات بنجاح");
    } catch (e) {
      showError(e instanceof Error ? e.message : "فشل حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("هل أنت متأكد من إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟")) return;
    
    setSaving(true);
    try {
      const defaults = await AppSettingsService.resetToDefaults();
      setSettings(defaults);
      showSuccess("✅ تم إعادة التعيين إلى الإعدادات الافتراضية");
    } catch (e) {
      showError(e instanceof Error ? e.message : "فشل إعادة التعيين");
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof AppSettings>(field: K, value: AppSettings[K]) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  if (loading || !settings) {
    return (
      <AdminLayout title="إعدادات التطبيق">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">جاري التحميل...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="إعدادات التطبيق">
      <div className="space-y-4">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">الإعدادات العامة</h2>
            <p className="text-sm text-muted-foreground">إدارة جميع إعدادات وميزات التطبيق</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} disabled={saving}>
              🔄 إعادة التعيين
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "جاري الحفظ..." : "💾 حفظ التغييرات"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="general">عام</TabsTrigger>
            <TabsTrigger value="features">الميزات</TabsTrigger>
            <TabsTrigger value="limits">الحدود</TabsTrigger>
            <TabsTrigger value="economy">الاقتصاد</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
            <TabsTrigger value="advanced">متقدم</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>معلومات التطبيق</CardTitle>
                <CardDescription>البيانات الأساسية للتطبيق</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>اسم التطبيق</Label>
                    <Input
                      value={settings.app_name}
                      onChange={(e) => updateField("app_name", e.target.value)}
                      placeholder="اسم التطبيق"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رابط الشعار</Label>
                    <Input
                      value={settings.app_logo_url || ""}
                      onChange={(e) => updateField("app_logo_url", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>بريد الدعم</Label>
                    <Input
                      type="email"
                      value={settings.support_email}
                      onChange={(e) => updateField("support_email", e.target.value)}
                      placeholder="support@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>هاتف الدعم</Label>
                    <Input
                      value={settings.support_phone || ""}
                      onChange={(e) => updateField("support_phone", e.target.value)}
                      placeholder="+966 50 000 0000"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>روابط التواصل الاجتماعي</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Facebook</Label>
                      <Input
                        value={settings.facebook_url || ""}
                        onChange={(e) => updateField("facebook_url", e.target.value)}
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Twitter</Label>
                      <Input
                        value={settings.twitter_url || ""}
                        onChange={(e) => updateField("twitter_url", e.target.value)}
                        placeholder="https://twitter.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Instagram</Label>
                      <Input
                        value={settings.instagram_url || ""}
                        onChange={(e) => updateField("instagram_url", e.target.value)}
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">YouTube</Label>
                      <Input
                        value={settings.youtube_url || ""}
                        onChange={(e) => updateField("youtube_url", e.target.value)}
                        placeholder="https://youtube.com/..."
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>رابط الشروط والأحكام</Label>
                    <Input
                      value={settings.terms_url || ""}
                      onChange={(e) => updateField("terms_url", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رابط سياسة الخصوصية</Label>
                    <Input
                      value={settings.privacy_url || ""}
                      onChange={(e) => updateField("privacy_url", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Settings */}
          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>تفعيل/إيقاف الميزات</CardTitle>
                <CardDescription>التحكم في الميزات المتاحة للمستخدمين</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {[
                    { key: "enable_voice_chat", label: "🎙️ غرف الصوت", desc: "السماح بإنشاء واستخدام غرف الصوت" },
                    { key: "enable_gifts", label: "🎁 نظام الهدايا", desc: "السماح بإرسال واستقبال الهدايا" },
                    { key: "enable_matching", label: "💕 نظام المطابقة", desc: "السماح بالمطابقة الذكية بين المستخدمين" },
                    { key: "enable_music_rooms", label: "🎵 غرف الموسيقى", desc: "السماح بغرف الموسيقى والبث" },
                    { key: "enable_agencies", label: "🏢 نظام الوكالات", desc: "السماح بنظام الوكالات والمضيفين" },
                    { key: "enable_store", label: "🛍️ المتجر", desc: "السماح بشراء العملات والباقات" },
                    { key: "enable_games", label: "🎮 الألعاب", desc: "السماح بالألعاب التفاعلية" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label className="text-base font-medium">{label}</Label>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </div>
                      <Switch
                        checked={settings[key as keyof AppSettings] as boolean}
                        onCheckedChange={(checked) => updateField(key as keyof AppSettings, checked)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Limits Settings */}
          <TabsContent value="limits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>الحدود والقيود</CardTitle>
                <CardDescription>تحديد الحدود القصوى للاستخدام</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>الحد الأدنى للعمر</Label>
                    <Input
                      type="number"
                      value={settings.min_age}
                      onChange={(e) => updateField("min_age", Number(e.target.value))}
                      min={13}
                      max={21}
                    />
                    <p className="text-xs text-muted-foreground">العمر المطلوب للتسجيل</p>
                  </div>
                  <div className="space-y-2">
                    <Label>طول اسم المستخدم (حد أقصى)</Label>
                    <Input
                      type="number"
                      value={settings.max_username_length}
                      onChange={(e) => updateField("max_username_length", Number(e.target.value))}
                      min={5}
                      max={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>طول النبذة (حد أقصى)</Label>
                    <Input
                      type="number"
                      value={settings.max_bio_length}
                      onChange={(e) => updateField("max_bio_length", Number(e.target.value))}
                      min={100}
                      max={1000}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>سعة الغرفة (حد أقصى)</Label>
                    <Input
                      type="number"
                      value={settings.max_room_capacity}
                      onChange={(e) => updateField("max_room_capacity", Number(e.target.value))}
                      min={10}
                      max={1000}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>هدايا يومية لكل مستخدم (حد أقصى)</Label>
                    <Input
                      type="number"
                      value={settings.max_daily_gifts_per_user}
                      onChange={(e) => updateField("max_daily_gifts_per_user", Number(e.target.value))}
                      min={10}
                      max={500}
                    />
                    <p className="text-xs text-muted-foreground">لمنع الإساءة</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Economy Settings */}
          <TabsContent value="economy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>الاقتصاد والعملات</CardTitle>
                <CardDescription>إعدادات النظام الاقتصادي</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>عملات التسجيل الافتراضية</Label>
                    <Input
                      type="number"
                      value={settings.default_signup_coins}
                      onChange={(e) => updateField("default_signup_coins", Number(e.target.value))}
                      min={0}
                      max={10000}
                    />
                    <p className="text-xs text-muted-foreground">المبلغ المجاني عند التسجيل</p>
                  </div>
                  <div className="space-y-2">
                    <Label>ماسات التسجيل الافتراضية</Label>
                    <Input
                      type="number"
                      value={settings.default_signup_diamonds}
                      onChange={(e) => updateField("default_signup_diamonds", Number(e.target.value))}
                      min={0}
                      max={1000}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>نسبة تحويل العملات إلى الماسات</Label>
                    <Input
                      type="number"
                      value={settings.coin_to_diamond_ratio}
                      onChange={(e) => updateField("coin_to_diamond_ratio", Number(e.target.value))}
                      min={1}
                      max={1000}
                    />
                    <p className="text-xs text-muted-foreground">كم عملة = 1 ماسة</p>
                  </div>
                  <div className="space-y-2">
                    <Label>عمولة المنصة على الهدايا (%)</Label>
                    <Input
                      type="number"
                      value={settings.gift_commission_percentage}
                      onChange={(e) => updateField("gift_commission_percentage", Number(e.target.value))}
                      min={0}
                      max={50}
                    />
                    <p className="text-xs text-muted-foreground">النسبة التي تأخذها المنصة</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>الأمان والتحقق</CardTitle>
                <CardDescription>إعدادات الأمان والمصادقة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label>طلب التحقق من الهاتف</Label>
                      <p className="text-sm text-muted-foreground">يجب على المستخدمين التحقق من رقم الهاتف</p>
                    </div>
                    <Switch
                      checked={settings.require_phone_verification}
                      onCheckedChange={(checked) => updateField("require_phone_verification", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label>طلب التحقق من البريد الإلكتروني</Label>
                      <p className="text-sm text-muted-foreground">يجب على المستخدمين التحقق من البريد</p>
                    </div>
                    <Switch
                      checked={settings.require_email_verification}
                      onCheckedChange={(checked) => updateField("require_email_verification", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label>المصادقة الثنائية</Label>
                      <p className="text-sm text-muted-foreground">السماح بتفعيل المصادقة الثنائية</p>
                    </div>
                    <Switch
                      checked={settings.enable_two_factor_auth}
                      onCheckedChange={(checked) => updateField("enable_two_factor_auth", checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>الحد الأدنى لطول كلمة المرور</Label>
                    <Input
                      type="number"
                      value={settings.min_password_length}
                      onChange={(e) => updateField("min_password_length", Number(e.target.value))}
                      min={6}
                      max={20}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>عدد التقارير للحظر التلقائي</Label>
                    <Input
                      type="number"
                      value={settings.auto_ban_threshold}
                      onChange={(e) => updateField("auto_ban_threshold", Number(e.target.value))}
                      min={3}
                      max={20}
                    />
                    <p className="text-xs text-muted-foreground">عدد التقارير التي تؤدي للحظر التلقائي</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label>تفعيل فلتر الكلمات البذيئة</Label>
                      <p className="text-sm text-muted-foreground">منع الكلمات غير اللائقة تلقائيًا</p>
                    </div>
                    <Switch
                      checked={settings.profanity_filter_enabled}
                      onCheckedChange={(checked) => updateField("profanity_filter_enabled", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label>طلب صورة الملف الشخصي</Label>
                      <p className="text-sm text-muted-foreground">يجب على المستخدمين رفع صورة</p>
                    </div>
                    <Switch
                      checked={settings.require_profile_image}
                      onCheckedChange={(checked) => updateField("require_profile_image", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>الإشعارات والتحليلات</CardTitle>
                <CardDescription>إعدادات متقدمة للنظام</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">الإشعارات</Label>
                  {[
                    { key: "enable_push_notifications", label: "إشعارات الدفع (Push)", desc: "إشعارات التطبيق الفورية" },
                    { key: "enable_email_notifications", label: "إشعارات البريد الإلكتروني", desc: "إرسال إشعارات عبر البريد" },
                    { key: "enable_sms_notifications", label: "إشعارات الرسائل النصية", desc: "إرسال إشعارات عبر SMS" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label>{label}</Label>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </div>
                      <Switch
                        checked={settings[key as keyof AppSettings] as boolean}
                        onCheckedChange={(checked) => updateField(key as keyof AppSettings, checked)}
                      />
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-semibold">التحليلات</Label>
                  {[
                    { key: "track_user_activity", label: "تتبع نشاط المستخدم", desc: "تسجيل تفاعلات المستخدمين" },
                    { key: "track_gift_analytics", label: "تحليلات الهدايا", desc: "تتبع إحصائيات الهدايا" },
                    { key: "track_room_analytics", label: "تحليلات الغرف", desc: "تتبع استخدام الغرف" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label>{label}</Label>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </div>
                      <Switch
                        checked={settings[key as keyof AppSettings] as boolean}
                        onCheckedChange={(checked) => updateField(key as keyof AppSettings, checked)}
                      />
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-semibold text-destructive">وضع الصيانة</Label>
                  <div className="flex items-center justify-between p-4 border border-destructive rounded-lg bg-destructive/5">
                    <div className="space-y-1">
                      <Label>⚠️ تفعيل وضع الصيانة</Label>
                      <p className="text-sm text-muted-foreground">منع المستخدمين من الدخول للتطبيق</p>
                    </div>
                    <Switch
                      checked={settings.maintenance_mode}
                      onCheckedChange={(checked) => updateField("maintenance_mode", checked)}
                    />
                  </div>
                  {settings.maintenance_mode && (
                    <div className="space-y-2">
                      <Label>رسالة الصيانة</Label>
                      <Textarea
                        value={settings.maintenance_message || ""}
                        onChange={(e) => updateField("maintenance_message", e.target.value)}
                        placeholder="نحن نعمل على تحسين التطبيق. سنعود قريبًا!"
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {settings.updated_at && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-xs text-muted-foreground">
                    آخر تحديث: {new Date(settings.updated_at).toLocaleString("ar-EG")}
                    {settings.updated_by && ` بواسطة: ${settings.updated_by}`}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Bottom Save Button */}
        <div className="sticky bottom-4 bg-background/95 backdrop-blur-sm p-4 border rounded-lg shadow-lg">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              قم بحفظ التغييرات لتطبيق الإعدادات الجديدة
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} disabled={saving}>
                إعادة التعيين
              </Button>
              <Button onClick={handleSave} disabled={saving} size="lg">
                {saving ? "⏳ جاري الحفظ..." : "💾 حفظ جميع التغييرات"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AppSettings;
