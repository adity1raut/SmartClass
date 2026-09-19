# Chapter 17 — System Design Rounds

> **What's actually being tested:** not whether you know the "right" architecture — there isn't one — but whether you can scope a vague problem, make explicit trade-offs, and reason quantitatively. Candidates fail system design by jumping to components instead of establishing requirements.

---

## 17.1 The framework (use it every single time)

### Step 1 — Requirements (5 minutes, do not skip)

**Functional:** what must it do? Get the interviewer to confirm a *small* list. Your job is to narrow, not expand. *"Let me scope this to: post a message, read a feed, follow a user. I'll leave search and DMs out unless you want them."*

**Non-functional:** which of these matter, and in what order?
- Scale (users, requests/second, data volume)
- Latency (p50, p99 — and for which operations)
- Availability (what happens during a partition)
- Consistency (can a user see stale data? whose data?)
- Durability (is losing this acceptable?)

**The killer question to ask:** *"What's the read-to-write ratio?"* It determines almost every subsequent decision.

### Step 2 — Estimation (3 minutes)

Do arithmetic out loud. Round aggressively; nobody wants precision.

Numbers to have memorised:
- 1 day ≈ 86,400s ≈ **10⁵ seconds**
- 1 million requests/day ≈ **12 req/s**
- 1 billion requests/day ≈ **12,000 req/s**
- Peak ≈ **2–3× average**
- L1 cache 1ns · RAM 100ns · SSD random read 100µs · network round trip within a datacentre 500µs · disk seek 10ms · cross-continent round trip 150ms
- A modern server: ~10k–50k simple requests/second; a database: ~1k–10k writes/second per node
- 1 char ≈ 1 byte · a UUID ≈ 16 bytes · a typical row ≈ 100–1000 bytes

**Worked example:** 100M daily active users, each posting 2 messages and reading 50.
- Writes: 200M/day ÷ 10⁵ = **2,000 writes/s**, peak **~6,000/s**
- Reads: 5B/day ÷ 10⁵ = **50,000 reads/s**, peak **~150,000/s**
- Ratio: **25:1 read-heavy** → cache aggressively, replicate reads, denormalise for reads
- Storage: 200M × 300 bytes = 60GB/day = **~22TB/year** → needs partitioning

### Step 3 — API design (3 minutes)

A handful of endpoints with their key parameters. This forces you to commit to the data model.

### Step 4 — Data model (5 minutes)

Entities, relationships, and **the access patterns**. Then choose the store *because of* the access patterns, not before.

### Step 5 — High-level design (10 minutes)

Draw the boxes. Client → LB → service → cache → database, plus async paths. **Then say: "The interesting part is here —" and point at the one hard component.**

### Step 6 — Deep dive (15 minutes)

The interviewer picks, or you offer. This is where the score is decided.

### Step 7 — Scale, failure, trade-offs (10 minutes)

What breaks first? What's the single point of failure? What happens on a partition? What did you trade away?

---

## 17.2 The trade-off vocabulary you must use

Saying these phrases correctly is a large part of the score:

| Instead of | Say |
|---|---|
| "I'll add a cache" | "This is 25:1 read-heavy, so I'll cache with a 60s TTL and accept up to 60s of staleness on the feed, because a slightly stale feed is acceptable and a stale balance wouldn't be." |
| "I'll use Kafka" | "I need durable, replayable, multi-consumer event delivery, which is what a log gives me; a task queue wouldn't, because I want several independent consumers of the same stream." |
| "I'll shard it" | "Writes exceed a single node at ~10k/s, so I'll shard on user_id, which keeps per-user queries single-shard. The cost is that cross-user queries become scatter-gather." |
| "It'll be highly available" | "I'll take AP here: during a partition I'd rather serve a stale feed than an error. For the payment path I'd take CP instead." |

---

## 17.3 Design 1 — A live-class platform (YOUR project, scaled)

**This is the one you're most likely to be given**, because it's on your resume. Prepare it thoroughly.

### Requirements
- Teacher broadcasts audio/video to N students; students can ask questions, raise hands, chat.
- Scope: classes of up to 100. Ask whether 10,000 is in scope — it's a completely different design.
- Latency: sub-500ms for interactive teaching; 2–5s acceptable for a pure lecture.
- Availability over consistency for chat; the class must not drop.

### Estimation
- 10,000 concurrent classes × 30 students = 300,000 concurrent media connections.
- At 1.5 Mbps downstream per student: 300,000 × 1.5 Mbps = **450 Gbps of egress.** Say this number out loud — it's what makes the design decisions obvious.
- That's the entire problem. Media bandwidth dominates everything else by orders of magnitude.

