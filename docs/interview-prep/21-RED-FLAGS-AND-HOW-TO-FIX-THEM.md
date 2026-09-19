# Chapter 21 — The Honest Audit: Red Flags and How to Fix Them

> **Read this chapter first.** Everything else in this guide makes you better at answering questions. This chapter stops you from losing an interview before it starts.
>
> Every item here is something a competent interviewer will find. Your choice is whether you find it first.

---

## 21.1 Severity ranking

| # | Issue | Where | Severity | Fix time |
|---|---|---|---|---|
| 1 | "SFU-based WebRTC" — no SFU exists | Resume | **Critical** | 5 min (resume) |
| 2 | Authorisation from request body (IDOR) | Code | **Critical** | 1–2 days |
| 3 | Google OAuth `isAccessToken` auth bypass | Code | **Critical** | 1 hour |
| 4 | Unauthenticated Socket.IO rooms | Code | High | 2 hours |
| 5 | Duplicate resume bullets (Pragyaa) | Resume | High | 5 min |
| 6 | Unquantified claims ("significantly", "40%") | Resume | High | 30 min |
| 7 | "Push notifications" ≠ Web Push | Resume | Medium | 2 min |
| 8 | Skills listed without backing projects | Resume | Medium | 10 min |
| 9 | No rate limiting anywhere | Code | Medium | 3 hours |
| 10 | No CSRF defence with `sameSite=none` | Code | Medium | 3 hours |
| 11 | `client/.env` tracked in git | Repo | Medium | 10 min |
| 12 | Recordings on ephemeral local disk | Code | Medium | 1 hour |
| 13 | In-memory state blocks horizontal scaling | Code | Medium | 1 day |
| 14 | Missing indexes on every queried field | Code | Medium | 1 hour |
| 15 | Role self-assignment at registration | Code | Low-Med | 30 min |
| 16 | Late submissions never appear as "pending" | Code | Low | 15 min |
| 17 | No TURN server | Code | Low | half day |
| 18 | Two PR counts that look contradictory | Resume | Low | 2 min |

**Do items 1, 3, 5, 7, 11 and 18 tonight.** They are minutes of work and they are the ones that cost you credibility.

---

## 21.2 CRITICAL #1 — The SFU claim

### What your resume says
> *Implemented SFU-based WebRTC live classes with multi-participant video conferencing.*

### What your code does
`client/src/pages/LiveClassRoom.jsx:226` — `makePeerForViewer(viewerSocketId)` constructs one `RTCPeerConnection` per viewer, held in `peerConnsRef` (a `Map` of socket ID → connection). The teacher's browser encodes and uploads a separate stream to every student. `server/app.js` relays `offer`, `answer` and `ice-candidate` events and nothing else — **no media passes through the server.**

That is a star-topology mesh. An SFU is a *server process* that receives one stream and forwards it. Your dependency list contains no mediasoup, no Janus, no LiveKit, no Pion. There is no SFU.

### Why this is the highest-priority item
An interviewer who has touched WebRTC will ask one of: "which SFU did you use?", "how did you handle simulcast?", or "what were your SFU's scaling characteristics?" Any of those exposes it in ten seconds. And a caught overclaim doesn't just cost you that answer — it makes the interviewer re-audit everything else you said.

### The fix — replace the line

**Option A (recommended — accurate and still impressive):**
> *Built browser-to-browser WebRTC live classes with a custom Socket.IO signalling layer — per-viewer peer connections, mid-call renegotiation for screen share, and trickle ICE.*

**Option B (if you want the scaling awareness on the page):**
> *Implemented peer-to-peer WebRTC live classes (mesh topology) with custom signalling, screen sharing and live AI subtitles; documented the publisher-bandwidth limit and the SFU migration path.*

**Option C (only if you actually add one):** integrate LiveKit or mediasoup — genuinely a weekend of work for a basic version — and then the original line becomes true. This is the highest-value single piece of work you could do on this project.

