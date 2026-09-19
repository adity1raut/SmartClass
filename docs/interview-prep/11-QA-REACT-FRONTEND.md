# Chapter 11 — React and Frontend (150 questions)

---

## Section A — React fundamentals (Q1–35)

**Q1. What is React?**
A library for building UIs from composable components, where you describe what the UI should look like for a given state and React handles updating the DOM.

**Q2. What is the virtual DOM and is it fast?**
An in-memory tree of elements. On a state change React builds a new tree, diffs it against the old (reconciliation), and applies the minimal set of real DOM mutations. It is *not* inherently faster than well-written imperative DOM code — the win is that it makes declarative UI fast *enough*, which is a different claim. Saying that distinction is a good signal.

**Q3. What is reconciliation?**
The diffing algorithm. It assumes two elements of different types produce different trees (so it discards and rebuilds), and it uses `key` to match children across renders.

**Q4. Why do keys matter?**
They tell React which child corresponds to which across renders. Without stable keys, React matches by index, so inserting at the front makes every item appear changed — losing component state and DOM state (focus, scroll, input values).

**Q5. Why is array index a bad key?**
It's not stable under insertion, deletion or reordering. It's acceptable only for a static list that never reorders.

**Q6. What is JSX?**
Syntax sugar compiled to `React.createElement` (or the modern `jsx` runtime). It's an expression, so it can be assigned, returned and passed.

**Q7. Controlled vs uncontrolled components?**
Controlled: React state is the source of truth, `value` + `onChange`. Uncontrolled: the DOM holds the value, read via a ref. Controlled is the default choice; uncontrolled is useful for file inputs (which must be uncontrolled) and for performance with very large forms.

**Q8. What are the rules of hooks?**
Only call them at the top level (not inside conditions, loops or nested functions) and only from React functions. React tracks hooks by call order, so a conditional hook shifts every subsequent hook's identity.

**Q9. Explain `useState`'s functional update form.**
`setCount(c => c + 1)` computes from the latest state rather than the value captured in the closure. Necessary when updating based on previous state, especially inside async callbacks and event handlers that may see stale values.

**Q10. What is a stale closure and where does it bite in your app?**
A callback capturing values from the render in which it was created. In `LiveClassRoom`, a socket handler registered once in a `useEffect` with `[]` deps closes over the first render's state forever. **This is the single most common React+Socket.IO bug.** The fixes: functional state updates, refs for mutable current values, or re-registering the handler when deps change (with proper cleanup).

**Q11. What does `useEffect` do and when does it run?**
Runs after the render is committed to the DOM. With no dependency array, after every render; with `[]`, once after mount; with deps, when a dep changes by `Object.is` comparison.

**Q12. What is the cleanup function for?**
It runs before the next effect execution and on unmount. It's where you remove listeners, close connections, clear timers, abort fetches and stop media tracks. **Every `socket.on` needs a matching `socket.off`; every `getUserMedia` stream needs `track.stop()`.**

**Q13. What does `useEffect` do in Strict Mode in development?**
React 18+ mounts, unmounts and remounts components in development, running effects twice. It's a deliberate test that your cleanup is correct. If double-mounting breaks something, the cleanup is wrong — it's revealing a bug, not causing one.

**Q14. What would double-mounting do to your WebRTC code?**
Create two peer connections, two `getUserMedia` calls, and duplicate socket handlers. If `LiveClassRoom` misbehaves in development but works in a production build, that's the cause and it means cleanup is incomplete.

**Q15. `useLayoutEffect` vs `useEffect`?**
`useLayoutEffect` runs synchronously after DOM mutation but before paint — use it when you must measure or mutate the DOM to avoid a visible flicker. It blocks paint, so it's the exception.

**Q16. `useMemo` vs `useCallback`?**
`useMemo` memoises a computed value; `useCallback` memoises a function reference. `useCallback(fn, deps)` is `useMemo(() => fn, deps)`.

