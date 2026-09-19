# Chapter 03 — Every Diagram You Must Be Able to Draw

> **DRAW** means: from memory, on a whiteboard or a shared screen, in under 90 seconds, while talking.
>
> The single most effective move in a project discussion is to say *"let me draw it"* and then actually be able to. Candidates who draw are remembered. Candidates who describe are forgotten.

---

## 3.1 The drawing method

Whatever the system, draw in this order. It works every time and it stops you from freezing:

1. **Boxes for actors** (left to right: user → client → server → data).
2. **Arrows with protocols labelled** (HTTPS, WSS, TCP). Protocol labels are what make a diagram look engineered rather than decorative.
3. **Number the flow** ①②③ so you can talk through it linearly.
4. **Mark the boundaries** — what's in your trust domain, what's a third party, what's ephemeral.
5. **Then say the one sentence that matters:** "The interesting part is here —" and point.

Never draw everything. Draw the layer the question is about.

---

## 3.2 DIAGRAM 1 — SmartClass high-level architecture

This is the one you draw first, every time SmartClass comes up.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  CLIENTS                                     │
│                                                                              │
│   ┌────────────────────┐              ┌────────────────────┐                │
│   │  React 19 SPA      │              │  React 19 SPA      │                │
│   │  (Teacher)         │              │  (Student)         │                │
│   │  Vite · Tailwind 4 │              │  Vite · Tailwind 4 │                │
│   └────────┬───────────┘              └─────────┬──────────┘                │
└────────────┼──────────────────────────────────┼─────────────────────────────┘
             │                                   │
             │  ① HTTPS (REST, cookie: sc_token) │
             │  ② WSS   (Socket.IO)              │
             │  ③ WebRTC media  ←── P2P, never touches the server ──┐
             │                                   │                   │
             ▼                                   ▼                   │
┌─────────────────────────────────────────────────────────────────────────────┐
│                        NODE.JS BACKEND  (single process)                     │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────┐      │
│   │  Express 5  —  buildApp()  [server/app.js]                        │      │
│   │  cors(credentials) → express.json() → cookieParser()              │      │
│   │                                                                    │      │
│   │  /api/auth  /api/courses  /api/assignments  /api/quizzes          │      │
│   │  /api/live-classes  /api/enrollments  /api/notifications          │      │
│   │  /api/ai  /api/profile  /api (dashboard)                          │      │
│   │                                                                    │      │
│   │  requireAuth (JWT verify) → controller → model                    │      │
│   └──────────────────────────────────────────────────────────────────┘      │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────┐      │
│   │  Socket.IO 4  —  same httpServer, same port                       │      │
│   │  Rooms:  user:<id>   course:<id>   liveclass:<id>                  │      │
│   │  In-memory: broadcasters Map (liveClassId → socketId)             │      │
│   │  Signalling only: offer / answer / ice-candidate relay            │      │
│   └──────────────────────────────────────────────────────────────────┘      │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────┐      │
│   │  AI layer  [app/ai/]                                              │      │
│   │  llm.js   — 7 single-shot Claude calls (quiz, summarise, …)       │      │
│   │  tools.js — tool schemas                                          │      │
│   │  agent.js — tool-use loop, max 10 iterations                      │      │
│   └──────────────────────────────────────────────────────────────────┘      │
└───────┬───────────────────┬──────────────────┬───────────────┬──────────────┘
        │                   │                  │               │
        ▼                   ▼                  ▼               ▼
┌───────────────┐   ┌──────────────┐   ┌──────────────┐  ┌──────────────┐
│  MongoDB      │   │  Cloudinary  │   │ Anthropic    │  │ Gmail SMTP   │
│  (Mongoose)   │   │  files/media │   │ Claude API   │  │ Nodemailer   │
│               │   │              │   │              │  │ (OTP mail)   │
│ 15 collections│   │ materials    │   │ sonnet model │  │              │
└───────────────┘   │ submissions  │   └──────────────┘  └──────────────┘
                    │ avatars      │
                    └──────────────┘
                                         ┌──────────────┐
                                         │ Google OAuth │
                                         │ (ID token    │
                                         │  verify)     │
                                         └──────────────┘
