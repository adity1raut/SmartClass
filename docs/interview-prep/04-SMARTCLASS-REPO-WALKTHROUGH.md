# Chapter 04 — SmartClass Repository Walkthrough

> **Purpose:** when an interviewer says *"walk me through your codebase"*, you should be able to give a tour that sounds like someone who wrote it, not someone who read it once. This chapter is that tour, file by file, with the question each file invites.
>
> **Repo:** `github.com/adity1raut/SmartClass` · 187 tracked files · Node 20+ · ESM throughout.

---

## 4.1 The 60-second tour (memorise this shape)

> "Two packages in one repo — `client/` is a React 19 SPA built with Vite, `server/` is an Express 5 API with Socket.IO on the same HTTP server.
>
> On the server, `server.js` is just a bootstrap: load env, connect Mongo, call `buildApp()`, listen. The real entry point is `app.js`, which is a factory returning `{ app, httpServer }` without calling `listen` — that's deliberate so the Vitest suite can drive it with Supertest without binding a port.
>
> Under `app/` it's a conventional layered split: `routes/` map URLs to controllers, `controllers/` hold the business logic, `models/` are the Mongoose schemas, `middleware/` is auth and file upload, `services/` is the Socket.IO emit layer and notifications, and `ai/` is the Claude integration — `llm.js` for the single-shot calls, `tools.js` for the tool schemas, `agent.js` for the tool-use loop.
>
> On the client, `pages/` are route-level components, `components/` are grouped by the page they serve, `context/` has auth and theme, and `socket.js` is a singleton Socket.IO client."

---

## 4.2 Directory structure with annotations

```
SmartClass/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                  # combined: backend matrix + frontend lint/build
│   │   ├── ci-backend.yml          # backend-only trigger
│   │   ├── ci-frontend.yml         # frontend-only trigger
│   │   └── main_smart-class.yml    # deploy (Azure App Service)
│   ├── ISSUE_TEMPLATE/{bug_report,feature_request}.md
│   └── pull_request_template.md
│
├── docs/
│   ├── architecture.png            # referenced from README
│   ├── archtecture-full.png        # (note the typo in the filename)
│   ├── request-cycle.png
│   └── interview-prep/             # ← this guide
│
├── client/                         # React 19 + Vite 8 + Tailwind 4
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json                 # SPA rewrite so deep links don't 404
│   ├── eslint.config.js            # flat config
│   └── src/
│       ├── main.jsx                # createRoot, providers
│       ├── App.jsx                 # top-level route split
│       ├── socket.js               # Socket.IO client singleton
│       ├── index.css               # Tailwind entry
│       ├── context/
│       │   ├── AuthContext.jsx     # user state, login/logout
│       │   └── ThemeContext.jsx
│       ├── routes/
│       │   ├── PublicRoutes.jsx    # signed-out routes
│       │   └── ProtectedRoutes.jsx # signed-in routes, role-switched home
│       ├── utils/
│       │   ├── api.js              # apiFetch wrapper (credentials:'include')
│       │   ├── aiUtils.js
│       │   └── aiShared.jsx
│       ├── theme/
│       │   ├── ThemeSelector.jsx
│       │   └── ThemeApplier.jsx
│       ├── pages/                  # 20 route-level pages
│       │   ├── TeacherDashboard.jsx
│       │   ├── StudentDashboard.jsx
│       │   ├── CourseView.jsx
│       │   ├── QuizView.jsx
│       │   ├── LiveClassRoom.jsx   # ★ 1,944 lines — the WebRTC core
│       │   ├── SignIn.jsx / SignUp.jsx / ProfilePage.jsx
│       │   ├── Mainpage.jsx, Features.jsx, About.jsx, Security.jsx,
│       │   │   Enterprise.jsx, TechArchitecture.jsx, Blog.jsx,
│       │   │   Privacy.jsx, Terms.jsx
│       │   └── ai/                 # 9 AI Playground pages
│       │       ├── AiChat.jsx, AiQuiz.jsx, AiSummarize.jsx,
│       │       ├── AiFeedback.jsx, AiStudyPlan.jsx, AiExplain.jsx,
│       │       ├── AiPerformance.jsx, AiCourseOutline.jsx, AiAgent.jsx
│       └── components/
│           ├── CourseView/         # 17 components for the course page
│           ├── QuizView/           # 8 components for quiz-taking
│           ├── SignIn/ SignUp/     # 12 + 8 presentational pieces
│           ├── Navbar.jsx, Footer.jsx
│
└── server/                         # Express 5 + Mongoose 9 + Socket.IO 4
    ├── server.js                   # bootstrap only
    ├── app.js                      # ★ buildApp() factory + ALL socket handlers
    ├── package.json                # type: module (ESM)
    ├── vitest.config.js
    ├── test.sh
    ├── .env.example
    ├── eslint.config.js, .prettierrc
    ├── tests/                      # 74 test cases across 6 files
    │   ├── globalSetup.js          # boots mongodb-memory-server once
    │   ├── setup.js                # mocks socketService + NodeMailer
    │   ├── helpers.js              # createTestUser, loginUser, createTestCourse
    │   ├── seed.js
    │   ├── auth.test.js            (14)
    │   ├── courses.test.js         (11)
    │   ├── assignments.test.js     (11)
    │   ├── quizzes.test.js         (12)
    │   ├── enrollments.test.js     (9)
    │   └── liveClass.test.js       (17)
    └── app/
        ├── config/
        │   ├── ConnectDB.js
        │   ├── Cloudenary.js       # (sic — typo in filename)
        │   └── NodeMailer.js
        ├── middleware/
        │   ├── auth.js             # requireAuth — JWT verify
        │   ├── documentUpload.js   # multer memory storage
        │   ├── materialUpload.js
        │   ├── recordingUpload.js  # ⚠ disk storage
        │   └── errorHandler.js
        ├── models/                 # 15 Mongoose schemas
        ├── controllers/            # 12 controllers
        ├── routes/                 # 11 routers
        ├── services/
        │   ├── socketService.js    # initIO/getIO/emitToCourse/emitToUser
        │   └── notificationService.js
        ├── ai/
        │   ├── llm.js              # 7 Claude prompt functions
        │   ├── tools.js            # tool JSON schemas
        │   └── agent.js            # agentic loop
        └── utils/
            ├── cloudinary.js, validators.js, helpers.js
```