**Q17. When should you actually use them?**
When the value is expensive to compute, or when referential identity matters — a dependency of another hook, or a prop to a `React.memo` child. Wrapping everything is cargo cult: you pay the comparison cost and the memory for no benefit.

**Q18. What is `React.memo`?**
A HOC that skips re-rendering when props are shallowly equal. It only helps if the props actually are stable — passing a new inline object or arrow function every render defeats it entirely.

**Q19. What is `useRef` for?**
Two things: a stable reference to a DOM node, and a mutable box that persists across renders without triggering one.

**Q20. Why does `LiveClassRoom` use refs so heavily?**
Because peer connections, media streams and senders are not render state — mutating them shouldn't re-render, and putting them in `useState` would trigger a render on every ICE candidate. **This is the best React answer in your whole project; make sure you can give it crisply.**

**Q21. When is a ref the wrong tool?**
When the value *should* drive the UI. If the number of connected viewers is shown on screen, that's state. A common bug is putting something in a ref and wondering why the UI doesn't update.

**Q22. What is `useReducer` and when is it better than `useState`?**
When the next state depends on the previous in complex ways, or several values change together. **`LiveClassRoom` with its many interdependent booleans (camera on, screen sharing, subtitles enabled, recording) is a textbook `useReducer` case** — that's a great concrete answer to "how would you refactor it".

**Q23. What is Context and what's the cost?**
A way to pass values down without prop drilling. The cost: **every consumer re-renders when the context value changes**, regardless of which part they use. A context holding a frequently-changing value re-renders the whole subtree.

**Q24. How do you mitigate that?**
Split contexts by update frequency (your `AuthContext` and `ThemeContext` split is right), memoise the provider value, and keep rapidly-changing state out of context entirely.

**Q25. Is the value in your `AuthContext` memoised?**
`<AuthContext.Provider value={{ user, login, logout }}>` creates a new object every render, so every consumer re-renders whenever `AuthProvider` renders. `login` and `logout` are `useCallback`'d — good — but the wrapping object isn't memoised. **A `useMemo` on the value object is the one-line fix, and spotting it in your own code is a strong moment.**

**Q26. Context vs Redux vs Zustand?**
Context is a dependency-injection mechanism, not a state manager — no selectors, no middleware, no devtools. Redux (with RTK) gives you those plus a strict update discipline. Zustand is lighter with selector-based subscriptions that avoid the over-rendering problem.

**Q27. Your resume lists Redux but SmartClass uses Context. Where did you use Redux?**
**RISK.** Have a real answer or remove it from the resume (Chapter 01 §1.10).

**Q28. When do you actually need a state manager?**
When state is shared widely, updated from many places, and its update logic is non-trivial. Most apps reach for one too early. For SmartClass, Context was correct — say that as a decision, not an omission.

**Q29. What is server state and why is it different?**
Data owned by the server that you cache client-side: it goes stale, needs refetching, deduplication, and background revalidation. React Query / SWR exist for this. **Your app hand-rolls `useEffect` + `fetch` + `useState` everywhere, which means no caching, no dedup, no retry, and race conditions on rapid navigation.** Naming React Query as the improvement is a strong answer.

**Q30. What's the race condition in `useEffect` + fetch?**
Navigate from course A to course B quickly; A's slower response arrives after B's and overwrites it. Fix: an `AbortController` in the effect cleanup, or an `ignore` flag checked before setting state.

**Q31. Show me the fix.**
```js
useEffect(() => {
  const ac = new AbortController();
  apiFetch(`/api/courses/${id}`, { signal: ac.signal })
    .then(r => r.json()).then(setCourse)
    .catch(e => { if (e.name !== 'AbortError') setError(e); });
  return () => ac.abort();
}, [id]);
```

**Q32. What is Suspense?**
A mechanism for declaring a fallback while a child is "not ready". Used with `React.lazy` for code splitting and with data-fetching libraries that integrate with it.