```

### The narration that goes with it (60 seconds)

> "React SPA on the client, Express on the server, Mongo for data. Three transport channels between them and that's the part worth noticing: plain HTTPS for REST with a JWT in an HTTP-only cookie; a Socket.IO WebSocket for anything real-time — notifications, chat, presence; and then WebRTC for live-class media, which is peer to peer and never goes through my server at all. The server only brokers the handshake.
>
> On the backend, `buildApp()` is a factory that returns the Express app and the HTTP server without calling `listen`, so the test suite can drive it with Supertest without binding a port. Socket.IO attaches to the same HTTP server, same port, and upgrades from HTTP.
>
> Four external dependencies: Mongo, Cloudinary for files, the Anthropic API for the AI features, and Gmail SMTP for OTP mail."

### Follow-ups this diagram invites

- *"Why is Socket.IO on the same server as Express?"* — One port, one process, shared session/cookie context; it's an HTTP upgrade so it needs an HTTP server anyway. The cost is that scaling them together couples two very different workloads.
- *"What happens if you run two instances of this?"* — **RISK, and a great answer.** It breaks in three specific places: the `broadcasters` Map is per-process so signalling fails across instances; the OTP store is an in-memory Map so verification fails if register and verify hit different instances; and Socket.IO rooms are per-process so `emitToUser` silently misses. Fix: Redis for the OTP store and the broadcaster registry, and `@socket.io/redis-adapter` so room emits fan out across instances. **Being able to list exactly what breaks and why is a top-decile answer.**
- *"Where's your cache?"* — There isn't one. Honest answer: read volumes didn't justify it, and the first thing I'd cache is the dashboard aggregation, which is the heaviest query.

---

## 3.3 DIAGRAM 2 — The request lifecycle (single API call, end to end)

Draw this when asked "what happens when a user does X".

```
  Browser                Express                 Mongoose              MongoDB
     │                      │                        │                     │
     │ ① fetch('/api/courses/:id/assignments',       │                     │
     │    { credentials: 'include' })                │                     │
     │─────────────────────>│                        │                     │
     │   Cookie: sc_token=eyJ...                     │                     │
     │                      │                        │                     │
     │                  ② cors()  — origin allow-listed, credentials:true  │
     │                  ③ express.json() — body parsed                     │
     │                  ④ cookieParser() — req.cookies populated           │
     │                  ⑤ requireAuth()                                    │
     │                     └─ jwt.verify(token, JWT_SECRET)                │
     │                        ├─ fail → 401 ────────────────────────────>  │
     │                        └─ ok   → req.user = { id, email, role }     │
     │                      │                        │                     │
     │                  ⑥ router → controller                              │
     │                      │  getCourseAssignments(req, res)              │
     │                      │────────────────────────>                     │
     │                      │   Course.findById(courseId)                  │
     │                      │                        │────────────────────>│
     │                      │                        │<────────────────────│
     │                      │   Assignment.find({course})                  │
     │                      │       .sort({order:1, createdAt:1})          │
     │                      │                        │────────────────────>│
     │                      │                        │<────────────────────│
     │                      │<────────────────────────                     │
     │                  ⑦ format*() — strip internals, rename _id → id     │
     │                  ⑧ res.json(payload)                                │
     │<─────────────────────│                        │                     │
     │   200 { [...] }      │                        │                     │
     │                      │                        │                     │
     │                  ⑨ side-effect (on writes only):                    │
     │                      emitToCourse(courseId, 'assignment:new', ...)  │
     │                      pushNotification(studentId, msg)               │
     │                      │                        │                     │
     │<══════ WS ═══════════│  Socket.IO push to course:<id> room          │
```

### Key points to make while drawing

1. **`credentials: 'include'` is load-bearing.** Without it the browser doesn't send the cookie cross-origin, and the server must reply with `Access-Control-Allow-Credentials: true` and a *specific* origin (never `*`). This is the #1 thing that breaks in a cookie-auth SPA and it's a great thing to have debugged.
2. **Middleware order matters.** `cookieParser` must run before `requireAuth` or `req.cookies` is undefined.
3. **The `format*()` helpers are a deliberate boundary.** **CODE:** `formatAssignment`, `formatSubmission`, `formatLiveClass`. They exist so the wire format is stable even if the schema changes, and so internal fields don't leak. Call this out — it reads as API-design maturity.
4. **The real-time emit is a side effect of the write, not a separate request.** That's the whole point: the writer gets a 201, everyone else in the room gets a push.

---

## 3.4 DIAGRAM 3 — Authentication: OTP registration flow

```
 Client              Express /api/auth        otpStore (Map)      Gmail       MongoDB
   │                        │                       │               │            │
   │ POST /register         │                       │               │            │
   │ {name,email,pw,role}   │                       │               │            │
   │───────────────────────>│                       │               │            │
   │                        │ User.findOne(email)   │               │            │
   │                        │──────────────────────────────────────────────────> │
   │                        │ existing?.isVerified → 409 CONFLICT               │
   │                        │                       │               │            │
   │                        │ new User(...)  ── pre('save') hook ──> bcrypt.hash(pw, 10)
   │                        │ user.save()   (isVerified: false)                  │
   │                        │──────────────────────────────────────────────────> │
   │                        │                       │               │            │
   │                        │ crypto.randomInt(100000, 999999)      │            │
   │                        │ saveOtp(email, otp) ─>│               │            │
   │                        │     setTimeout(delete, 5 min) ────────┤            │
   │                        │                       │               │            │
   │                        │ transporter.sendMail(otp) ───────────>│            │
   │<───────────────────────│ 200 { message, email }                │            │
   │                        │                       │               │  ┌─────────┴────┐
   │  ┌── user reads mail ──────────────────────────────────────────────│ inbox        │
   │  ▼                     │                       │               │  └──────────────┘
   │ POST /verify-otp       │                       │               │            │
   │ {email, otp}           │                       │               │            │
   │───────────────────────>│ getOtp(email) ───────>│               │            │
   │                        │<── stored otp ────────│               │            │
   │                        │ null       → 400 "expired or not found"            │
   │                        │ mismatch   → 400 "Invalid OTP"                     │
   │                        │ match      → deleteOtp(email) (clears the timer)   │
   │                        │                       │               │            │
   │                        │ findOneAndUpdate({email},{isVerified:true}) ──────>│
   │                        │                       │               │            │
   │                        │ jwt.sign({id,email,role}, SECRET, 7d)             │
   │                        │ res.cookie('sc_token', token, {                    │
   │                        │    httpOnly:true, secure:isProd,                   │
   │                        │    sameSite: isProd?'none':'lax',                  │
   │                        │    maxAge: 7 days })                               │
   │<───────────────────────│ 200 { id, name, email, role }                      │
   │                        │                       │               │            │
   │ localStorage.setItem('smartclass_user', {...})  ← profile only, NOT the token
