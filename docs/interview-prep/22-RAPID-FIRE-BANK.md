# Chapter 22 — Rapid-Fire Bank (600+ one-line Q&A)

> **Use this in the last 24 hours only.** One-line questions, one-line answers. If an answer surprises you, go back to the full chapter — don't try to learn it from here.

---

## A — Your projects (1–60)

1. SmartClass in one line? — MERN LMS with WebRTC live classes and a Claude-backed AI layer.
2. Backend framework? — Express 5 on Node 20+, ESM throughout.
3. Why `buildApp()`? — Returns the app without `listen()` so Supertest can drive it without binding a port.
4. Database? — MongoDB with Mongoose, 15 collections.
5. Real-time transport? — Socket.IO 4, attached to the same HTTP server.
6. Three Socket.IO rooms? — `user:<id>`, `course:<id>`, `liveclass:<id>`.
7. Media topology? — Star-topology mesh, not an SFU.
8. Who encodes? — The teacher's browser, once per viewer.
9. Mesh ceiling? — About 4–6 students on a typical home uplink.
10. STUN servers? — Google's public ones, from `VITE_STUN_SERVERS`.
11. TURN? — None. 8–15% of users can't connect.
12. Auth mechanism? — JWT in an httpOnly cookie, 7-day expiry, HS256.
13. OTP generation? — `crypto.randomInt(100000, 999999)`.
14. OTP storage? — In-memory Map with a 5-minute `setTimeout`.
15. Password hashing? — bcrypt, cost 10, in a `pre('save')` hook.
16. Why the `isModified` guard? — Otherwise every save re-hashes the hash.
17. Biggest security bug? — Identity read from the request body instead of `req.user`.
18. Second biggest? — The Google OAuth `isAccessToken` branch trusts client-supplied email.
19. Third? — Socket.IO takes `userId` from the handshake query, unverified.
20. Why didn't tests catch it? — Every test is a happy path with correct IDs.
21. Sequential assignments? — `order` field; can't submit N+1 if N is unsubmitted and not overdue.
22. Why the due-date escape? — Otherwise one missed assignment locks the whole course.
23. Quiz scoring? — Server-side, comparing `selectedOption` to `correctOption`.
24. Why server-side? — The client can't be trusted for anything determining an outcome.
25. File uploads? — Multer memory storage → Cloudinary.
26. The exception? — Recordings, which go to ephemeral local disk. That's a bug.
27. AI provider? — Anthropic Claude via `@anthropic-ai/sdk`.
28. Number of AI tools? — 7, plus chat and the agent.
29. Agent iteration cap? — 10.
30. Why cap it? — Cost and runaway loops; each iteration is a paid call.
31. `stop_reason` values handled? — `end_turn` and `tool_use`; others `break`.
32. Tool errors? — Returned to the model as tool results, not thrown.
33. Subtitle pipeline? — Browser Web Speech API → relay raw → Claude grammar fix → re-broadcast.
34. Bug in it? — No sequence numbers, so corrections can arrive out of order.
35. Test framework? — Vitest + Supertest + mongodb-memory-server.
36. Test count? — 74 across 6 files.
37. How is OTP tested? — A Nodemailer mock scrapes it from the email HTML.
38. Why the anchored regex? — Hex colour codes in inline styles would match a bare `\d{6}`.
39. What's untested? — Sockets, AI, the entire frontend, authorisation negatives.
40. CI? — GitHub Actions: backend on Node 20/22 matrix, frontend lint + build.
41. Why `npm ci`? — Exact lockfile install, fails on drift, faster.
42. Frontend? — React 19, Vite 8, Tailwind 4, React Router 7.
43. State management? — Context (Auth, Theme). No Redux.
44. Biggest component? — `LiveClassRoom.jsx`, 1,944 lines.
45. Why refs for peer connections? — They're not render state; mutating them shouldn't re-render.
46. Deployment? — Vercel (frontend) + Azure App Service (API).
47. What breaks at 2 instances? — `broadcasters` Map, `otpStore`, Socket.IO rooms.
48. Fix? — Redis for the first two, `@socket.io/redis-adapter` for the third.
49. Scheduler language? — Go, with PostgreSQL and Redis.
50. Claim mechanism? — `SELECT ... FOR UPDATE SKIP LOCKED`.
51. Worker count? — 50.
52. Exactly-once? — Claiming only. Execution is at-least-once with idempotent handlers.
53. Retry policy? — Exponential backoff with jitter, capped, then dead-letter.
54. Why jitter? — Prevents a synchronised thundering herd on a recovering downstream.
55. Recovery? — Heartbeat plus a reaper that re-queues stale `running` rows.
56. Reaper failure mode? — Split brain — a stalled worker resumes after reaping.
57. Mitigation? — Fencing tokens (version-checked completion writes).
58. Rate limiter? — Redis, atomic via `INCR`+`EXPIRE` or Lua.
59. Why Postgres not Kafka? — Transactional coupling; avoids the dual-write problem.
60. Cron handling? — A materialiser inserts the next occurrence as a pending row.

---

## B — Node.js and JavaScript (61–130)