---

## 4.3 `server/server.js` — the bootstrap

```js
import "dotenv/config";
import connectDB from "./app/config/ConnectDB.js";
import { buildApp } from "./app.js";

connectDB();
const { httpServer } = buildApp();
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

**Ten lines. That's the point.**

**Q. Why is this file so thin?**
**A.** Separation between *constructing* the app and *running* it. The construction lives in `buildApp()`, which returns without listening, so tests can import it and hand it to Supertest — Supertest binds an ephemeral port itself. If `app.js` called `listen()` at module scope, every test file that imported it would try to bind port 5000 and the second one would `EADDRINUSE`.

**DEEPER: "Why `import 'dotenv/config'` rather than `dotenv.config()`?"** — It's the side-effect import form; it runs the config at import time, before any other module in the graph reads `process.env`. With ESM, imports are hoisted and evaluated before the module body, so calling `dotenv.config()` in the body would run *after* `ConnectDB.js` had already been evaluated and possibly read `process.env.MONGO_URI` as undefined. This is a genuinely good ESM-semantics answer.

**DEEPER: "`connectDB()` isn't awaited. Is that a bug?"** — It's a race in principle: the server starts listening before Mongo is connected, so a request arriving in that window would fail. In practice Mongoose buffers operations until the connection is ready (`bufferCommands` defaults to true), so it works. The clean version is `await connectDB()` in a top-level async IIFE, or top-level await, and a readiness probe that doesn't report healthy until the DB is up. **Volunteering this is a good move.**

---

## 4.4 `server/app.js` — the factory and the socket layer

This is the most important file on the server and it does two quite different jobs, which is itself a discussion point.

### Part 1 — the Express app

```js
export function buildApp() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: [CORS_ORIGIN, "https://smart-class-ivory.vercel.app"], credentials: true },
    maxHttpBufferSize: 1e7,
  });
  initIO(io);
  // ... socket handlers ...
  app.use(cors({ origin: [...], credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
  app.use("/api/auth", authRoutes);
  // ... 9 more routers ...
  return { app, httpServer };
}
```

**Q. Why `createServer(app)` instead of `app.listen()`?**
**A.** Because Socket.IO needs an `http.Server` to attach to — it hooks the `upgrade` event to complete the WebSocket handshake. `app.listen()` creates one internally and doesn't hand it back, so you'd have no object to pass to `new Server(...)`. Creating it explicitly gives both Express and Socket.IO the same server and therefore the same port.

**Q. What is `maxHttpBufferSize: 1e7`?**
**A.** 10MB cap on a single Socket.IO message. The default is 1MB. It's raised here because some payloads (recording chunks / large text) exceed the default. The trade-off: it's also a DoS knob — a client can now make the server buffer 10MB per message. In production I'd keep the default and move large payloads to HTTP uploads instead of the socket.

**Q. Why is the CORS origin hardcoded alongside the env var?**
**A. (honest)** *"That's a shortcut — the Vercel production URL is hardcoded next to `CORS_ORIGIN` from the environment. It should be a comma-separated env var parsed into an array. It's the kind of thing that works until you add a second deployment and then silently blocks it."*

**Q. Order of `express.json()` and `cookieParser()` relative to routes?**
**A.** Both must precede the routers, because Express middleware runs in registration order and the route handlers depend on `req.body` and `req.cookies` being populated. Note that in this file the routers are registered *after* the socket handlers, but that ordering is irrelevant — socket handlers aren't Express middleware.

**Q. `express.static` on `/uploads` — any concerns?**
**A.** Two. First, it serves from local disk, which is ephemeral on a container platform — after a restart, recordings 404. Second, there's no access control: anyone with a URL can fetch any recording, including someone not enrolled in the course. Cloudinary with signed URLs (which the rest of the app uses) is the right answer for both.

### Part 2 — the Socket.IO handlers

All 25-odd socket event handlers live inline in this file. Roughly:

| Group | Events |
|---|---|
| Rooms | `join-course`, `leave-course`, `join-liveclass`, `leave-liveclass` |
| WebRTC signalling | `broadcaster`, `viewer`, `offer`, `answer`, `ice-candidate`, `broadcaster-stop`, `student-offer`, `teacher-reanswer` |
| Presence / media state | `student-cam-on`, `student-cam-off`, `screen-share-started`, `screen-share-stopped` |
| Classroom interaction | `raise-hand`, `lower-hand`, `send-reaction`, `end-class` |
| Subtitles | `speech:interim`, `speech:final`, `speech:stop` |
| Lifecycle | `disconnect` |

**Q. This file is doing a lot. How would you refactor it?**
**A. (the answer they want)** *"The socket layer should be extracted — I'd split it into `sockets/webrtc.js`, `sockets/classroom.js`, `sockets/subtitles.js`, each exporting a `register(io, socket)` function, and `app.js` would just wire them up. Right now `app.js` is both the HTTP composition root and the entire real-time layer, which means any change to signalling touches the same file as any change to middleware. It also makes the socket logic untestable in isolation — and notably, the test suite mocks `socketService` entirely, so none of these handlers are covered."*

That last sentence is the kind of self-aware observation interviewers remember.

**Q. Explain the `broadcasters` Map.**
```js
const broadcasters = new Map();   // liveClassId → broadcaster's socketId
```
**A.** It records which socket is the teacher for a given live class, so that when a student emits `viewer`, the server knows which socket to tell about the new viewer. It's cleaned up on `broadcaster-stop`, on `end-class`, and in the `disconnect` handler, which scans the map for the disconnecting socket.

**DEEPER: "What's the complexity of that disconnect scan?"** — O(number of active live classes) on *every* disconnect, because it iterates the whole map looking for a matching socket ID. Fine at this scale; the fix is a reverse index (`socketId → liveClassId`) for O(1). Good small-optimisation answer.

**DEEPER: "What happens to this Map if you restart the server mid-class?"** — Everything breaks: all sockets reconnect, but the map is empty, so the teacher must re-emit `broadcaster`. The client does reconnect handling, but the state is lost. Redis would fix it.

### Part 3 — the subtitle handler (a genuinely interesting piece)

```js
socket.on("speech:final", async ({ liveClassId, text }) => {
  socket.to(`liveclass:${liveClassId}`).emit("speech:subtitle", { text });  // raw, instantly
  const msg = await anthropic.messages.create({ /* fix grammar only */ });
  const corrected = msg.content[0]?.text?.trim();
  if (corrected && corrected !== text) {
    io.to(`liveclass:${liveClassId}`).emit("speech:subtitle", { text: corrected });
  }
});
```

**Q. Walk me through the subtitle pipeline.**
**A.** *"Speech recognition runs in the teacher's browser using the Web Speech API — `webkitSpeechRecognition`. It emits interim results continuously and final results at phrase boundaries. Interim results I relay straight through with no processing, because latency matters more than polish for live captions. Final results I relay raw first, so students never wait, and then in parallel send to Claude with a tightly-scoped prompt — fix grammar and punctuation only, don't change meaning, output only the corrected text — and re-broadcast the polished version if it differs. So the student sees the caption immediately and it silently improves a second later."*

**This is a good design and you should present it as one.** The "emit raw first, upgrade later" pattern is optimistic rendering applied to captions.

**DEEPER: "What could go wrong?"**
Be ready with all of these — it shows depth:
- **Ordering.** Two `speech:final` events in quick succession produce two async Claude calls that can resolve out of order, so an older corrected caption can overwrite a newer one. There's no sequence number. *That's a real bug in the current code.*
- **Cost.** Every final phrase is a paid API call. A 45-minute lecture is hundreds of calls. No batching, no cap.
- **No debounce or length check** — a two-word fragment triggers a full round trip.
- **`new Anthropic()` inside the handler** creates a client per event rather than reusing one.
- **Browser support.** The Web Speech API is Chromium-only in practice; Firefox and Safari users get no subtitles at all.
- **Privacy.** Classroom speech is being sent to a third-party API. That needs disclosure and, in an education context, probably consent.

Listing those unprompted is one of the strongest things you can do in a project interview.

---

## 4.5 `server/app/middleware/auth.js` — 16 lines, huge implications

```js
export function requireAuth(req, res, next) {
  const token = req.cookies?.sc_token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7) : null);
  if (!token) return res.status(401).json({ error: "Unauthorized." });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
}
```

**Q. Why accept both a cookie and a Bearer header?**
**A.** The cookie is the primary path for the browser SPA — `httpOnly` so JS can't read it, sent automatically. The Bearer fallback exists for non-browser clients: Postman during development, and any future mobile client that can't rely on cookie semantics. The cost is that supporting both means the CSRF story has to cover the cookie path specifically.

**Q. `jwt.verify` vs `jwt.decode` — difference?**
**A.** `decode` just base64-decodes the payload and does not check the signature — so it's attacker-controlled data. `verify` validates the HMAC signature against the secret and checks `exp`/`nbf`. Using `decode` for auth is a complete authentication bypass. This is a common interview question and a common real bug.

### **RISK — the big one: authentication ≠ authorisation**

`requireAuth` sets `req.user` from the verified token. **Almost no controller uses it.**

Look at what controllers actually do:

```js
// assignmentController.js — submitAssignment
const { studentId, content, fileUrl } = req.body;      // ← from the BODY

