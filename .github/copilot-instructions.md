# Copilot Instructions for TRTC Voice Chat App

## Overview
This is a React + TypeScript web application built with Vite, featuring voice chat rooms powered by TRTC SDK, real-time messaging, gift system, and admin management. The app supports bilingual UI (English/Arabic) with RTL support.

## Tech Stack & Key Dependencies
- **Framework**: React 18 + TypeScript + React Router v6
- **UI Components**: shadcn/ui (Radix UI) + Tailwind CSS
- **Real-time Communication**: TRTC JS SDK (Tencent Real-Time Communication)
- **Backend**: Supabase (PostgreSQL + Auth)
- **State Management**: React Query (TanStack Query)
- **Audio**: WebRTC + custom AudioManager utility
- **Build**: Vite with optimized chunking (React, Router, TRTC, Supabase, UI as separate chunks)

## Architecture & Data Flow

### Key Service Boundaries
Services in `src/services/` follow a singleton pattern exposing object literals with methods. Never instantiate—always import and call methods directly.

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
- `GiftService` — Gift catalog (Rose, Luxury Car, Golden Dragon); categories define availability
- `EconomyService` — Transaction ledger (coins, diamonds); accumulates from gifts + purchases
- `CoinPackageService` — Purchasable coin packages; manages coin packages in admin
- Gift animations via Lottie (assets in `public/lottie/`)

**Admin & Moderation**
- `AdminService` (implied) — Admin dashboard roles/permissions
- `ReportService` — User reports; moderation queue
- `BannerService` — In-app banners for announcements
- `GiftAdminService` — Admin gift management

**Notifications & Logging**
- `NotificationFeedService` — Notification inbox; uses Supabase real-time
- `ActivityLogService` — Event logging (logins, room joins, gifts sent)
- `AnalyticsService` — Engagement metrics; fires on key user actions

**Utilities**
- `api.ts` — Generic `ApiResponse<T>` type with `ok()` / `fail()` helpers
- `toast.ts` — Sonner + Radix Toast integration; use `showSuccess()`, `showError()`
- `AudioManager` — Web Audio API wrapper; handles mic/speaker control, volume normalization
- `trtcAuth.ts` — UserSig token fetching; includes fallback retry logic

### Supabase Integration
- Client initialized in `src/services/db/supabaseClient.ts`
- Export: `supabase` (nullable), `isSupabaseReady` (boolean), `safe()` wrapper for error handling
- Auth stored in Supabase; UI state synced to localStorage (persistence across page reloads)
- Real-time subscriptions used for notifications, room state updates

### Configuration & Feature Flags
`src/config/dyad.ts` exports `DyadConfig` object defining:
- Feature toggles: voice_chat, gift_system, virtual_economy, live_matching, monetization
- Quality settings: voice quality levels, max participants, recording capability
- Firebase/Supabase integration flags

## Project Structure Patterns

### Pages (`src/pages/`)
- All pages are route components; routing managed in `src/App.tsx`
- Main entry: `Index.tsx` (default `/` route) — landing/home
- Auth pages: `auth/Login`, `auth/Register`, `auth/PhoneVerification`, `auth/ForgotPassword`
- Voice chat: `voice-chat/RoomList`, `RoomDetails`, `VoiceChat`, `CreateRoom`
- Admin pages: `admin/Dashboard`, `admin/Users`, `admin/Rooms`, etc.
- Each page uses `ChatLayout` or similar layout wrapper for consistent header/nav

### Components (`src/components/`)
- **UI components** (`ui/`) — shadcn/ui imports (Button, Card, Dialog, etc.); do NOT edit these
- **Layout** — `made-with-dyad.tsx`, chat layout wrappers
- **Feature components** — organized by domain: `admin/`, `chat/`, `voice/`, `music/`, `profile/`, `trtc/`, `mobile/`, `moderation/`, `gifts/`, `discover/`
- Create new domain folders for new feature areas

### Hooks (`src/hooks/`)
- `useTrtc()` — main voice chat hook; returns join/leave/remote stream methods
- `useMicControl()` — mic toggle with seat validation
- `useBottomBarVisibility` — mobile bottom bar show/hide logic
- `use-mobile.tsx` — responsive breakpoint detection
- `use-toast.ts` — toast trigger function

### Contexts (`src/contexts/`)
- `LocaleProvider` — bilingual support (en/ar); provides `t()` translation function and `locale`/`dir` (ltr/rtl)
- Dictionary keys defined in-file; add new keys as needed

### Models (`src/models/`)
- TypeScript interfaces: `User`, `Message`, `ChatRoom`, `Contact`, `Playlist`, `MusicTrack`, `RoomData`
- Keep models separate from services; models = data shape, services = behavior

## Development Workflows

### Build & Dev
```bash
pnpm dev          # Start dev server on :8080
pnpm build        # Production build with optimized chunks
pnpm build:dev    # Dev mode build (unminified)
pnpm lint         # ESLint check (includes React Hooks rules)
pnpm preview      # Local preview of production build
```

### Adding Routes
1. Create page component in `src/pages/` or subdirectory
2. Import in `src/App.tsx`
3. Add `<Route path="/..." element={<YourPage />} />`
4. If new feature, ensure page is linked from navigation (Index.tsx or admin menu)

### Creating UI Components
- Always import from `src/components/ui/` for shadcn components (pre-installed)
- Wrap with Tailwind classes; avoid inline CSS
- Example: `<Button className="w-full mt-4">Action</Button>`