61. Event loop phases? — timers, pending, idle/prepare, poll, check, close.
62. `setTimeout(0)` vs `setImmediate` in an I/O callback? — `setImmediate` first.
63. `process.nextTick` priority? — Before promise microtasks, between every phase.
64. Can `nextTick` starve the loop? — Yes, the queue drains fully before continuing.
65. Is Node single-threaded? — Your JS is; libuv has a 4-thread pool for fs/crypto/dns.
66. Does network I/O use the pool? — No, it uses epoll/kqueue/IOCP.
67. `cluster` vs `worker_threads`? — Processes sharing a socket vs threads with shared memory.
68. What blocks the loop? — Sync CPU work: big JSON, sync crypto, regex backtracking.
69. How to detect blocking? — Event loop lag via `monitorEventLoopDelay`.
70. Unhandled rejection since Node 15? — Crashes the process.
71. After an uncaught exception? — Log and exit; let the supervisor restart.
72. `Promise.all` vs `allSettled`? — Fail-fast vs always-resolve-with-statuses.
73. Backpressure? — Writable can't keep up; `write()` returns false, wait for `drain`.
74. `pipe` vs `pipeline`? — `pipeline` propagates errors and destroys streams.
75. CJS vs ESM? — `require` sync/dynamic vs `import` static/async with TLA.
76. Why no `__dirname` in ESM? — Reconstruct from `fileURLToPath(import.meta.url)`.
77. What is middleware? — `(req, res, next)` in an ordered chain.
78. Error middleware signature? — Four args. Three won't receive errors.
79. Express 5's headline change? — Rejected promises from async handlers auto-forward.
80. Why `cookieParser` before `requireAuth`? — Otherwise `req.cookies` is undefined.
81. `trust proxy`? — Reads the client IP from `X-Forwarded-For` behind a proxy.
82. Why does that matter? — IP-based rate limiting is wrong without it.
83. Graceful shutdown? — SIGTERM → stop accepting → drain → close → exit.
84. `var`/`let`/`const`? — Function-scoped hoisted / block-scoped TDZ / block-scoped no-rebind.
85. Closure? — A function plus its captured lexical environment.
86. `this` in an arrow function? — Lexically captured; no own binding.
87. Why `function` in a Mongoose hook? — Mongoose binds `this` to the document.
88. `==` vs `===`? — Coercion vs strict.
89. Falsy values? — `false 0 -0 0n "" null undefined NaN`.
90. `??` vs `||`? — Nullish only vs any falsy. `maxScore || 100` breaks on 0.
91. Shallow vs deep copy? — Spread is shallow; `structuredClone` is deep.
92. `map` vs `forEach`? — Returns a new array vs returns undefined.
93. Why is `forEach` with async a bug? — It ignores returned promises.
94. Correct pattern? — `await Promise.all(items.map(async ...))`.
95. `Map` vs object? — Any key type, ordered, `size`, no prototype collisions.
96. `Set` vs array membership? — O(1) vs O(n).
97. `WeakMap` use? — Metadata on objects without preventing GC.
98. Generator? — A pausable function producing an iterator via `yield`.
99. V8 GC? — Generational: scavenging young, mark-sweep-compact old.
100. Memory leak causes? — Unbounded caches, uncleaned listeners, timers, globals.
101. `--max-old-space-size`? — V8 old-generation heap limit.
102. `Error.cause`? — Standard error wrapping preserving the original.
103. `structuredClone` vs JSON round-trip? — Handles Dates, cycles, more types.
104. Event delegation? — One listener on an ancestor, using `event.target`.
105. Currying in Express? — `validate(schema)` returning middleware.
106. What does `type: "module"` change? — `.js` files become ESM.
107. `npm ci` vs `install`? — Exact lockfile, deletes node_modules, fails on drift.
108. Semver? — major.minor.patch; `^` allows minor, `~` allows patch.
109. What's a peer dependency? — A dependency the host app must provide.
110. Vitest vs Jest? — Vite-native, ESM-first, faster startup.
111. Supertest? — Binds the app to an ephemeral port for HTTP assertions.
112. Test double types? — Dummy, stub, spy, mock, fake.
113. Which is mongodb-memory-server? — A fake.
114. Flaky test causes? — Timing, shared state, ordering, real network.
115. How to test time? — Inject a clock or `vi.useFakeTimers()`.
116. ESLint vs Prettier? — Problems vs formatting.
117. Why format-check in CI? — Removes formatting from code review.
118. How to profile CPU in Node? — `--cpu-prof`, then DevTools or a flame graph.
119. Reading a flame graph? — Width is time; look for wide plateaus.
120. Log levels? — error/warn/info/debug; error should be actionable.
121. Logs vs metrics vs traces? — Events vs aggregates vs per-request paths.
122. `AsyncLocalStorage`? — Context propagation across async boundaries.
123. RED metrics? — Rate, Errors, Duration.
124. What's a circuit breaker? — Closed/open/half-open; fail fast on a dead dependency.
125. Idempotency key? — A client-supplied key so retries don't duplicate effects.
126. 201 vs 200? — Created (with Location) vs OK.
127. 401 vs 403? — Not authenticated vs not permitted.
128. PUT vs PATCH? — Full replace (idempotent) vs partial modify.
129. What does CORS protect? — The user's browser, not your server.
130. What triggers a preflight? — Non-simple methods, custom headers, JSON content type.

---

## C — Databases (131–210)