// assignmentController.js — gradeSubmission
const { score, feedback, teacherId } = req.body;        // ← from the BODY
if (submission.assignment.createdBy.toString() !== teacherId) → 403

// liveClassController.js — updateLiveClassStatus
const { status, teacherId } = req.body;                 // ← from the BODY
if (liveClass.teacher.toString() !== teacherId) → 403
```

The ownership check compares a database value against **a value the client supplied**. An authenticated student can send `teacherId` equal to the real teacher's ID and the check passes. That's **Broken Access Control / IDOR — OWASP A01**, the #1 category in the OWASP Top 10.

**Q. "I notice your controllers take `teacherId` from the request body. Talk me through that."**

**The answer (own it completely):**

> *"That's a real authorisation bug and it's the most serious problem in the codebase. The middleware verifies the JWT and puts the user on `req.user`, but the controllers then read the actor's identity out of the request body instead of from `req.user`. So the ownership checks are comparing a database value against attacker-controlled input — any authenticated user can pass someone else's ID and pass the check. It's textbook IDOR, OWASP A01.*
>
> *It happened because I built the frontend and the backend together; the client always had the IDs to hand, so passing them felt natural, and the check 'looked' like a real check. The lesson is that the identity of the actor must only ever come from a verified credential — the request body is input, not identity.*
>
> *The fix is mechanical: delete every `teacherId` / `studentId` / `userId` from the request bodies, use `req.user.id` everywhere, and add a `requireRole('teacher')` middleware for the role dimension. Then add a negative test per protected route — 'student attempts teacher action, expects 403' — because the current tests only cover the happy path, which is exactly why this survived."*

**Why this is your single best interview asset.** It demonstrates: security knowledge, honesty, root-cause analysis, understanding of *why* the tests didn't catch it, and a concrete remediation plan. Interviewers rate "found a serious bug in my own code and can explain the class of mistake" far above "wrote code with no bugs I'm aware of."

**Prepare it. Volunteer it if they haven't found it by minute 30.**

---

## 4.6 The controllers

### `authController.js` (~200 lines)

Covered in the diagrams chapter. The pieces to know:

| Function | Notes |
|---|---|
| `register` | Creates or updates a pending user, generates OTP, mails it. Returns 409 only if the existing user is *already verified* — so an unverified registration can be re-attempted. |
| `verifyOtp` | Compares against the in-memory store, marks verified, sets the cookie. |
| `resendOtp` | Replaces the OTP and resets the 5-minute timer. **No rate limit — an abuse vector and an email-cost vector.** |
| `login` | `findOne` → check `isVerified` (403 if not) → `comparePassword` → cookie. |
| `logout` | `clearCookie` with the same options (required — the options must match or the browser won't clear it). |
| `googleAuth` | Two paths: verify an ID token via `google-auth-library`, or trust a client-supplied profile when `isAccessToken` is set. |

**RISK — `googleAuth` with `isAccessToken: true`:**
```js
if (isAccessToken) {
  if (!email || !gId) return res.status(400)...
  googleId = gId; userEmail = email; ...   // ← no verification at all
}
```
An attacker can POST `{isAccessToken: true, email: "victim@x.com", googleId: "anything"}` and be issued a valid session as that user. **This is a complete authentication bypass.** The ID-token path is correct (`verifyIdToken` checks Google's signature and the audience); the access-token path trusts client input.

Have the fix ready: if you're given an access token, you must call Google's `tokeninfo`/`userinfo` endpoint server-side with that token and use *Google's* response, never the client's claims.

**Also note:** `login` uses the same error message for "no such user" and "wrong password" — that's correct (prevents user enumeration). But `register` returns 409 "Email already registered", which *does* enumerate. Worth mentioning that you know the trade-off (usability vs enumeration) exists and that the common resolution is to accept enumeration on registration but never on login.

**Also note:** timing. `if (!user || !user.password) return 401` returns immediately without running bcrypt, so a non-existent user responds measurably faster than an existing one. A timing-attack enumeration vector. Fix: always run a bcrypt compare against a dummy hash.

### `assignmentController.js` (~450 lines) — the richest controller

Functions: `createAssignment`, `getCourseAssignments`, `getAssignment`, `updateAssignment`, `deleteAssignment`, `addAttachment`, `deleteAttachment`, `submitAssignment`, `getSubmissions`, `getMySubmission`, `gradeSubmission`.

**The sequential-submission logic is the showpiece.** Walk through it:

```js
const previousAssignments = await Assignment.find({
  course: assignment.course, order: { $lt: assignment.order },
}).select("_id title order dueDate");