**Q33. What is an Error Boundary?**
A class component with `componentDidCatch`/`getDerivedStateFromError` that catches render-phase errors in its subtree. **It does not catch errors in event handlers, async code, or the boundary itself.** That limitation is the follow-up question.

**Q34. Does your app have error boundaries?**
If not, say so: one uncaught render error white-screens the entire application. A top-level boundary plus one per route is the minimum.

**Q35. What are Server Components?**
Components that render on the server and send a serialised result, never shipping their code to the client. They can access the database directly and reduce bundle size. They're a Next.js/framework feature — a Vite SPA like yours doesn't use them, and knowing *why* is the point.

---

## Section B — Performance (Q36–70)

**Q36. What causes unnecessary re-renders?**
State changing in a common ancestor, new object/array/function props breaking memoisation, context value identity changing, and missing or unstable keys.

**Q37. How do you find them?**
React DevTools Profiler with "highlight updates", and the "why did this render" information in the profiler.

**Q38. What is the "lifting state down" technique?**
Move state to the smallest component that needs it, so a change re-renders less. Often more effective than memoising.

**Q39. What is component composition as a performance tool?**
Passing expensive subtrees as `children` means they're created in the parent's parent and don't re-render when the wrapper's state changes. It's a free optimisation with no memoisation.

**Q40. What is list virtualisation?**
Rendering only the visible window of a long list (react-window, TanStack Virtual). Necessary past a few hundred rows.

**Q41. Where would it help in SmartClass?**
Chat messages in a long live class, and a course with many students or submissions.

**Q42. What is code splitting?**
Splitting the bundle so code is fetched when needed. `React.lazy(() => import('./X'))` + `<Suspense>`.

**Q43. What should you split in your app?**
`LiveClassRoom` (1,944 lines plus WebRTC logic — most users never open it) and the nine AI Playground pages. Those are the biggest wins and the least-used routes.

**Q44. Show me.**
```js
const LiveClassRoom = lazy(() => import("../pages/LiveClassRoom"));
// ...
<Suspense fallback={<Spinner />}>
  <Route path="/live-class/:id" element={<LiveClassRoom />} />
</Suspense>
```
Plus an Error Boundary around the Suspense, because a failed chunk load throws.

**Q45. What's the chunk-load failure after deploy problem?**
A user has an old tab open; you deploy; hashed chunk filenames change; they navigate and the old chunk 404s. Fix: an error boundary that offers a reload, or retaining old chunks for a grace period.

**Q46. What is prefetching and how do you do it on intent?**
Start fetching a lazy chunk before it's needed — on `onMouseEnter` of a nav link, or during idle time. It removes the perceived cost of splitting.

**Q47. What is tree shaking and what breaks it?**
Eliminating unused exports via static analysis of ESM. Broken by CommonJS, by side effects at module scope, and by `import * as X`. `"sideEffects": false` in package.json helps bundlers be aggressive.

**Q48. How do you analyse a bundle?**
`rollup-plugin-visualizer` for Vite, or `vite build --mode production` with source map exploration. Look for large dependencies you didn't expect.

**Q49. What would you find in yours?**
Likely candidates: `recharts` (large, used only on dashboards), `react-markdown` + `remark-gfm` (used only on AI pages), and `lucide-react` if imported non-specifically. All three are lazy-loading candidates.

**Q50. Why does icon library import style matter?**
`import { Home } from 'lucide-react'` should tree-shake, but `import * as Icons` pulls everything. With some libraries even named imports pull the whole barrel unless the package ships proper ESM.

**Q51. What are the Core Web Vitals?**
LCP (Largest Contentful Paint, loading — target <2.5s), INP (Interaction to Next Paint, responsiveness — target <200ms; it replaced FID), CLS (Cumulative Layout Shift, visual stability — target <0.1).

**Q52. How do you improve LCP?**
Reduce server response time, preload the LCP resource, don't lazy-load above-the-fold images, cut render-blocking CSS/JS, and use a CDN (your Vercel deployment already covers the last one).