```

### The three things to say about this diagram

1. **The token is never in JavaScript's reach.** `httpOnly` means `document.cookie` cannot read it, so an XSS payload can't exfiltrate it. What *is* in `localStorage` is the non-sensitive profile (`id`, `name`, `role`) so the UI can render before any network call. **CODE:** `client/src/context/AuthContext.jsx`.
2. **`sameSite: 'none'` in production is forced by the deployment, not a preference.** The client is on Vercel and the API is on a different origin, so the cookie is cross-site; `none` requires `secure: true`. The cost is that `sameSite=none` removes the built-in CSRF protection you'd get from `lax`, which is why CSRF tokens become necessary — and currently aren't there. That's a genuine finding to volunteer (Chapter 08).
3. **RISK — the OTP store.** It's a `Map` in process memory with a `setTimeout` eviction. Three problems: it dies on restart; it breaks with more than one instance; and there is **no attempt limiting**, so a six-digit OTP with a five-minute window is brute-forceable — a million possibilities, but an attacker doing 1,000 req/s gets through a meaningful fraction of the space. Fix: Redis `SETEX otp:<email> 300 <hash>` plus an `INCR` attempt counter that invalidates after 5 tries, and a rate limit on the endpoint.

---

## 3.5 DIAGRAM 4 — WebRTC live class (the real topology)

**This is the most important diagram in the guide, because the resume claim about it is wrong.** Draw what the code actually does.

### 4a — What your code does: star-topology mesh

```
                        ┌──────────────────────┐
                        │   TEACHER BROWSER    │
                        │                      │
                        │ cameraStreamRef      │  getUserMedia
                        │ screenStreamRef      │  getDisplayMedia
                        │                      │
                        │ peerConnsRef: Map    │
                        │  viewerSocketId → PC │
                        └──┬────┬────┬────┬────┘
              ENCODE ×N ───┘    │    │    └─── one RTCPeerConnection per viewer
                          │     │    │
               ┌──────────┘     │    └──────────┐
               │           ┌────┘               │
               ▼           ▼                    ▼
        ┌───────────┐ ┌───────────┐      ┌───────────┐
        │ Student 1 │ │ Student 2 │ ···  │ Student N │
        └───────────┘ └───────────┘      └───────────┘

   Teacher upload bandwidth  =  N × bitrate      ← LINEAR. This is the limit.
   Teacher CPU (encode)      ≈  N × encode cost  (partially shared, not fully)
   Server media load         =  ZERO
```

**The one-liner:** *"The teacher's browser is the broadcaster and holds N peer connections. Media never touches my server — it only relays signalling. The cost is that the teacher's uplink scales linearly with class size, so this is a small-classroom design."*

### 4b — What an SFU would look like (draw this next, to show you know the difference)

```
        ┌───────────┐
        │  TEACHER  │  ── ONE upstream (optionally simulcast: 3 quality layers)
        └─────┬─────┘
              │
              ▼
     ┌─────────────────────────┐
     │   SFU  (mediasoup /     │   Terminates each publisher's RTP.
     │   Janus / LiveKit /     │   Forwards (does NOT decode/re-encode).
     │   Pion)                 │   Picks a simulcast layer per subscriber
     └──┬──────┬──────┬────────┘   based on their bandwidth estimate.
        │      │      │
        ▼      ▼      ▼
      ┌───┐  ┌───┐  ┌───┐
      │S1 │  │S2 │  │SN │
      └───┘  └───┘  └───┘

   Teacher upload  =  1 × bitrate   ← CONSTANT. That's the whole point.
   Server cost     =  N × forward   (bandwidth-bound, cheap CPU — no transcode)
