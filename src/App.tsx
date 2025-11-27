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
import VoiceChat from "./pages/voice-chat/VoiceChat";
import RoomDetails from "./pages/voice-chat/RoomDetails";
import Contacts from "./pages/contacts/Contacts";
import InviteFriends from "./pages/contacts/InviteFriends";
import Profile from "./pages/profile/Profile";
import Settings from "./pages/profile/Settings";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminRooms from "./pages/admin/Rooms";
import AdminReports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";
import AdminStatus from "./pages/admin/Status";
import BannersAdmin from "./pages/admin/Banners";
import AgenciesAdmin from "./pages/admin/Agencies";
import GiftsAdmin from "./pages/admin/Gifts";
import CoinsAdmin from "./pages/admin/Coins";
import Wallet from "./pages/finance/Wallet";
import HostAgency from "./pages/agency/HostAgency";
import RechargeAgency from "./pages/agency/RechargeAgency";
import Store from "./pages/store/Store";
import Hosts from "./pages/hosts/Hosts";
import Moments from "./pages/Moments";
import Messages from "./pages/Messages";
import Inbox from "./pages/notifications/Inbox";
import { LocaleProvider } from "@/contexts";
import Matching from "./pages/matching/Matching";
import PrivateCall from "./pages/matching/PrivateCall";
import RateMatch from "./pages/matching/RateMatch";
import Earnings from "./pages/finance/Earnings";
import Withdrawal from "./pages/finance/Withdrawal";
import CoinPurchase from "./pages/finance/CoinPurchase";
import MusicLibrary from "./pages/music/MusicLibrary";

const queryClient = new QueryClient();

const App = () => (
  <LocaleProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="flex items-center justify-center p-6 text-muted-foreground">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
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
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/gifts" element={<GiftsAdmin />} />
              <Route path="/admin/coins" element={<CoinsAdmin />} />
              {/* Auth */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/verify" element={<PhoneVerification />} />
              <Route path="/auth/forgot" element={<ForgotPassword />} />
              {/* Voice Chat */}
              <Route path="/voice/rooms" element={<RoomList />} />
              <Route path="/voice/create" element={<CreateRoom />} />
              <Route path="/voice/rooms/:id" element={<RoomDetails />} />
              <Route path="/voice/rooms/:id/join" element={<VoiceChat />} />
              {/* Finance & Store */}
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/store" element={<Store />} />
              {/* Earnings & Withdrawal */}
              <Route path="/earnings" element={<Earnings />} />
              <Route path="/withdrawal" element={<Withdrawal />} />
              {/* Coin purchase */}
              <Route path="/coins" element={<CoinPurchase />} />
              {/* Music */}
              <Route path="/music" element={<MusicLibrary />} />
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
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              {/* Matching */}
              <Route path="/matching" element={<Matching />} />
              <Route path="/matching/call/:id" element={<PrivateCall />} />
              <Route path="/matching/rate/:id" element={<RateMatch />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </LocaleProvider>
);

export default App;