const completedPrevious = await Submission.find({
  assignment: { $in: prevIds }, student: studentId,
}).select("assignment");

const completedIds = new Set(completedPrevious.map(s => s.assignment.toString()));
const missing = previousAssignments.find(a => {
  const isSubmitted = completedIds.has(a._id.toString());
  const isOverdue = a.dueDate && now > a.dueDate;
  return !isSubmitted && !isOverdue;       // blocks only if unsubmitted AND still open
});
if (missing) return res.status(403).json({ error: ..., blockedBy: {...} });
```

**Q. Why the `isOverdue` escape hatch?**
**A.** Without it, one missed assignment locks a student out of the entire course permanently. The rule is "you can't skip ahead past something you could still do" — once the window closes, the sequence moves on. That's a product decision encoded in the check, and it's the detail that shows this was thought about rather than copied.

**Q. Why a `Set` for the lookup?**
**A.** O(1) membership instead of O(n) `Array.includes` inside the `find` loop, which would be O(n²). Small, but it's the kind of thing that gets noticed positively.

**Q. Two sequential queries — could that be one?**
**A.** Yes — an aggregation with `$lookup` from assignments to submissions would do it in one round trip. At the current scale (a course has maybe 20 assignments) two queries is fine and far more readable. The honest answer is "I'd measure before optimising, and at this cardinality it isn't the bottleneck."

**The error response returns `blockedBy`:**
```js
return res.status(403).json({ error: `You must submit Assignment ${missing.order}...`,
                              blockedBy: { id, title, order } });
