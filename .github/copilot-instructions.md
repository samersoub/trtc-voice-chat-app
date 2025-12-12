# Copilot Instructions for TRTC Voice Chat App

## Overview
React 18 + TypeScript voice chat application built with Vite. Features TRTC SDK-powered voice rooms, real-time messaging, gift economy, and admin management. Bilingual UI (English/Arabic) with RTL support.

## Tech Stack & Key Dependencies
- **Framework**: React 18 + TypeScript + React Router v6
- **UI**: shadcn/ui (Radix UI) + Tailwind CSS (dark mode via `[class="dark"]`)
- **Real-time**: TRTC JS SDK + Supabase Realtime
- **Backend**: Supabase (PostgreSQL + Auth) — **optional** (app degrades to demo mode)
- **State**: React Query (TanStack Query)
- **Build**: Vite with manual chunks (react, router, trtc, supabase, ui, utils)

## Critical Architecture Patterns

### Supabase "Graceful Degradation" Pattern
**This is the most important architectural decision.** The app works WITHOUT Supabase configured.

### Critical Data Consistency Pattern: DELETE-then-INSERT
**Problem:** Supabase `upsert()` fails on unique constraints (`voice_room_seats` has UNIQUE on `room_id, seat_number`).

**Solution:** Always DELETE before INSERT when seat data may conflict:
```typescript
// ✅ Correct** (max 8 speakers/room)
- `useTrtc()` hook — TRTC client lifecycle; join/leave rooms, remote stream state
- `MicService` — Seat allocation; tracks speaking state per room
- `useMicControl()` — Mic toggle with "ghost mic" detection (no mic if unseated)
- `WebRTCService` — WebRTC stream capture (mic/camera)
- **TRTC UserSig** fetched from `https://trtc-sig-service.vercel.app/api/generate-sig` (see `trtcConfig.ts`)
  - Critical: App fails silently if endpoint unreachable — always check console for `TRTC: Join flow start`
// 2. Insert new seat data
coEconomy**
- `GiftService` — Gift catalog (Rose, Luxury Car, Golden Dragon); Lottie animations in `public/lottie/`
- `EconomyService` — Transaction ledger (coins/diamonds)
- `CoinPackageService` — Coin purchase packages

**Admin/Moderation**
- `ReportService`, `BannerService`, `GiftAdminService`
- `ActivityLogService` — Event logging (logins, room joins, gifts)
- `AnalyticsService` — Engagement metrics

**Utilities**
- `toast.ts` — `showSuccess()`, `showError()` (Sonner + Radix Toast)
- `AudioManager` — Web Audio API wrapper
- `trtcAuth.ts` — UserSig fetching with retry logic

### localStorage Keys (Persistence Strategy)
- `auth:user` — Current user object (survives page reload)
- `app:locale` — Language preference (en/ar)
- `trtcAnonId` — Anonymous TRTC ID if unauthenticated

### Feature Flags
`src/config/dyad.ts` — Toggles for voice_chat, gift_system, virtual_economy, live_matching, monetization
**Authentication & Profile**
- `AuthService` — User registration, login, token management; stores user in localStorage (key: `auth:user`)
- `ProfileService` — Profile CRUD, avatar handling; manages user metadata in Supabase
- Rate limiting built into AuthService for brute-force protection

**Voice Chat Core**
- `useTrtc` hook (not a service) — TRTC client initialization, joining rooms, remote stream management
- `MicService` — Per-room mic seat allocation (max 8 speakers); tracks who's speaking
- `useMicControl` hook — Mic toggle with "ghost mic" detection (prevents mic on if not seated)
- `WebRTCService` — Lower-level WebRTC stream handling (mic/camera capture)
- `VoiceChatService` — Room state syncing, participant lists
- TRTC UserSig fetched from `https://trtc-sig-service.vercel.app/api/generate-sig` (configured in `src/config/trtcConfig.ts`)

**Rooms & Matching**
- `roomService` — Seed data for demo rooms (images, host info, listeners)
- `SmartMatchingService` — AI-based matching algorithm (factors in profile, preferences)
- Room settings stored in Supabase; WebRTC handshake via TRTC cloud

