# Chapter 01 — Your Resume, Line by Line

> **Premise:** every line on a resume is a question you have volunteered to answer. This chapter walks your resume top to bottom and, for each line, lists the questions it invites, the model answer, and the follow-up that comes next.

---

## 1.1 Header — Contact and links

```
Aditya Raut
github.com/adity1raut | linkedin.com/in/aditya1-raut | adityaraut.me | araut7798@gmail.com | +91 92843 72614
```

**What the interviewer does with this:** opens your GitHub, in the first 30 seconds, before the call. Often while you are still introducing yourself.

### Questions this invites

**Q1. I had a look at your GitHub — walk me through what I'd find there.**

**A.** Three kinds of things. First, my open-source work, which is mostly not in my own repos — it's merged PRs in Kubescape, Fluid, and KubeStellar, all CNCF projects. Second, two systems I built end to end: a distributed job scheduler in Go, and SmartClass, a MERN learning platform. Third, hackathon projects, which are rougher and I'd not point you at those.

**DEEPER:** *"Which repo are you proudest of and why?"* — Have a single answer ready. Recommended: the job scheduler, because it is the one with the most non-obvious engineering (exactly-once claiming, retry semantics, failure recovery) and the least "framework did it for me".

**Q2. Your portfolio site — did you build it, and with what?**

Be ready. If it is a template, say so plainly: *"It's a Next.js template I customised — I spent my time on the systems work instead."* Nobody penalises that. Pretending it is bespoke and then not knowing its build config is what costs you.

### ACTION ITEMS for your links
- Pin exactly four repositories on GitHub: SmartClass, the job scheduler, and two others. Unpin everything half-finished.
- Every pinned repo must have a README with (a) one-paragraph what-it-is, (b) an architecture diagram, (c) run instructions that actually work on a clean machine. SmartClass already has this — it is genuinely strong. Make the scheduler match it.
- Make sure your GitHub contribution graph is not a wall of `Update README` commits in the last month. Interviewers do notice.

---

## 1.2 Education

```
Shri Guru Gobind Singhji Institute of Engineering and Technology, Nanded
B.Tech, Computer Science and Engineering | CGPA: 7.60/10 | 2023–2027
Relevant Coursework: Web Development, Data Science (Minor), Operating Systems,
Data Structures & Algorithms, Distributed Computing
```

### Questions this invites

**Q3. Your CGPA is 7.6 — tell me about that.**

**RISK.** This will come up at companies with a 7.5 or 8.0 cutoff. Do not apologise, do not blame the college, do not say "marks don't matter."

**A (model).** *"It's honest — I'm around 7.6 and I could have pushed it higher. From my third semester I made a deliberate trade: I put most of my time into shipping real code, which is where the 185 merged PRs across CNCF projects and the two systems in my resume come from. I don't think that was the wrong call for the engineer I want to be, but I'd rather be straight with you that it was a choice with a cost, not an accident."*

Why this works: it is honest, it is specific, it converts the weakness into a signal (you prioritise, you trade off consciously, you own outcomes), and it hands them a bridge into the work you *do* want to discuss.

**DEEPER:** *"Which subjects did you do badly in?"* — Name one real one. Then say what you did about it. Never claim you did well in everything.

**Q4. You list Distributed Computing — what did you actually learn in it?**

This is a trap for people who pad their coursework list. Have three concrete things ready per subject listed. For Distributed Computing: consensus (Raft basics), the CAP theorem and why it's often misstated, clock/ordering problems (Lamport timestamps), and then connect it: *"The job scheduler is where I actually hit these — exactly-once claiming is really a distributed-agreement problem, and I solved it by pushing the agreement down into Postgres's row locks rather than building consensus myself."*

**Q5. Data Science as a minor — are you looking at ML roles?**

Have a position. Recommended: *"No — I took it for the statistics and data-handling foundations, and it's useful for the analytics side of the products I build, but my centre of gravity is backend and distributed systems."* Clear positioning beats trying to be a candidate for everything.

**Q6. You're 2027 batch — what's your availability?**

Know your exact answer: graduation month, internship windows, notice constraints. Fumbling this looks unserious.

---

## 1.3 Work Experience — Pragyaa 2026, Web Lead

```
Pragyaa 2026 — Web Lead | Oct 2025 – March 2026
- Developed a responsive frontend with component-level code splitting, reducing load time significantly.
- Optimized frontend performance using component-level code splitting, improving load times.
- Configured CI/CD pipelines via GitHub Actions, streamlining deployment and release cycles.
```