```
This is good API design and worth pointing out: a structured field the client can act on (link straight to the blocking assignment), alongside a human message. Say *"I return a machine-readable reason, not just a string, so the UI can deep-link rather than just showing the error."*

**`deleteAssignment` re-numbering:**
```js
await Assignment.findByIdAndDelete(id);
await Submission.deleteMany({ assignment: id });
await Assignment.updateMany({ course, order: { $gt: deletedOrder } }, { $inc: { order: -1 } });
```
Three writes, not atomic. If the process dies between them you get orphaned submissions or a gap in the ordering. **Q: "How would you fix that?"** — A MongoDB multi-document transaction (requires a replica set; Atlas gives you one). Or make the system tolerant: a gap in `order` doesn't actually break the `$lt` comparison, so re-numbering is cosmetic and could be dropped entirely. That second answer — "question whether the operation is needed at all" — is the better one.

**`submitAssignment` uses upsert:**
```js
Submission.findOneAndUpdate({ assignment: id, student: studentId }, {...},
                            { upsert: true, new: true });
```
Resubmission overwrites the previous submission *and resets score and feedback to null*. **Q: "Is that right?"** — It's a product decision: it means a student can resubmit after grading and wipe their grade. Depending on the policy you'd either block resubmission after `status === 'graded'`, or keep a submission history array instead of overwriting. Volunteering this as a known limitation is better than defending it.

### `quizController.js`

The scoring loop:
```js
let score = 0;
for (const a of answers) {
  const q = quiz.questions[a.questionIndex];
  if (q && a.selectedOption === q.correctOption) score += q.points;
}
const result = await QuizResult.findOneAndUpdate({ quiz: id, student: studentId },
  { answers: gradedAnswers, score, totalPoints, submittedAt: new Date() },
  { upsert: true, new: true });