**Economy & Gifts**

### Component Organization
- `src/components/ui/` — **shadcn/ui primitives (DO NOT EDIT)** — wrap in new components instead
- `src/components/{admin,chat,voice,music,profile,trtc,mobile,moderation,gifts,discover}/` — feature domains
- Key voice component: `AuthenticLamaVoiceRoom.tsx` — implements DELETE-INSERT pattern

### Pages & Routing
All routes defined in `src/App.tsx`. Pages in `src/pages/`:
- Auth: `auth/Login`, `auth/Register`, `auth/PhoneVerification`
- Voice: `voice-chat/RoomList`, `RoomDetails`, `CreateRoom`
- Admin: `admin/Dashboard`, `admin/Users`, `admin/Rooms`, etc.

### Hooks
- `useTrtc()` — TRTC lifecycle (join/leave/streams)
- `useMicControl()` — Mic toggle with seat validation
- `use-mobile.tsx` — Responsive breakpoint detection

### Contexts
- `LocaleProvider` — Bilingual i18n (en/ar); provides `t(key)`, `locale`, `dir` (ltr/rtl)
  - Add new keys directly to `src/contexts/locale.tsx` dict object

### Models (`src/models/`)
TypeScript interfaces only—no logic: `User`, `Message`, `ChatRoom`, `Contact`, `RoomData`, etc.
`src/config/dyad.ts` exports `DyadConfig` object defining:
- Feature toggles: voice_chat, gift_system, virtual_economy, live_matching, monetization
- Quality settings: voice quality levels, max participants, recording capability
- Firebase/Supabase integration flags

## Project Structure Patterns

### Pages (`src/pages/`)
- All pages are route components; routing managed in `src/App.tsx`
- MaCommands
```bash
pnpm dev       # Dev server on localhost:8080
pnpm build     # Production build (optimized chunks)
pnpm lint      # ESLint (includes react-hooks/exhaustive-deps)
pnpm preview   # Preview production build
```

### Styling (Tailwind Only)
- Dark mode: `[class="dark"]` selector
- CSS vars: `hsl(var(--primary))`
- No custom CSS except `globals.css` theme overrides
- Example: `<Button className="w-full mt-4">Action</Button>`

### i18n Pattern
```typescript
import { useLocale } from "@/contexts";
const { t, locale, dir } = useLocale();  // t("key"), dir="ltr"|"rtl"
// Add keys to src/contexts/locale.tsx dict
```

### Adding Routes
1. Create page in `src/pages/`
2. Import in `App.tsx`
3. Add `<Route path="/..." element={<YourPage />} />`
### Build & Dev
```bash
pnpm dev          # Start dev server on :8080
pnpm build        # Production build with optimized chunks
pnpm build:dev    # Dev mode build (unminified)
pnpm lint Code Patterns

### React Query Data Fetching
```typescript
const { data, isLoading } = useQuery({ 
  queryKey: ['key'], 
  queryFn: () => SomeService.fetch() 
});
```

### Voice Chat Flow
```typescript
// 1. Join room
const { join, leave, remoteStreams } = useTrtc();
await join(roomId, userId);  // Fetches UserSig, connects TRTC

// 2. Mic control
const { isMicOn, toggleMic } = useMicControl(roomId, seatNumber);
toggleMic();  // Prevents "ghost mic" if not seated