### If it comes up before you've fixed it
Use the recovery script in Chapter 01 Q28 verbatim. It converts the problem into a demonstration of architectural knowledge and honesty. But **relying on the script is a worse expected outcome than fixing the line** — some interviewers stop listening the moment they catch an overclaim.

---

## 21.3 CRITICAL #2 — Authorisation from the request body

### The bug
Across `assignmentController.js`, `liveClassController.js`, `quizController.js` and others:

```js
const { teacherId } = req.body;
if (assignment.createdBy.toString() !== teacherId)
  return res.status(403).json({ error: "Only the assignment creator can..." });
```

`requireAuth` verifies the JWT and populates `req.user`. The controllers then ignore it and read the actor's identity from **the request body** — attacker-controlled input. Every ownership check compares a database value against a value the caller chose.

### The exploit
```
PATCH /api/submissions/<victim_submission_id>/grade
Cookie: sc_token=<any valid student token>
{ "score": 100, "teacherId": "<the course teacher's id, which the API publishes>" }
```
403 never fires. OWASP A01, Broken Access Control — the most common serious vulnerability in real applications.

### The fix
1. Delete every `teacherId` / `studentId` / `userId` from request bodies and query strings.
2. Use `req.user.id` everywhere.
3. Add a role middleware:
```js
export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: "Forbidden." });
```
4. Add a validation middleware whose output schema physically cannot contain identity fields (Chapter 08 Q35) — that makes the bug structurally impossible to reintroduce.
5. **Write the negative tests.** One per protected route: "wrong role attempts action → 403", "correct role, wrong owner → 403".

### The interview framing
This is, counterintuitively, your best story. Chapter 04 §4.5 has the full script. The three things it demonstrates: you understand a real vulnerability class, you found it in your own work, and you can explain *why* your tests didn't catch it — which is the actual insight.

**Volunteer it around the 30-minute mark of any project deep-dive if they haven't found it.**

---

## 21.4 CRITICAL #3 — The Google OAuth bypass

### The bug
`authController.js`, `googleAuth`:
```js
if (isAccessToken) {
  if (!email || !gId) return res.status(400).json({ error: "Missing Google user info." });
  googleId = gId;  userEmail = email;  userName = name;  picture = avatar;
}
```
When `isAccessToken` is truthy, the server takes the email and Google ID **straight from the request body with no verification** and issues a session for that user.

### The exploit
```
POST /api/auth/google
{ "isAccessToken": true, "email": "victim@example.com", "googleId": "anything" }
```
You are now logged in as the victim. No credentials, no brute force, one request.

This is worse than the IDOR because it requires no prior access at all.

### The fix
Never accept identity from the client. If you're given an access token, verify it server-side:
```js
const r = await fetch("https://www.googleapis.com/oauth2/v3/userinfo",
                     { headers: { Authorization: `Bearer ${accessToken}` } });
if (!r.ok) return res.status(401).json({ error: "Invalid Google token." });
const profile = await r.json();          // trust THIS, not req.body
if (!profile.email_verified) return res.status(401).json({ error: "Email not verified." });
```
Or simply delete the branch — the ID-token path (`verifyIdToken` with the audience check) is already correct.

### The interview value
It pairs with the IDOR as the same root cause stated twice: **identity must come from something you verified, never from something you were told.** Presenting both bugs as one lesson is stronger than presenting them as two mistakes.

---

## 21.5 HIGH #4 — Unauthenticated sockets

`server/app.js`:
```js
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) socket.join(`user:${userId}`);
```
No verification. Connect with someone else's user ID and receive their notifications, grades and teacher replies. Similarly, `join-liveclass` joins any room with no enrolment check, so anyone with a class ID can receive signalling, chat and questions — and, because the teacher's client trusts the server's `new-viewer` event, can be sent the video.

