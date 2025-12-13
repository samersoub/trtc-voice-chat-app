import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PhoneVerification from "./pages/auth/PhoneVerification";
import ForgotPassword from "./pages/auth/ForgotPassword";
import AdminLogin from "./pages/admin/AdminLogin";
import RoomList from "./pages/voice-chat/RoomList";
import CreateRoom from "./pages/voice-chat/CreateRoom";
import RoomDetails from "./pages/voice-chat/RoomDetails";
import VoiceChatRoomRedesign from "@/components/voice/VoiceChatRoomRedesign";
import PremiumVoiceRoom from "@/components/voice/PremiumVoiceRoom";
import LamaStyleVoiceRoom from "@/components/voice/LamaStyleVoiceRoom";
import RealLamaVoiceRoom from "@/components/voice/RealLamaVoiceRoom";
import AuthenticLamaVoiceRoom from "@/components/voice/AuthenticLamaVoiceRoom";
import Contacts from "./pages/contacts/Contacts";
import InviteFriends from "./pages/contacts/InviteFriends";
import Profile from "./pages/profile/Profile";
import ModernProfile from "./pages/profile/ModernProfile";
import Settings from "./pages/profile/Settings";
import PersonalSettings from "./pages/profile/PersonalSettings";
import AccountSettings from "./pages/profile/AccountSettings";
import Blocklist from "./pages/profile/Blocklist";
import Backpack from "./pages/profile/Backpack";
import SVIP from "./pages/profile/SVIP";
import Aristocracy from "./pages/profile/Aristocracy";
import LoveHouse from "./pages/love-house/LoveHouse";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminRooms from "./pages/admin/Rooms";
import AdminReports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";
import AppSettings from "./pages/admin/AppSettings";
import AdminStatus from "./pages/admin/Status";
import BannersAdmin from "./pages/admin/Banners";
import AgenciesAdmin from "./pages/admin/Agencies";
import GiftsAdmin from "./pages/admin/Gifts";
import CoinsAdmin from "./pages/admin/Coins";
import Wallet from "./pages/finance/Wallet";
import Wealth from "./pages/finance/Wealth";
import HostAgency from "./pages/agency/HostAgency";
import RechargeAgency from "./pages/agency/RechargeAgency";
import Store from "./pages/store/Store";
import Hosts from "./pages/hosts/Hosts";
import Moments from "./pages/Moments";
import Messages from "./pages/Messages";
import Inbox from "./pages/notifications/Inbox";
import { LocaleProvider } from "@/contexts";
import ThemeProvider from "@/contexts/ThemeContext";
import Matching from "./pages/matching/Matching";
import PrivateCall from "./pages/matching/PrivateCall";
import RateMatch from "./pages/matching/RateMatch";
import Earnings from "./pages/finance/Earnings";
import Withdrawal from "./pages/finance/Withdrawal";
import CoinPurchase from "./pages/finance/CoinPurchase";
import MusicLibrary from "./pages/music/MusicLibrary";
import BottomTabController from "@/components/mobile/BottomTabController";
import Home from "./pages/Home";
import GamesPage from "./pages/games/GamesPage";
import LudoGame from "./pages/games/LudoGame";
import UnoGame from "./pages/games/UnoGame";
import Recharge from "./pages/finance/Recharge";
import SuperSupport from "./pages/support/SuperSupport";
import Rankings from "./pages/Rankings";
import DailyMissions from "./pages/profile/DailyMissions";
import FriendRecommendations from "./pages/profile/FriendRecommendations";
import RoomThemes from "./pages/voice-chat/RoomThemes";
import LuckyWheel from "./pages/games/LuckyWheel";
import VoiceEffects from "./pages/voice-chat/VoiceEffects";
import Phase1Analytics from "./pages/admin/Phase1Analytics";
import PremiumSubscription from "./pages/premium/PremiumSubscription";
import FamilyDashboard from "./pages/family/FamilyDashboard";
import ReferralPage from "./pages/referral/ReferralPage";
import LiveStreamPage from "./pages/livestream/LiveStreamPage";
import EventsPage from "./pages/events/EventsPage";
import CreatorDashboard from "./pages/creator/CreatorDashboard";
import DiscoverEnhanced from "./components/discover/DiscoverEnhanced";
import AIMatchingPage from "./pages/matching/AIMatchingPage";
import AdvancedAdminPanel from "./pages/admin/AdvancedAdminPanel";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <LocaleProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="flex items-center justify-center p-6 text-muted-foreground">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/home" element={<Home />} />
              {/* Admin Panel */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              {/* ADDED: Admin Status */}
              <Route path="/admin/status" element={<AdminStatus />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/rooms" element={<AdminRooms />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/agencies" element={<AgenciesAdmin />} />
              <Route path="/admin/banners" element={<BannersAdmin />} />
              <Route path="/admin/settings" element={<AppSettings />} />
              <Route path="/admin/room-settings" element={<AdminSettings />} />
              <Route path="/admin/gifts" element={<GiftsAdmin />} />
              <Route path="/admin/coins" element={<CoinsAdmin />} />
              <Route path="/admin/analytics" element={<Phase1Analytics />} />
              {/* Auth */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/verify" element={<PhoneVerification />} />
              <Route path="/auth/forgot" element={<ForgotPassword />} />
              {/* Voice Chat */}
              <Route path="/voice/rooms" element={<RoomList />} />
              <Route path="/voice/create" element={<CreateRoom />} />
              <Route path="/voice/rooms/:id" element={<RoomDetails />} />
              <Route path="/voice/rooms/:id/join" element={<AuthenticLamaVoiceRoom />} />
              <Route path="/voice/rooms/:id/real" element={<RealLamaVoiceRoom />} />
              <Route path="/voice/rooms/:id/lama" element={<LamaStyleVoiceRoom />} />
              <Route path="/voice/rooms/:id/premium" element={<PremiumVoiceRoom />} />
              <Route path="/voice/rooms/:id/classic" element={<VoiceChatRoomRedesign />} />
              <Route path="/voice/themes" element={<RoomThemes />} />
              <Route path="/voice/effects" element={<VoiceEffects />} />
              {/* Finance & Store */}
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/wealth" element={<Wealth />} />
              <Route path="/store" element={<Store />} />
              <Route path="/recharge" element={<Recharge />} />
              {/* Earnings & Withdrawal */}
              <Route path="/earnings" element={<Earnings />} />
              <Route path="/withdrawal" element={<Withdrawal />} />
              {/* Coin purchase */}
              <Route path="/coins" element={<CoinPurchase />} />
              {/* Music */}
              <Route path="/music" element={<MusicLibrary />} />
              {/* Games */}
              <Route path="/games" element={<GamesPage />} />
              <Route path="/games/ludo" element={<LudoGame />} />
              <Route path="/games/uno" element={<UnoGame />} />
              <Route path="/games/lucky-wheel" element={<LuckyWheel />} />
              {/* Support */}
              <Route path="/support" element={<SuperSupport />} />
              {/* Agency */}
              <Route path="/agency/host" element={<HostAgency />} />
              <Route path="/agency/recharge" element={<RechargeAgency />} />
              {/* Social */}
              <Route path="/moments" element={<Moments />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/hosts" element={<Hosts />} />
              {/* Notifications */}
              <Route path="/inbox" element={<Inbox />} />
              {/* Contacts */}
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/contacts/invite" element={<InviteFriends />} />
              {/* Profile */}
              <Route path="/profile" element={<ModernProfile />} />
              <Route path="/profile/:userId" element={<ModernProfile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/personal" element={<PersonalSettings />} />
              <Route path="/settings/account" element={<AccountSettings />} />
              <Route path="/settings/blocklist" element={<Blocklist />} />
              <Route path="/backpack" element={<Backpack />} />
              <Route path="/svip" element={<SVIP />} />
              <Route path="/aristocracy" element={<Aristocracy />} />
              <Route path="/profile/missions" element={<DailyMissions />} />
              <Route path="/profile/friends/recommendations" element={<FriendRecommendations />} />
              {/* Premium */}
              <Route path="/premium" element={<PremiumSubscription />} />
              {/* Families */}
              <Route path="/family" element={<FamilyDashboard />} />
              <Route path="/family/create" element={<FamilyDashboard />} />
              <Route path="/family/:id" element={<FamilyDashboard />} />
              {/* Referral */}
              <Route path="/referral" element={<ReferralPage />} />
              {/* Live Streaming */}
              <Route path="/stream/:streamId" element={<LiveStreamPage />} />
              <Route path="/stream/create" element={<LiveStreamPage />} />
              {/* Events */}
              <Route path="/events" element={<EventsPage />} />
              <Route path="/event/:eventId" element={<EventsPage />} />
              <Route path="/event/create" element={<EventsPage />} />
              {/* Creator Dashboard */}
              <Route path="/creator/dashboard" element={<CreatorDashboard />} />
              {/* Discover Enhanced */}
              <Route path="/discover/enhanced" element={
                <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 p-6">
                  <div className="max-w-7xl mx-auto">
                    <DiscoverEnhanced />
                  </div>
                </div>
              } />
              {/* AI Matching */}
              <Route path="/matching/ai" element={<AIMatchingPage />} />
              {/* Advanced Admin */}
              <Route path="/admin/advanced" element={<AdvancedAdminPanel />} />
              {/* Love House */}
              <Route path="/love-house" element={<LoveHouse />} />
              {/* Matching */}
              <Route path="/matching" element={<Matching />} />
              <Route path="/matching/call/:id" element={<PrivateCall />} />
              <Route path="/matching/rate/:id" element={<RateMatch />} />
              {/* Rankings */}
              <Route path="/rankings" element={<Rankings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          {/* Global bottom bar controller */}
          <BottomTabController />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </LocaleProvider>
  </ThemeProvider>
);

export default App;