**RISK — bullets 1 and 2 say the same thing.** Both are "component-level code splitting → faster loads". A careful reader sees padding. Chapter 21 gives you a rewrite. In the interview, if they quote both back at you, do not pretend they're different — say *"Those two collapsed into one point when I trimmed the resume; the real second item was X"* and give the real second item (bundle analysis, image optimisation, caching headers — whatever you actually did).

### Questions this invites

**Q7. What is Pragyaa and what did "Web Lead" mean day to day?**

**A.** Frame it concretely: the college technical festival, N-thousand visitors during the event window, a team of K people, you owned the site end to end — architecture decisions, splitting work, reviewing others' PRs, and being the person on call when registration traffic spiked. *Lead* should mean you made decisions others followed and you were accountable when it broke.

**DEEPER:** *"How many people did you lead, and how did you split work?"* Have real numbers.

**Q8. "Reducing load time significantly" — by how much? From what to what?**

**RISK.** "Significantly" is a word that invites this exact question, and having no number is worse than having no bullet. Get the number. Even approximate and measured badly is better than nothing.

**A (if you have numbers).** *"First contentful paint went from about 3.1s to 1.4s on a throttled 4G profile in Lighthouse; the initial JS bundle went from ~480KB to ~180KB gzipped because the route-level chunks stopped being pulled in eagerly."*