### The fix
```js
io.use((socket, next) => {
  try {
    const raw = socket.handshake.headers.cookie || "";
    const token = cookie.parse(raw).sc_token;
    socket.data.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch { next(new Error("Unauthorized")); }
});
io.on("connection", (socket) => {
  socket.join(`user:${socket.data.user.id}`);           // from the token, never the query
  socket.on("join-liveclass", async (id) => {
    if (await isEnrolled(socket.data.user.id, id)) socket.join(`liveclass:${id}`);
  });
```

---

## 21.6 HIGH #5 — The duplicate Pragyaa bullets

```
- Developed a responsive frontend with component-level code splitting, reducing load time significantly.
- Optimized frontend performance using component-level code splitting, improving load times.
```

These are the same sentence. A careful reader sees padding, and padding invites the question "what did you actually do?"

### The fix — one line becomes two distinct ones
> *- Led frontend development for the college technical festival site (≈N contributors, ≈M visitors during the event), owning architecture and review.*
> *- Cut initial bundle size ~X% via route-level code splitting; configured GitHub Actions CI/CD for build, test and deploy.*

Fill in real numbers. If you genuinely don't have them, drop the percentages and keep the specifics — "route-level code splitting" and "GitHub Actions CI/CD" are concrete claims that stand on their own.

---

## 21.7 HIGH #6 — Unquantified and unverifiable claims

Every one of these will be challenged:

| Claim | The question you'll get | What to do |
|---|---|---|
| "reducing load time significantly" | "By how much?" | Get a Lighthouse before/after, or remove the word |
| "improving UI/UX performance by 40%" | "Forty percent of what metric?" | Name the metric or reframe as UX, not performance |
| "managing 100+ clusters" | "Did you personally operate 100 clusters?" | Say it was a capability of the workflow, not your fleet |
| "185+ PRs merged" | "What's the size distribution?" | Volunteer the breakdown before being asked |
| "5,300+ lines of new tests" | "How do you keep that maintainable?" | Have the table-driven answer ready |
| "50 workers" | "Did you actually run 50?" | Say whether it was load-tested or designed-for |

**The rule: a number you can't defend is worse than no number.** Either get the measurement or change the wording.

---

## 21.8 MEDIUM #7 — "Push notifications"

Your resume says *"Integrated push notifications, OTP auth, Google OAuth, and AI-powered live subtitles."*

`notificationService.js` persists to MongoDB and emits a Socket.IO event. That's **in-app real-time notification**, not Web Push — which requires a Service Worker, the Push API, a `PushSubscription` per device, and VAPID-signed messages delivered through the browser's push service even when the tab is closed.

**Fix:** change "push notifications" → **"real-time notifications"**. Two-word change, removes an entire line of questioning.

---

## 21.9 MEDIUM #8 — Skills you can't back

From Chapter 01 §1.10, the high-risk entries:

| Skill | Problem | Action |
|---|---|---|
| **Java** | Nothing on your resume uses it | Keep only if you'll do DSA in Java or genuinely prepare it |
| **Redux** | SmartClass uses Context, not Redux | Name the project that used it, or cut |
| **Next.js** | No listed project uses it | Name the project, or cut |
| **TypeScript** | Both listed projects are plain JS/Go | Name the project, or cut |
| **AWS** | Too vague to be a claim | Replace with the specific services: "AWS (EC2, S3, IAM)" |
| **E2E Testing** | Your tests are integration (Vitest + Supertest) | Change to "Integration Testing (Vitest, Supertest)" or add a real Playwright test |

**A shorter, fully-defensible skills list interviews better than a longer one with three soft spots.** The interviewer's job is to find the soft spot, and finding one makes them doubt the rest.

---

## 21.10 MEDIUM #9–10 — No rate limiting, no CSRF defence

**Rate limiting:** nothing on `/api/auth/verify-otp` (6-digit OTP, 5-minute window, no attempt cap — do the brute-force arithmetic from Chapter 05 Q49), nothing on `resend-otp` (email bombing), nothing on `/api/ai/*` (your money).