**Q53. How do you improve INP?**
Break up long tasks (yield with `scheduler.yield` or `setTimeout`), reduce JS execution, avoid synchronous layout thrashing, and use `startTransition` for non-urgent state updates.

**Q54. How do you prevent CLS?**
Explicit `width`/`height` or `aspect-ratio` on images and embeds, reserve space for dynamically inserted content, and use `font-display: optional`/`swap` with matched fallback metrics.

**Q55. Lab vs field data?**
Lab (Lighthouse) is a controlled synthetic run — reproducible but not representative. Field (RUM, CrUX) is real users on real devices. **Your Pragyaa "reduced load time significantly" claim is lab data, and saying so unprompted is a strong, honest answer (Chapter 01 Q8).**

**Q56. What is `startTransition`?**
Marks a state update as non-urgent so React can interrupt it to handle more urgent updates (like typing). It's how you keep an input responsive while a heavy list re-filters.

**Q57. What is `useDeferredValue`?**
Lets a value lag behind, so expensive renders derived from it don't block urgent ones. Useful for search-as-you-type over a big list.

**Q58. What is concurrent rendering?**
React can start rendering, pause, and resume or abandon that work. It's what makes transitions and Suspense interruptible.

**Q59. What is automatic batching in React 18?**
Multiple `setState` calls in the same tick are batched into one render — now including inside promises, timeouts and native event handlers, which weren't batched before 18.

**Q60. What's new in React 19 that's relevant to you?**
Actions and `useActionState` for form submission with pending/error states, `use()` for reading promises and context, ref as a prop (no `forwardRef`), and improved hydration errors. **You're on React 19 — know at least two of these.**

**Q61. How do you optimise images?**
Modern formats (WebP/AVIF), responsive `srcset`/`sizes`, `loading="lazy"` below the fold, and explicit dimensions. Cloudinary does format and size transformation on the fly via URL parameters — **you already have Cloudinary, so you're not using a capability you're already paying for.** That's a good "what I'd do next" item.

**Q62. What is debouncing vs throttling?**
Debounce: run after activity stops for N ms (search input). Throttle: run at most once per N ms (scroll, resize, mousemove).

**Q63. Where would you use each in SmartClass?**
Debounce a search field and the auto-save of a submission draft. Throttle the `getStats()` polling for a connection-quality indicator, and reaction emission to prevent spam.

**Q64. What's the cost of Tailwind at runtime?**
Zero — it's build-time CSS generation with unused classes purged. The cost is in HTML size from long class strings, and in readability.

**Q65. What changed in Tailwind 4?**
CSS-first configuration (`@theme` in CSS rather than `tailwind.config.js`), a much faster Rust-based engine, and native cascade layers. You're on v4 with `@tailwindcss/vite`.

**Q66. How do you handle dark mode?**
`prefers-color-scheme` for the default plus a class or data attribute for an explicit override, persisted. Your `ThemeContext`/`ThemeApplier` does this — know which mechanism.

**Q67. How do you avoid a theme flash on load?**
An inline script in `index.html` that sets the theme class before React hydrates, reading from `localStorage`. Otherwise the default paints first and then switches.

**Q68. What is CSS-in-JS and what's the trade-off?**
Styles co-located with components, dynamic from props, scoped. Cost: runtime overhead and a larger bundle. **You have `react-jss` in your dependencies alongside Tailwind — two styling systems is a real code-smell worth acknowledging.**

**Q69. How would you measure real user performance?**
The `web-vitals` library reporting to an analytics endpoint, segmented by route and device class.

**Q70. What's the single biggest frontend improvement to your app?**
Code splitting `LiveClassRoom` and the AI pages, because they're the largest chunks and the least used, so nearly every user is currently downloading code they'll never run.

---

## Section C — Routing, forms, data (Q71–105)