```

### 4c — And the third option, for completeness

```
   MCU (Multipoint Control Unit): decodes all streams, composites them into
   ONE mixed stream, re-encodes, sends one stream to everyone.
   Client cost: minimal (one decode).  Server cost: very high (transcode).
   Used when clients are weak (SIP phones, legacy hardware) or you need a
   single recorded composite.
```

### The comparison table — memorise this

| | **Mesh (yours)** | **SFU** | **MCU** |
|---|---|---|---|
| Publisher uplink | N × bitrate | 1 × bitrate | 1 × bitrate |
| Server CPU | none | low (forwarding) | very high (transcode) |
| Server bandwidth | none | N × bitrate | N × bitrate |
| Latency | lowest (direct) | low (+1 hop) | highest (+transcode) |
| Client decode | N streams | N streams | 1 stream |
| Practical ceiling | ~4–8 peers | hundreds–thousands | limited by CPU |
| Per-subscriber quality | no | yes (simulcast/SVC) | yes (server decides) |
| Recording | hard (client-side) | needs a recorder | trivial (already mixed) |
| Infra cost | zero | medium | high |

### 4d — The signalling sequence (draw this when they ask "how does the connection get set up")

```
 Teacher                 Socket.IO Server                 Student
    │                          │                             │
    │ emit('broadcaster',      │                             │
    │      {liveClassId})      │                             │
    │─────────────────────────>│ broadcasters.set(id, sock)  │
    │                          │ socket.join(liveclass:<id>) │
    │                          │─── 'broadcaster-ready' ────>│
    │                          │                             │
    │                          │<─ emit('viewer',            │
    │                          │    {liveClassId,userId})    │
    │                          │   socket.join(liveclass:<id>)
    │<── 'new-viewer'          │                             │
    │    {viewerSocketId}      │                             │
    │                          │                             │
    │ makePeerForViewer(sid)   │                             │
    │  new RTCPeerConnection(ICE_CONFIG)                     │
    │  pc.addTrack(camera)     │                             │
    │  pc.addTrack(screen?)    │                             │
    │  → fires onnegotiationneeded                           │
    │  pc.createOffer()        │                             │
    │  pc.setLocalDescription(offer)                         │
    │                          │                             │
    │ emit('offer',{to:sid,offer}) ──────────────────────────>│
    │                          │  io.to(sid).emit('offer')   │  pc.setRemoteDescription
    │                          │                             │  pc.createAnswer()
    │                          │                             │  pc.setLocalDescription
    │<───────────────────── emit('answer',{to:teacherSock}) ──│
    │  pc.setRemoteDescription(answer)                       │
    │                          │                             │
    │ ═══════ ICE candidates trickle BOTH ways ══════════════│
    │ emit('ice-candidate',{to,candidate}) ──────────────────>│
    │<────────────────────── emit('ice-candidate',{to,cand}) ─│
    │  pc.addIceCandidate()    │                             │
    │                          │                             │
    │ ◄══════════ ICE connectivity checks (STUN binding) ═══► │
    │ ◄═══════════ DTLS handshake → SRTP keys ══════════════► │
    │ ◄═══════════════ MEDIA FLOWS (SRTP), P2P ═════════════► │
    │                          │                             │
    │ (server is now completely out of the media path)       │
```

**CODE:** `server/app.js` — the `broadcaster`, `viewer`, `offer`, `answer`, `ice-candidate` handlers. `client/src/pages/LiveClassRoom.jsx:226` — `makePeerForViewer`.

### The vocabulary you must have ready

| Term | One-line definition |
|---|---|
| **SDP** | Session Description Protocol — a text blob describing codecs, media directions, ICE credentials, DTLS fingerprint. Offer/answer negotiates a common subset. |
| **ICE** | Interactive Connectivity Establishment — the framework for finding a working path between two peers behind NATs. Gathers candidates, then probes pairs. |
| **STUN** | A server that tells you your public IP:port as seen from outside. Cheap. Yours: `stun:stun.l.google.com:19302`. |
| **TURN** | A relay server used when direct connectivity fails (symmetric NAT, restrictive firewalls). Expensive — it carries the media. **You have none configured.** |
| **Candidate types** | `host` (local IP), `srflx` (server-reflexive, from STUN), `relay` (from TURN), `prflx` (peer-reflexive, discovered during checks). |
| **Trickle ICE** | Sending candidates as they're discovered instead of waiting for gathering to finish. Cuts setup time significantly. |
| **DTLS-SRTP** | DTLS handshake over the established path derives the keys used to encrypt media with SRTP. WebRTC media is *always* encrypted. |
| **Simulcast** | Publisher sends the same video at multiple resolutions/bitrates; an SFU forwards the right one per subscriber. Mesh can't use this meaningfully. |
| **`onnegotiationneeded`** | Fires when tracks are added/removed and the session must be renegotiated. Your code uses it — say so. |
| **Perfect negotiation** | The polite/impolite-peer pattern that avoids glare (both sides offering at once). |

### **RISK: no TURN server**

**Q: "What percentage of your users can actually connect?"**

Honest answer: *"I only configure STUN. Published figures put the share of connections that need a TURN relay at roughly 8–15% — symmetric NATs, corporate firewalls that block UDP, some mobile carrier networks. Those users currently fail to connect at all, and my code doesn't distinguish that failure from any other. Adding coturn, or a hosted TURN, is the first thing I'd do to make this production-real. I'd also watch `pc.oniceconnectionstatechange` for `failed` and surface a real error instead of a hang."*

That answer is worth more than a working TURN server explained badly.

---

## 3.6 DIAGRAM 5 — Socket.IO room topology

```
                        ┌─────────────────────────────┐
                        │      Socket.IO Server       │
                        │                             │
   on('connection') ──> │  userId = handshake.query   │  ← RISK: unauthenticated
                        │  socket.join(`user:${id}`)  │
                        └─────────────┬───────────────┘
                                      │
      ┌───────────────────────────────┼───────────────────────────────┐
      │                               │                               │
      ▼                               ▼                               ▼