```

**Q. Where is the correct answer stored and who can see it?**
**A.** `correctOption` lives on the embedded question subdocument. **Check this carefully:** if the "get quiz" endpoint returns the full quiz document to a student, the correct answers ship to the client and are visible in DevTools. The fix is a projection that strips `correctOption` for student requests. *Go verify this in your own code before an interview — if it leaks, know it; if it's projected out, say so proudly.*

**Q. Server-side scoring — why does that matter?**
**A.** Because the client can't be trusted. Scoring on the server means a student can't submit a forged score. This is the same principle as the authorisation issue: never trust the client for anything that determines an outcome.

**Q. Time limit — how is it enforced?**
**A.** `timeLimit` is on the quiz document in minutes. If it's only enforced by a client-side timer, it isn't enforced — a student can disable JS or just POST directly after an hour. Real enforcement needs a server-recorded start time and a submission-time check. Know which one yours does.

### `dashboardController.js` — the aggregation showcase

```js
const [materialCounts, assignmentCounts, quizCounts, liveClassCounts, pendingSubmissions] =
  await Promise.all([
    Material.aggregate([{ $match: { course: { $in: courseIds } } },
                        { $group: { _id: "$course", count: { $sum: 1 } } }]),
    // ... 3 more ...
    Submission.countDocuments({ assignment: { $in: await Assignment.find(...).distinct("_id") },
                                status: "submitted" }),
  ]);