### Styling
- Tailwind CSS exclusively; dark mode via `[class="dark"]`
- CSS Variables in Tailwind (e.g., `hsl(var(--primary))`)
- No custom CSS files unless absolutely necessary (globals.css is for theme overrides only)

### Internationalization
- Import `{ useLocale }` from `@/contexts` to access translation
- Usage: `const { t, locale, dir } = useLocale()`
- Add new translation keys to `src/contexts/locale.tsx` dict object

## Common Patterns & Conventions

### Service Usage Pattern
```typescript
import { SomeService } from "@/services/SomeService";
// Call directly — no instantiation
const result = SomeService.methodName(args);
```

### Async Data Fetching with React Query
- Use `useQuery()` / `useMutation()` from `@tanstack/react-query`
- Configured QueryClient in `App.tsx` with default retry/stale time
- Example: `const { data, isLoading, error } = useQuery({ queryKey: ['data'], queryFn: () => SomeService.fetch() })`

### Toast Notifications
```typescript
import { showSuccess, showError } from "@/utils/toast";
showSuccess("Action completed");
showError("Something went wrong");
```

### Voice Chat Integration Flow
1. User joins room → `useTrtc().join(roomId, userId)`
2. TRTC client fetches UserSig from external endpoint
3. On success, remote streams managed in component state
4. Mic control: `useMicControl()` with seat validation
5. On leave: `useTrtc().leave()` cleans up streams

### Error Handling Pattern
- Use `safe()` wrapper from Supabase client for fire-and-forget calls
- Check `isSupabaseReady` before making DB calls
- Wrap async calls in try/catch; show toast on error

### localStorage Keys
- `auth:user` — current logged-in user (AuthService)
- `app:locale` — locale preference (en/ar)
- `trtcAnonId` — anonymous TRTC user ID if not authenticated

## Debugging Workflows

### Development Server Debugging
```bash
# Start dev server with full console logging (webpack/Vite debug info)
pnpm dev

# Dev server runs on http://localhost:8080 — check browser DevTools Console for TRTC logs
```

**Browser DevTools Console patterns** — filtered by "TRTC:" prefix:
- `TRTC: Join flow start` — room join initiated
- `TRTC: Connection state:` — peer connection status
- `TRTC: Remote stream added/subscribed` — remote users arriving
- `TRTC: Peer unmuted audio/video` — media state changes
- `console.error("TRTC: ...")` — explicit error signals (catch these)

### Voice Chat / TRTC Debugging

**Common TRTC failure points:**

1. **UserSig fetch failure** — logs `Failed to fetch UserSig (400/404/500)`
   - Verify `USERSIG_API_ENDPOINT` in `src/config/trtcConfig.ts` is reachable
   - Check endpoint returns `{ userSig: "..." }` or `{ data: { userSig: "..." } }`
   - See `src/utils/trtcAuth.ts` for response parsing logic

2. **Silent join failure** — no console error but no streams appear
   - Check browser console for `TRTC: Join flow start` log
   - Verify TRTC app ID matches `TRTC_SDK_APP_ID` (200297772)
   - Confirm room ID is valid in `TRTC_TEST_ROOM_ID` or passed dynamically
   - TRTC SDK may fail silently on network issues

3. **Remote stream subscription fails** — logs `TRTC: Subscribe failed: [userId]`
   - Indicates peer exists but audio/video stream unreachable
   - Check browser media permissions (microphone, camera)
   - Verify WebRTC transport (may require TURN server in some networks)

4. **Mic/audio not working** — see `src/hooks/useMicControl.ts` and `src/utils/AudioManager.ts`
   - Ghost mic detection logs: "Detected ghost mic. Mic muted until you take a seat."
   - Check `MicService.setSpeaking()` was called with correct roomId/userId
   - Verify mic stream acquired: `WebRTCService.getMicStream()` should resolve

### Linting & Type Checking

```bash
pnpm lint                # Run ESLint on all .ts/.tsx files
# Output will show unused vars, React Hook violations (from react-hooks/exhaustive-deps)
```

**Common lint errors in this project:**
- Unused variables — disabled by rule in `eslint.config.js` (set to "off")
- Missing dependency in useEffect — **do NOT ignore** (catch real React Hook bugs)
- Component must be PascalCase if exported — catch accidental lowercase exports

### Network & API Debugging

**Check Supabase connectivity** — in browser console:
```javascript
// Quick test if Supabase is reachable
const { isSupabaseReady, supabase } = await import('@/services/db/supabaseClient.ts');
console.log('Supabase ready:', isSupabaseReady, 'Client:', !!supabase);
```

**Check localStorage state:**
```javascript
// View current auth user
JSON.parse(localStorage.getItem('auth:user'));
// View locale preference
localStorage.getItem('app:locale');
// View anonymous TRTC ID
localStorage.getItem('trtcAnonId');
```

**Check React Query cache** (if ReactQueryDevtools installed):
- Add `import { lazy } from 'react'; const RQDevtools = lazy(() => import('@tanstack/react-query-devtools'));` to App.tsx
- Shows all query states, network requests, cache timing

### Performance & Bundle Debugging

```bash
pnpm build             # Build with Vite's chunk optimization
# Check generated dist/ for chunk sizes
# Manual chunks defined in vite.config.ts: react, router, trtc, supabase, ui, utils
```

**Identify slow components:**
- React DevTools Profiler (in browser) — measure render times
- Vite's built-in bundle analysis — check chunk file sizes in dist/

### Testing & Validation

```bash
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