### Design
```
  Teacher ──┐                      ┌── SFU pool (mediasoup / LiveKit) ──┐
            │  1 upstream          │   regional, autoscaled             │
            └─────────────────────►│   simulcast: 180p/360p/720p        │
                                   └──┬──────────┬──────────┬───────────┘
                                      │          │          │
                               Students (subscribed at the layer their
                               bandwidth estimate supports)

  Signalling:  WebSocket gateway (stateless) ── Redis pub/sub ── SFU control
  App:         REST API ── Postgres (classes, enrolment, recordings)
  Chat/hands:  WebSocket gateway ── Redis pub/sub ── fan-out per room
  Recording:   SFU-side recorder ── object storage ── transcode ── CDN
```

### Deep-dive points (this is where you win)

1. **Why an SFU, with numbers.** Mesh: publisher uplink = N × bitrate, dead past ~6. MCU: transcode cost per participant, unaffordable. SFU: publisher uploads once, server forwards, cost is bandwidth not CPU. **You have first-hand experience of the mesh limit — say so.** *"I built the mesh version and hit exactly this wall at around six students."*

2. **Simulcast and layer selection.** The publisher encodes three qualities; the SFU picks per subscriber based on their REMB/transport-cc bandwidth estimate and what the UI is showing (thumbnail vs pinned). Without this, one student on 3G degrades everyone.

3. **Room-to-SFU assignment.** All participants of a class must be on the same SFU instance (or cascaded). A router service assigns a class to an SFU at start time, recorded in Redis. Consistent hashing on class ID gives stable assignment; a capacity-aware scheduler is better because classes vary in size.

4. **What happens when an SFU dies?** All its classes drop. Mitigations: clients detect `iceConnectionState: failed`, re-signal, get reassigned to a new SFU, and re-establish — a 3–5 second interruption. Full redundancy (dual-publishing to two SFUs) doubles cost for a rare event; most products accept the reconnect.

5. **TURN.** 8–15% of participants need relay. That's a separate, bandwidth-heavy fleet, deployed regionally, with time-limited HMAC credentials issued by your API.

6. **Scaling beyond 100 per class.** At some point it stops being conferencing and becomes broadcasting. Above ~500 viewers, transcode the teacher's stream to LL-HLS and serve via CDN — you trade 2–5s of latency for effectively unlimited scale and far lower cost. Interaction stays on WebSocket. **Recognising the regime change is the single best answer in this design.**

7. **Chat and presence at scale.** Stateless WebSocket gateways behind an L4 load balancer; room fan-out via Redis pub/sub so any gateway can serve any user. Presence in Redis with TTL heartbeats. This is precisely the fix for the in-memory state problem in your own app — make that link.

### Trade-offs to volunteer
- SFU means the server can decrypt media, so you lose true end-to-end encryption unless you add SFrame — and SFrame breaks server-side recording and transcription.
- Regional SFUs improve latency but complicate cross-region classes (cascading).
- Recording server-side is reliable but expensive; client-side is free but unreliable.

---

## 17.4 Design 2 — A distributed job scheduler (YOUR project, scaled)

Also highly likely. Chapter 12 has the depth; here's the design-round framing.

**Requirements:** submit a job with a schedule (now, at time T, cron), execute at least once, retry on failure, dead-letter on exhaustion, multi-tenant with fairness, visibility into status.

**Estimation:** 100M jobs/day = ~1,200/s average, ~3,500/s peak. Payload 1KB → 100GB/day → needs retention policy and partitioning.

**Key design decisions to state:**
1. **Postgres as the queue up to ~5k jobs/s**, because of transactional coupling. Beyond that, a partitioned design or a dedicated broker with the outbox pattern.
2. **`SELECT FOR UPDATE SKIP LOCKED` for claiming**, with a partial index on pending rows.
3. **At-least-once with idempotent handlers.** State explicitly that exactly-once is unachievable.
4. **Heartbeat + reaper for recovery**, with fencing tokens for the split-brain case.
5. **Per-tenant fairness** via weighted selection, because global FIFO lets one tenant starve everyone.
6. **Partition by time** so completed jobs are dropped by partition rather than deleted row by row.

**The scale question:** *"What breaks at 10× ?"* — vacuum load from update churn on the jobs table. Mitigations in order: partial indexes to enable HOT updates, per-worker heartbeating instead of per-job, table partitioning, and finally moving the ephemeral state (heartbeats) to Redis while keeping the durable state in Postgres.

---

## 17.5 Design 3 — A URL shortener