Fix: `express-rate-limit` with a Redis store, keyed on IP and account, plus an attempt counter that invalidates the OTP after five failures.

**CSRF:** production uses `sameSite: 'none'` (forced by the cross-origin deployment), which removes the built-in protection, and there's no CSRF token, no double-submit, and no Origin check.

Fix, in order of preference: (a) serve the API and SPA from the same origin and use `sameSite: 'lax'`; (b) add Origin/Referer validation on state-changing requests — cheap and effective; (c) a CSRF token.

---

## 21.11 MEDIUM #11 — `client/.env` is tracked in git

The repository file listing shows `client/.env` as a tracked file (not just `.env.example`).

Even though `VITE_`-prefixed values are public by design — Vite inlines them into the browser bundle — committing the file is the habit that eventually commits something that isn't public.

**Fix:**
```bash
git rm --cached client/.env
echo ".env" >> client/.gitignore        # verify it's covered
git commit -m "chore: stop tracking client/.env"
```
Then check the history for anything sensitive. **If anything secret was ever committed, rotate it first** — rewriting history doesn't help once it's been pushed (Chapter 08 Q82).

---

## 21.12 MEDIUM #12 — Recordings on ephemeral disk

`liveClassController.js` → `uploadRecording` writes to local disk and stores `/uploads/recordings/<file>`, served by `express.static`. Every other upload in the codebase goes to Cloudinary via `uploadToCloudinary`.

Two problems: container filesystems are ephemeral, so recordings vanish on restart or redeploy; and `express.static` has **no access control**, so anyone with the URL can fetch any recording regardless of enrolment.

**Fix:** route recordings through `uploadToCloudinary` like everything else, with `resource_type: 'video'`, and serve signed URLs.

**Interview value:** this is an inconsistency *within your own codebase*, which makes it a great "what would you fix" answer — it shows you can audit your own work rather than only defend it.

---

## 21.13 MEDIUM #13 — In-memory state blocks scaling

Three pieces of state live in process memory:
- `broadcasters` Map in `app.js` (live class → teacher socket)
- `otpStore` Map in `authController.js`
- Socket.IO room membership

Running two instances breaks all three: signalling fails across instances, OTP verification fails if register and verify land on different instances, and `emitToUser` silently misses.

**Fix:** Redis for the first two (with TTLs), `@socket.io/redis-adapter` for the third, plus sticky sessions at the load balancer.

**Interview value: very high, as an answer rather than a problem.** "What breaks if you run two instances?" is a common question and most candidates say "nothing" or guess. Being able to name exactly three things and the fix for each is a top-decile answer (Chapter 03 §3.2).

---

## 21.14 MEDIUM #14 — Missing indexes

Indexed: `Enrollment {student, course}`, `QuizResult {quiz, student}`, `User.email`.

Not indexed but queried on every page load: `Assignment.course`, `Submission.assignment`, `Submission.student`, `Material.course`, `Quiz.course`, `Course.teacher`, `Course.enrolledStudents`, `Notification.user`, `LiveClass.course`.

Every one of those is currently a collection scan. It's invisible at your data volume and catastrophic at any real one.

**Fix:** one line per schema. `assignmentSchema.index({ course: 1, order: 1 });` and so on. Then verify with `.explain("executionStats")` that `stage` is `IXSCAN`, not `COLLSCAN`.

---

## 21.15 LOW #15–18 — The rest

**#15 Role self-assignment.** `role: role || 'student'` at registration means anyone can register as a teacher. For a real institution, teacher accounts should be provisioned or approved. Fix: force `student` at registration and add an admin promotion path, or require an invite code.

**#16 Late submissions aren't "pending".** The teacher dashboard counts `status: 'submitted'`, but a late submission gets `status: 'late'` — so late work never appears in the pending count and silently never gets graded. The root cause is a status enum doing two jobs (workflow state *and* lateness) when it should be two fields. Fix: `{ status: { $in: ['submitted', 'late'] } }`, or better, add an `isLate` boolean and keep `status` purely a workflow state.