**A (if you genuinely don't have numbers).** *"I don't have a rigorous before/after — I measured with Lighthouse locally and saw the initial bundle drop by roughly half after route-level splitting, but I didn't set up field monitoring, so I'd treat that as directional rather than a measurement. If I did it again I'd wire up web-vitals reporting first so the claim is defensible."* — This is a strong answer. It shows you know the difference between lab and field data, which most candidates don't.

**Q9. Explain component-level code splitting. How does it actually work?**

**A.** Three layers:
1. *Direct:* splitting the bundle so a route's JavaScript is fetched only when the user navigates there, instead of shipping everything in one file on first load.
2. *Mechanism:* `React.lazy(() => import('./Page'))` wrapped in `<Suspense>`. The dynamic `import()` is a signal to the bundler — Vite/Rollup treats it as a chunk boundary and emits a separate file. At runtime `React.lazy` returns a component that suspends until the chunk resolves, and `Suspense` renders the fallback meanwhile.
3. *Trade-off:* you convert one big download into several smaller round-trips. If you split too finely you get a request waterfall and the UI flashes fallbacks on every navigation. The fix is prefetching on intent — `onMouseEnter` over a nav link starts the chunk fetch before the click.

**DEEPER:** *"What's the difference between code splitting and tree shaking?"* — Splitting decides *when* code is loaded (runtime, chunk boundaries); tree shaking decides *whether* code is included at all (build time, static analysis of ES module imports, dead-export elimination). They are orthogonal and you want both.

**DEEPER:** *"What breaks if a lazy chunk fails to load?"* — `Suspense` doesn't catch errors; you need an Error Boundary around it. A common real failure is a deploy invalidating hashed chunk filenames while an old tab is still open — the user clicks a link and gets a 404 on a chunk. Fix: error boundary that triggers a reload, or keep old chunks around for a grace period.

**Q10. Walk me through the CI/CD pipeline you configured.**

You have real material here — the SmartClass repo has four workflow files. **CODE:** `.github/workflows/ci.yml`, `ci-backend.yml`, `ci-frontend.yml`, `main_smart-class.yml`.

**A.** *"In SmartClass, CI runs on push and PR against main and develop. Three jobs: a backend job on a Node 20 and 22 matrix that runs `npm ci` and the Vitest suite against an in-memory MongoDB, with the Mongo binary cached via `actions/cache` keyed on the lockfile hash so we don't re-download it every run; a frontend lint job running ESLint and a Prettier check; and a frontend build job that depends on lint passing. Coverage gets uploaded as an artifact with 14-day retention."*

**DEEPER:** *"Why a Node version matrix?"* — To catch version-specific breakage before users do; `fail-fast: false` so one version failing doesn't hide the other's result.

**DEEPER:** *"Why cache keyed on the lockfile hash?"* — The cache should be invalidated exactly when dependencies change, which is what the lockfile represents. `restore-keys` gives a partial-match fallback so a dependency bump still gets a warm-ish cache.

**DEEPER:** *"How do you handle secrets in Actions?"* — Repository/environment secrets injected as env vars, never in the YAML. Note the honest detail from your own CI: `ANTHROPIC_API_KEY: sk-test-ci-dummy-key` — a dummy value, because the tests mock the AI layer and shouldn't make real API calls. That's a good answer about test isolation and cost control.

**DEEPER:** *"What would you add?"* — Dependency vulnerability scanning (`npm audit` / Dependabot), a required-status-check branch protection rule, and deployment gating on a manual approval for production.

---

## 1.4 Open Source — the headline (185+ PRs)

```
Open Source (185+ PRs merged across multiple projects)
```

This is your strongest single line. Treat it as such.

**Q11. 185 pull requests is a lot. What's the split, and what does a typical one look like?**

**A.** Give the breakdown immediately — it converts a number that sounds inflated into one that sounds audited. *"Roughly 40 in KubeStellar where I was an IFOS intern, and the rest spread across Kubescape and Fluid. They are not all the same size — there's a long tail of documentation and small fixes, and then maybe fifteen or twenty that are substantive: the path-traversal fix in Kubescape, the race conditions in the cluster-state cache, and the test-suite migration in Fluid which was the biggest by volume."*

**Never** let this line stand as an unqualified 185. Volunteering the distribution is what makes it credible.

**DEEPER:** *"Which PR was hardest and why?"* — Prepare one answer in full detail, with the debugging narrative. This is the single most valuable story in your entire interview arsenal, because it lets you demonstrate debugging methodology on real code in a real codebase with real reviewers. Chapter 14 builds this out.

**DEEPER:** *"Did any of your PRs get rejected?"* — Say yes and tell the story. "All merged" is either false or means you only did trivial work.

**Q12. How do you pick what to work on in a large unfamiliar codebase?**

**A.** *"I start from the issue tracker with `good first issue` and `help wanted`, but that only works for the first couple. After that the better source is reading the code around something I've already fixed — bugs cluster. In Kubescape, the path-traversal fix came out of reading the handler-resolution code for a different reason and noticing the path wasn't being sanitised. I also read the test suite first in any new repo; it's the fastest map of what the maintainers actually care about."*

That answer signals initiative and code-reading skill, which is what they're testing.

---

## 1.5 Kubescape — CNCF Sandbox, Kubernetes security

```
Kubescape — CNCF Sandbox | K8s Security
- Patched path traversal in handler resolution, made pprof loopback-only, fixed Helm TLS conflation.
- Eliminated races and leaks in global cluster state, policy-handler singleton, and gRPC reuse.
```

This is the densest technical line on your resume. Six distinct claims. **Every one of them is a 10-minute conversation.** Chapter 14 covers each in full; here is the shape.

**Q13. Explain the path traversal you patched.**

**A (3-layer).**
1. *Direct:* A request parameter was being used to build a filesystem path without sanitising it, so `../../` sequences could escape the intended directory and read files outside it.
2. *Mechanism:* The handler resolved a name from the request into a path by concatenation. `filepath.Join` normalises but does not confine — `filepath.Join("/base", "../../etc/passwd")` gives `/etc/passwd`. The fix is to join, then resolve to an absolute path, then verify the result is still prefixed by the base directory (and compare after `filepath.Clean` / symlink resolution, because a symlink inside the base can also escape).
3. *Trade-off / depth:* the really correct fix in modern Go is `os.OpenRoot` (Go 1.24+) or an `openat2`-style confined open, because prefix-checking is still racy against a symlink swapped in between the check and the open — a TOCTOU.

**DEEPER:** *"What's the CWE number?"* — CWE-22. Worth knowing for a security-adjacent role.

**Q14. Why make pprof loopback-only?**

**A.** `net/http/pprof` exposes heap, goroutine, CPU and mutex profiles. In Go, merely importing it for its side effect registers those handlers on `http.DefaultServeMux` — so if you also serve `DefaultServeMux` on a public listener, you've exposed them without meaning to. That's an information-disclosure and DoS surface: goroutine dumps can leak internal structure and in-flight data, and a CPU profile request is a free way to burn CPU on the target. Binding the debug listener to `127.0.0.1` means it's reachable only from inside the pod, so you get it via `kubectl port-forward` when you need it and nobody else gets it.

**DEEPER:** *"So why not just remove pprof?"* — Because it's genuinely the tool you need when a production pod is leaking goroutines. You want it present and unreachable, not absent.

**Q15. "Helm TLS conflation" — what was conflated?**

**A.** Two distinct TLS settings were being treated as one in the chart — the classic version is a single `tls.enabled` (or a single `insecureSkipVerify`) controlling both the server-side TLS of the service *and* the client-side verification when calling out, so turning one on or off silently changed the other. Conflating them means an operator who disables verification for a self-signed internal endpoint accidentally disables it everywhere. The fix is separate, explicitly-named values with safe defaults.

> **Prep note:** Go and re-read your actual PRs before any interview. The descriptions above are the standard shape of these bugs; your specific PR will have specific details, and the specifics are what score. Open your merged PR list, read your own diffs and the review comments, and write two sentences per significant PR into a file you re-read the morning of the interview.

**Q16. Describe one of the race conditions you eliminated.**

**A (structure to follow).** (a) what the shared state was, (b) which two goroutines touched it and on what paths, (c) how you detected it (`go test -race`, a flaky CI test, a reported panic like "concurrent map read and map write"), (d) the fix and why you chose that fix, (e) how you proved it.

The "how you proved it" step is what most candidates miss. Answer: `-race` in CI, plus a test that actually runs the concurrent paths — a race detector only reports races it observes.

**DEEPER:** *"What's the difference between a race condition and a data race?"* — A data race is the specific memory-model violation: two goroutines access the same location, at least one writes, with no happens-before relation. A race condition is the broader correctness bug where behaviour depends on timing. You can have a race condition with no data race (e.g. a check-then-act sequence where each step is individually mutex-protected).

**DEEPER:** *"A singleton with a race — was it lazy initialisation?"* — Almost always. `if instance == nil { instance = new() }` from multiple goroutines. Fix: `sync.Once`, or package-level `var` initialised at init time.

**Q17. "gRPC reuse" — what was the leak?**

**A.** Creating a new `grpc.ClientConn` per call instead of reusing one. Each `ClientConn` owns an HTTP/2 transport, a resolver and a balancer with their own goroutines; not closing them leaks goroutines, sockets and memory, and you also pay a fresh TCP + TLS handshake on every call. The fix is one long-lived `ClientConn` per target, shared — gRPC connections are designed to be concurrent-safe and multiplexed over HTTP/2 streams, so sharing is the intended usage, not an optimisation.

---

## 1.6 Fluid — CNCF Incubating

```
Fluid-Cloudnative — CNCF Incubating
- Migrated test suites across 25+ packages (runtime, webhook, kubelet) to Ginkgo & Gomega.
- Took mountinfo package to 100% test coverage, adding 5,300+ lines of new tests.
```

**Q18. Why migrate to Ginkgo and Gomega? What was wrong with `testing`?**

**A.** Nothing is *wrong* with the standard library — the motivation is structure. Ginkgo gives you nested `Describe`/`Context`/`It` blocks with `BeforeEach` at each level, which matters a lot for controller and webhook tests where you need a lot of shared setup at different granularities. Gomega's matchers produce far more readable failure output than hand-written `if got != want`. And for Kubernetes controllers specifically, Ginkgo's `Eventually`/`Consistently` are the right primitives — reconcile loops are asynchronous, so you're always asserting "this converges within N seconds", which is painful to express with the standard library.

**DEEPER:** *"What's the downside?"* — It's a DSL. New contributors have to learn it, the stack traces are worse, it doesn't compose with table-driven tests as naturally as plain Go, and `Eventually` with a bad timeout is how you get slow, flaky suites. Also Ginkgo's parallelism model (separate processes) has real gotchas with shared fixtures.

**DEEPER:** *"`Eventually` vs `Consistently`?"* — `Eventually` polls until the assertion passes or times out (converges to a state). `Consistently` asserts it keeps holding for a duration (never leaves a state). You need both for a controller: "the pod becomes Ready" and "the pod does not get deleted".

**Q19. 100% coverage — is that a good goal?**

**RISK / OPPORTUNITY.** This is a judgement question disguised as a factual one. The wrong answer is enthusiasm.

**A.** *"For that package, yes, and I'd defend it — `mountinfo` parses `/proc/self/mountinfo`, so it's pure parsing logic with a lot of malformed-input edge cases and no I/O to speak of. That's exactly the shape where coverage is cheap and valuable. But I wouldn't hold a whole codebase to 100%. Line coverage measures execution, not assertion — you can execute every line and assert nothing. Past about 80% you usually start writing tests that exist to move the number, and they cost maintenance forever."*

**DEEPER:** *"What kinds of coverage are there?"* — Line/statement, branch, condition, path, and mutation coverage. Mutation testing is the one that actually measures assertion quality: mutate the source and see whether any test fails.

**DEEPER:** *"5,300 lines of tests — how do you keep that maintainable?"* — Table-driven tests with named cases, golden files for parser output, and shared fixtures. Otherwise you have 5,300 lines of copy-paste that nobody will ever refactor.

**Q20. What does `mountinfo` actually parse?**

Know this cold, because it's a great Linux/OS question in disguise: `/proc/self/mountinfo` gives the mount table for the process's mount namespace — mount ID, parent ID, device major:minor, the root of the mount within the filesystem, the mount point, mount options, optional fields (like shared/master propagation tags), a `-` separator, then filesystem type, source, and super options. It matters to Fluid because Fluid mounts distributed caches (JuiceFS/Alluxio/GooseFS) into pods, and you need to know whether a path is already a mount point, what propagation mode it has, and whether it's healthy. This connects to Chapter 16's mount-namespace material.

---

## 1.7 KubeStellar — CNCF Sandbox

```
KubeStellar — CNCF Sandbox
- Built a 3D login interface, improving UI/UX performance by 40%, and improved documentation.
- Simplified cluster import into a single-click workflow managing 100+ clusters; fixed backend.
```

**RISK — "improving UI/UX performance by 40%"** attached to a *3D* interface is the kind of claim that draws fire, because 3D is usually the thing that makes a page slower. You must be able to say precisely which metric moved 40%.

**Q21. A 3D login interface that improved performance by 40% — what metric?**

Prepare the honest version. Options depending on what's true:
- *"The 40% is time-to-interactive on the login route — the old page pulled in a heavy component tree; the new one lazy-loads the 3D scene after first paint, so the form is interactive well before the visual finishes."* (Good — performance improved *despite* the 3D, because of how it's loaded.)
- *"Honestly, the 40% was a UX measure, not a rendering one — task-completion time in the flow, not frame time. I should have worded that line more precisely."* (Also fine. Owning imprecise wording costs you far less than defending it badly.)

**DEEPER:** *"How do you make a 3D scene not destroy a login page?"* — Lazy-load the WebGL bundle, render it behind the form not as a blocker, respect `prefers-reduced-motion`, drop to a static image on low-end devices / low `hardwareConcurrency`, cap the device pixel ratio, and stop the render loop when the tab is hidden (`visibilitychange`) so you don't burn battery.

**Q22. Single-click cluster import for 100+ clusters — what was hard?**

**A.** Frame it as the interesting problem it is: bulk operations against remote clusters are partial-failure problems. 100 imports means some subset fails — auth, network, version skew — and the naive implementation either serialises (slow) or fans out unbounded (rate-limited into the ground). What you want is bounded concurrency, per-cluster status rather than one global success/failure, idempotency so a retry doesn't double-import, and a UI that shows progress rather than a spinner. If you did those, say so. If you did some, say which.

**DEEPER:** *"What does importing a cluster mean mechanically in KubeStellar?"* — Registering a workload cluster with the hub: creating the inventory object, establishing credentials, and getting an agent running on the target that syncs bindings. Know the rough shape even if not every detail.

---

## 1.8 Project — Distributed Job Scheduler

```
Distributed Job Scheduler — Go, PostgreSQL, Redis, React, JWT
- Designed multi-tenant job scheduling platform supporting immediate, delayed, cron & batch jobs.
- Engineered job claiming with Postgres SKIP LOCKED, ensuring zero duplicate claims across 50 workers.
- Built fault-tolerant execution with backoff-retries, dead-letter queue & heartbeat-based recovery.
- Secured the platform with JWT authentication, RBAC, and a Redis-backed rate limiter.
```

**This is your best technical project.** It is dense with genuinely senior concepts. Chapter 12 is 12 pages on it alone. The headline questions:

**Q23. Explain `SELECT ... FOR UPDATE SKIP LOCKED` and why it gives you exactly-once claiming.**

**A (3-layer).**
1. *Direct:* It lets fifty workers poll the same jobs table concurrently and each walk away with a different row, with no coordination between them and no worker blocking on another.
2. *Mechanism:* Plain `SELECT ... FOR UPDATE` takes row locks; a second transaction hitting a locked row *waits*. With `SKIP LOCKED`, it doesn't wait — it steps over the locked row and takes the next available one. So the query is `SELECT id FROM jobs WHERE status='pending' AND run_at <= now() ORDER BY run_at LIMIT 10 FOR UPDATE SKIP LOCKED`, and inside the same transaction I flip those rows to `running` and commit. The lock is held for the duration of the transaction, so between the select and the commit no other worker can see those rows as claimable.
3. *Trade-off / honesty:* this gives exactly-once *claiming*, not exactly-once *execution*. If a worker claims a job, runs it, and dies before writing the result, the heartbeat reaper will re-claim it and it runs twice. True exactly-once across a process boundary isn't achievable — so the real design requirement is that job handlers are idempotent, and I give each attempt an idempotency key the handler can dedupe on.

That last paragraph is the single strongest thing you can say in a backend interview. Most candidates claim exactly-once and don't know it's impossible.

**DEEPER:** *"Why not Redis for the queue?"* — You can (`BRPOPLPUSH`, or Streams with consumer groups). The reason to stay in Postgres is transactionality: the job claim and the business-state change commit atomically in one transaction. With a separate broker you get dual-write — you can enqueue and fail to commit, or commit and fail to enqueue — and then you need the outbox pattern to fix it. Postgres-as-queue trades throughput for that guarantee.

**DEEPER:** *"At what scale does Postgres-as-a-queue fall over?"* — Roughly single-digit-thousands of jobs/second before you're fighting table bloat from the constant UPDATEs and the autovacuum load. Mitigations: partition by status or time, `HOT` updates by keeping the status column out of indexes you don't need, aggressive `autovacuum_vacuum_scale_factor` on that table, and archiving completed rows out.

**Q24. Walk me through your retry strategy.**

**A.** Exponential backoff with jitter: `delay = min(base * 2^attempt, cap)` plus randomisation, because synchronised retries from many workers produce a thundering herd. A max attempt count, after which the job goes to a dead-letter queue rather than being retried forever or silently dropped — the DLQ is a table with the job, the final error, and the attempt history, so a human can inspect and replay. And crucially, retries are only safe because handlers are required to be idempotent.

**DEEPER:** *"Why jitter?"* — Without it, N jobs that failed at the same moment (because a downstream went down) all retry at the same moment, re-killing the downstream. Full jitter (`random(0, backoff)`) is usually better than equal jitter for this.

**DEEPER:** *"Which errors do you retry?"* — Distinguish transient (network timeout, 502, deadlock, rate-limit) from permanent (validation failure, 404, auth failure). Retrying a permanent error is pure waste and delays the DLQ signal.

**Q25. Heartbeat-based recovery — how does it work and what's the failure mode?**

**A.** A running worker updates `last_heartbeat_at` on its claimed rows every N seconds. A reaper process periodically finds rows in `running` whose heartbeat is older than some threshold and returns them to `pending`. The failure mode is the split brain: a worker that's alive but stalled (GC pause, network partition, blocked on a slow downstream) stops heartbeating, gets reaped, and then *finishes its work* — so the job runs twice concurrently. Mitigations: fencing tokens (each claim gets a monotonically increasing token; the result write is rejected if the token is stale), making the threshold generously larger than the worst realistic pause, and again — idempotent handlers.

Knowing the term *fencing token* here is a strong signal. It comes from the distributed-locks literature (Kleppmann's critique of Redlock).

**Q26. Multi-tenant — how is tenant isolation enforced?**

Have a real answer: tenant ID on every row, every query scoped by it, and ideally enforced at the database with Postgres Row-Level Security rather than relying on every query being written correctly. Plus per-tenant quotas so one tenant can't starve the others — which is where the Redis rate limiter comes in.

**Q27. Describe your Redis rate limiter.**

Know which algorithm: fixed window (simple, allows 2x burst at boundaries), sliding window log (exact, memory-heavy), sliding window counter (good compromise), token bucket (allows controlled bursts), leaky bucket (smooths output). Say which you implemented and why. Then the critical detail: **it must be atomic.** `GET` then `INCR` from multiple processes is a race; you use `INCR` with `EXPIRE` set only on first increment, or a Lua script so the whole check-and-increment is one atomic operation on the Redis server.

**DEEPER:** *"What happens when Redis is down?"* — Decide and defend: fail open (availability over protection) or fail closed (protection over availability). For a rate limiter protecting an expensive downstream, fail closed; for one protecting a login form, failing open is usually the lesser evil. Having *a* position is what matters.

---

## 1.9 Project — SmartClass

```
SmartClass — MERN, WebRTC, Socket.IO, Claude API, Vercel
- Built a full-stack LMS with role-based dashboards, sequential assignments, and Cloudinary uploads.
- Implemented SFU-based WebRTC live classes with multi-participant video conferencing.
- Developed AI Playground using Claude API for quiz generation and automated assignment feedback.
- Integrated push notifications, OTP auth, Google OAuth, and AI-powered live subtitles.
```

Chapters 04, 05, 06, 07 cover this project in ~50 pages. Here are the resume-level questions.

### **RISK — the SFU claim**

**Your code does not implement an SFU.**

**CODE:** `client/src/pages/LiveClassRoom.jsx:226` — `makePeerForViewer(viewerSocketId)` creates one `RTCPeerConnection` per viewer, stored in `peerConnsRef` (a `Map` of `viewerSocketId → RTCPeerConnection`). The teacher's browser encodes and uploads a separate stream to every single student. The server (`server/app.js`) only relays `offer`, `answer` and `ice-candidate` events — it never touches media.

That is a **star-topology mesh** (sometimes called P2P broadcast or full-mesh-from-one). An SFU is a *server* that receives one uploaded stream and forwards it to N subscribers — mediasoup, Janus, Jitsi Videobridge, LiveKit, Pion. You have none of those in your dependencies.

**Q28. Tell me about your SFU implementation.**

**The recovery script (use this, it turns the risk into a win):**

> *"I have to correct the resume line there — it's inaccurate and I should fix it. What I actually built is a star-topology mesh: the teacher's browser holds one `RTCPeerConnection` per student and uploads a separate encoded stream to each one. The server is signalling-only; it brokers SDP offers and answers over Socket.IO and never sees media.*
>
> *I know the difference and I know why it matters. The teacher's upload bandwidth and CPU scale linearly with the number of students, so this holds up for a small class and falls apart somewhere around eight to ten. An SFU fixes exactly that — the teacher uploads once to the server, and the server forwards to N subscribers, so the publisher cost is constant. The trade is that you now run and pay for media infrastructure, and you need simulcast plus bandwidth estimation on the server to adapt per-subscriber quality.*
>
> *I chose the mesh because it needed zero server infrastructure, which was the right call for the scope I had. If I were taking this to real classrooms, mediasoup or LiveKit would be the next step, and the client-side signalling I already have maps onto it fairly directly."*

Why this is actually a *good* outcome: you have demonstrated (a) honesty under pressure, (b) that you understand the architecture space, not just your implementation, (c) that you can reason about scaling limits quantitatively. Several interviewers will rate that exchange higher than a correct SFU implementation explained blandly.

**But you must fix the resume line.** Chapter 21 has the replacement wording. Do not walk into another interview with the current line — relying on the recovery script is a worse expected outcome than just being accurate.

**Q29. Why did you use Claude for the AI features rather than building your own model?**

**A.** Because the task is language understanding and generation over open-ended educational content, and there is no dataset or compute budget that would make a self-trained model competitive. The interesting engineering isn't the model, it's everything around it: structured output that parses reliably, an agent loop with a tool registry and an iteration cap, cost control, and graceful degradation when the API is slow or down.

**DEEPER:** *"How do you guarantee the quiz JSON parses?"* — Currently you prompt for JSON and parse. **CODE:** `server/app/ai/llm.js` — `generateQuiz` asks for "ONLY a valid JSON array". That is prompt-level, not structural. Be ready to say the better answer: use the tool-use API with an input schema so the model returns structured arguments, validate against a schema (Zod/JSON Schema) on receipt, and retry once with the validation error fed back. Say this as "what I'd do next" and you've answered it well.

**Q30. "Push notifications" — are those real web push?**

**RISK — small but real.** **CODE:** `server/app/services/notificationService.js` persists to MongoDB and emits a `notification:new` Socket.IO event to the user's room. That is **in-app real-time notification**, not Web Push (which requires a Service Worker, the Push API, and VAPID keys). The distinction matters: real push reaches the user when the tab is closed; yours does not.

**Recovery:** *"That's in-app real-time notification over Socket.IO, persisted to Mongo so it survives a refresh — not Web Push with a service worker. I'd word that as 'real-time notifications'. Adding true Web Push would mean a service worker, a `PushSubscription` per device, and VAPID-signed messages through the browser's push service."*

**Q31. Sequential assignments — what does that mean and how did you enforce it?**

This one is genuinely good and you should volunteer it. **CODE:** `server/app/controllers/assignmentController.js` → `submitAssignment`. Assignments carry an `order` field, auto-assigned as `last + 1` on creation. Before accepting a submission, the controller fetches every assignment in the course with a lower `order`, checks which of them the student has submitted, and blocks if any earlier one is both unsubmitted *and* not past its due date. The due-date escape hatch is the thoughtful bit: without it, one missed assignment would permanently lock a student out of the whole course.

**DEEPER:** *"What happens to ordering when an assignment is deleted?"* — You handle it: `deleteAssignment` runs `updateMany({ order: { $gt: deletedOrder } }, { $inc: { order: -1 } })` to keep the sequence contiguous. Good answer — and the honest caveat is that this isn't transactional, so a crash mid-way leaves a gap.

---

## 1.10 Skills section

```
Languages: Java, Go, TypeScript, JavaScript, SQL
Frontend: React.js, Next.js, Redux, HTML5, CSS3, Tailwind CSS, Vite
Backend & Databases: Node.js, Express.js, REST APIs, WebSockets, JWT, MongoDB, Redis
Cloud & Tools: Git, GitHub Actions, AWS, Docker, Kubernetes, Postman, Linux, E2E Testing
```

**The rule: everything on this list is fair game, and the interviewer will pick the one you look least comfortable with.**

Audit your own list honestly right now. For each item, can you answer three questions of increasing depth?

| Skill | Likely questions | Your risk |
|---|---|---|
| **Java** | Collections, `HashMap` internals, GC, `equals`/`hashCode`, concurrency (`synchronized` vs `ReentrantLock`), streams | **High if unused recently.** Nothing on your resume is Java. Either prepare it properly or drop it. |
| **Go** | Goroutines, channels, `select`, `context`, slices vs arrays, interfaces, `defer`, race detector | Low — it's your strongest. Chapter 13. |
| **TypeScript** | `interface` vs `type`, generics, narrowing, `unknown` vs `any`, utility types | **Medium.** Your SmartClass code is plain JS. If TS isn't in a real project, be ready for "where have you used TypeScript?" |
| **Redux** | Store/actions/reducers, middleware, thunk vs saga, why RTK, when *not* to use Redux | **Medium-high.** Not present in SmartClass (you use Context). Have a real project or drop it. |
| **Next.js** | SSR vs SSG vs ISR, App Router vs Pages, server components, data fetching | **Medium.** Where did you use it? |
| **AWS** | Which services specifically? EC2/S3/Lambda/RDS? IAM basics? | **High.** "AWS" alone is the vaguest possible claim. Name the services you've actually used. |
| **Docker** | Image vs container, layers & caching, multi-stage builds, volumes, networking, `CMD` vs `ENTRYPOINT` | Low-medium. Very likely to be asked. |
| **Kubernetes** | Pods/Deployments/Services, controllers & reconciliation, RBAC, admission webhooks | Low — backed by real CNCF work. Chapter 14. |
| **E2E Testing** | Which framework? Playwright/Cypress? Flakiness management? | **Medium.** Your repo has Vitest + Supertest, which is integration testing, not E2E. |

**Action:** cut anything in the "high risk" column that you cannot back with a project or genuine recent practice. A shorter skills list that is 100% defensible interviews far better than a long one with three soft spots. The interviewer's job is to find the soft spot.

**Q32. Rank these by confidence.** Interviewers ask this. Have the ranking ready and be honest about the bottom of it: *"Go and Node I'd call strong. React solid. Java I've done coursework and DSA in but haven't shipped production code with — I'd want to say that up front rather than have you find it."* That sentence buys you enormous goodwill.

---

## 1.11 Achievements

```
Hackathons: Hackspectra Winner, 4-time Hackathon Finalist
Open Source: IFOS Intern (KubeStellar), 40+ merged pull requests in CNCF KubeStellar project
```

**Q33. Tell me about the hackathon you won.**

Use STAR, and make the *technical* decision the centre of the story, not the win. What did you build, what was the hardest call you made under time pressure, what did you cut and why. Interviewers hear "we won a hackathon" constantly; they rarely hear "we cut real-time sync at hour 20 and faked it with polling because the demo needed to not break, and here's how I'd have done it properly."

**Q34. Four times a finalist but won once — what did you learn from the losses?**

Excellent question to get. Best answers involve scope: *"The pattern in the ones we lost was that we built too much. The one we won, we shipped one flow end to end and it worked every time in the demo. Judges reward a thing that works over a bigger thing that's broken."*

**Q35. What is IFOS and what did the internship involve?**

Be able to explain the programme in one sentence and then go straight to what you shipped. Interviewers care about the work, not the programme name.

---

## 1.12 Your pre-interview checklist for resume questions

Print this. Run it the night before every interview.

- [ ] I have re-read my own merged PRs for Kubescape, Fluid and KubeStellar in the last 48 hours.
- [ ] I have two sentences prepared for each of the six Kubescape claims.
- [ ] I have a number (or an honest "I didn't measure rigorously") for every quantified claim: "significantly", "40%", "50 workers", "100+ clusters", "185+ PRs", "5,300 lines".
- [ ] I can draw the SmartClass architecture from memory in 60 seconds.
- [ ] I can draw the WebRTC signalling sequence from memory.
- [ ] I have the SFU correction script ready and I have *already fixed the resume line*.
- [ ] I have the authorisation-bug story ready as a "what I learned" answer (Chapter 21).
- [ ] Every skill on my skills list survives three levels of questioning, or it is no longer on my skills list.
- [ ] I have one prepared story each for: hardest bug, biggest mistake, disagreement with a reviewer, something I shipped that I'd now do differently.

---

*Next: [Chapter 02 — How to start the interview](02-HOW-TO-START-THE-INTERVIEW.md)*