```

**Q. Why `Promise.all`?**
**A.** The five queries are independent, so running them concurrently makes the total latency equal to the slowest one rather than the sum. On five queries at ~20ms each that's 20ms instead of 100ms.

**Q. Why aggregate instead of a loop over courses?**
**A.** Avoiding N+1. Counting materials per course by looping would be one query per course; the `$group` does it in one round trip regardless of course count.

**DEEPER — the flaw:** look closely at the `pendingSubmissions` entry. There's an `await` *inside* the array passed to `Promise.all`:
```js
Submission.countDocuments({ assignment: { $in: await Assignment.find(...).distinct("_id") }, ... })
```
That inner `await` is evaluated while *building* the array, so it runs sequentially **before** `Promise.all` starts — the concurrency you wanted doesn't apply to it. Spotting this in your own code is exactly the kind of detail that impresses. The fix is to hoist the `distinct` call out and await it first, or include it as its own promise in the array.

---

## 4.7 The models

15 schemas. The ones worth discussing:

### `User.js`
```js
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};
```

**Q. Why the `isModified` guard?**
**A.** Without it, every `save()` on the document re-hashes the already-hashed password, so the user could never log in again after any profile update. This is the single most common Mongoose auth bug.

**Q. Why `!this.password`?**
**A.** Google OAuth users have no password. Hashing `undefined` would throw.

**Q. Cost factor 10 — why not higher?**
**A.** 10 is roughly 100ms on typical hardware; each +1 doubles the time. The trade is login latency and CPU vs offline-cracking resistance. 12 is the common modern recommendation. The real answer for a new system is argon2id, which is memory-hard and therefore much more resistant to GPU/ASIC attack than bcrypt.

**Q. `unique: true` on email — is that a validation?**
**A. (classic gotcha)** No. It's an *index* declaration, not a validator. Mongoose asks MongoDB to create a unique index; the enforcement is in the database and surfaces as a duplicate-key error (code 11000), not a Mongoose ValidationError. Also, `autoIndex` is disabled by default in production in some setups, so the index may not exist unless you create it deliberately.

### `Enrollment.js` and `QuizResult.js`
```js
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
quizResultSchema.index({ quiz: 1, student: 1 }, { unique: true });
```
**Q. Why compound unique indexes?**
**A.** They encode a business rule at the storage layer: one enrolment per student per course, one result per student per quiz. Application-level checks race — two concurrent requests can both pass a "does it exist" check and both insert. A unique index makes the database the arbiter, and one of the two gets a duplicate-key error. **This is the correct pattern and you should present it as a deliberate choice.**

**DEEPER: "Does field order in a compound index matter?"** — Yes, hugely, for query support: an index on `{student, course}` supports queries on `student` alone and on `{student, course}`, but not on `course` alone (the ESR rule — Equality, Sort, Range — governs how you order fields). For the *uniqueness* constraint specifically, order doesn't change what's enforced.

### `Quiz.js`
Questions are an **embedded** subdocument array, not a separate collection.

**Q. Why embed?**
**A.** Questions have no life outside their quiz, they're always read together with it, and the count is bounded (tens, not thousands). That's the textbook case for embedding: it makes the read a single document fetch with no join. If questions needed to be shared across quizzes or independently queried, referencing would be right.

---

## 4.8 The AI layer

### `llm.js`
Seven exported functions — `generateQuiz`, `summarizeMaterial`, `explainConcept`, `gradeAndFeedback`, `createStudySchedule`, `analyzePerformance`, `generateCourseOutline` — each a prompt template over a shared `callClaude(prompt, maxTokens, system)`.

**Q. Why is the client lazily initialised?**
```js
let _client = null;
function getClient() { if (!_client) _client = new Anthropic(); return _client; }
```
**A.** So importing the module doesn't require `ANTHROPIC_API_KEY` to be set. That matters for tests and for CI, where the key is a dummy. Constructing at module scope would throw at import time in any environment without a key.

**Q. Every max-token value is an env var with a default. Why?**
**A.** Different tasks need different lengths — a quiz needs 3000, a summary 1500, an outline 3500 — and max_tokens is a direct cost lever. Making them configurable means you can tune cost without redeploying.

**Q. `response.content[0].text` — what could go wrong?**
**A.** It assumes the first content block is text. If the model returns a `thinking` block or a `tool_use` block first, `.text` is `undefined` and downstream string operations throw. The robust version filters by `block.type === 'text'` and joins — which, notably, `agent.js` does correctly. Pointing out the inconsistency between your own two files is a strong detail.

### `tools.js` and `agent.js`
Covered in Chapter 03 (diagram 6) and Chapter 07 in full.

The four things to always say about the agent:
1. **The iteration cap is a safety valve** — without it, a model that keeps calling tools loops forever, and each iteration is a paid call.
2. **Tool errors are returned to the model, not thrown** — `result = "Tool error: " + err.message` lets the model see and adapt. Throwing would kill the request.
3. **Message history grows every iteration**, so token cost is superlinear in iterations — each turn resends the whole conversation.
4. **The tools are themselves LLM calls**, so one agent request can be 11+ API calls.

---

## 4.9 The client

### `socket.js` — the singleton
```js
let socket = null;
export function getSocket(userId) {
  if (!socket) socket = io(API_URL, { query: { userId }, withCredentials: true });
  return socket;
}
```
**Q. Why a singleton?**
**A.** One WebSocket per tab. If every component created its own connection you'd have a dozen sockets per user, each with its own room memberships, and every server-side emit would fan out redundantly.

**Q. The bug in this singleton:** `userId` is only used on the *first* call. If a user logs out and a different user logs in without a full page reload, the existing socket keeps the old `userId` in its handshake, so the new user sits in the old user's room. `disconnectSocket()` exists — the fix is making sure logout always calls it. Worth flagging.

### `AuthContext.jsx`
State initialised lazily from `localStorage` with a `try/catch` around the `JSON.parse` — correct, because a corrupted value would otherwise throw during render and white-screen the app.

**Q. Why is the user in `localStorage` at all if the token is in an HTTP-only cookie?**
**A.** So the UI can render the correct shell immediately on load without waiting for a `/me` round trip. It's a cache of non-sensitive display data, not a credential.

**Q. What's the risk?** — It can go stale or be tampered with. A user can edit `localStorage` to say `role: "teacher"` and the client will render the teacher dashboard. **That's a UI-only bypass, not a privilege escalation**, *provided* the server checks roles — which, per §4.5, it currently doesn't do properly. The two bugs compound: fake the role in `localStorage`, and the client sends `teacherId` in the body, and the server believes it. Being able to trace how two individually-minor issues combine into a real exploit is a genuinely senior observation.

### `ProtectedRoutes.jsx` / `PublicRoutes.jsx`
Route split on authentication, and the home route switches on `user.role`. Clean. The thing to say: *"Route guarding is a UX affordance, not a security boundary. Every protected route's data comes from an API call that must independently authorise."*

### `LiveClassRoom.jsx` — 1,944 lines

**Q. That's a very large component. Defend it.**
**A. (don't over-defend)** *"It's too big, and I'd split it. The reason it grew is that WebRTC state is genuinely entangled — peer connections, local streams, screen share senders, the subtitle recogniser and the socket handlers all have to coordinate, and splitting them naively means lifting a dozen refs into a shared context anyway. The right refactor is a `useWebRTCBroadcast` hook and a `useWebRTCViewer` hook that own the peer lifecycle and expose a small surface, leaving the component to render. The chat, questions and reactions panels are already independent and should be separate components with their own socket subscriptions."*

**Q. Why `useRef` for the peer connections rather than `useState`?**
**A.** Because they're not render state. A `RTCPeerConnection` changing doesn't need to re-render the tree, and putting it in state would trigger renders on every ICE candidate. `useRef` gives you a stable mutable box across renders. This is one of the best React questions to get right — it shows you understand what state is *for*.

**Q. `ICE_CONFIG` is built from an env var:**
```js
const ICE_CONFIG = { iceServers: (import.meta.env.VITE_STUN_SERVERS || "stun:stun.l.google.com:19302,...").split(",").map(url => ({ urls: url.trim() })) };
```
Configurable, with a sensible default. Good. The gap is that there's no TURN entry and no credentials field — TURN requires `username` and `credential`, so adding TURN means changing this shape, not just the env var.

---

## 4.10 The test suite

74 test cases across 6 files, running against `mongodb-memory-server`.

### `globalSetup.js` / `setup.js`

```js
vi.mock("../app/services/socketService.js", () => ({ initIO: vi.fn(), getIO: vi.fn(() => ({...})), emitToCourse: vi.fn(), emitToUser: vi.fn() }));
vi.mock("../app/config/NodeMailer.js", () => ({ default: { sendMail: vi.fn(async ({ html }) => {
  const match = html?.match(/>\s*(\d{6})\s*</);       // capture the OTP out of the email HTML
  if (match) global.__testOtp = match[1];
  return { messageId: "test-msg-id" };
}) } }));
```

**This is genuinely clever and you should show it off.** The email transport is mocked, and the mock *scrapes the OTP out of the email HTML* and stashes it on `global.__testOtp`, so the auth test can complete the full register → verify flow without any real email.

**Q. Why the regex `/>\s*(\d{6})\s*</` rather than `/\d{6}/`?**
**A.** The comment in the code answers it: the email template contains hex colour codes like `#374151` in inline styles, and a bare six-digit match would grab those. Anchoring on `>` and `<` matches only a text node. **That is a real bug someone hit and fixed**, and telling that story is much better than describing the regex.