131. BSON vs JSON? — Binary, extra types (ObjectId, Date, Decimal128), length-prefixed.
132. ObjectId contents? — 4-byte timestamp, 5-byte random, 3-byte counter.
133. Embed or reference? — Embed if owned, co-read and bounded.
134. 16MB limit applies to? — A single document.
135. Unbounded array problem? — Document growth, rewrites, index churn.
136. MongoDB transactions? — Yes, 4.0+ on replica sets, with real costs.
137. Default write concern? — `w: "majority"` since 5.0.
138. What does majority protect? — Losing an acked write during failover.
139. Oplog? — Capped collection of idempotent ops driving replication.
140. Change streams? — Subscribable database changes built on the oplog.
141. Read from secondaries? — Yes, with stale-read risk.
142. Shard key criteria? — High cardinality, even distribution, query alignment.
143. Monotonic shard key problem? — Hot shard; all writes land on one.
144. Scatter-gather? — A query without the shard key hitting every shard.
145. CAP position of MongoDB? — CP by default.
146. PACELC? — Partition→A/C, Else→Latency/Consistency.
147. Default MongoDB indexes? — Only `_id`.
148. Missing indexes in SmartClass? — `Assignment.course`, `Submission.*`, `Course.teacher`, `Notification.user`, and more.
149. How to check? — `.explain("executionStats")`; look for `COLLSCAN`.
150. Covered query? — Answered entirely from the index; `totalDocsExamined: 0`.
151. ESR rule? — Equality, Sort, Range for compound index field order.
152. Partial index? — Indexes only documents matching a filter.
153. Sparse index? — Indexes only documents where the field exists.
154. TTL index? — Auto-deletes documents past an expiry. Perfect for notifications.
155. Multikey index? — On an array field; one entry per element.
156. Index costs? — Write amplification, storage, cache pressure.
157. Find unused indexes? — `$indexStats`.
158. WiredTiger concurrency? — Document-level via MVCC.
159. Working set? — Actively accessed data + indexes; must fit RAM.
160. `$lookup` vs `populate`? — Server-side join vs a second query stitched client-side.
161. `.lean()`? — Plain objects, no Mongoose document overhead.
162. Pipeline optimisation rule? — `$match` and `$limit` as early as possible.
163. Why paginate with a cursor? — `skip` is O(n).
164. Why doesn't `pre('save')` run on `findOneAndUpdate`? — Document vs query middleware.
165. `runValidators`? — Validators don't run on updates by default.
166. Does `unique: true` validate? — No — it creates an index; violations are error 11000.
167. `select: false`? — Excludes a field from queries by default.
168. Why `.toString()` on ObjectIds? — `===` compares references.
169. ACID? — Atomicity, Consistency, Isolation, Durability.
170. Isolation levels? — Read Uncommitted, Read Committed, Repeatable Read, Serializable.
171. Postgres default? — Read Committed.
172. Postgres Repeatable Read? — Snapshot isolation; also prevents phantoms.
173. Write skew? — Disjoint writes on overlapping reads violating an invariant.
174. What prevents it? — Serializable only.
175. Postgres Serializable implementation? — SSI, optimistic, aborts with SQLSTATE 40001.
176. MVCC? — Multiple row versions with visibility metadata; readers never block writers.
177. MVCC cost? — Dead tuples, bloat, vacuum load.
178. HOT update? — Index-free update when no indexed column changes and there's page room.
179. Why does HOT matter for a queue? — Heartbeat updates become far cheaper.
180. `FOR UPDATE`? — Row-level exclusive locks held until commit.
181. `SKIP LOCKED`? — Step over locked rows instead of waiting.
182. `NOWAIT`? — Error immediately instead of waiting.
183. Index for the claim query? — Partial on `(priority, run_at) WHERE status='pending'`.
184. Does SKIP LOCKED preserve FIFO? — No, only approximately.
185. Advisory lock use? — Ensuring a single reaper across instances.
186. `LISTEN`/`NOTIFY`? — Postgres pub/sub; not durable, so keep polling as a backstop.
187. Outbox pattern? — Write the event in the same transaction, publish separately.
188. 2PL vs 2PC? — Concurrency control within a DB vs distributed atomic commit.
189. 2PC weakness? — Blocking if the coordinator fails after prepare.
190. Saga? — Local transactions with compensating actions.
191. B-tree vs LSM? — Read-optimised in-place vs write-optimised append+compact.
192. Bloom filter? — Probabilistic set; no false negatives.
193. Clustered index? — Determines physical row order; one per table.
194. SQL clause evaluation order? — FROM→JOIN→WHERE→GROUP BY→HAVING→SELECT→ORDER BY→LIMIT.
195. `WHERE` vs `HAVING`? — Before vs after grouping.
196. `UNION` vs `UNION ALL`? — Dedupes (costly) vs doesn't.
197. Window function? — Aggregate over a partition without collapsing rows.
198. `RANK` vs `DENSE_RANK` vs `ROW_NUMBER`? — Gaps on ties / no gaps / always unique.
199. `NOT IN` with NULL? — Returns no rows. Use `NOT EXISTS`.
200. `EXISTS` vs `IN`? — Short-circuits, NULL-safe.
201. Is Redis single-threaded? — Command execution is; I/O is threaded since 6.0.
202. Why is `KEYS *` dangerous? — Blocks the whole server. Use `SCAN`.
203. RDB vs AOF? — Snapshots vs append-only command log.
204. Is Redis durable? — Not strictly; up to a second can be lost with AOF everysec.
205. Why Lua over MULTI/EXEC? — You can branch on intermediate results atomically.
206. `WATCH`? — Optimistic locking; `EXEC` fails if the key changed.
207. Eviction policy for a rate limiter? — `noeviction` or `volatile-*`.
208. Redis distributed lock flaw? — TTL expiry during a pause; needs fencing tokens.
209. Safe lock release? — Lua compare-and-delete, never plain `DEL`.
210. Streams vs Pub/Sub? — Durable with consumer groups vs fire-and-forget.

---

## D — WebRTC and real-time (211–280)

