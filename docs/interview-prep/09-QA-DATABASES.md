# Chapter 09 — Databases: MongoDB, PostgreSQL, Redis (150 questions)

> Your resume claims MongoDB, PostgreSQL and Redis. That's three different data models with three different consistency stories, and a good interviewer will make you compare them. The `SKIP LOCKED` line means Postgres locking questions are close to guaranteed.

---

## Section A — MongoDB fundamentals (Q1–30)

**Q1. What kind of database is MongoDB?**
A document database. Data is stored as BSON documents in collections, with a flexible schema — documents in the same collection need not share a shape.

**Q2. BSON vs JSON?**
BSON is a binary serialisation of JSON-like documents with extra types JSON lacks: `ObjectId`, `Date`, `Decimal128`, binary data, and distinct int32/int64/double. It's also length-prefixed, so it's traversable without full parsing.

**Q3. What's in an `ObjectId`?**
12 bytes: a 4-byte Unix timestamp, a 5-byte random value per process, and a 3-byte incrementing counter. It's roughly monotonic, so sorting by `_id` approximates sorting by creation time and you get a free `createdAt` index.

**Q4. Is `_id` always an ObjectId?**
No — it's whatever you set. It just must be unique and present; MongoDB generates an ObjectId if you don't supply one.

**Q5. When is MongoDB the right choice?**
Document-shaped data read and written as a unit, evolving schemas, heavy horizontal-scale reads, and hierarchical data. When the access pattern is known and stable, embedding beats joining.

**Q6. When is it the wrong choice?**
Highly relational data with many-to-many relationships, workloads needing complex multi-entity transactions, ad-hoc analytical queries across entities, and anywhere strong referential integrity matters.

**Q7. Was it right for SmartClass?**
Partly. Quizzes with embedded questions: yes, clearly. Enrolments, submissions and grades: no — those are relational, and you ended up hand-writing joins with `populate` and re-implementing referential integrity in application code. **Saying "I'd choose Postgres if I did it again" is the mature answer and costs you nothing.**

**Q8. Embed or reference — what's the rule?**
Embed when the child is owned by the parent, always read with it, and bounded in size. Reference when the child is shared, independently queried, or unbounded. The 16MB document limit is a hard ceiling, but document growth causing rewrites bites long before that.

**Q9. Give an example of each in your schema.**
Embed: `Quiz.questions[]` — owned, always read together, bounded. Reference: `Submission.student` → `User` — users exist independently and are shared across everything.

**Q10. `Course.enrolledStudents[]` is an unbounded array. Why is that a problem?**
Every enrolment grows the parent document, causing rewrites and index churn; a course with 10,000 students has a large document fetched on every read even when you only need the title. The unbounded-array anti-pattern is one of the most commonly tested MongoDB design questions.

**Q11. What's the outlier pattern?**
Handle the rare huge case differently — keep the first N in the array and overflow the rest to a separate collection, with a flag on the parent. It's how you keep the common case fast without breaking on outliers.

**Q12. What's the bucket pattern?**
Group many small time-series documents into buckets (e.g. one document per hour holding an array of readings) to reduce document count and index size. Relevant to any event-logging workload.

**Q13. What's the computed pattern?**
Precompute and store an aggregate (like `enrollmentCount`) rather than counting on every read. Trades write cost and staleness risk for read speed. Your `Enrollment.progress` is an instance of this.

**Q14. What's the schema versioning pattern?**
A `schemaVersion` field on each document so the application can handle multiple shapes during a lazy migration with no downtime.

**Q15. Does MongoDB support transactions?**
Yes since 4.0 for replica sets (and 4.2 for sharded clusters) — multi-document ACID transactions via sessions. They have real costs: they hold resources, have a default 60-second limit, and don't scale like single-document operations.

**Q16. Then why is single-document atomicity emphasised?**
Because operations on one document are always atomic without a transaction, and the document model is meant to let you put things that change together in one document. Needing transactions often signals that the schema is fighting the model.

**Q17. Where would you need a transaction in SmartClass?**
`deleteAssignment` — delete the assignment, delete its submissions, renumber the rest. Three writes that should be all-or-nothing.

**Q18. What are read and write concerns?**
Write concern: how many nodes must acknowledge a write (`w: 1`, `w: "majority"`) and whether it's journalled (`j: true`). Read concern: what consistency a read guarantees (`local`, `majority`, `linearizable`, `snapshot`).