┌─────────────┐              ┌─────────────────┐            ┌──────────────────┐
│ user:<id>   │              │ course:<id>     │            │ liveclass:<id>   │
│             │              │                 │            │                  │
│ Personal.   │              │ Everyone in a   │            │ Everyone in a    │
│ Every tab / │              │ course page.    │            │ live session.    │
│ device the  │              │ Joined on       │            │ Joined on        │
│ user has.   │              │ 'join-course'.  │            │ 'join-liveclass'.│
│             │              │                 │            │                  │
│ EVENTS:     │              │ EVENTS:         │            │ EVENTS:          │
│ notification│              │ assignment:new  │            │ offer / answer   │
│   :new      │              │ assignment:     │            │ ice-candidate    │
│ assignment: │              │   updated       │            │ hand-raised /    │
│   graded    │              │ assignment:     │            │   lowered        │
│ assignment: │              │   deleted       │            │ reaction         │
│   submitted │              │ quiz:new        │            │ new-comment      │
│ live-class- │              │ material:new    │            │ new-reply        │
│   scheduled │              │                 │            │ new-question     │
│ live-class- │              │                 │            │ question-answered│
│   status    │              │                 │            │ speech:subtitle  │
│ teacher-    │              │                 │            │ screen-share-*   │
│   replied   │              │                 │            │ student-cam-on/  │
│ student-    │              │                 │            │   off            │
│   question  │              │                 │            │ class-ended      │
│ recording-  │              │                 │            │ participant-     │
│   available │              │                 │            │   joined         │
└─────────────┘              └─────────────────┘            └──────────────────┘

  emitToUser(id, ev, data)     emitToCourse(id, ev, data)    io.to(`liveclass:${id}`)
  [services/socketService.js]  [services/socketService.js]   [inline in app.js]
```

### The critical observation to volunteer

> **RISK:** *"There's a real authorisation gap here. The socket takes `userId` straight from the handshake query string — `socket.handshake.query.userId` — and joins that user's personal room with no verification. Any client can connect with someone else's user ID and receive their notifications and grades. The fix is to verify the JWT cookie in a Socket.IO middleware (`io.use`) and derive the user ID from the verified token rather than trusting the query. Same applies to `join-liveclass`, which doesn't check enrolment."*

Finding and stating this yourself is a significantly better outcome than having it found for you. It shows you read your own code critically.

---

## 3.7 DIAGRAM 6 — The AI agent loop

```
  POST /api/ai/agent  { task, context }
            │
            ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │  runAgent(task, context, maxIterations = 10)                     │
  │  [server/app/ai/agent.js]                                        │
  │                                                                  │
  │  messages = [{ role:'user', content: task + JSON(context) }]     │
  │                                                                  │
  │  ┌──────────── LOOP (iterations < maxIterations) ─────────────┐  │
  │  │                                                            │  │
  │  │  anthropic.messages.create({                               │  │
  │  │     model, max_tokens: 4096,                               │  │
  │  │     system: AGENT_SYSTEM_PROMPT,                           │  │
  │  │     tools: SMARTCLASS_TOOLS,     ← schemas from tools.js   │  │
  │  │     messages })                                            │  │
  │  │                     │                                      │  │
  │  │       ┌─────────────┴─────────────┐                        │  │
  │  │       ▼                           ▼                        │  │
  │  │  stop_reason ===            stop_reason ===                │  │
  │  │   'end_turn'                 'tool_use'                    │  │
  │  │       │                           │                        │  │
  │  │       │              push assistant message (with          │  │
  │  │       │                tool_use blocks) to history         │  │
  │  │       │                           │                        │  │
  │  │       │              for each tool_use block:              │  │
  │  │       │                 dispatchTool(name, input)          │  │
  │  │       │                   → TOOL_DISPATCH[name]            │  │
  │  │       │                   → generateQuiz / summarize /     │  │
  │  │       │                     explain / grade / schedule /   │  │
  │  │       │                     analyze / outline              │  │
  │  │       │                   → each is ITSELF a Claude call   │  │
  │  │       │                     [llm.js]                       │  │
  │  │       │                           │                        │  │
  │  │       │              push user message containing          │  │
  │  │       │                tool_result blocks (matched by      │  │
  │  │       │                tool_use_id)                        │  │
  │  │       │                           │                        │  │
  │  │       │                           └──── loop again ────────┤  │
  │  │       ▼                                                    │  │
  │  │  extract text blocks → return                              │  │
  │  │  { response, tools_used[], iterations }                    │  │
  │  └────────────────────────────────────────────────────────────┘  │
  │                                                                  │
  │  loop exhausted → "Agent reached maximum iterations…"            │
  └─────────────────────────────────────────────────────────────────┘