**#17 No TURN.** 8–15% of users can't connect, and the failure is silent. Fix: coturn or a hosted TURN, with time-limited HMAC credentials (never a static password in client JS).

**#18 Two PR counts.** "185+ PRs merged across multiple projects" and "40+ merged pull requests in CNCF KubeStellar" read as inconsistent to a skimming reader. Fix: make the relationship explicit — *"185+ PRs merged across Kubescape, Fluid and KubeStellar (40+ in KubeStellar as an IFOS intern)"*.

---

## 21.16 Your rewritten resume bullets

Copy-paste ready. Fill in the bracketed numbers with real measurements.

**Pragyaa 2026 — Web Lead**
> - Led frontend development for the institute technical festival platform, owning architecture, task breakdown and review across a team of [N].
> - Reduced initial bundle size ~[X]% and first contentful paint from [A]s to [B]s (Lighthouse, throttled 4G) through route-level code splitting and asset optimisation.
> - Built GitHub Actions CI/CD covering lint, test, build and deploy, cutting release turnaround from [manual process] to a single merge.

**SmartClass**
> - Built a full-stack MERN learning platform: role-based dashboards, sequential assignment gating with due-date fallback, Cloudinary-backed uploads, and 74 integration tests against an in-memory MongoDB.
> - Implemented peer-to-peer WebRTC live classes with a custom Socket.IO signalling layer — per-viewer peer connections, mid-call renegotiation for screen share, trickle ICE, and live AI subtitles.
> - Developed an LLM feature layer on Claude's tool-use API: a bounded agent loop over 7 registered tools for quiz generation, grading feedback, study planning and performance analysis.
> - Integrated real-time notifications over Socket.IO with MongoDB persistence, email-OTP registration, and Google OAuth.

**Distributed Job Scheduler** *(already strong — one sharpening)*
> - Engineered exactly-once job claiming across 50 concurrent workers using PostgreSQL `SELECT ... FOR UPDATE SKIP LOCKED`, with idempotent handlers for at-least-once execution semantics.

That last clause — naming the distinction between claiming and execution — is a signal almost no student resume carries.

---

## 21.17 The 48-hour fix plan

**Tonight (1 hour, do all of it):**
- [ ] Rewrite the SFU line
- [ ] "push notifications" → "real-time notifications"
- [ ] De-duplicate the Pragyaa bullets
- [ ] Clarify the two PR counts
- [ ] Cut or justify every soft skills entry
- [ ] `git rm --cached client/.env`

**Tomorrow (1 day):**
- [ ] Fix `googleAuth` — delete or properly verify the `isAccessToken` branch (1 hour)
- [ ] Add Socket.IO auth middleware (2 hours)
- [ ] Replace body-supplied IDs with `req.user.id` across all controllers (4 hours)
- [ ] Add `requireRole` middleware and apply it (1 hour)

**Day after (1 day):**
- [ ] Write authorisation negative tests — one per protected route
- [ ] Add the missing indexes
- [ ] Add `express-rate-limit` to auth and AI routes
- [ ] Fix the late-submission pending count
- [ ] Route recordings to Cloudinary

Then commit it all with a clear message. **A commit history showing you found and fixed a security bug in your own project is itself an interview asset** — you can point at it.

---

## 21.18 What "honest" gets you

There is a version of this chapter where you hide all of it, hope nobody asks, and hold the line if they do. That version loses. Interviewers have seen every kind of overclaim, and the ones who care enough to check are exactly the ones whose opinion decides the offer.

The version that wins is: fix what you can fix, know precisely what you couldn't, and be the candidate who says *"that line is wrong and here's what's actually true"* before they have to ask.

Nobody expects a final-year student's project to be production-secure. They expect you to know whether it is.

---

*Next: [Chapter 18 — HR and behavioural](18-HR-AND-BEHAVIOURAL.md)*