// 3. Cleanup
leave();
```

### Toast Pattern
```typescript
import { showSuccess, showError } from "@/utils/toast";
showSuccess("Action completed");  // Green toast
showError("Failed");              // Red toast
```le time
- Example: `const { data, isLoading, error } = useQuery({ queryKey: ['data'], queryFn: () => SomeService.fetch() })`

### Toast Notifications
```typescript
import { showSuccess, showError } from "@/utils/toast";
showSuccess("Action completed");
showError("Something went wrong");
```


### TRTC Voice Chat Issues
**Console logging:** All TRTC events prefixed with `TRTC:` (see `useTrtc.ts:48-88`)

**Common failures:**
1. **UserSig fetch fails** → Check `USERSIG_API_ENDPOINT` in `trtcConfig.ts` is reachable
2. **Silent join failure** → Look for `TRTC: Join flow start` log; verify `TRTC_SDK_APP_ID` matches 200297772
3. **No remote streams** → Check browser mic permissions; may need TURN server
4. **Ghost mic** → Check console for "Detected ghost mic" — user not seated

### Supabase Duplicate Key Errors
**Error:** `duplicate key violates unique constraint "voice_room_seats_room_id_seat_number_key"`

**Fix:** Use DELETE-then-INSERT pattern (see "Critical Data Consistency Pattern" above).

**Manual cleanup:**
```sql
-- Run in Supabase SQL Editor
TRUNCATE TABLE public.voice_room_seats CASCADE;
TRUNCATE TABLE public.voice_room_messages CASCADE;
```
See `supabase/fix_voice_rooms.sql` for full cleanup script.

### Quick Checks
```javascript
// Browser console
localStorage.getItem('auth:user');     // Current user
localStorage.getItem('trtcAnonId');    // Anonymous ID
const { isSupabaseReady } = await import('@/services/db/supabaseClient.ts');
console.log(isSupabaseReady);          // DB connectivity
```
pnpm lint              # Validate syntax and hook rules before push
```

No unit test runner currently configured — rely on:
- TypeScript compiler (`tsc --noEmit`) for type safety
- Manual testing in dev server
- ESLint for code quality

### Debugging Mobile / Responsive Issues

```javascript
// Check if mobile view active
const { useBottomBarVisibility } = await import('@/hooks/useBottomBarVisibility');
// Check responsive breakpoint
const { useIsMobile } = await import('@/hooks/use-mobile');
```

Use browser DevTools device emulation to test mobile layouts.

## Key Files Reference
- **App setup**: `src/App.tsx` (routing), `src/main.tsx` (root), `vite.config.ts` (build config)
- **Auth**: `src/services/AuthService.ts`, `src/pages/auth/Login.tsx`
- **Voice chat**: `src/hooks/useTrtc.ts`, `src/config/trtcConfig.ts`, `src/pages/voice-chat/VoiceChat.tsx`
- **Admin**: `src/pages/admin/Dashboard.tsx`, `src/components/admin/`
- **Gift system**: `src/services/GiftService.ts`, `src/services/EconomyService.ts`
- **Styling**: `tailwind.config.ts`, `src/globals.css`
- **i18n**: `src/contexts/locale.tsx`
- **Debugging**: `src/hooks/useTrtc.ts` (console.log TRTC events), `src/utils/trtcAuth.ts` (UserSig fetching)

## Critical Notes
- **Do NOT edit shadcn/ui component files** in `src/components/ui/`; wrap them in new components instead
- **TRTC requires valid UserSig** — app will fail silently if API endpoint unreachable
- **Mic seats are limited to 8 per room** — enforce in UI to prevent queue overflow
- **User state persists in localStorage** — clear on logout to prevent stale auth
- **Supabase is optional** — app degrades gracefully if env vars missing (demo mode)
- **Dyad framework** — Vite plugin auto-tags components for analytics; doesn't affect development

- **Routing**: `src/App.tsx`
- **Supabase client**: `src/services/db/supabaseClient.ts` (nullable client + `isSupabaseReady`)
- **Voice chat**: `src/hooks/useTrtc.ts`, `src/components/voice/AuthenticLamaVoiceRoom.tsx`
- **TRTC config**: `src/config/trtcConfig.ts`, `src/utils/trtcAuth.ts`
- **i18n**: `src/contexts/locale.tsx`
- **DB schemas**: `supabase/schema.sql`, `supabase/fix_voice_rooms.sql`

## Critical Constraints
- **Do NOT edit `src/components/ui/*`** — shadcn/ui primitives; wrap instead
- **Max 8 mic seats per room** — enforced in `MicService`
- **TRTC fails silently** if UserSig endpoint down — check console logs
- **Supabase optional** — app works in demo mode without env vars
- **Vite chunks** defined in `vite.config.ts` — don't add to manual chunks without reason