```

### The narration

> "It's the standard tool-use loop. I send the task with a tool registry; Claude either finishes — `stop_reason: 'end_turn'` — or asks to call tools — `stop_reason: 'tool_use'`. When it asks, I execute each requested tool, push the results back as `tool_result` blocks keyed by `tool_use_id`, and loop. The iteration cap at 10 is the safety valve — without it a confused model can loop indefinitely and each iteration is a paid API call.
>
> The nesting is the interesting bit: each of my 'tools' is itself a Claude call, because they're all prompt templates. So one agent request can be eleven API calls. That's the main cost risk and I'd cap it per user."

### Follow-ups

- *"Why must `tool_use_id` be matched?"* — The model may request several tools in one turn; the IDs are how results are paired back to requests. Mismatched IDs are an API error.
- *"What if a tool throws?"* — Your code catches it and returns `"Tool error: ..."` as the tool result, so the model can see the failure and recover. That's the right design — say so. A throw that escapes would kill the whole request.
- *"How would you make this cheaper?"* — Prompt caching on the system prompt and tool schemas, a smaller model for the simple tools, and replacing the nested LLM calls with deterministic functions where the task doesn't need a model.

---

## 3.8 DIAGRAM 7 — Deployment topology

```
  ┌──────────────┐        ┌────────────────────────────────────────┐
  │   Browser    │        │           VERCEL (edge/CDN)            │
  │              │───────>│  Static React build (vite build)       │
  │              │        │  client/dist — HTML, hashed JS/CSS     │
  └──────┬───────┘        │  vercel.json → SPA rewrite to index    │
         │                └────────────────────────────────────────┘
         │
         │  XHR + WebSocket to a DIFFERENT origin
         │  ⇒ CORS with credentials:true
         │  ⇒ cookie must be SameSite=None; Secure
         ▼
  ┌────────────────────────────────────────────────────────────────┐
  │  API HOST  (Azure App Service — see .github/workflows/          │
  │             main_smart-class.yml)                               │
  │                                                                 │
  │   node server.js                                                │
  │     connectDB()  ──────────────> MongoDB Atlas                  │
  │     buildApp() → httpServer.listen(PORT)                        │
  │       ├── Express routes                                        │
  │       └── Socket.IO (WS upgrade on the same port)               │
  │                                                                 │
  │   ⚠ SINGLE INSTANCE ASSUMED                                     │
  │      - broadcasters Map   → per-process                         │
  │      - otpStore Map       → per-process                         │
  │      - Socket.IO rooms    → per-process                         │
  │   ⚠ /uploads/recordings  → local disk, ephemeral on restart     │
  └────────────────────────────────────────────────────────────────┘

  CI:  .github/workflows/
         ci.yml            → backend matrix (Node 20, 22) + frontend lint + build
         ci-backend.yml    → backend-only
         ci-frontend.yml   → frontend-only
         main_smart-class.yml → deploy
```

### What to say

> "Frontend is a static build on Vercel's CDN. The API is a single Node process that serves both REST and the WebSocket. That's the constraint that shapes everything: three pieces of state live in process memory, so horizontally scaling this requires moving them out first. And the recording upload writes to local disk under `/uploads`, which on any container platform is ephemeral — that one's a real bug, it should go to Cloudinary like every other upload does."

**That last admission is worth volunteering.** It's a genuine inconsistency in your own code (`uploadRecording` writes to disk; everything else uses `uploadToCloudinary`), and catching your own bug live is a strong signal.

---

## 3.9 DIAGRAM 8 — MongoDB data model

```
                              ┌──────────┐
                     ┌────────│   User   │────────┐
                     │        │          │        │
          teacher ───┤        │ name     │        ├─── student
                     │        │ email ⚿  │        │
                     │        │ password │        │
                     │        │ role     │        │
                     │        │ isVerified│       │
                     │        │ googleId │        │
                     │        │ avatar   │        │
                     │        └──────────┘        │
                     ▼                            ▼
              ┌─────────────┐              ┌──────────────┐
              │   Course    │◄─────────────│  Enrollment  │
              │             │  course      │              │
              │ title       │              │ student ─────┼──> User
              │ description │              │ course       │
              │ subject     │              │ status       │
              │ teacher ────┼──> User      │ progress %   │
              │ enrolled    │              │              │
              │  Students[] │──> [User]    │ ⚿ UNIQUE     │
              └──┬──┬──┬──┬─┘              │ (student,    │
                 │  │  │  │                │   course)    │
    ┌────────────┘  │  │  └────────────┐   └──────────────┘
    ▼               ▼  ▼               ▼