**Q19. What does `w: "majority"` protect against?**
Losing an acknowledged write during a failover. With `w: 1`, a write acknowledged by a primary that then crashes before replicating can be rolled back — so the client was told it succeeded and it didn't.

**Q20. What's the default write concern?**
`w: "majority"` since MongoDB 5.0 (it was `w: 1` before). Knowing the default changed is a detail that shows you keep up.

**Q21. How does replication work?**
A replica set has one primary and multiple secondaries. Writes go to the primary and are recorded in the oplog, a capped collection; secondaries tail the oplog and apply the operations. On primary failure, an election (a Raft-like protocol) picks a new primary.

**Q22. What's the oplog and why does it matter?**
The operation log — an idempotent record of every write. It drives replication, and it's what change streams are built on. Its size bounds how far behind a secondary can fall before needing a full resync.

**Q23. What are change streams?**
A subscribable stream of database changes built on the oplog. **This is directly relevant to SmartClass:** instead of the application emitting a socket event after every write, a change stream could drive notifications, which removes the dual-write inconsistency. Proposing it is a strong architectural answer.

**Q24. Can you read from secondaries?**
Yes, via read preference (`secondaryPreferred`, etc.). The trade-off is stale reads because replication is asynchronous — you can write and then not see your own write. "Read your own writes" requires the primary or a causally consistent session.

**Q25. What is sharding?**
Horizontal partitioning across shards by a shard key. `mongos` routes queries; the config servers hold metadata. It's how MongoDB scales writes beyond one machine.

**Q26. How do you pick a shard key?**
High cardinality, even write distribution, and alignment with your common queries so they can target a single shard. A monotonically increasing key (like `_id`) creates a hot shard because all new writes land on one — that's the classic mistake.

**Q27. What would you shard SmartClass on if you had to?**
`courseId` for the content collections, because most queries are course-scoped, so they'd be targeted rather than scatter-gather. The risk is a very large course becoming a hot shard (a jumbo chunk).

**Q28. What's a scatter-gather query?**
One that doesn't include the shard key, so `mongos` must query every shard and merge. Latency becomes the slowest shard's, and it doesn't scale.

**Q29. What's the CAP theorem and where does MongoDB sit?**
Under a network partition you must choose consistency or availability. MongoDB is CP by default — during a partition the minority side has no primary and rejects writes, preserving consistency over availability.

**Q30. Is CAP a useful framework?**
Partly, and saying so is a good signal: it describes behaviour only during a partition, and real systems have tunable, per-operation trade-offs. PACELC extends it usefully — *during a Partition, trade Availability vs Consistency; Else, trade Latency vs Consistency* — which better describes what you actually tune day to day.

---

## Section B — MongoDB indexing and performance (Q31–60)

**Q31. What is an index, physically?**
A B-tree mapping field values to document locations, so lookups are logarithmic instead of a full collection scan.

**Q32. What indexes exist by default?**
Only `_id`. Everything else you create.

**Q33. Which indexes does your schema declare?**
`{student: 1, course: 1}` unique on Enrollment and `{quiz: 1, student: 1}` unique on QuizResult. Plus the unique index implied by `unique: true` on `User.email`.

**Q34. Which indexes are missing?**
Meaningful ones: `Assignment.course` (queried on every course page), `Submission.assignment`, `Submission.student`, `Material.course`, `Quiz.course`, `Course.teacher`, `Course.enrolledStudents`, `Notification.user`. **Every one of those fields is queried and none is indexed. That's the single biggest performance issue in the codebase and you should be able to list them.**

**Q35. How do you know an index is needed?**
`.explain("executionStats")` — look at `stage`. `COLLSCAN` means a full scan; `IXSCAN` means an index was used. Compare `totalDocsExamined` to `nReturned`: if you examined 10,000 documents to return 10, you need an index.

**Q36. What's a covered query?**
One answered entirely from the index, with no document fetch, because every field in the filter and the projection is in the index. `totalDocsExamined` is 0. Fastest possible query.

**Q37. What's the ESR rule for compound index field order?**
**E**quality fields first, then **S**ort fields, then **R**ange fields. Following it lets one index serve the filter and the sort without an in-memory sort.

**Q38. Why does field order matter at all?**
A compound index on `{a, b, c}` supports queries on `a`, `{a,b}` and `{a,b,c}` — a prefix — but not on `b` alone. It's ordered like a phone book sorted by surname then first name.