211. Three WebRTC APIs? — `getUserMedia`, `RTCPeerConnection`, `RTCDataChannel`.
212. Is signalling in the spec? — No, deliberately.
213. SDP? — Text description of codecs, transport, ICE credentials, DTLS fingerprint.
214. ICE? — Framework for finding a working path between NATed peers.
215. Candidate types? — host, srflx, relay, prflx.
216. STUN? — Tells you your public mapped address.
217. TURN? — Relays media when no direct path works.
218. TURN share of connections? — 8–15%.
219. Trickle ICE? — Send candidates as discovered rather than bundled.
220. Candidate before remote description? — `addIceCandidate` throws; queue them.
221. Symmetric NAT? — Different external port per destination; forces TURN.
222. Is WebRTC media encrypted? — Always, DTLS-SRTP, no opt-out.
223. How is MITM prevented? — DTLS fingerprint in the SDP, delivered over authenticated signalling.
224. RTP vs SRTP vs RTCP? — Media, encrypted media, control/feedback.
225. Jitter buffer? — Small delay smoothing packet arrival variation.
226. Loss recovery? — NACK, FEC, PLI/FIR keyframe requests, concealment.
227. Congestion control? — GCC/transport-cc estimating bandwidth from arrival timing.
228. Mandatory video codecs? — VP8 and H.264.
229. Audio codec? — Opus.
230. `iceConnectionState` values? — new, checking, connected, completed, disconnected, failed, closed.
231. `disconnected` vs `failed`? — Transient vs exhausted; failed needs an ICE restart.
232. ICE restart? — `createOffer({iceRestart: true})` with new credentials.
233. `onnegotiationneeded`? — Fires when tracks change and renegotiation is needed.
234. Glare? — Simultaneous offers; solved by perfect negotiation (polite/impolite).
235. `replaceTrack`? — Swap the source without renegotiation.
236. `contentHint`? — `motion` for camera, `detail` for screen share.
237. `getStats()`? — Inbound/outbound RTP, candidate pairs, codecs.
238. `qualityLimitationReason`? — Tells you if degradation is cpu or bandwidth.
239. SFU? — Server forwarding packets without decoding.
240. MCU? — Server decoding, compositing, re-encoding.
241. Mesh publisher cost? — N × bitrate.
242. SFU publisher cost? — 1 × bitrate.
243. Real SFUs? — mediasoup, Janus, Jitsi Videobridge, LiveKit, Pion.
244. Simulcast? — Publisher sends multiple quality layers; the SFU picks per subscriber.
245. SVC vs simulcast? — Layered single bitstream vs duplicated encodes.
246. Can an SFU see your media? — Yes, unless you use SFrame/insertable streams.
247. mediasoup vocabulary? — Router, Transport, Producer, Consumer.
248. Cascading SFUs? — Connecting instances so a room spans machines.
249. At 500 viewers, what changes? — It's broadcasting — use LL-HLS + CDN.
250. `MediaRecorder` output? — Usually WebM/VP8+Opus in Chromium.
251. Web Speech API support? — Chromium only in practice.
252. WebSocket handshake? — HTTP GET with Upgrade, 101 response, magic GUID hash.
253. Why mask client frames? — Prevents cache poisoning of intermediaries.
254. `ws` vs `wss`? — Plain vs TLS. Always wss in production.
255. Socket.IO additions? — Reconnection, polling fallback, rooms, acks, namespaces.
256. Can a raw WS client talk to Socket.IO? — No, it's a protocol on top.
257. Namespaces vs rooms? — Separate channels vs subsets within a namespace.
258. Default ping interval/timeout? — 25s / 20s.
259. What's lost on reconnect? — Room membership. Re-join on `connect`.
260. Socket.IO auth? — `io.use` middleware reading `handshake.auth`, not `query`.
261. Scaling Socket.IO? — Redis adapter plus sticky sessions.
262. Why sticky sessions? — The polling handshake creates per-instance state.
263. Redis adapter failure? — Cross-instance broadcasts stop silently.
264. `io.to` vs `socket.to`? — Includes vs excludes the sender.
265. Backpressure on a socket? — Per-socket buffer growth; monitor and disconnect slow clients.
266. Head-of-line blocking in WebSocket? — Yes, it's over TCP.
267. Why doesn't WebRTC use WebSocket for media? — TCP HOL blocking; late packets are worse than lost ones.
268. QUIC? — UDP-based with per-stream reliability; no cross-stream HOL blocking.
269. WebTransport? — Browser access to QUIC with streams and datagrams.
270. SSE vs WebSocket? — Server→client over HTTP with auto-reconnect vs bidirectional.
271. Chrome WebRTC debugging? — `chrome://webrtc-internals`.
272. First thing to check there? — The selected candidate pair and whether bytes are climbing.
273. nginx WebSocket config? — `proxy_http_version 1.1`, Upgrade/Connection headers, long read timeout.
274. Connections dropping every 60s? — Proxy idle timeout.
275. Echo in a call? — Missing echo cancellation, or a duplicate join.
276. Remote mute enforcement? — Impossible client-side; needs an SFU controlling forwarding.
277. Virtual background? — Segmentation on a canvas, `captureStream()` as the source.
278. Breakout rooms in a mesh? — Actually feasible, since each room is small.
279. Live polls transport? — Socket.IO, not WebRTC.
280. Connection success rate? — The single most important product metric for a video feature.

---

## E — Go (281–350)