┌──────────┐ ┌──────────┐ ┌─────────┐ ┌────────────┐
│ Material │ │Assignment│ │  Quiz   │ │ LiveClass  │
│          │ │          │ │         │ │            │
│ course   │ │ course   │ │ course  │ │ course     │
│ url      │ │ order ★  │ │ questions[]│ teacher   │
│ type     │ │ dueDate  │ │  question│ │ scheduledAt│
│          │ │ maxScore │ │  options[]│ status     │
│          │ │ attach[] │ │  correct │ │ type       │
└────┬─────┘ └────┬─────┘ │  Option  │ │ meetingLink│
     │            │       │  points  │ │ recordingUrl│
     ▼            ▼       │ timeLimit│ │ attendees[]│
┌──────────┐ ┌──────────┐ └────┬────┘ └──┬───┬─────┘
│Completed │ │Submission│      ▼         │   │
│ Material │ │          │ ┌──────────┐   ▼   ▼
│          │ │ student  │ │QuizResult│ ┌────────┐ ┌──────────┐
│ student  │ │ content  │ │          │ │ Class  │ │  Class   │
│ material │ │ fileUrl  │ │ quiz     │ │Comment │ │ Question │
│          │ │ score    │ │ student  │ │        │ │          │
└──────────┘ │ feedback │ │ answers[]│ │ user   │ │ student  │
             │ status   │ │ score    │ │ text   │ │ question │
             └──────────┘ │ ⚿ UNIQUE │ │ parent │ │isAnswered│
                          │(quiz,    │ │Comment │ └──────────┘
                          │ student) │ │isTeacher│
                          └──────────┘ │  Reply │
                                       └────────┘
  Standalone:
  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐
  │ Notification │  │ AIStudyPlan   │  │ AICourseOutline  │
  │ user, message│  │ student, plan │  │ teacher, outline │
  │ type, read   │  └───────────────┘  └──────────────────┘
  └──────────────┘

  ⚿ = unique index    ★ = the sequential-assignment ordering field
```

### The design question you will be asked

**Q: "You have `Course.enrolledStudents[]` AND an `Enrollment` collection. Isn't that duplicated?"**

**A (be honest, it's the right answer):** *"Yes, and it's a denormalisation I'd defend only partly. `enrolledStudents` is an embedded array for the cheap membership check — 'is this student in this course' is on the hot path for every submission and every material fetch, and having the array means one document read instead of a join. The `Enrollment` collection carries the richer per-enrolment state: status, progress percentage, timestamps. The cost is that they can drift — if a write updates one and not the other, they disagree, and MongoDB won't stop me. If I were fixing it, I'd make `Enrollment` the single source of truth and either accept the extra lookup or maintain the array through one function that owns both writes, ideally in a transaction."*

**Q: "Why is the unbounded array a problem?"** — MongoDB documents cap at 16MB, and more practically, an array that grows without bound makes the parent document grow, which causes document moves and index churn. For a course with 10,000 students the embedded array is the wrong model. Rule of thumb: embed when the child set is bounded and read with the parent; reference when it's unbounded or accessed independently.

---

## 3.10 DIAGRAM 9 — Distributed job scheduler (your Go project)

```
 ┌──────────┐  POST /jobs                ┌─────────────────────────────┐
 │  Client  │ ──────────────────────────>│  API (Go)                   │
 │  (React) │  JWT + tenant              │  - JWT auth, RBAC           │
 └──────────┘                            │  - Redis rate limit (per    │
                                         │    tenant, atomic INCR/Lua) │
                                         │  - validate + INSERT        │
                                         └──────────────┬──────────────┘
                                                        │
                                                        ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │  PostgreSQL                                                           │
  │                                                                       │
  │   jobs(id, tenant_id, type, payload, status, run_at, attempts,       │
  │        max_attempts, locked_by, locked_at, last_heartbeat_at,        │
  │        idempotency_key, created_at)                                  │
  │                                                                       │
  │   status: pending → running → succeeded                              │
  │                            ↘ failed → (retry: back to pending)       │
  │                                     ↘ dead_letter (attempts exhausted)│
  │                                                                       │
  │   INDEX (status, run_at)  ← the claim query's index                  │
  │   INDEX (tenant_id, status)                                          │
  │   UNIQUE (tenant_id, idempotency_key)                                │
  └───────────────────────┬───────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┬──────────────────┐
        ▼                 ▼                 ▼                  ▼
   ┌─────────┐       ┌─────────┐      ┌─────────┐        ┌──────────┐
   │Worker 1 │       │Worker 2 │ ···  │Worker 50│        │  Reaper  │
   └────┬────┘       └────┬────┘      └────┬────┘        └────┬─────┘
        │                 │                │                  │
        │  BEGIN;                                             │ every T seconds:
        │  SELECT id FROM jobs                                │ UPDATE jobs
        │   WHERE status='pending' AND run_at <= now()        │  SET status='pending',
        │   ORDER BY run_at                                   │      locked_by=NULL
        │   LIMIT 10                                          │  WHERE status='running'
        │   FOR UPDATE SKIP LOCKED;   ◄── the key line        │   AND last_heartbeat_at
        │  UPDATE jobs SET status='running',                  │       < now()-threshold
        │      locked_by=$worker, locked_at=now();            │
        │  COMMIT;                                            │
        │                                                     │
        │  ── execute handler (idempotent) ──                 │
        │  ── heartbeat every N s ──────────>  last_heartbeat_at = now()
        │                                                     │
        │  success → status='succeeded'                       │
        │  failure → attempts++                               │
        │            attempts < max → status='pending',       │
        │                run_at = now() + backoff(attempts)   │
        │                            + jitter                 │
        │            attempts >= max → status='dead_letter'   │
        ▼
  ┌──────────────────┐
  │  Dead-letter     │  human inspects · fixes · replays
  │  (queryable)     │
  └──────────────────┘

  Cron jobs: a separate ticker materialises the next occurrence as a
  concrete pending row at (or shortly before) its run_at.
