import React, { useState, useEffect } from 'react';
import { useLocale } from '@/contexts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminPanelService from '@/services/AdminPanelService';
import type {
  AdminDashboardStats,
  ReportDetails,
  BanDetails,
  FinancialTransaction,
  SystemSetting,
  AdminActivity,
  SystemAlert,
} from '@/models/AdminPanel';
import {
  Shield,
  Users,
  DollarSign,
  Activity,
  AlertTriangle,
  Settings,
  FileText,
  TrendingUp,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Video,
  Calendar,
  Home,
  ShoppingBag,
} from 'lucide-react';

import StoreManagement from '@/components/admin/StoreManagement';

export default function AdvancedAdminPanel() {
  const { t, dir } = useLocale();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [reports, setReports] = useState<ReportDetails[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Read tab from URL or default to 'overview'
  const searchParams = new URLSearchParams(window.location.search);
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const dashboardStats = AdminPanelService.getDashboardStats();
      setStats(dashboardStats);

      const allReports = AdminPanelService.getAllReports();
      setReports(allReports);

      const allTransactions = AdminPanelService.getFinancialTransactions(50);
      setTransactions(allTransactions);

      const systemSettings = AdminPanelService.getSystemSettings();
      setSettings(systemSettings);

      const activityLog = AdminPanelService.getAdminActivityLog(50);
      setActivities(activityLog);

      const systemAlerts = AdminPanelService.getSystemAlerts();
      setAlerts(systemAlerts);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = (userId: string, reason: string) => {
    const success = AdminPanelService.performUserAction({
      action: 'ban',
      userId,
      reason,
      duration: 24 * 7, // 7 days
      performedBy: 'current_admin',
      timestamp: Date.now(),
    });

    if (success) {
      alert(dir === 'rtl' ? 'تم حظر المستخدم بنجاح' : 'User banned successfully');
      loadDashboardData();
    }
  };

  const handleResolveReport = (reportId: string) => {
    const resolution = prompt(dir === 'rtl' ? 'قرار الحل:' : 'Resolution:');
    if (resolution) {
      const success = AdminPanelService.resolveReport(reportId, resolution);
      if (success) {
        alert(dir === 'rtl' ? 'تم حل البلاغ' : 'Report resolved');
        loadDashboardData();
      }
    }
  };

  const handleUpdateSetting = (key: string, value: number | string | boolean) => {
    const success = AdminPanelService.updateSystemSetting(key, value);
    if (success) {
      loadDashboardData();
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    const success = AdminPanelService.acknowledgeAlert(alertId);
    if (success) {
      loadDashboardData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Activity className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-red-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
              {dir === 'rtl' ? 'لوحة الإدارة المتقدمة' : 'Advanced Admin Panel'}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {dir === 'rtl'
              ? 'إدارة شاملة للمستخدمين والمحتوى والنظام'
              : 'Comprehensive management of users, content, and system'}
          </p>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{dir === 'rtl' ? 'إجمالي المستخدمين' : 'Total Users'}</p>
                  <p className="text-3xl font-bold">{stats.users.total.toLocaleString()}</p>
                  <p className="text-xs opacity-75">{stats.users.online} {dir === 'rtl' ? 'متصل' : 'online'}</p>
                </div>
                <Users className="w-12 h-12 opacity-50" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{dir === 'rtl' ? 'الإيرادات (الشهر)' : 'Revenue (Month)'}</p>
                  <p className="text-3xl font-bold">${stats.financial.revenue.month.toLocaleString()}</p>
                  <p className="text-xs opacity-75">
                    ${stats.financial.revenue.today.toLocaleString()} {dir === 'rtl' ? 'اليوم' : 'today'}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 opacity-50" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{dir === 'rtl' ? 'البلاغات المعلقة' : 'Pending Reports'}</p>
                  <p className="text-3xl font-bold">{stats.moderation.pendingReports}</p>
                  <p className="text-xs opacity-75">
                    {stats.moderation.resolvedReports} {dir === 'rtl' ? 'محلول' : 'resolved'}
                  </p>
                </div>
                <AlertTriangle className="w-12 h-12 opacity-50" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{dir === 'rtl' ? 'نسبة الاستبقاء' : 'Retention Rate'}</p>
                  <p className="text-3xl font-bold">{stats.engagement.retentionRate}%</p>
                  <p className="text-xs opacity-75">
                    {stats.engagement.dailyActiveUsers.toLocaleString()} {dir === 'rtl' ? 'نشط يومياً' : 'DAU'}
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 opacity-50" />
              </div>
            </Card>
          </div>
        )}

        {/* Unacknowledged Alerts */}
        {alerts.filter(a => !a.acknowledged).length > 0 && (
          <Card className="p-4 mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-red-700 dark:text-red-400 mb-2">
                  {dir === 'rtl' ? 'تنبيهات النظام' : 'System Alerts'}
                </h3>
                {alerts.filter(a => !a.acknowledged).slice(0, 3).map(alert => (
                  <div key={alert.id} className="flex items-center justify-between py-2 border-b border-red-200 dark:border-red-800 last:border-0">
                    <div>
                      <p className="font-semibold text-sm">{alert.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{alert.message}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                    >
                      {dir === 'rtl' ? 'تأكيد' : 'Acknowledge'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="overview">
              <Home className="w-4 h-4 mr-2" />
              {dir === 'rtl' ? 'نظرة عامة' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="store">
              <ShoppingBag className="w-4 h-4 mr-2" />
              {dir === 'rtl' ? 'المتجر' : 'Store'}
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              {dir === 'rtl' ? 'المستخدمون' : 'Users'}
            </TabsTrigger>
            <TabsTrigger value="reports">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {dir === 'rtl' ? 'البلاغات' : 'Reports'} ({reports.filter(r => r.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="financial">
              <DollarSign className="w-4 h-4 mr-2" />
              {dir === 'rtl' ? 'المالية' : 'Financial'}
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              {dir === 'rtl' ? 'الإعدادات' : 'Settings'}
            </TabsTrigger>
          </TabsList>

          {/* Store Tab */}
          <TabsContent value="store">
            <StoreManagement />
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Content Stats */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    {dir === 'rtl' ? 'إحصائيات المحتوى' : 'Content Statistics'}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        {dir === 'rtl' ? 'غرف الصوت' : 'Voice Rooms'}
                      </span>
                      <Badge>{stats.content.rooms} ({stats.content.activeRooms} active)</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        {dir === 'rtl' ? 'البث المباشر' : 'Live Streams'}
                      </span>
                      <Badge>{stats.content.streams}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        {dir === 'rtl' ? 'الفعاليات' : 'Events'}
                      </span>
                      <Badge>{stats.content.events}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        {dir === 'rtl' ? 'العائلات' : 'Families'}
                      </span>
                      <Badge>{stats.content.families}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        {dir === 'rtl' ? 'الرسائل (24 ساعة)' : 'Messages (24h)'}
                      </span>
                      <Badge className="bg-green-100 text-green-700">{stats.content.messages.toLocaleString()}</Badge>
                    </div>
                  </div>
                </Card>

                {/* User Stats */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {dir === 'rtl' ? 'إحصائيات المستخدمين' : 'User Statistics'}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        {dir === 'rtl' ? 'مستخدمون نشطون (24 ساعة)' : 'Active (24h)'}
                      </span>
                      <Badge className="bg-blue-100 text-blue-700">{stats.users.active.toLocaleString()}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        {dir === 'rtl' ? 'مستخدمون جدد (7 أيام)' : 'New (7 days)'}
                      </span>
                      <Badge className="bg-green-100 text-green-700">{stats.users.new.toLocaleString()}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        {dir === 'rtl' ? 'مستخدمون مميزون' : 'Premium Users'}
                      </span>
                      <Badge className="bg-yellow-100 text-yellow-700">{stats.users.premium.toLocaleString()}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        {dir === 'rtl' ? 'محظورون' : 'Banned'}
                      </span>
                      <Badge className="bg-red-100 text-red-700">{stats.users.banned}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        {dir === 'rtl' ? 'معدل النمو' : 'Growth Rate'}
                      </span>
                      <Badge className="bg-purple-100 text-purple-700">+{stats.users.growthRate}%</Badge>
                    </div>
                  </div>
                </Card>

                {/* System Stats */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    {dir === 'rtl' ? 'حالة النظام' : 'System Status'}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        {dir === 'rtl' ? 'وقت التشغيل' : 'Uptime'}
                      </span>
                      <Badge className="bg-green-100 text-green-700">
                        {Math.floor(stats.system.uptime / 86400)} {dir === 'rtl' ? 'يوم' : 'days'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        {dir === 'rtl' ? 'متوسط الاستجابة' : 'Avg Response'}
                      </span>
                      <Badge>{stats.system.averageResponseTime}ms</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        {dir === 'rtl' ? 'معدل الأخطاء' : 'Error Rate'}
                      </span>
                      <Badge className={stats.system.errorRate < 1 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                        {stats.system.errorRate}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        {dir === 'rtl' ? 'اتصالات نشطة' : 'Active Connections'}
                      </span>
                      <Badge className="bg-blue-100 text-blue-700">{stats.system.activeConnections}</Badge>
                    </div>
                  </div>
                </Card>

                {/* Recent Activity */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {dir === 'rtl' ? 'آخر الأنشطة' : 'Recent Activities'}
                  </h3>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {activities.slice(0, 10).map(activity => (
                        <div key={activity.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-sm font-semibold">{activity.adminUsername}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{activity.details}</p>
                          <Badge variant="secondary" className="text-xs mt-1">{activity.category}</Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">{dir === 'rtl' ? 'إدارة المستخدمين' : 'User Management'}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {dir === 'rtl'
                  ? 'عرض وإدارة جميع المستخدمين في النظام'
                  : 'View and manage all users in the system'}
              </p>

              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{dir === 'rtl' ? 'إجمالي المستخدمين' : 'Total Users'}</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.users.total.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{dir === 'rtl' ? 'نشط (24 ساعة)' : 'Active (24h)'}</p>
                    <p className="text-2xl font-bold text-green-600">{stats.users.active.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{dir === 'rtl' ? 'مميز' : 'Premium'}</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.users.premium.toLocaleString()}</p>
                  </div>
                </div>
              )}

              <Button className="w-full md:w-auto">
                <Users className="w-4 h-4 mr-2" />
                {dir === 'rtl' ? 'عرض جميع المستخدمين' : 'View All Users'}
              </Button>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">{dir === 'rtl' ? 'البلاغات المعلقة' : 'Pending Reports'}</h3>

              <ScrollArea className="h-[600px]">
                {reports.filter(r => r.status === 'pending').length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {dir === 'rtl' ? 'لا توجد بلاغات معلقة' : 'No pending reports'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.filter(r => r.status === 'pending').map(report => (
                      <div key={report.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <Badge className={
                              report.priority === 'critical' ? 'bg-red-500' :
                                report.priority === 'high' ? 'bg-orange-500' :
                                  report.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                            }>
                              {report.priority}
                            </Badge>
                            <Badge variant="outline" className="ml-2">{report.category}</Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="font-semibold mb-1">{report.targetName}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{report.reason}</p>
                        <p className="text-sm text-gray-500 mb-3">{report.description}</p>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleResolveReport(report.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {dir === 'rtl' ? 'حل' : 'Resolve'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBanUser(report.targetId, report.reason)}
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            {dir === 'rtl' ? 'حظر' : 'Ban'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {stats && (
                <>
                  <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <p className="text-sm opacity-90">{dir === 'rtl' ? 'إيرادات اليوم' : "Today's Revenue"}</p>
                    <p className="text-3xl font-bold">${stats.financial.revenue.today.toLocaleString()}</p>
                  </Card>
                  <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <p className="text-sm opacity-90">{dir === 'rtl' ? 'إيرادات الأسبوع' : "Week's Revenue"}</p>
                    <p className="text-3xl font-bold">${stats.financial.revenue.week.toLocaleString()}</p>
                  </Card>
                  <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <p className="text-sm opacity-90">{dir === 'rtl' ? 'إيرادات الشهر' : "Month's Revenue"}</p>
                    <p className="text-3xl font-bold">${stats.financial.revenue.month.toLocaleString()}</p>
                  </Card>
                </>
              )}
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">{dir === 'rtl' ? 'آخر المعاملات' : 'Recent Transactions'}</h3>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {transactions.slice(0, 20).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{tx.username}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{tx.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${tx.amount}</p>
                        <Badge className={
                          tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                            tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                        }>
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">{dir === 'rtl' ? 'إعدادات النظام' : 'System Settings'}</h3>

              <div className="space-y-6">
                {['general', 'features', 'limits'].map(category => {
                  const categorySettings = settings.filter(s => s.category === category);
                  if (categorySettings.length === 0) return null;

                  return (
                    <div key={category}>
                      <h4 className="font-semibold mb-3 capitalize">{category}</h4>
                      <div className="space-y-3">
                        {categorySettings.map(setting => (
                          <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex-1">
                              <p className="font-semibold">{setting.label}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{setting.description}</p>
                            </div>
                            <div>
                              {setting.type === 'boolean' ? (
                                <Button
                                  size="sm"
                                  variant={setting.value ? 'default' : 'outline'}
                                  onClick={() => handleUpdateSetting(setting.key, !setting.value)}
                                >
                                  {setting.value ? (dir === 'rtl' ? 'مفعل' : 'Enabled') : (dir === 'rtl' ? 'معطل' : 'Disabled')}
                                </Button>
                              ) : (
                                <span className="text-sm font-mono bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded">
                                  {setting.value}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div >
  );
}