281. Array vs slice? — Fixed-length value type vs pointer/len/cap view.
282. Append beyond capacity? — Allocates a new backing array and copies.
283. Slice aliasing bug? — `b := a[:2]; append(b, x)` overwrites `a[2]`.
284. Full slice expression? — `a[:2:2]` caps capacity, forcing allocation.
285. `make` vs `new`? — Initialises slices/maps/channels vs zeroed pointer.
286. Nil slice? — Usable — len, range, append all work.
287. Nil map? — Readable, panics on write.
288. Concurrent map access? — Runtime throw, not corruption.
289. When is `sync.Map` right? — Write-once read-many, or disjoint key sets.
290. Value vs pointer receiver? — Copy vs mutable; be consistent per type.
291. Method set rule? — `*T` has both; `T` has only value-receiver methods.
292. Interface satisfaction? — Implicit, no `implements` keyword.
293. Interface idiom? — Accept interfaces, return structs.
294. Interface value physically? — Type word + data word.
295. Nil interface gotcha? — A typed nil pointer in an interface is not `== nil`.
296. `any`? — Alias for `interface{}` since 1.18.
297. Type assertion forms? — `x.(T)` panics; `v, ok := x.(T)` doesn't.
298. Error wrapping? — `fmt.Errorf("...: %w", err)`.
299. `errors.Is` vs `As`? — Compare to a sentinel vs extract a concrete type.
300. When to panic? — Broken invariants only, not expected failures.
301. `defer` argument evaluation? — At defer time, not execution time.
302. `defer` in a loop? — Accumulates until function return; leaks handles.
303. Goroutine initial stack? — ~2KB, grows dynamically.
304. GMP? — Goroutine, Machine (thread), Processor (scheduling context).
305. Why does P exist? — Decouples parallelism from thread count; released on syscall block.
306. `GOMAXPROCS` default? — CPU count. Cgroup-aware in recent versions.
307. Is the scheduler preemptive? — Yes, asynchronously since 1.14.
308. Unbuffered channel send? — Blocks until a receiver is ready (rendezvous).
309. Nil channel? — Blocks forever; used to disable a `select` case.
310. Send on a closed channel? — Panic.
311. Who closes? — The sender, always.
312. Multiple senders? — WaitGroup then close elsewhere, or use a done channel.
313. `select` with multiple ready? — Pseudo-random, to prevent starvation.
314. Concurrency slogan? — Share memory by communicating — but a mutex is often right.
315. `WaitGroup.Add` placement? — Before starting the goroutine.
316. `sync.Once` use? — Safe lazy initialisation — the singleton race fix.
317. Double-checked locking in Go? — Still a data race; use `sync.Once`.
318. `sync.Pool`? — Reusable object free list; cleared at GC.
319. `atomic.Pointer`? — Typed atomic pointer swap, 1.19+.
320. Data race definition? — Same location, one write, no happens-before.
321. Data race vs race condition? — Memory model violation vs timing-dependent bug.
322. Race with no data race? — Mutex-protected check-then-act.
323. Race detector limitation? — Only finds races that actually execute.
324. How to gain confidence? — `-race` in CI with `-count`, plus tests that drive concurrency.
325. Happens-before sources? — Channels, mutexes, Once, WaitGroup, goroutine creation, atomics.
326. Context rules? — First param, never stored in a struct, always call cancel.
327. `WithValue` criticism? — Untyped and invisible in signatures.
328. Goroutine leak cause? — Blocked send with no receiver.
329. Fix? — Buffered channel of 1, or select on `ctx.Done()`.
330. Detecting leaks? — `NumGoroutine`, goroutine profile, `goleak`.
331. `errgroup`? — WaitGroup with error collection, derived context, `SetLimit`.
332. Semaphore pattern? — `make(chan struct{}, N)`.
333. Why `struct{}`? — Zero bytes.
334. Deadlock prevention? — Consistent lock ordering, small critical sections.
335. Finding lock contention? — `-mutexprofile`.
336. `go vet` catches? — printf mismatches, lock copying, struct tag errors.
337. `staticcheck`? — A far more thorough linter.
338. Table-driven tests? — Slice of named cases with `t.Run`.
339. Loop variable capture? — Fixed in Go 1.22; previously needed `tt := tt`.
340. Benchmark? — `for i := 0; i < b.N; i++`, with `-benchmem`.
341. `benchstat`? — Statistical comparison of benchmark runs.
342. Go fuzzing? — `f.Fuzz` with a seed corpus; ideal for parsers.
343. Ginkgo `Eventually` vs `Consistently`? — Converges vs keeps holding.
344. Profiles available? — CPU, heap, goroutine, block, mutex, threadcreate.
345. pprof exposure risk? — Info disclosure plus DoS; bind to loopback.
346. Why is importing pprof dangerous? — It registers on `DefaultServeMux`.
347. Go GC? — Concurrent tri-colour mark-sweep, non-generational, low pause.
348. `GOGC`? — Heap growth trigger, default 100.
349. `GOMEMLIMIT`? — Soft memory cap; essential in containers.
350. `CGO_ENABLED=0`? — Static binary, runs on `scratch`.

---

## F — Kubernetes and infrastructure (351–420)

