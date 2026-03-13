# Clique App & Repo Review

## What Works

1. **Dark theme pipeline is solid** — Three layers ensure no white flash: `app.json` backgroundColor, runtime DOM injection in `App.js` (lines 45-59), and build-time `patch-index.js` into `dist/index.html`. All use the same `#0A0A0A`.

2. **Navigation structure is clean** — Stack navigator gates auth vs main app; bottom tabs use a custom `ImperialTabBar` with gold accent styling. All five tabs render.

3. **Web stubs are correct** — `maps.web.js` provides a placeholder for `react-native-maps`; `snapLogin.web.js` throws a clear error. Expo resolves `.web.js` extensions automatically.

4. **Zustand stores are well-organized** — Separate stores for auth (persisted with AsyncStorage), stories, messages, and UI. Auth interceptor on the axios client handles 401 → logout correctly.

5. **Vercel build config** (`vercel.json`) is valid — `cd frontend && npm install && npm run build:web`, output `frontend/dist`, SPA catch-all rewrite.

6. **Component library is cohesive** — Consistent gold/leather theme across all screens with proper `cliqueTheme.js` tokens.

---

## What's Broken or Risky

### Critical

| # | Issue | File(s) | Detail |
|---|-------|---------|--------|
| 1 | **Wrong env var prefix** | `frontend/src/api/cliqueApi.js:5`, `frontend/.env.local` | Uses `REACT_APP_API_URL` but Expo SDK 55 only exposes `EXPO_PUBLIC_*` vars to the client bundle. The API URL will **always** fall back to `http://localhost:3001` in production. Every API call (auth, stories, upload, etc.) will fail. |
| 2 | **WebSocket URL hardcoded** | `frontend/src/services/websocketClient.js:5` | `const WS_URL = 'http://localhost:3001'` — not configurable, will never connect in production. |
| 3 | **`StoriesScreen` uses non-existent store field** | `frontend/src/screens/StoriesScreen.js:28` | Destructures `activeStory` from `useUIStore`, but the store only has `currentStoryGroup`. The inline story viewer modal (line 172: `visible={showStoryViewer && activeStory}`) will never open because `activeStory` is always `undefined`. |
| 4 | **Duplicate StoryViewer** | `App.js:98` + `StoriesScreen.js:171-214` | `App.js` renders a global `<StoryViewer />` overlay. `StoriesScreen` has its own separate `<Modal>` with a simpler viewer. They conflict and the StoriesScreen one is broken (#3 above). |
| 5 | **Missing Expo app icons** | `frontend/app.json` | References `./assets/icon.png`, `./assets/splash.png`, `./assets/adaptive-icon.png` — none of these files exist. The `expo export` build may warn or fail for web builds that need a favicon. |

### Moderate

| # | Issue | File(s) | Detail |
|---|-------|---------|--------|
| 6 | **`Alert.alert` on web** | `frontend/src/screens/AuthScreen.js:133` | `Alert.alert()` from react-native maps to `window.alert()` on web — functional but jarring UX. |
| 7 | **No error boundaries** | Entire app | Any uncaught component error will white-screen the whole app. No `ErrorBoundary` wrapper anywhere. |
| 8 | **Haptics called unconditionally** | `App.js:106`, `StoryViewer.js:75` | `expo-haptics` is called on every tab press and story open. On web, Haptics may silently no-op (Expo polyfills it), but it adds unnecessary overhead and could warn in some browsers. |
| 9 | **`ImperialTabBar` nests Text inside Text** | `ImperialTabBar.js:62` | `tabBarIcon` returns a `<Text>` component, which gets rendered inside another `<Text style={styles.icon}>`. Nested `<Text>` works but prevents proper layout control. |
| 10 | **Auth screen requires `suede_bg.png` image** | `AuthScreen.js:146` | The `ImageBackground` uses `require("../../assets/suede_bg.png")` — the file exists, but if the Vercel build can't resolve it (e.g., due to missing Expo asset plugins), the auth screen will crash. |
| 11 | **`eliteGreetingService` loads a `.js` file as audio** | `eliteGreetingService.js:17` | `require("../../assets/sounds/empire_chime.js")` — this is a JavaScript module, not an audio file. The `Audio.Sound.createAsync` call will fail (caught by try/catch, so non-fatal). |
| 12 | **`__DEV__` bypass absent in production** | `AuthScreen.js:263` | The "Dev: Enter app" button only shows when `__DEV__` is true. In Vercel production builds, this is `false`, so users **must** authenticate through the real backend (which doesn't have a production URL configured — see #1). The app will be stuck on the auth screen. |

---

## Summary: End-to-End Web Experience

On a Vercel production deploy, the expected user experience is:

1. Page loads → dark background appears correctly (theme pipeline works)
2. "Chargement..." briefly appears, then auth screen shows with gold/leather branding
3. **No "Dev: Enter app" button** (production build)
4. Entering a phone number and pressing "Continuer" → API call to `http://localhost:3001/auth/otp` → **fails silently** (network error to localhost)
5. Snapchat login → throws "only available in mobile app"
6. **User is stuck on the auth screen with no way in**

---

## Concrete Next Steps

### 1. Fix the env var prefix (blocks everything)
- Rename `REACT_APP_API_URL` → `EXPO_PUBLIC_API_URL` in:
  - `frontend/.env.local`
  - `frontend/src/api/cliqueApi.js` (line 5)
  - `frontend/src/services/websocketClient.js` (line 5)
- Set `EXPO_PUBLIC_API_URL` in Vercel project environment variables pointing to the real backend URL.

### 2. Fix the StoriesScreen store bug + remove duplicate viewer
- In `StoriesScreen.js` line 28, change `activeStory` to `currentStoryGroup`.
- Or better: remove the entire inline `<Modal>` (lines 171-214) from `StoriesScreen` since `App.js` already renders a global `<StoryViewer />` that is feature-complete.

### 3. Add a web-friendly auth bypass or demo mode
- Either deploy the backend with a real API URL, or add a production-safe demo/guest mode so users can reach the main app.
- Add missing `icon.png` / `splash.png` assets (or remove references from `app.json`).
- Wrap the app root in an `ErrorBoundary` to prevent full white-screen crashes.