The classic warm-up. Get through it quickly and correctly.

**Requirements:** shorten a URL, redirect, optional custom alias, optional expiry, analytics.
**Estimation:** 100M writes/day = 1,200/s; 10:1 read ratio → 12,000 redirects/s. Storage: 100M × 500 bytes × 365 = 18TB/year.

**Key ID-generation decision — discuss three options:**
1. **Hash the URL** (MD5/SHA, take 7 chars of base62). Deterministic, but collisions need checking, and the same URL always maps to the same short code (sometimes desirable, sometimes not).
2. **Auto-increment ID → base62.** Simple, no collisions, but sequential IDs are enumerable (a privacy leak) and a single counter is a bottleneck.
3. **Pre-allocated key ranges per server** (a key-generation service handing out blocks). No coordination on the hot path, no collisions. **This is usually the best answer.**

Base62 with 7 characters gives 62⁷ ≈ 3.5 trillion — ample.

**Design:** LB → stateless app servers → Redis cache (hot URLs) → key-value store (Cassandra/DynamoDB — the access pattern is pure key lookup, so a relational database buys you nothing).

**Redirect:** 301 (permanent, cached by the browser — fast but kills your analytics) vs 302 (temporary, every hit reaches you — analytics work, higher load). **The choice is analytics vs efficiency, and naming that trade-off is the point of the question.**

**Analytics:** don't write synchronously on the redirect path. Emit to Kafka, aggregate asynchronously.

---

## 17.6 Design 4 — A rate limiter (you have built one)

**Requirements:** limit requests per user/API key, distributed across N servers, low latency, configurable per endpoint.

**Algorithm comparison — this is the whole question:**

| Algorithm | Memory | Accuracy | Burst behaviour |
|---|---|---|---|
| Fixed window | O(1) | Poor at boundaries (2× burst) | Allows a burst |
| Sliding window log | O(requests) | Exact | Smooth |
| Sliding window counter | O(1) | Good approximation | Smooth |
| Token bucket | O(1) | Exact | Allows controlled bursts |
| Leaky bucket | O(1) | Exact | Smooths output |

**Recommend token bucket** for an API: it permits legitimate bursts while bounding the sustained rate, and it's O(1) memory.

**The distributed part is the real question.** Redis with a Lua script for atomicity (Chapter 09 Q121). Discuss:
- **Latency:** a Redis round trip per request adds ~1ms. For extreme scale, use local counters with periodic sync, accepting approximate limits.
- **Redis failure:** fail open or fail closed — decide and justify per use case.
- **Hot keys:** a single very active key concentrates load on one Redis shard; mitigate by sharding the counter and summing.

**Client communication:** 429 with `Retry-After`, plus `X-RateLimit-Limit`, `X-RateLimit-Remaining` and `X-RateLimit-Reset` headers so well-behaved clients self-regulate.

---

## 17.7 Design 5 — A notification system (your app, scaled)

**Requirements:** deliver in-app, push, email and SMS; per-user preferences; deduplication; retry; scale to millions.

**Design:**
```
Services ──► Notification API ──► Kafka ──► Workers ──► Channel adapters
                  │                             │            ├─ APNs/FCM
                  │                             │            ├─ SES/SendGrid
             preference &                       │            └─ Twilio
             template store                     │
                                          dedup (Redis) + rate limit per user
```