351. Core Kubernetes idea? — Declarative desired state, continuously reconciled.
352. Level vs edge triggered? — Observe current state vs react to events. K8s is level.
353. Control plane components? — apiserver, etcd, scheduler, controller-manager.
354. Node components? — kubelet, kube-proxy, container runtime.
355. What talks to etcd? — Only the apiserver.
356. Request path through the apiserver? — authn → authz → mutating → validation → validating → etcd.
357. Why mutating before validating? — So defaulting and injection happen before validation.
358. Pod? — Containers sharing network and optionally volumes.
359. Deployment vs StatefulSet? — Stateless with rolling updates vs stable identity and storage.
360. DaemonSet? — One pod per node.
361. Service types? — ClusterIP, NodePort, LoadBalancer, ExternalName.
362. How does a Service route? — kube-proxy programs iptables/IPVS/eBPF DNAT rules.
363. EndpointSlice? — Scalable replacement for Endpoints.
364. Is a Secret encrypted? — Base64-encoded only, unless etcd encryption is on.
365. Requests vs limits? — Scheduler reservation vs cgroup cap.
366. QoS classes? — Guaranteed, Burstable, BestEffort.
367. Should you set CPU limits? — Contested; throttling causes latency spikes.
368. Liveness vs readiness? — Restart vs remove from endpoints.
369. Classic liveness mistake? — Checking an external dependency; outage becomes total.
370. Are namespaces a security boundary? — Not alone.
371. RBAC objects? — Role, ClusterRole, RoleBinding, ClusterRoleBinding.
372. Are there deny rules? — No, RBAC is purely additive.
373. Why is "create pods" ~ cluster admin? — Mount the host or steal the node's SA token.
374. `automountServiceAccountToken: false`? — Don't give a token to workloads that don't need one.
375. Pod Security Standards? — Privileged, Baseline, Restricted.
376. NetworkPolicy default? — Allow-all until a policy selects the pod.
377. Admission webhook risk? — In the request path; `failurePolicy: Fail` can lock you out.
378. CRD? — Custom API type with full apiserver treatment.
379. Operator? — CRD plus a controller encoding operational knowledge.
380. Controller internals? — Informer cache → workqueue of keys → workers reconcile.
381. Why enqueue keys? — Deduplication; always read latest from cache.
382. Resync purpose? — Safety net for dropped work; makes level-triggering real.
383. Finalizer? — Blocks deletion until cleanup completes.
384. Owner reference? — Enables cascading garbage collection.
385. Update conflict? — 409 on stale `resourceVersion`; retry after re-read.
386. Spec vs status? — Desired vs observed; separate subresources.
387. `observedGeneration`? — Which spec generation the status reflects.
388. envtest? — Real apiserver + etcd binaries for controller tests.
389. Fake client vs envtest? — Fast unit testing vs real API semantics.
390. Container vs VM? — Shared kernel with namespaces/cgroups vs own kernel.
391. Namespaces list? — PID, network, mount, UTS, IPC, user, cgroup, time.
392. What do cgroups do? — Limit and account CPU, memory, I/O, PIDs.
393. Dockerfile cache ordering? — Least-frequently-changing first.
394. Why multi-stage? — Keeps build tooling out of the final image.
395. distroless/scratch benefit? — Minimal attack surface, no shell.
396. Debugging distroless? — Ephemeral debug containers.
397. `CMD` vs `ENTRYPOINT`? — Default args vs the executable.
398. Why exec form? — So the process is PID 1 and receives signals.
399. `.dockerignore` importance? — Keeps `.git` and `.env` out of the image.
400. Image scanning tools? — Trivy, Grype, Docker Scout, Kubescape.
401. SBOM? — Machine-readable component inventory (SPDX/CycloneDX).
402. Cosign? — Signs images; admission policy verifies.
403. GitOps? — Desired state in git, agent reconciles the cluster.
404. Helm vs Kustomize? — Templating/packaging vs overlay patching.
405. Helm templating criticism? — Text-templating YAML is structurally unsound.
406. Terraform's role? — Provisioning infrastructure, not workloads.
407. Terraform state danger? — Source of truth; needs remote state with locking.
408. Blue-green vs canary? — Full switch vs percentage ramp.
409. Deploy order for a job system? — Workers first, so they understand new payloads.
410. `terminationGracePeriodSeconds`? — Time between SIGTERM and SIGKILL.
411. CNCF maturity levels? — Sandbox, Incubating, Graduated.
412. Kubescape's job? — Scans clusters/manifests against security frameworks.
413. Fluid's job? — Orchestrates distributed dataset caches near compute.
414. KubeStellar's job? — Multi-cluster configuration and workload binding.
415. `mountinfo` source? — `/proc/self/mountinfo`.
416. Mount propagation modes? — private, shared, slave, unbindable.
417. `filepath.Join` traversal issue? — It resolves `..` rather than rejecting it.
418. Correct confinement? — Clean, resolve, prefix-check — or `os.OpenRoot`.
419. DCO? — `Signed-off-by` certifying the right to submit.
420. Prow? — Kubernetes CI bot: `/lgtm`, `/approve`, OWNERS, tide.

---

## G — Security (421–490)