**Q. Why `mongodb-memory-server` instead of mocking Mongoose?**
**A.** Because you're testing the real queries. Mocking Mongoose tests that you called a function; running against a real MongoDB tests that the query, the indexes, the unique constraints and the aggregation pipelines actually work. It's a materially higher-value test at slightly higher cost.

**Q. There's no `afterEach` cleanup — why?**
**A.** The comment says it: tests within a file share `beforeAll` state deliberately, and each file wipes collections in its own `afterAll`. The trade-off is that tests within a file are order-dependent, which is a known fragility. The alternative — wiping between every test — is slower and forces every test to build its own fixtures.

**Q. What isn't tested?**
Be honest and specific — this is a strong answer:
- The Socket.IO handlers (mocked out entirely).
- The AI layer (no tests; the key is a dummy in CI).
- The React client (zero frontend tests).
- **Authorisation negative cases** — and that's precisely why the IDOR in §4.5 survived. Every test is a happy path with correct IDs.

*"The gap in my test suite and the bug in my authorisation are the same gap"* is a sentence that will land very well.

---

## 4.11 CI/CD

`ci.yml` — three jobs:
1. **backend** — matrix on Node 20.x and 22.x, `fail-fast: false`, MongoDB binary cached keyed on the lockfile hash, `npm ci`, `npm test`, coverage uploaded as an artifact for 20.x only.
2. **frontend-lint** — ESLint + `prettier --check`.
3. **frontend-build** — `needs: frontend-lint`, so it doesn't waste a build on unformatted code.

Points worth making:
- `npm ci` not `npm install` — installs exactly the lockfile, deletes `node_modules` first, and fails if `package.json` and the lockfile disagree. Reproducible and faster.
- `ANTHROPIC_API_KEY: sk-test-ci-dummy-key` — tests must never hit a paid API. The key exists only so module initialisation doesn't fail.
- **What's missing:** no `npm audit` / Dependabot, no coverage threshold gate, no E2E, and backend lint isn't run in CI even though the script exists.

---

## 4.12 The walkthrough script (use this when they say "show me the code")

Share your screen and go in this order. Do not scroll randomly.

1. **`server/app.js`** — "this is the composition root; here's the middleware chain, here are the routers, and here's the socket layer which I'd extract."
2. **`middleware/auth.js`** — "16 lines, and here's the serious problem with how the controllers use it." *(Volunteer the IDOR here.)*
3. **`controllers/assignmentController.js` → `submitAssignment`** — "this is the piece of logic I'm happiest with." *(The sequential check.)*
4. **`ai/agent.js`** — "the tool-use loop, and why the iteration cap exists."
5. **`client/src/pages/LiveClassRoom.jsx:226`** — "`makePeerForViewer` — this is where the mesh topology lives, and it's why the SFU line on my resume is wrong."
6. **`tests/setup.js`** — "the OTP-scraping mock, and the regex bug I hit."

Six files, eight minutes, and every one of them has a story. That's a walkthrough that gets remembered.

---

*Next: [Chapter 05 — SmartClass question bank](05-QA-SMARTCLASS-CORE.md)*