**Key points:**
1. **Queue between production and delivery**, so a slow provider doesn't block the business operation. Your app calls the provider synchronously in the request path — name that as the thing you'd change.
2. **Idempotency/dedup** with a key per (user, event), so a retry doesn't double-notify.
3. **Per-user rate limiting and digesting** — nobody wants 40 notifications; coalesce into "3 new assignments".
4. **Fan-out strategy:** for a course with 10,000 students, don't write 10,000 rows synchronously. Write one event and fan out asynchronously, or use a pull model where clients query "notifications since X".
5. **Push vs pull for the feed.** Push (write to each recipient's inbox) is fast to read, expensive to write for large audiences. Pull (query at read time) is the reverse. **Hybrid: push for normal users, pull for high-fan-out sources** — the classic Twitter celebrity problem.

---

## 17.8 Design 6 — A chat system (WhatsApp/Slack)

**Requirements:** 1:1 and group messages, delivery and read receipts, online presence, message history, offline delivery.

**Key decisions:**
1. **Connection layer:** persistent WebSocket connections, stateless gateways, a session registry in Redis mapping user → gateway. To deliver, look up the gateway and forward.
2. **Message ordering:** per-conversation sequence numbers assigned server-side. Client timestamps are unusable. Use Snowflake-style IDs (timestamp + machine + counter) so IDs are roughly time-ordered and globally unique.
3. **Storage:** a wide-column store (Cassandra) partitioned by conversation ID, clustered by message ID descending — "fetch the last 50 messages in this conversation" is then a single efficient partition read.
4. **Offline delivery:** persist first, then attempt delivery. On reconnect the client sends its last-seen message ID and receives everything after.
5. **Group fan-out:** for small groups, write to each member's inbox. For large channels, store once per channel and let clients read — the same push/pull hybrid.
6. **Presence:** heartbeat to Redis with a TTL; subscribe only to the presence of users you're actually viewing, otherwise presence fan-out dominates your traffic at scale.

**The hard question they'll ask:** *"How do you guarantee exactly-once delivery?"* — You don't. At-least-once plus client-side deduplication on message ID. Same answer as your job scheduler, and saying so ties the two together.

---

## 17.9 Design 7 — A news feed

**Requirements:** show posts from followed accounts, ranked, paginated, fresh.

**The central decision: fan-out on write vs fan-out on read.**
- **On write (push):** when you post, write to every follower's feed. Reads are a single lookup. Terrible for celebrities — one post triggers 100M writes.
- **On read (pull):** at read time, query all followed accounts and merge. Writes are cheap; reads are expensive and slow.
- **Hybrid (the answer):** push for normal users, pull for accounts above a follower threshold, merged at read time.

**Ranking:** start with chronological, then mention that a ranked feed needs a feature store and a model, scored at read time over a candidate set generated cheaply.

**Pagination:** cursor-based on (score, id), never offset — offset pagination on a changing feed shows duplicates and skips items.

---

## 17.10 Design 8 — An online code judge / assessment platform

Relevant to you (education domain) and a good sandbox-security discussion.

**The interesting part is untrusted code execution:**
- Containers with no network, read-only root filesystem, dropped capabilities, seccomp profile, strict CPU/memory limits, and a hard wall-clock timeout.
- Containers share the host kernel, so a kernel exploit escapes. For genuinely hostile code use gVisor (userspace kernel) or Firecracker microVMs. **Naming those two shows real depth.**
- A worker pool consuming from a queue — which is your job scheduler again.
- Fork bombs: limit PIDs via cgroups. Disk fill: quota or tmpfs with a size limit.

---

## 17.11 Design 9 — A file storage service (Dropbox/Google Drive)

**Key ideas:**
1. **Chunking:** split files into 4MB blocks, content-address each by hash. Deduplication is then free — identical blocks are stored once globally.
2. **Delta sync:** only changed blocks are uploaded, which is what makes syncing a large file after a small edit fast.
3. **Metadata vs blob separation:** metadata (paths, versions, permissions) in a relational database; blocks in object storage. **The metadata service is the hard part, not the storage.**
4. **Conflict resolution:** version vectors; on true conflict, keep both ("conflicted copy") rather than silently losing data.
5. **Sharing and permissions:** an ACL model, with the subtlety that permission checks must be efficient for deeply nested folders — which is where a Zanzibar-style ReBAC system comes in.

---

## 17.12 Design 10 — A video streaming service (YouTube)

**Upload path:** upload to object storage → enqueue a transcoding job → transcode into multiple bitrates and resolutions → segment (HLS/DASH) → distribute to CDN → mark available.

**Playback:** adaptive bitrate — the manifest lists available renditions and the player switches based on measured throughput and buffer level.

**Key numbers:** video dominates storage and bandwidth by orders of magnitude. 1 hour of 1080p ≈ 3GB. That's why CDN cost is the business.

**The transcoding pipeline is a job scheduler** — priority queues (a popular creator's upload first), retries, and DAG dependencies (segment after transcode). **Connect it to your project explicitly.**

---

## 17.13 Design 11 — A search/autocomplete system

**Autocomplete:** a trie with the top-k completions precomputed at each node, held in memory, rebuilt offline from query logs. Serving is then O(prefix length). Sharded by prefix.

**Search:** an inverted index (term → posting list of document IDs), built offline, with TF-IDF or BM25 scoring, then a ranking layer. Elasticsearch/Lucene is the standard implementation.

**For SmartClass specifically:** MongoDB Atlas Search or a separate Elasticsearch, indexing course materials and assignment text, with per-user filtering so results respect enrolment — **and that filtering-by-permission requirement is the part most candidates forget.**

---

## 17.14 Design 12 — A metrics/monitoring system

**Ingestion:** agents push (or are scraped) at intervals. Enormous write volume, tiny reads by comparison.

**Storage:** a time-series database. The key properties are columnar storage, delta-of-delta timestamp encoding, and downsampling — raw data for 24 hours, 1-minute rollups for a week, 1-hour for a year.

**Cardinality is the killer.** Every unique label combination is a separate series. `user_id` as a label creates millions of series and destroys the system. **Knowing that high cardinality is the #1 operational failure of Prometheus is the expert answer.**

**Alerting:** rules evaluated on a schedule, with for-duration to avoid flapping, deduplication and grouping in the alert manager.

---

## 17.15 Design 13 — A ticketing/booking system

**The interesting part is the concurrency:** N users, 1 seat.

**Options:**
1. **Pessimistic lock** — `SELECT FOR UPDATE` on the seat. Correct, but holds a lock during a human's payment flow, which is unacceptable.
2. **Optimistic with a hold** — reserve with a short expiry (10 minutes), then confirm. A background reaper releases expired holds. **This is your job scheduler's claim-and-heartbeat pattern applied to seats** — say that.
3. **Unique constraint** on (event, seat) in the bookings table so the database arbitrates, and the loser gets a clear error.

**The correct answer combines 2 and 3.** And the overall framing — "this is a distributed claiming problem, which I've solved before with `SKIP LOCKED`" — is exactly how to make a design round play to your experience.

---

## 17.16 Design 14 — An LLM-backed product feature (your AI Playground, scaled)

Increasingly common, and directly yours.

**Requirements:** generate content from user input, low perceived latency, bounded cost, graceful degradation.

**Design:**
```
Client ──► API ──► [auth, per-user quota check in Redis] ──► Job queue
                                                                │
                                          Worker ──► LLM provider (timeout,
                                            │         retry w/ backoff,
                                            │         circuit breaker)
                                            ├──► validate output vs schema
                                            ├──► store result
                                            └──► notify via WebSocket
Cache: semantic (embedding similarity) + exact-prompt cache
```

**Key points:**
1. **Async, not synchronous.** Generation takes seconds; holding an HTTP connection is wasteful and fragile. Return a job ID, notify over the existing WebSocket. **This is exactly what you'd change in your own app.**
2. **Streaming** where the user watches the output — it changes perceived latency far more than any backend optimisation.
3. **Structured output via tool schemas plus validation**, not prompt-requested JSON.
4. **Cost control:** per-user token quotas, prompt caching on the stable prefix, a cheaper model for simple tasks, and a hard cap on agent iterations.
5. **Prompt injection:** untrusted input in delimiters, authoritative instructions in the system prompt, and — the real control — no consequential action without human or deterministic validation.
6. **Evaluation:** a golden set with programmatic assertions in CI, so a prompt change that breaks format reliability is caught before deploy.

---

## 17.17 The ten most common ways candidates fail

| Failure | Fix |
|---|---|
| Jumping to components before requirements | Always spend 5 minutes on requirements. Always. |
| No numbers | Do the arithmetic out loud, even roughly |
| Designing for 1B users when asked about 1M | Design for the stated scale, then say how it evolves |
| Listing technologies without justification | Every choice gets a "because" |
| Never mentioning a downside | Volunteer the cost of your own decision |
| Silence while thinking | Narrate: "I'm weighing X against Y" |
| Ignoring the interviewer's hints | If they ask twice about something, that's the area they want |
| No failure discussion | Always cover: what's the SPOF, what happens on a partition |
| Over-engineering | "I'd start with a single Postgres and add complexity when measurements demand it" is often the *right* answer |
| Not drawing | Draw. Always draw. |

---

## 17.18 Sentences that score

Keep these in your head; deploy them at the right moment:

- *"Before I design anything — what's the read-to-write ratio?"*
- *"Let me do the arithmetic on that, because I think bandwidth is the binding constraint here."*
- *"The interesting part of this system is X; everything else is standard, so let me spend our time there."*
- *"I'd start simple with a single Postgres, and here's the specific measurement that would tell me it's time to shard."*
- *"That's not achievable — exactly-once across a process boundary isn't possible. What I can give you is at-least-once with idempotent consumers."*
- *"I'm choosing availability over consistency here, because a stale feed is better than an error. I'd choose the opposite for payments."*
- *"This is where I'd push back on the requirement — supporting 10,000 participants isn't a scaled-up version of 30, it's a different product."*
- *"I built something close to this and hit exactly this wall, which is why I'd do it differently now."*

That last one is your unfair advantage. Use it whenever it's true.

---

*Next: [Chapter 18 — HR and behavioural](18-HR-AND-BEHAVIOURAL.md)*