```

**The one sentence:** *"The scheduler is a Postgres table with a state machine, and `FOR UPDATE SKIP LOCKED` is what makes fifty workers able to poll the same table without stepping on each other or blocking."*

---

## 3.11 DIAGRAM 10 — Kubernetes context (for the CNCF discussion)

```
 ┌────────────────────────── CONTROL PLANE ───────────────────────────┐
 │  kube-apiserver ── the only component that talks to etcd            │
 │       │   authn → authz (RBAC) → admission (mutating, then          │
 │       │                           validating) → persist              │
 │       ▼                                                             │
 │  etcd (state)      scheduler (pod → node)                           │
 │                    controller-manager (reconcile loops)             │
 └─────────────────────────────┬───────────────────────────────────────┘
                               │ watch / list
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
  ┌───────────┐          ┌───────────┐          ┌───────────┐
  │  Node 1   │          │  Node 2   │          │  Node N   │
  │ kubelet   │          │ kubelet   │          │ kubelet   │
  │ kube-proxy│          │ kube-proxy│          │ kube-proxy│
  │ container │          │ container │          │ container │
  │  runtime  │          │  runtime  │          │  runtime  │
  │           │          │           │          │           │
  │ ┌───────┐ │          │ ┌───────┐ │          │ ┌───────┐ │
  │ │ Pods  │ │          │ │ Pods  │ │          │ │ Pods  │ │
  │ └───────┘ │          │ └───────┘ │          │ └───────┘ │
  └───────────┘          └───────────┘          └───────────┘

  Where your work sits:
  · Kubescape   → scans manifests/clusters for misconfig + RBAC risk;
                  runs as an operator + CLI. Your fixes: path traversal in
                  handler resolution, pprof exposure, TLS config, races in
                  shared cluster state, gRPC connection reuse.
  · Fluid       → CRDs + controllers that orchestrate distributed dataset
                  caches; mounts caches into pods (hence mountinfo).
  · KubeStellar → multi-cluster: a hub holds inventory + binding policies,
                  agents on workload clusters sync down. Your work: cluster
                  import UX + backend.

  THE ONE IDEA:  declare desired state → controller reconciles actual
                 toward it, continuously, level-triggered not edge-triggered.
```

---

## 3.12 Practice drill

Set a timer. Draw each of these from memory, out loud, narrating:

| Diagram | Target time | Done? |
|---|---|---|
| SmartClass HLD (3.2) | 90s | ☐ |
| Request lifecycle (3.3) | 60s | ☐ |
| OTP auth flow (3.4) | 60s | ☐ |
| Mesh vs SFU vs MCU (3.5) | 90s | ☐ |
| WebRTC signalling sequence (3.5d) | 90s | ☐ |
| Socket.IO rooms (3.6) | 45s | ☐ |
| Agent loop (3.7) | 60s | ☐ |
| Deployment + what breaks at 2 instances (3.8) | 60s | ☐ |
| Data model (3.9) | 90s | ☐ |
| Job scheduler (3.10) | 90s | ☐ |

Repeat daily for a week. After that they are permanent.

---

*Next: [Chapter 04 — SmartClass repository walkthrough](04-SMARTCLASS-REPO-WALKTHROUGH.md)*
