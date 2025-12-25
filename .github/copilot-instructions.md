---
# Copilot AI Agent Instructions for TRTC Voice Chat App

## Project Overview
This is a React 18 + TypeScript voice chat app (Vite) with TRTC SDK-powered rooms, real-time messaging, virtual economy, and admin features. The UI is bilingual (English/Arabic) with RTL support. Supabase is optional—app degrades to demo mode if not configured.

## Architecture & Patterns
- **Supabase Graceful Degradation:** All features must work without Supabase. Check for `isSupabaseReady` before DB operations.
- **DELETE-then-INSERT Pattern:** For tables with unique constraints (e.g., `voice_room_seats`), always DELETE before INSERT. Never use upsert for seat allocation.
- **TRTC UserSig:** Fetched from `https://trtc-sig-service.vercel.app/api/generate-sig` (see `src/config/trtcConfig.ts`). App fails silently if unreachable—check console for `TRTC: Join flow start`.
- **Max 8 Mic Seats:** Enforced in `MicService` and UI. Prevent "ghost mic" (mic on without seat) via `useMicControl`.
- **Feature Flags:** Controlled in `src/config/dyad.ts` (voice_chat, gift_system, virtual_economy, live_matching, monetization).
- **State:** React Query for data fetching; localStorage keys: `auth:user`, `app:locale`, `trtcAnonId`.

## Key Workflows
- **Dev Server:** `pnpm dev` (localhost:8080)
- **Build:** `pnpm build` (prod), `pnpm build:dev` (unminified)
- **Lint:** `pnpm lint` (includes react-hooks/exhaustive-deps)
- **Preview:** `pnpm preview`
- **No unit tests:** Rely on TypeScript, ESLint, and manual testing.

## Project Conventions
- **UI:** Only use Tailwind. Do not edit `src/components/ui/*` (shadcn/ui); wrap in new components.
- **Routing:** All routes in `src/App.tsx`. Pages in `src/pages/`.
- **i18n:** Use `useLocale()` from `src/contexts/locale.tsx`. Add new keys directly to the dict.
- **Data Fetching:** Use React Query (`useQuery`).
- **Toast Notifications:** Use `showSuccess()`/`showError()` from `src/utils/toast.ts`.
- **Component Domains:** Organize by feature in `src/components/{admin,chat,voice,...}/`.

## Integration Points
- **TRTC:** All voice chat flows use `useTrtc` and `useMicControl` hooks. See `src/hooks/useTrtc.ts` and `src/components/voice/AuthenticLamaVoiceRoom.tsx`.
- **Supabase:** Client in `src/services/db/supabaseClient.ts`. Optional; check `isSupabaseReady`.
- **Economy/Gifts:** `GiftService`, `EconomyService`, `CoinPackageService` in `src/services/`.
- **Admin/Moderation:** `ReportService`, `BannerService`, `GiftAdminService`, `ActivityLogService`, `AnalyticsService`.

## Debugging & Troubleshooting
- **TRTC:** All events logged with `TRTC:` prefix. Common issues: UserSig fetch failure, silent join, ghost mic (see console logs).
- **Supabase:** Duplicate key errors—use DELETE-then-INSERT. See `supabase/fix_voice_rooms.sql` for cleanup.
- **Mobile/Responsive:** Use `useIsMobile` and `useBottomBarVisibility` hooks. Test with browser DevTools.

## Key Files & References
- Routing: `src/App.tsx`
- Voice chat: `src/hooks/useTrtc.ts`, `src/components/voice/AuthenticLamaVoiceRoom.tsx`
- TRTC config: `src/config/trtcConfig.ts`, `src/utils/trtcAuth.ts`
- Auth: `src/services/AuthService.ts`, `src/pages/auth/Login.tsx`
- Economy: `src/services/GiftService.ts`, `src/services/EconomyService.ts`
- i18n: `src/contexts/locale.tsx`
- Styling: `tailwind.config.ts`, `src/globals.css`
- DB: `supabase/schema.sql`, `supabase/fix_voice_rooms.sql`

## Critical Constraints
- Do NOT edit `src/components/ui/*` (shadcn/ui primitives)
- Max 8 mic seats per room (enforced in code and UI)
- Supabase is optional—always check for DB readiness
- TRTC UserSig endpoint must be reachable for voice chat
- Vite manual chunks in `vite.config.ts`—do not modify without reason

---