**Q71. How does client-side routing work?**
The History API (`pushState`) changes the URL without a navigation; the router matches the new path and renders the corresponding component. No server round trip.

**Q72. Why does deep linking 404 without configuration?**
A hard request to `/course/123/materials` goes to the server, which has no such file. The server must rewrite all unmatched paths to `index.html`. **That's what your `vercel.json` does.**

**Q73. What's new in React Router 7?**
Convergence with Remix — a framework mode with loaders, actions and data APIs, plus the existing declarative mode. You use the declarative mode.

**Q74. What are loaders and would they help?**
Route-level data fetching that runs *before* the component renders, eliminating the fetch-on-render waterfall and the race condition of Q30. Yes, they'd help — that's the honest answer.

**Q75. What is a render waterfall?**
Parent fetches, renders, then child fetches — serialising requests that could have been parallel. Fetching at the route level fixes it.

**Q76. How do you protect routes?**
Your `App.jsx` splits `PublicRoutes` and `ProtectedRoutes` on auth state, and the home route switches on `user.role`. **Always add: this is UX, not security — the API must authorise independently.**

**Q77. Someone edits `localStorage` to set `role: "teacher"`. What happens?**
They see the teacher dashboard shell. Its API calls should then fail — except that your controllers accept `teacherId` from the body, so they may not. Two independently-minor issues combining into a real exploit (Chapter 04 §4.9).

**Q78. How do you handle a 401 from the API?**
A central `apiFetch` wrapper that detects 401, clears the auth state and redirects to login. **Your `apiFetch` is three lines with no response handling, so each caller must handle it — which means some won't.** That's a concrete improvement.

**Q79. Write the improved wrapper.**
```js
export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, { credentials: "include", ...options });
  if (res.status === 401) { clearAuth(); window.location.assign("/signin"); }
  return res;
}
```
with the caveat that coupling navigation into a fetch helper is itself debatable — mentioning the trade-off is better than presenting it as obviously right.

**Q80. How do you handle form state?**
Controlled inputs with `useState` for small forms; React Hook Form for anything with real validation, because it uses uncontrolled inputs under the hood and avoids re-rendering on every keystroke.

**Q81. How do you validate on the client?**
For UX only. **Every validation must be repeated server-side**, because the client is attacker-controlled. Sharing a Zod schema between client and server gives you one definition and two enforcement points.

**Q82. How would you implement optimistic UI?**
Apply the change locally immediately, send the request, and roll back on failure. Good for marking a notification read; bad for submitting an assignment, where a false success is worse than a spinner. **Knowing when *not* to be optimistic is the differentiator.**

**Q83. How do you handle file upload UI?**
`<input type="file">` (necessarily uncontrolled), `FormData`, and progress via `XMLHttpRequest`'s `upload.onprogress` — `fetch` still has no upload progress. That last detail is a good practical one.

**Q84. How do you show upload progress with `fetch`?**
You can't, for uploads. Downloads can be tracked with a `ReadableStream` reader. For uploads you need XHR or a library.

**Q85. How do you handle long-running server operations in the UI?**
Optimistically show a pending state, then either poll, use SSE, or — since you already have a socket — push the result over it. The socket is clearly the right answer for your app.

**Q86. What's the accessibility baseline you'd hold code to?**
Semantic HTML first, keyboard operability for everything, visible focus states, labels on all inputs, sufficient contrast, and ARIA only where semantics can't express it.