**Q39. What index would you build for `Assignment.find({course}).sort({order: 1, createdAt: 1})`?**
`{course: 1, order: 1, createdAt: 1}`. Equality on `course` first, then the sort fields in sort order. This is a real query in your code — being able to design its index on the spot is a strong moment.

**Q40. What's a partial index?**
An index built only over documents matching a filter — e.g. index submissions only where `status: 'submitted'`. Smaller index, cheaper writes, but only usable when the query includes the same condition.

**Q41. What's a sparse index?**
Indexes only documents where the field exists. Useful for optional fields like `googleId` — most users won't have one.

**Q42. Unique + sparse together — what's the catch?**
Multiple documents *missing* the field are allowed (they're not indexed), but the interaction with `null` values is subtle: a document with `googleId: null` is indexed and collides with another `null`. A partial index with `{$exists: true}` is the safer modern choice.

**Q43. What's a TTL index?**
An index on a date field with `expireAfterSeconds`; a background thread deletes expired documents roughly every 60 seconds. **Perfect for your Notification collection**, which currently grows forever — and for OTPs if you stored them in Mongo.

**Q44. What's a text index?**
Enables `$text` search with stemming and stop words. One text index per collection. For anything serious, Atlas Search (Lucene-backed) is far better.

**Q45. What's a multikey index?**
An index on an array field — MongoDB creates an entry per array element. `Course.enrolledStudents` would need one. You can't compound two array fields in one index.

**Q46. What's index intersection and why shouldn't you rely on it?**
MongoDB can combine two single-field indexes for one query, but it's usually slower than a purpose-built compound index and the planner often won't choose it.

**Q47. What are the costs of an index?**
Write amplification (every insert/update maintains every affected index), storage, and memory pressure — indexes compete for the WiredTiger cache. Unused indexes are pure cost.

**Q48. How do you find unused indexes?**
`$indexStats` reports access counts per index. Drop the ones with zero accesses over a representative window.

**Q49. How do you build an index on a live production collection?**
Modern MongoDB builds indexes with only a brief exclusive lock at start and end; older versions needed `background: true`. On a replica set you can also roll the build through members one at a time.

**Q50. What is WiredTiger?**
The default storage engine: document-level concurrency control via MVCC, compression (snappy by default), and a configurable cache (~50% of RAM by default). Document-level locking is why concurrent writes to different documents don't block each other.

**Q51. What's the working set and why does it matter?**
The data and indexes actively accessed. If it fits in RAM, you're memory-speed; if it doesn't, you're disk-speed, and performance falls off a cliff. Most MongoDB performance problems are the working set exceeding cache.

**Q52. What's an aggregation pipeline?**
A sequence of stages each transforming a stream of documents: `$match`, `$group`, `$sort`, `$project`, `$lookup`, `$unwind`, `$facet`.

**Q53. What's the single most important optimisation rule for pipelines?**
`$match` and `$limit` as early as possible, so later stages process fewer documents — and an early `$match` can use an index, which a later one cannot.

**Q54. Explain the aggregation in your dashboard.**
`$match` on courses in the teacher's set, then `$group` by course with `$sum: 1`. One round trip instead of N count queries.

**Q55. What's `$lookup` and how does it differ from `populate`?**
`$lookup` is a server-side left outer join executed inside the pipeline, so you can filter and group on joined data. `populate` is a Mongoose convenience that issues a second query and stitches client-side — it can't filter the parent by child fields and is N+1-prone.

**Q56. What's the N+1 problem in your code?**
Fetching a list then calling `populate` per item, or looping queries. Your dashboard avoids it with aggregation; be ready to point to a place where `populate` on a list is doing one extra query per document.

**Q57. What does `.lean()` do?**
Returns plain objects instead of Mongoose documents — significantly faster and lighter, at the cost of virtuals, getters, and `save()`. Any read-only endpoint should use it.

**Q58. How would you paginate?**
Cursor-based: `find({_id: {$gt: lastId}}).limit(n)`, using the index. `skip(n)` is O(n) — the server walks and discards n documents — so deep pagination degrades badly.

**Q59. What's the connection pool and how does it fail?**
The driver maintains a pool (default max 100 in recent drivers). Exhaustion happens when queries are slow (usually a missing index) and requests queue waiting for a connection. The symptom is timeouts everywhere, and the cause is almost never the pool size.

**Q60. How would you find your slowest queries?**
The database profiler (`db.setProfilingLevel`) or Atlas's Performance Advisor, which also suggests indexes. Then `explain` each candidate.

---

## Section C — Mongoose (Q61–75)

**Q61. What is Mongoose and what does it add?**
An ODM over the MongoDB driver: schemas, type casting, validation, middleware (hooks), virtuals, population, and query building.

**Q62. Downsides?**
It hides what queries actually run, casting rules surprise people, hooks create action at a distance, and `populate` encourages N+1. Some teams use the driver directly for exactly these reasons.

**Q63. What are pre and post hooks?**
Middleware around document and query operations. Your password hashing is a `pre('save')` hook.

**Q64. Why doesn't a `pre('save')` hook run on `findOneAndUpdate`?**
Because document middleware and query middleware are different. `findOneAndUpdate` is a query operation — it never instantiates a document, so `save` hooks don't fire. **This is a classic source of real bugs: a password updated via `findOneAndUpdate` would be stored in plaintext.** Very common interview question.

**Q65. Does that affect your code?**
`verifyOtp` uses `findOneAndUpdate({email}, {isVerified: true})` — no password involved, so it's safe. But it's exactly the pattern that would bite if someone later added a password update there.

**Q66. What is `runValidators`?**
Schema validators don't run on update operations by default; `{runValidators: true}` enables them. Another "update operations behave differently" trap.

**Q67. What's a virtual?**
A computed property not stored in the database — e.g. `fullName` from first and last. Not queryable, because it doesn't exist in storage.

**Q68. What does `timestamps: true` do?**
Adds and maintains `createdAt` and `updatedAt`. Your schemas use it throughout.

**Q69. Why does `unique: true` not validate?**
It's a request to create a unique index, enforced by the database. Violations surface as error code 11000, not a Mongoose validation error. If `autoIndex` is off (common in production configs) and the index was never created, it enforces nothing at all.

**Q70. What is `strict` mode?**
By default Mongoose drops fields not in the schema on save — protecting against mass assignment. `strict: 'throw'` errors instead, and `strict: false` allows anything.

**Q71. Why compare ObjectIds with `.toString()` or `.equals()`?**
`ObjectId` is an object; `===` compares references, so two ObjectIds with identical values are not `===`. Your code uses `.toString()` consistently — that's correct and worth noting.

**Q72. What does `select: false` do?**
Excludes a field from query results by default (e.g. a password hash), requiring explicit `.select('+password')`. **Your `User.password` isn't marked `select: false`, so every user query pulls the hash — a small but real defence-in-depth gap.**

**Q73. What are discriminators?**
Single-collection inheritance — multiple schemas sharing a collection with a discriminator key. Useful if you added multiple question types to quizzes.

**Q74. How do you handle schema changes?**
Mongo is schemaless at the storage layer, so adding an optional field needs no migration. Removing or renaming does — either a backfill script or lazy migration in application code.

**Q75. What's `bufferCommands`?**
Mongoose queues operations issued before the connection is ready rather than failing. It's why `connectDB()` without `await` in your `server.js` works despite the race.

---

## Section D — PostgreSQL and `SKIP LOCKED` (Q76–110)

> Your job scheduler makes this section non-optional.

**Q76. What does ACID stand for?**
Atomicity (all or nothing), Consistency (constraints preserved), Isolation (concurrent transactions don't interfere improperly), Durability (committed data survives a crash).

**Q77. Name the isolation levels and their anomalies.**
Read Uncommitted (dirty reads), Read Committed (non-repeatable reads, phantoms), Repeatable Read (phantoms in the standard), Serializable (none).

**Q78. What's Postgres's default and what does it actually give you?**
Read Committed. Each statement sees a snapshot taken at statement start, so you never read uncommitted data, but two reads in one transaction can differ.

**Q79. How does Postgres implement Repeatable Read?**
Snapshot isolation via MVCC — the transaction sees a snapshot taken at its start. Notably Postgres's Repeatable Read also prevents phantoms, which is stronger than the SQL standard requires.

**Q80. What's a write skew and which level prevents it?**
Two transactions read overlapping data, make disjoint writes, and together violate an invariant neither would alone (the classic: two doctors both going off-call because each sees the other is on-call). Snapshot isolation permits it; only Serializable prevents it.

**Q81. How does Postgres implement Serializable?**
SSI — Serializable Snapshot Isolation. It runs optimistically on top of snapshot isolation, tracks read/write dependencies, and aborts a transaction if a dangerous structure appears. So you must be prepared to retry on a serialization failure (SQLSTATE 40001).

**Q82. What is MVCC?**
Multi-Version Concurrency Control. Each update writes a new row version with visibility metadata (`xmin`/`xmax`), so readers never block writers and writers never block readers.

**Q83. What's the cost of MVCC?**
Dead tuples accumulate and need vacuuming. Table and index bloat, and transaction ID wraparound if vacuum can't keep up.

**Q84. What does VACUUM do?**
Reclaims space from dead tuples and freezes old transaction IDs to prevent wraparound. `VACUUM FULL` rewrites the table (taking an exclusive lock) and actually returns space to the OS.

**Q85. Why does this matter specifically for a job queue?**
A job queue is update-heavy — every job row is updated several times (claim, heartbeat, complete). Each update creates a dead tuple, so a busy queue table bloats fast. **Tuning `autovacuum_vacuum_scale_factor` down on that table is a real, specific piece of operational knowledge and a great thing to volunteer.**

**Q86. What's a HOT update?**
Heap-Only Tuple — if the update doesn't touch any indexed column and there's room on the same page, Postgres can skip updating the indexes. **So keeping `status` and `last_heartbeat_at` out of unnecessary indexes makes your queue updates dramatically cheaper.** This is an expert-level answer.

**Q87. Now: explain `SELECT ... FOR UPDATE`.**
It takes a row-level exclusive lock on every selected row, held until the transaction ends. Another transaction trying to lock the same row blocks.

**Q88. And `SKIP LOCKED`?**
Instead of blocking on an already-locked row, the query skips it and moves on. So concurrent workers each get a disjoint set of rows with no coordination.

**Q89. Write the claim query.**
```sql
BEGIN;
  SELECT id, payload FROM jobs
   WHERE status = 'pending' AND run_at <= now()
   ORDER BY run_at
   LIMIT 10
   FOR UPDATE SKIP LOCKED;
  UPDATE jobs SET status = 'running', locked_by = $1, locked_at = now(),
                  last_heartbeat_at = now()
   WHERE id = ANY($2);
COMMIT;
```

**Q90. What index supports it?**
`CREATE INDEX ON jobs (run_at) WHERE status = 'pending';` — a partial index on just the pending rows. It's small (only the actionable rows), it serves both the filter and the ordering, and it shrinks as jobs complete. Proposing the *partial* index rather than a plain composite is the strong answer.

**Q91. Is this exactly-once?**
Exactly-once *claiming*, not exactly-once *execution*. A worker can claim, execute, and die before recording the result; the reaper re-queues it and it runs again. **Exactly-once execution across a process boundary is not achievable — so handlers must be idempotent.** Say this; it's the difference between a student answer and an engineer's answer.

**Q92. What is `NOWAIT`?**
The other option: error immediately instead of blocking or skipping. Useful when you want to fail fast rather than pick a different row.

**Q93. `FOR UPDATE` vs `FOR NO KEY UPDATE` vs `FOR SHARE` vs `FOR KEY SHARE`?**
Decreasing strength. `FOR NO KEY UPDATE` is weaker than `FOR UPDATE` and doesn't block foreign-key checks — worth using when you're not changing the key.

**Q94. `SELECT FOR UPDATE` vs an advisory lock?**
Row locks are tied to actual rows and released at transaction end. Advisory locks are application-defined, keyed on an arbitrary integer, and can be session- or transaction-scoped. Advisory locks are useful for "only one instance should run this cron", which is a real need in your scheduler.

**Q95. How would you ensure only one reaper runs across many instances?**
`pg_try_advisory_lock(key)` — whoever gets it runs the reaper; the others skip. Simple and no extra infrastructure.

**Q96. Why did you use Postgres as the queue rather than Redis or Kafka?**
Transactionality. The job claim and the business state change commit together in one transaction. With a separate broker you have a dual-write problem: you can commit and fail to enqueue, or enqueue and fail to commit — which then needs the outbox pattern to fix. **This is the single best answer in this chapter.**

**Q97. What's the outbox pattern?**
Write the event to an `outbox` table in the same transaction as the business change, then a separate process reads the outbox and publishes. Atomicity is preserved because both writes are in one transaction, and publishing becomes at-least-once with idempotent consumers.

**Q98. When does Postgres-as-a-queue stop working?**
Low thousands of jobs per second, where the update churn, vacuum load and index maintenance dominate. Then you move to a purpose-built broker and accept the dual-write complexity.

**Q99. What's `LISTEN`/`NOTIFY` and would it help?**
Postgres pub/sub. Instead of workers polling, a trigger or the inserting transaction notifies, and idle workers wake immediately. It cuts polling latency and load. The caveat: notifications are not durable — a worker not connected at the time misses it — so you keep polling as a slower backstop and use NOTIFY as an accelerator.

**Q100. How do you handle delayed and cron jobs?**
Delayed: just set `run_at` in the future; the same claim query ignores it until due. Cron: a scheduler process materialises the next occurrence as a concrete pending row. **Keeping cron as a materialiser rather than special-casing it in the claim query keeps the hot path simple — say that.**

**Q101. How do you avoid two schedulers double-materialising a cron job?**
A unique constraint on `(cron_job_id, scheduled_for)` so the second insert fails harmlessly. Constraint-based coordination beats lock-based coordination wherever it's possible.

**Q102. How do you implement priority?**
`ORDER BY priority DESC, run_at` with the index updated to match. Watch for starvation of low-priority jobs — ageing (boosting priority with waiting time) is the standard fix.

**Q103. What's a deadlock in Postgres and how does it resolve?**
Two transactions each holding a lock the other needs. Postgres detects the cycle and aborts one with SQLSTATE 40P01. Prevention: always acquire locks in a consistent order. `SKIP LOCKED` largely sidesteps deadlocks in the queue because nobody waits.

**Q104. How do you handle a job that takes hours?**
Long-held transactions are bad (they block vacuum and hold connections), so you don't hold the claim transaction for the job's duration. You claim in a short transaction, mark `running`, then execute outside it, heartbeating periodically. **Your design does this and it's the correct pattern — make the point explicitly.**

**Q105. Multi-tenancy — how do you isolate tenants?**
`tenant_id` on every row plus Row-Level Security policies, so isolation is enforced by the database rather than by every query being written correctly. `SET LOCAL app.tenant_id` per transaction, and the policy references it.

**Q106. Why RLS rather than just scoping queries?**
Because one forgotten `WHERE tenant_id = ...` is a cross-tenant data leak, and code review is not a reliable control. RLS makes the secure behaviour the default.

**Q107. What's connection pooling and why does Postgres need it more than MongoDB?**
Postgres uses a process per connection, which is expensive — hundreds of connections is a real memory and scheduling cost. PgBouncer multiplexes many client connections onto few server connections. In transaction pooling mode you lose session-level features (prepared statements, `SET`, advisory session locks), which matters for your scheduler.

**Q108. What's a prepared statement and why does it help?**
The server parses and plans once, then executes many times with different parameters. It saves planning time and — critically — parameterisation prevents SQL injection by construction.

**Q109. What's `EXPLAIN ANALYZE`?**
`EXPLAIN` shows the planner's chosen plan and estimates; `ANALYZE` actually runs it and shows real timings and row counts. The gap between estimated and actual rows is the main diagnostic — a large discrepancy usually means stale statistics.

**Q110. Join algorithms — name them and when each is chosen.**
Nested loop (small outer, indexed inner), hash join (large unsorted inputs, equality only), merge join (both inputs sorted, good for range conditions). The planner picks on cost estimates from table statistics.

---

## Section E — Redis (Q111–135)

**Q111. What is Redis?**
An in-memory data structure server — strings, lists, sets, sorted sets, hashes, streams, bitmaps, HyperLogLog — with optional persistence.

**Q112. Is Redis single-threaded?**
Command execution is single-threaded, which is why operations are atomic without locks. Since 6.0 there's threaded I/O for network reads/writes, but the command execution core remains single-threaded.

**Q113. Why does single-threading make Redis fast?**
No lock contention, no context switching, and cache-friendly execution. The bottleneck is network and memory bandwidth, not CPU concurrency.

**Q114. What's the consequence for your code?**
A single slow command blocks everything. `KEYS *` on a large keyspace will stall the whole server — use `SCAN` instead. This is the classic Redis production incident.

**Q115. RDB vs AOF persistence?**
RDB: periodic point-in-time snapshots — compact, fast restart, but you lose everything since the last snapshot. AOF: append every write command — far better durability (`fsync` every second by default), larger files, slower restart. Most production setups use both.

**Q116. Is Redis durable?**
Not strictly. Even AOF with `everysec` can lose up to a second of writes. Treat Redis as a cache or as a store for data you can reconstruct — not as a system of record.

**Q117. What are your Redis use cases in the job scheduler?**
The rate limiter. Say what else you'd add: distributed locks, deduplication of idempotency keys, and a leaderboard/metrics layer.

**Q118. Implement a rate limiter with Redis.**
Fixed window: `INCR user:<id>:<window>`, and if the result is 1, `EXPIRE` it. If the count exceeds the limit, reject. Atomic because `INCR` is atomic, but the `INCR`+`EXPIRE` pair isn't — if the process dies between them you get a key with no TTL. A Lua script makes the pair atomic.

**Q119. Why is the fixed window flawed?**
Boundary bursts — 100 requests at 0:59 and 100 at 1:01 is 200 in two seconds against a "100 per minute" limit.

**Q120. Implement a sliding window.**
Sorted set per user: `ZREMRANGEBYSCORE` to drop entries older than the window, `ZCARD` to count, `ZADD` the current timestamp, `EXPIRE` the key. Exact, at the cost of one member per request in memory. Wrap it in a Lua script for atomicity.

**Q121. Implement a token bucket.**
Store tokens and last-refill timestamp in a hash; on each request compute elapsed time, add `rate × elapsed` tokens up to the capacity, and consume one if available. Must be a Lua script — the read-modify-write is otherwise racy.

**Q122. Why Lua rather than MULTI/EXEC?**
`MULTI/EXEC` queues commands and executes them atomically but you can't branch on intermediate results. Lua runs actual logic atomically on the server, so you can read, decide and write in one atomic step.

**Q123. What's `WATCH` and optimistic locking in Redis?**
`WATCH key` makes a subsequent `EXEC` fail if the key changed, giving compare-and-swap semantics. You retry on failure. It's the alternative to Lua for read-modify-write.

**Q124. What are Redis eviction policies?**
`noeviction` (errors on write when full), `allkeys-lru`, `allkeys-lfu`, `volatile-lru`, `volatile-ttl`, `allkeys-random`, `volatile-random`.

**Q125. Which for a rate limiter?**
`noeviction` or `volatile-*` — if rate-limit keys can be evicted under memory pressure, the limiter silently stops limiting exactly when the system is under load. That's a subtle and excellent point.

**Q126. LRU vs LFU?**
LRU evicts least recently used — good for temporal locality. LFU evicts least frequently used — better when some keys are persistently hot but accessed irregularly.

**Q127. What's a distributed lock in Redis and what's wrong with it?**
`SET key value NX PX ttl` — set if not exists with an expiry. The problems: if the holder pauses (GC, network) past the TTL, the lock is granted to someone else while the first still believes it holds it. Redlock (multi-node) doesn't fix this — Kleppmann's critique is the canonical reference. **The real answer is fencing tokens: each lock grant carries a monotonically increasing token, and the protected resource rejects writes with a stale token.**

**Q128. How do you release a Redis lock safely?**
Never plain `DEL` — you might delete someone else's lock if yours expired. Use a Lua script that checks the value matches your unique token before deleting. Compare-and-delete.

**Q129. What are Redis Streams?**
An append-only log with consumer groups, per-consumer acknowledgement, and a pending-entries list for unacknowledged messages — much closer to Kafka than to pub/sub. It's the right Redis primitive for a queue, unlike `LPUSH`/`BRPOP` which has no acknowledgement.

**Q130. Pub/Sub vs Streams?**
Pub/Sub is fire-and-forget — a subscriber that's offline misses messages entirely. Streams are durable and replayable with consumer tracking. **Socket.IO's Redis adapter uses Pub/Sub, which is why a brief Redis outage silently drops cross-instance events.**

**Q131. How does Redis Cluster work?**
16,384 hash slots distributed across nodes; keys hash to a slot. Multi-key operations must be in the same slot, which is what hash tags (`{user123}:profile`) are for.

**Q132. Redis Sentinel vs Cluster?**
Sentinel provides monitoring and automatic failover for a single master with replicas — high availability without sharding. Cluster provides sharding *and* availability.

**Q133. How would you cache SmartClass's dashboard with Redis?**
Key on `dashboard:teacher:<id>`, short TTL (30–60s), and invalidate on any write affecting that teacher's courses. The hard part is invalidation correctness, which is why a short TTL plus best-effort invalidation is usually the pragmatic answer.

**Q134. What's cache stampede and how do you prevent it?**
A popular key expires and many requests simultaneously recompute it. Prevention: a mutex so only one recomputes while others serve stale, probabilistic early expiration, or refresh-ahead.

**Q135. Cache-aside vs write-through vs write-behind?**
Cache-aside: application reads cache, misses, loads from DB, populates cache. Write-through: writes go through the cache to the DB synchronously — consistent, slower writes. Write-behind: cache acknowledges and flushes to the DB asynchronously — fast, risks loss.

---

## Section F — Comparative and design (Q136–150)

**Q136. SQL vs NoSQL — how do you actually choose?**
By access pattern and consistency needs, not by scale. If the data is relational and queries are ad-hoc, use SQL. If it's document-shaped and queries are known in advance, a document store fits. "NoSQL scales better" is mostly obsolete — Postgres scales very far.

**Q137. You used Mongo for SmartClass and Postgres for the scheduler. Justify both.**
*"SmartClass is document-shaped content — a quiz with its questions, a course with its materials — read as a unit, with an evolving schema while I was iterating. The scheduler is the opposite: the job state machine needs transactional guarantees and row-level locking, and `SKIP LOCKED` doesn't have a clean MongoDB equivalent. I'd actually move SmartClass's enrolment and grading model to Postgres too, because that half of it is relational and I ended up emulating joins."*

**Q138. Could you build the job scheduler on MongoDB?**
Yes — `findOneAndUpdate` with a filter on `status: 'pending'` is atomic and would claim a single job safely. What you'd lose is batch claiming in one operation and the transactional coupling to other business writes.

**Q139. What's eventual consistency?**
Replicas converge to the same state given no new writes, but reads may be stale in the interim. Fine for a social feed, wrong for a bank balance.

**Q140. Strong vs eventual — where does each belong in your apps?**
Grades and enrolment: strong. Notification read-status: eventual is fine. Being able to assign per-entity rather than per-system is the point.

**Q141. What's read-your-writes consistency?**
A user always sees their own writes, even if others might not yet. Achieved by routing that user's reads to the primary or using a causally consistent session. It's the minimum users actually notice.

**Q142. How would you handle a report query that's too slow?**
In order: index, then rewrite the query, then precompute (materialised view or a summary collection updated on write), then move it off the primary to a read replica or a warehouse.

**Q143. What's a materialised view?**
A stored query result, refreshed periodically. Postgres has them natively; in MongoDB you build one with `$merge` or `$out` in an aggregation.

**Q144. How do you do a zero-downtime schema migration in SQL?**
Expand-migrate-contract: add the new column nullable, backfill in batches, write to both old and new, switch reads, then drop the old. Never rename in place.

**Q145. Why backfill in batches?**
A single `UPDATE` over millions of rows holds locks, generates enormous WAL, and blocks vacuum. Batching with small transactions and pauses keeps the system live.

**Q146. What's a database index's effect on writes?**
Every insert and every update touching an indexed column must maintain the index. Ten indexes means roughly ten extra B-tree writes per insert — which is why "index everything" is wrong.

**Q147. How would you design the SmartClass schema in Postgres?**
`users`, `courses`, `enrollments` (with a unique constraint on `(student_id, course_id)`), `assignments` (unique on `(course_id, position)`), `submissions` (unique on `(assignment_id, student_id)`), `quizzes`, `questions`, `quiz_attempts`, `answers`. Foreign keys with appropriate `ON DELETE` behaviour — which gives you for free the cascade deletion you currently hand-code.

**Q148. What do you gain from that?**
Referential integrity enforced by the database, real transactions for the multi-step operations, real joins for the dashboard, and constraints that make the ordering race impossible.

**Q149. What do you lose?**
Schema flexibility during iteration, and the natural fit for the quiz-with-questions document. Though `jsonb` covers the latter well — Postgres is a perfectly good document store when you want one.

**Q150. Final: pick one database for a system you'd run for ten years.**
*"Postgres. It does relational, document (`jsonb`), full-text, vector (`pgvector`), queuing (`SKIP LOCKED`) and pub/sub (`LISTEN/NOTIFY`) adequately, and being adequate at six things in one operational footprint beats being excellent at one across six systems. I'd add specialised stores only when a measured requirement forces it."*

That's an opinionated, defensible answer — which is exactly what the question is testing.

---

*Next: [Chapter 10 — Node.js and Express](10-QA-NODE-EXPRESS.md)*