421. OWASP #1? — Broken Access Control.
422. IDOR? — Acting on an object you shouldn't, via a client-supplied reference.
423. Confused deputy? — A privileged component acting on a less-privileged caller's claim.
424. Your IDOR? — Controllers read `teacherId` from the request body.
425. Fix? — `req.user.id` everywhere, plus a validation layer that strips identity fields.
426. Your auth bypass? — Google `isAccessToken` branch trusts client-supplied email.
427. Fix? — Call Google's userinfo endpoint server-side, or delete the branch.
428. NoSQL injection? — Passing an object where a scalar is expected.
429. Defence? — Type validation at the boundary plus `express-mongo-sanitize`.
430. Mass assignment? — Passing a whole body into a model. Allowlist fields.
431. ReDoS? — Catastrophic regex backtracking.
432. XSS types? — Stored, reflected, DOM-based.
433. Does React escape by default? — Yes, except `dangerouslySetInnerHTML` and `javascript:` URLs.
434. Is `react-markdown` safe? — Yes, unless `rehype-raw` is added.
435. What does `httpOnly` buy? — Stops JS exfiltration, not abuse.
436. CSRF? — Third-party site causing an authenticated state-changing request.
437. Why are you vulnerable? — `sameSite: none` in production with no CSRF token.
438. Best fix? — Same origin + `sameSite: lax`.
439. Why do CSRF tokens work? — Same-origin policy prevents reading your responses.
440. Does Bearer auth fix CSRF? — Yes, but reopens XSS exfiltration.
441. Clickjacking defence? — `X-Frame-Options` / CSP `frame-ancestors`.
442. Is CORS a server protection? — No, it's browser-enforced user protection.
443. Wildcard + credentials? — Forbidden by spec.
444. CSP purpose? — Restricts where scripts/styles/connections may come from.
445. `unsafe-inline` problem? — Defeats CSP's main purpose.
446. Helmet? — Sets a baseline of security headers.
447. Hashing vs encryption vs encoding? — One-way / reversible with key / reversible without key.
448. Is a JWT encrypted? — No, only signed.
449. HS256 vs RS256? — Symmetric (verifier can mint) vs asymmetric.
450. `alg: none` attack? — Library honouring a header claiming no signature.
451. Hardening `jwt.verify`? — Pass `algorithms: ['HS256']` explicitly.
452. Can you revoke a JWT? — Not natively; use short expiry + refresh, denylist, or tokenVersion.
453. Refresh token rotation? — New token each refresh; reuse of an old one signals theft.
454. bcrypt cost 10 meaning? — ~2^10 iterations, ~100ms.
455. Salt vs pepper? — Per-password stored vs global secret stored separately.
456. Best modern password hash? — argon2id.
457. bcrypt's 72-byte limit? — Input beyond it is ignored.
458. OTP brute-force math? — 10^6 space, 5-min window, no cap = feasible.
459. Timing attack in your login? — Early return skips bcrypt, so non-existent users respond faster.
460. Fix? — Always compare against a dummy hash.
461. Why not `===` for secrets? — Short-circuits, leaking position via timing.
462. Correct comparison? — `crypto.timingSafeEqual`.
463. OAuth vs OIDC? — Authorisation framework vs authentication layer with ID tokens.
464. Why check the audience? — Otherwise a token for any app is accepted.
465. PKCE? — Prevents an intercepted authorisation code being redeemed.
466. Account linking risk? — Only safe if the provider verified the email.
467. Rate limiting algorithms? — Fixed window, sliding log, sliding counter, token bucket, leaky bucket.
468. Why atomic? — Read-then-write races exactly under load.
469. Rate limiting behind an LB? — Needs `trust proxy` or everyone shares a bucket.
470. Can `X-Forwarded-For` be spoofed? — Yes; only trust proxy-appended entries.
471. Redis down — fail open or closed? — Depends; have a position per endpoint.
472. SSRF target? — 169.254.169.254, the cloud metadata endpoint.
473. SSRF defence? — Allowlist, reject private ranges, re-check after redirects.
474. STRIDE? — Spoofing, Tampering, Repudiation, Info disclosure, DoS, Elevation.
475. Your realistic threat actor? — A student with legitimate credentials wanting a better grade.
476. Least privilege example? — The app's Mongo user doesn't need dbAdmin.
477. Defence in depth? — Multiple independent controls.
478. Responsible disclosure? — Private report, reasonable window, coordinated publication.
479. CVE? — Vulnerability identifier assigned by a CNA.
480. CWE for path traversal? — CWE-22.
481. Supply chain attack in npm? — Malicious postinstall or typosquatting.
482. Defences? — Lockfiles, `npm ci`, audit, pinning, `--ignore-scripts`.
483. SRI? — Hash on a CDN script so the browser rejects tampering.
484. Secret in git history? — Rotate first; rewriting history isn't enough.
485. Can you put a secret in `VITE_`? — Never; it's inlined into the client bundle.
486. TOCTOU? — State changes between check and use.
487. Where's yours? — The assignment `order` read-max-then-write race.
488. RBAC vs ABAC vs ReBAC? — Roles vs attributes vs relationships.
489. Which does your app really need? — ReBAC — "is this the teacher *of this course*".
490. Security philosophy in one line? — Assume every input is hostile and every control will fail.

---

## H — DSA and system design (491–560)