**Q87. Accessibility issues specific to a video classroom?**
Captions (you have them, Chromium-only — an accessibility feature that doesn't work for everyone is a real failure), keyboard shortcuts for mute/raise hand, screen-reader announcements for who's speaking and for chat, and respecting `prefers-reduced-motion` for reactions.

**Q88. How do you test accessibility?**
`axe-core` in CI for automated checks (which catch maybe 30–40%), keyboard-only navigation manually, and a screen reader for critical flows.

**Q89. What's the `alt` attribute rule?**
Describe the function, not the appearance. Decorative images get `alt=""` so screen readers skip them — omitting `alt` entirely makes them read the filename.

**Q90. How do you handle focus management in a modal?**
Trap focus inside, move focus to the modal on open, restore it to the trigger on close, close on Escape, and mark the background inert. Your `Modals.jsx` — know whether it does this.

**Q91. What is hydration and does it apply to you?**
Attaching React to server-rendered HTML. Not applicable to a Vite SPA — your `index.html` is a shell and everything renders client-side.

**Q92. SPA vs SSR — trade-offs for SmartClass?**
SPA: simpler, cheap static hosting, no server render cost — but slower first paint and no SEO. SSR: better first paint and SEO. **SmartClass is behind a login, so SEO is irrelevant and the SPA is the right call.** The marketing pages (`Mainpage`, `Features`, `Blog`) are the exception and would benefit from static generation.

**Q93. What is `import.meta.env` in Vite?**
Build-time environment variables, only those prefixed `VITE_`. They're statically replaced at build, so they're compile-time constants — and therefore public.

**Q94. Why is Vite fast in development?**
It serves native ES modules with no bundling, transforming files on demand, and uses esbuild (Go) for dependency pre-bundling. Bundling only happens for production builds, via Rollup.

**Q95. What is dependency pre-bundling?**
Vite converts CJS dependencies to ESM and bundles many small modules into one, so the browser doesn't make hundreds of requests for a package's internal files.

**Q96. Vite vs webpack?**
Vite: far faster cold start and HMR, simpler config, modern defaults. Webpack: more mature, more plugins, more control for unusual setups. For a new project Vite is the default.

**Q97. What is HMR?**
Hot Module Replacement — swapping a changed module at runtime while preserving state. React Fast Refresh is the React-specific version, which is what `eslint-plugin-react-refresh` in your config is guarding (it warns when a file exports things that break Fast Refresh).

**Q98. What's the `// eslint-disable-next-line react-refresh/only-export-components` in your `AuthContext`?**
Exporting the `useAuth` hook alongside the component breaks Fast Refresh's ability to hot-update that file. **The cleaner fix is putting the hook in a separate file** — knowing why the disable exists, rather than just that it does, is the good answer.

**Q99. What is `StrictMode`?**
A development-only wrapper that double-invokes render and effects to surface impure renders and missing cleanup. No production effect.

**Q100. What browser APIs does your app depend on?**
`getUserMedia`, `getDisplayMedia`, `RTCPeerConnection`, `MediaRecorder`, `SpeechRecognition`, `localStorage`, `WebSocket`. **`SpeechRecognition` is the one with poor cross-browser support** — Chromium only.

**Q101. How do you feature-detect?**
`if (!navigator.mediaDevices?.getUserMedia)` and `MediaRecorder.isTypeSupported(mime)`. Then degrade with a clear message rather than throwing.

**Q102. Why does `getUserMedia` require a secure context?**
Because camera and microphone access over plain HTTP could be intercepted or injected. `localhost` is exempt, which is why it works in development and fails on a plain-HTTP deployment.

**Q103. How do permissions work?**
The browser prompts on first `getUserMedia`. The result is remembered per origin. `navigator.permissions.query({name: 'camera'})` lets you check state and show a helpful message when it's `denied` (where a retry won't prompt again).

**Q104. What happens if the user denies camera access?**
`getUserMedia` rejects with `NotAllowedError`. You must catch it and explain how to re-enable, because a bare failure looks like a broken app.

**Q105. Name the `getUserMedia` error types.**
`NotAllowedError` (denied), `NotFoundError` (no device), `NotReadableError` (hardware in use by another app), `OverconstrainedError` (constraints unsatisfiable), `AbortError`. Handling them distinctly is the difference between a usable and a frustrating product.

---

## Section D — Architecture and rapid-fire (Q106–150)

**Q106. How would you restructure your `components/` folder?**
It's grouped by page (`CourseView/`, `QuizView/`, `SignIn/`), which works but means nothing is shared. A `components/ui/` for genuinely shared primitives plus feature folders is the usual evolution.

**Q107. `SignIn/` and `SignUp/` have near-duplicate components (`StatsGrid`, `LeftSidebar`, `BackgroundBlur`, `BrandHeader`, `FeatureList`, `GlobalStyles`). What would you do?**
Extract a shared `AuthLayout`. **Being asked to spot duplication in your own tree and doing it immediately is a good sign.** The counterargument — duplication is cheaper than the wrong abstraction — is worth stating too, but six duplicated components across two pages is past that line.

**Q108. What is a design system and would you build one?**
A shared set of tokens and primitives. For a solo project, Tailwind's config *is* your design system; a component library is over-engineering until multiple people build screens.

**Q109. How do you decide component granularity?**
Split when a piece is reused, when it has its own state, or when the parent exceeds comfortable reading length. Don't split purely to reduce line count — that produces prop-drilling soup.

**Q110. Container vs presentational components — still relevant?**
Less so since hooks, because a custom hook extracts the logic without needing a wrapper component. The modern version is "custom hooks for logic, components for markup" — which is exactly the `useWebRTCBroadcast` refactor for `LiveClassRoom`.

**Q111. Write me the signature of that hook.**
```js
function useWebRTCBroadcast({ liveClassId, socket }) {
  // owns: cameraStreamRef, screenStreamRef, peerConnsRef, screenSendersRef
  return { start, stop, startScreenShare, stopScreenShare, viewers, isLive };
}
```
Being able to define the *interface* is what shows you understand the decomposition.

**Q112. How do you share logic between components?**
Custom hooks. HOCs and render props are the pre-hooks patterns and are mostly legacy now.

**Q113. What makes a good custom hook?**
It encapsulates a concern, has a clear return shape, handles its own cleanup, and doesn't leak implementation details. `useAuth` is a minimal example.

**Q114. How do you test React components?**
React Testing Library — query by accessible role and text, interact with `userEvent`, assert on what the user sees. The philosophy is to test behaviour, not implementation.

**Q115. Why not shallow rendering or testing state directly?**
Because those assert implementation. A refactor that preserves behaviour should not break tests.

**Q116. What would you test first in your app?**
The auth flow, the quiz submission flow, and the sequential-assignment blocking UI. **You currently have zero frontend tests — say so plainly.**

**Q117. How would you test the WebRTC component?**
Mock `RTCPeerConnection` and `navigator.mediaDevices` and assert on the signalling calls made. The media itself can't be unit tested.

**Q118. What is Playwright and would you use it?**
A cross-browser E2E framework. Yes — one smoke test covering login → open course → submit assignment would catch entire classes of breakage that unit tests miss. It also supports fake media devices (`--use-fake-device-for-media-stream`), which makes live-class E2E actually feasible.