491. Hash table average/worst? — O(1) / O(n).
492. Balanced BST operations? — O(log n).
493. Heap build from array? — O(n).
494. Comparison sort lower bound? — Ω(n log n).
495. Merge sort space? — O(n).
496. Quicksort worst case? — O(n²); mitigate with a random pivot.
497. Heapsort space? — O(1), unstable.
498. Stable sort meaning? — Equal elements retain relative order.
499. Two-pointer signal? — Sorted array, or pairs, or converging from both ends.
500. Sliding window signal? — Contiguous subarray with a constraint.
501. "Exactly K" trick? — atMost(K) − atMost(K−1).
502. Monotonic stack signal? — Next/previous greater or smaller element.
503. Binary search on the answer? — Monotonic feasibility over a numeric range.
504. Floyd's cycle detection? — Slow/fast pointers.
505. Finding the cycle entry? — Reset one pointer to head after meeting.
506. Why a dummy head? — Removes head-removal special cases.
507. Validate BST correctly? — Pass down (min, max) bounds.
508. Tree recursion key idea? — Distinguish what you return from what updates the global answer.
509. Two-heap median? — Max-heap low half, min-heap high half.
510. Quickselect complexity? — O(n) average.
511. BFS use? — Unweighted shortest path.
512. Dijkstra requirement? — Non-negative weights.
513. Bellman-Ford use? — Negative weights or a hop limit.
514. Floyd-Warshall? — All-pairs, O(V³).
515. Topological sort uses? — Dependency ordering, cycle detection.
516. Union-Find complexity? — O(α(n)) with path compression + union by rank.
517. Kruskal vs Prim? — Sort edges + UF vs grow from a node with a heap.
518. DP steps? — State, recurrence, base case, order, space optimisation.
519. 0/1 vs unbounded knapsack? — Iterate weight downward vs upward.
520. Stock problems? — One state-machine family, not six problems.
521. Burst Balloons insight? — Think "last burst", not first.
522. LIS in O(n log n)? — Patience sorting with binary search.
523. Backtracking template? — choose, recurse, un-choose.
524. Word Search II optimisation? — Trie to prune branches.
525. N-Queens optimisation? — Diagonal sets for O(1) checks.
526. Interval scheduling greedy? — Sort by end time.
527. When is greedy valid? — Greedy-choice property + optimal substructure.
528. `n & (n-1)`? — Clears the lowest set bit.
529. `n & -n`? — Isolates the lowest set bit.
530. Single Number? — XOR everything.
531. LRU implementation? — Hash map + doubly linked list.
532. Design-round step 1? — Requirements. Always.
533. The question to always ask? — Read-to-write ratio.
534. 1M/day in req/s? — ~12.
535. 1B/day in req/s? — ~12,000.
536. Peak multiplier? — 2–3×.
537. Cross-continent RTT? — ~150ms.
538. SSD random read? — ~100µs.
539. Datacentre round trip? — ~500µs.
540. URL shortener ID strategy? — Pre-allocated key ranges per server.
541. 301 vs 302 for redirects? — Cached (fast, no analytics) vs not (analytics work).
542. News feed fan-out? — Hybrid: push for normal users, pull for celebrities.
543. Chat message ordering? — Server-assigned per-conversation sequence numbers.
544. Chat storage? — Wide-column, partitioned by conversation, clustered by message ID.
545. Exactly-once message delivery? — Impossible; at-least-once + client dedup.
546. Notification system key idea? — Queue between production and delivery.
547. Rate limiter for an API? — Token bucket, Redis, Lua for atomicity.
548. Live class at 10,000 viewers? — Not conferencing — LL-HLS + CDN.
549. Sandboxing untrusted code? — gVisor or Firecracker, not plain containers.
550. Dropbox key idea? — Content-addressed chunks give dedup and delta sync for free.
551. Video platform bottleneck? — CDN bandwidth cost.
552. Autocomplete? — Trie with precomputed top-k per node.
553. Search? — Inverted index with BM25 scoring.
554. Metrics system killer? — Label cardinality.
555. Ticketing concurrency? — Hold with expiry + unique constraint.
556. Consistent hashing benefit? — Only K/N keys remap when a node changes.
557. Cache stampede fix? — Mutex, probabilistic early expiry, or refresh-ahead.
558. Cache-aside vs write-through? — App manages vs writes go through the cache.
559. CAP under partition? — Choose consistency or availability.
560. Best design-round sentence? — "I built something close to this and hit exactly this wall."

---

## I — Behavioural (561–600)

561. Intro length? — 60 seconds.
562. How should it end? — With a pointer to what you want discussed.
563. Biggest intro mistake? — Naming something you can't defend.
564. Greatest weakness answer? — Over-investing in the interesting part; the boring-pass fix.
565. Failure story? — The SmartClass IDOR, and why the tests couldn't catch it.
566. Conflict story? — The maintainer wanting a minimal fix over your refactor.
567. Hardest bug? — The Kubescape race in shared cluster state.
568. Proudest work? — The path traversal fix — nobody asked, real users protected.
569. Technical decision you'd reverse? — MongoDB for SmartClass.
570. "We" or "I"? — "We" for context, "I" for action.
571. STAR ratio? — ~60% on Action.
572. CGPA question? — Own the trade-off, don't dismiss marks.
573. Why our company? — Something specific they build + your closest experience.
574. Salary question? — Deflect once, then a researched range.
575. Questions to ask? — Review culture, biggest current problem, what success looks like at 6 months.
576. Never ask? — Anything on the careers page.
577. When to say "I don't know"? — Once, early, deliberately, with a recovery plan.
578. If corrected? — "You're right, let me redo that." Never argue.
579. If you realise you were wrong earlier? — Correct it explicitly; it reads as rigour.
580. If you go blank? — Say so, go to first principles, ask for a hint after 60s.
581. Clarifying questions on a coding problem? — Exactly one, at the start.
582. Before coding? — State the approach out loud.
583. Narrate what? — Decisions, not confusion.
584. If they interrupt? — Stop immediately.
585. If they ask "and...?"? — You gave Layer 1; go to the mechanism.
586. If they ask the same thing twice? — You didn't answer it; ask which they meant.
587. Answer structure? — Direct answer → mechanism → trade-off. Then stop.
588. What makes a 9/10 answer? — Volunteering the cost of your own choice.
589. Best closing move? — Close a loop on something you fumbled earlier.
590. Never ask at the end? — "How did I do?"
591. After the interview? — Write down every question asked.
592. Number of STAR stories needed? — Eight.
593. Your strongest story? — 185 PRs, or the path traversal, depending on the role.
594. Your riskiest resume line? — The SFU claim. Fix it.
595. Second riskiest? — Unquantified "40%" and "significantly".
596. Third? — "Push notifications" when it's in-app real-time.
597. Skills to cut or justify? — Java, Redux, Next.js, TypeScript, AWS, E2E.
598. What are they really scoring? — Depth, judgement, honesty, communication.
599. Which three of those aren't about knowing more? — Judgement, honesty, communication.
600. The one rule? — Never claim a mechanism you can't explain three levels deep.

---

**That's the bank. If you can answer 500 of these without hesitation and you've fixed everything in Chapter 21, you're ready.**

Good luck.

---

*Back to: [Index](00-INDEX-AND-HOW-TO-USE.md)*