**Q119. What's the flakiness risk with E2E and how do you manage it?**
Timing. Use auto-waiting assertions (Playwright's default) rather than fixed sleeps, isolate test data per run, and run against a deterministic backend.

**Q120–150. Rapid-fire.**

**Q120.** *What does `key` do on a fragment?* — `<React.Fragment key={x}>` is the only fragment form that takes a key; `<>` can't.
**Q121.** *Can you return multiple elements?* — Yes, via fragments or an array with keys.
**Q122.** *What is `children`?* — A prop holding nested JSX. Composition's primary mechanism.
**Q123.** *What are portals for?* — Rendering into a DOM node outside the parent hierarchy. Modals and tooltips, to escape `overflow: hidden` and stacking contexts.
**Q124.** *Does a portal break event bubbling?* — No — React events propagate through the React tree, not the DOM tree. A common surprise.
**Q125.** *What is `forwardRef` and is it still needed?* — Passing a ref to a child's DOM node. In React 19, `ref` is a normal prop for function components, so it's largely unnecessary.
**Q126.** *What is `useImperativeHandle`?* — Customises what a parent gets via a ref. Use sparingly — it's an escape hatch from declarative flow.
**Q127.** *What is prop drilling and when is it fine?* — Passing props through intermediate components. Fine for two or three levels; past that use context or composition.
**Q128.** *Why is mutating state directly a bug?* — React compares by reference; mutating means the reference is unchanged so no re-render is scheduled.
**Q129.** *How do you update nested state immutably?* — Spread each level, or use Immer.
**Q130.** *What is `flushSync`?* — Forces a synchronous re-render, opting out of batching. Needed rarely, e.g. before measuring the DOM.
**Q131.** *What is `useId` for?* — Stable unique IDs for accessibility attributes that match between server and client.
**Q132.** *What is `useSyncExternalStore`?* — Subscribing to external state safely under concurrent rendering. It's what state libraries use internally.
**Q133.** *What is tearing?* — Different parts of one render seeing different values of external state. `useSyncExternalStore` prevents it.
**Q134.** *What are the React event system basics?* — Delegated at the root container (since 17), with a synthetic event wrapping the native one.
**Q135.** *How do you access the native event?* — `e.nativeEvent`.
**Q136.** *`onChange` in React vs the DOM?* — React's `onChange` behaves like the DOM's `input` event — firing on every keystroke, not on blur.
**Q137.** *How do you prevent a form's default submit?* — `e.preventDefault()` in the handler.
**Q138.** *What is a ref callback?* — A function passed as `ref`, called with the node on mount and `null` on unmount. In React 19 it can return a cleanup function.
**Q139.** *Why does an inline ref callback fire twice per update?* — A new function identity each render means React detaches and reattaches. Use `useCallback` if that matters.
**Q140.** *What is `dangerouslySetInnerHTML` and when is it acceptable?* — Rendering raw HTML. Acceptable only with sanitised content (DOMPurify).
**Q141.** *How does `react-markdown` avoid it?* — It parses to an AST and renders React elements, never raw HTML, unless `rehype-raw` is added.
**Q142.** *What is `remark-gfm`?* — GitHub Flavored Markdown support: tables, strikethrough, task lists, autolinks. Syntax only — no HTML injection risk.
**Q143.** *What is Recharts built on?* — SVG via D3 utilities. Renders a lot of DOM nodes, so large datasets need downsampling.
**Q144.** *How would you optimise a chart with 10,000 points?* — Downsample before rendering (LTTB algorithm), or switch to a canvas-based library.
**Q145.** *What is `aria-live` for?* — Announcing dynamic content to screen readers. `polite` waits for a pause; `assertive` interrupts. Your chat and subtitles need it.
**Q146.** *What's the difference between `visibility: hidden`, `display: none` and `opacity: 0` for a11y?* — The first two remove from the accessibility tree; `opacity: 0` does not, so it stays focusable and readable — a common a11y bug.
**Q147.** *What is a stacking context and what creates one?* — A z-index scope. Created by `position` + `z-index`, `transform`, `opacity < 1`, `filter`, `will-change` and others. The usual cause of "my modal is behind something".
**Q148.** *What is layout thrashing?* — Interleaving DOM reads and writes so the browser recalculates layout repeatedly. Batch reads then writes.
**Q149.** *Which CSS properties are cheap to animate?* — `transform` and `opacity`, because they're composited and skip layout and paint.
**Q150.** *Biggest frontend lesson from this project?* — *"That a component's size is a symptom, not the disease. `LiveClassRoom` is 1,944 lines because I never separated the WebRTC state machine from the rendering, and once the two are tangled, every change touches both. Extracting the peer lifecycle into a hook is the fix, and I'd do it before adding another feature."*

---

*Next: [Chapter 12 — Distributed Job Scheduler](12-QA-DISTRIBUTED-JOB-SCHEDULER.md)*
