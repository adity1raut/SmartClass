# Chapter 12 — Distributed Job Scheduler (130 questions)

> **Resume line:** *Distributed Job Scheduler — Go, PostgreSQL, Redis, React, JWT. Multi-tenant platform supporting immediate, delayed, cron & batch jobs. Job claiming with Postgres SKIP LOCKED, ensuring zero duplicate claims across 50 workers. Fault-tolerant execution with backoff-retries, dead-letter queue & heartbeat-based recovery. JWT authentication, RBAC, and a Redis-backed rate limiter.*
>
> This is the most senior-sounding project on your resume. Prepare it as your primary deep-dive.

---

## Section A — Framing and design (Q1–25)

**Q1. What problem does this solve?**
Applications need work to happen outside the request path — sending email, generating reports, running scheduled tasks — reliably, with retries, across many workers, without duplicating work or losing it.

**Q2. Why not just use Celery / Sidekiq / BullMQ?**
*"For a production system I probably would. I built this because the interesting parts — exactly-once claiming, failure recovery, the state machine — are the parts a library hides, and I wanted to have actually solved them rather than configured them."* Own the "I built it to learn" framing confidently; it's the honest and respectable answer.

**Q3. Draw the architecture.**
Diagram 3.10.

**Q4. What are the components?**
An API (accepts job submissions, authenticates, rate-limits, validates, inserts), Postgres (the job store and the coordination primitive), a worker pool (claim, execute, report), a reaper (recovers stalled jobs), a cron materialiser (turns schedules into concrete rows), and a React dashboard.

**Q5. Why is Postgres the queue and not just the store?**
Because claiming *is* a database operation. Putting the queue in the database means the claim and any related business write commit in one transaction — no dual-write problem (Chapter 09 Q96).

**Q6. Walk me through the job state machine.**
`pending` → `running` → `succeeded`, or `running` → `failed` → back to `pending` (with a future `run_at`) if attempts remain, or → `dead_letter` if exhausted. A reaper can move a stalled `running` back to `pending`.

**Q7. Why is the state machine explicit rather than implicit?**
Because every transition is a place where a crash can occur, and naming them makes the recovery story explicit. An implicit "is it done" flag can't distinguish "never started" from "started and died".

**Q8. Show me the schema.**
```sql
CREATE TABLE jobs (
  id              BIGSERIAL PRIMARY KEY,
  tenant_id       UUID NOT NULL,
  type            TEXT NOT NULL,
  payload         JSONB NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending',
  priority        INT  NOT NULL DEFAULT 0,
  run_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  attempts        INT  NOT NULL DEFAULT 0,
  max_attempts    INT  NOT NULL DEFAULT 5,
  locked_by       TEXT,
  locked_at       TIMESTAMPTZ,
  last_heartbeat_at TIMESTAMPTZ,
  last_error      TEXT,
  idempotency_key TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX jobs_claim_idx ON jobs (priority DESC, run_at) WHERE status = 'pending';
CREATE INDEX jobs_reaper_idx ON jobs (last_heartbeat_at) WHERE status = 'running';
CREATE UNIQUE INDEX jobs_idem_idx ON jobs (tenant_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;
```
**Being able to write the schema with the right partial indexes is worth a lot.** Explain each index: the claim index only covers actionable rows and serves both filter and ordering; the reaper index only covers running rows; the idempotency index is partial so rows without a key don't collide.

**Q9. Why `JSONB` for the payload?**
Different job types have different payloads, and the scheduler shouldn't know their shapes. `JSONB` is indexable if you ever need to query inside it, unlike `JSON` or `TEXT`.

**Q10. Why `TIMESTAMPTZ` and not `TIMESTAMP`?**
`TIMESTAMPTZ` stores an absolute instant (normalised to UTC); `TIMESTAMP` is a wall-clock reading with no zone, so it's ambiguous across zones and DST. **For scheduling, always `TIMESTAMPTZ`.** A precise, commonly-missed answer.

**Q11. Where does the worker's clock come from?**
`now()` in the database, not the worker. Worker clocks drift; the database is the single authority. **This is an important detail — if workers used their own clocks, a skewed worker would claim jobs early or a reaper would reap healthy jobs.**

**Q12. What's the difference between a scheduler and a queue?**
A queue delivers work as soon as a consumer is free. A scheduler adds a *time* dimension — work becomes eligible at a point in time. Yours is both.

**Q13. How do you support the four job types?**
Immediate: `run_at = now()`. Delayed: `run_at = now() + delay`. Cron: a materialiser inserts the next occurrence as a normal row. Batch: a parent record with N child jobs, plus aggregate completion tracking.

**Q14. Why materialise cron rather than evaluating schedules in the claim query?**
Because the claim query must stay simple and indexable. Evaluating cron expressions in SQL on every poll would be a full scan. Materialising keeps the hot path a simple indexed range scan.

**Q15. How do you prevent two materialisers creating the same occurrence?**
A unique constraint on `(cron_job_id, scheduled_for)` — the second insert fails harmlessly. **Constraint-based coordination over lock-based coordination wherever possible.**

**Q16. How far ahead do you materialise?**
A rolling window (say the next hour), so a schedule change takes effect quickly and you don't accumulate rows for the next decade. Trade-off between responsiveness to schedule edits and materialiser frequency.

**Q17. What about DST and cron?**
The nasty one. "2:30am daily" doesn't exist on spring-forward and occurs twice on fall-back. You must decide a policy (skip, run once, run at the nearest valid time) and evaluate the cron expression in the tenant's timezone, not UTC. **Raising DST unprompted is a strong signal — it's the thing that separates people who've built schedulers from people who've read about them.**

**Q18. What is batch job tracking?**
A parent row with `total`, `completed`, `failed` counters updated atomically as children finish (`UPDATE ... SET completed = completed + 1`), so the parent is complete when `completed + failed = total`.

**Q19. Why atomic increments rather than counting children?**
Counting is O(N) per check. An atomic increment is O(1) and race-free because the update happens inside the database.

**Q20. What are the multi-tenancy requirements?**
Isolation (tenant A never sees B's jobs), fairness (A can't starve B), and quota (A can't consume everything).

**Q21. How do you enforce isolation?**
`tenant_id` on every row, plus Postgres Row-Level Security so a missing `WHERE` clause can't leak data (Chapter 09 Q106).

**Q22. How do you enforce fairness?**
The naive claim query is global FIFO, so a tenant that enqueues 100,000 jobs monopolises every worker. Fixes: a per-tenant concurrency cap enforced in the claim (`WHERE running_count(tenant) < cap`), or weighted round-robin where each worker poll picks a tenant first and then a job. **Volunteering the starvation problem before being asked is a strong move.**

**Q23. How would you implement a per-tenant concurrency cap efficiently?**
Maintain a `tenant_running` counter table updated in the same transaction as the claim, and join against it in the claim query. Or track it in Redis with atomic increment/decrement, accepting that a crash can leak a count until reconciled.

**Q24. What's your throughput?**
Have a number and its method: *"I load tested at roughly X jobs/second with 50 workers on a single Postgres instance; the binding constraint was update churn and autovacuum, not the claim query itself."* If you never measured, say so — *"I didn't load test it, which is a gap; I'd expect low thousands per second before vacuum pressure dominates"* is honest and shows you know where the limit is.

**Q25. What would you change if you rebuilt it?**
Good answers: move to `LISTEN/NOTIFY` to cut polling latency, partition the jobs table by status or time to bound vacuum cost, and add per-tenant fairness from the start rather than as a retrofit.

---

## Section B — Claiming and concurrency (Q26–55)

**Q26. Write the claim query and explain every clause.**
Chapter 09 Q89. Then: `status='pending'` and `run_at <= now()` select eligible rows; `ORDER BY priority DESC, run_at` gives fairness and ordering; `LIMIT` batches to amortise round trips; `FOR UPDATE` takes row locks; `SKIP LOCKED` means no worker blocks on another.

**Q27. Why batch (`LIMIT 10`) rather than one at a time?**
Amortises the round trip and transaction overhead. The cost: a worker that dies holding 10 claims delays 10 jobs until the reaper runs, instead of 1. It's a latency-vs-throughput knob.

**Q28. What would you set the batch size to?**
Small enough that a worker death doesn't stall much, large enough that the claim isn't the bottleneck. Tune from measurement; 5–20 is typical.

**Q29. Precisely how does `SKIP LOCKED` guarantee no duplicate claims?**
The row lock is acquired inside the transaction and held until commit. Between the `SELECT` and the `COMMIT`, no other transaction can lock those rows — and because they skip rather than wait, they simply never see them as claimable. After commit, `status='running'` excludes them from the filter permanently.

**Q30. What if the transaction rolls back?**
The locks release and the status change is undone, so the rows return to `pending` and another worker picks them up. That's correct behaviour — a failed claim is a no-op.

**Q31. Is there a window where a job is claimed but not marked running?**
Inside the transaction, yes — but it's invisible to others because of the lock. That's exactly why the `SELECT` and the `UPDATE` must be in the same transaction. **If they were separate transactions, two workers could both select the same row.**

**Q32. Could you do it in one statement?**
Yes, and it's arguably better:
```sql
UPDATE jobs SET status='running', locked_by=$1, locked_at=now(), last_heartbeat_at=now()
WHERE id IN (
  SELECT id FROM jobs WHERE status='pending' AND run_at <= now()
  ORDER BY priority DESC, run_at LIMIT $2 FOR UPDATE SKIP LOCKED
) RETURNING id, type, payload;
```
One round trip, implicitly one transaction, and `RETURNING` gives you the claimed work. **Being able to write this form shows real fluency.**

**Q33. Why is the subquery necessary rather than `UPDATE ... LIMIT`?**
Postgres's `UPDATE` doesn't support `LIMIT` or `ORDER BY` directly. The `IN (SELECT ... FOR UPDATE SKIP LOCKED)` pattern is the idiom.

**Q34. What happens under high contention with many workers?**
Workers skip past locked rows, so the effective cost is scanning past the rows other workers hold. With 50 workers each holding 10 rows, a worker may skip ~500 rows before finding free ones. Mitigations: a larger `LIMIT` in the inner select relative to contention, or randomised offsets.

**Q35. Does `SKIP LOCKED` break FIFO ordering?**
Yes, strictly — a worker may skip an older locked row and take a newer one. You get approximate ordering, not strict. **If strict ordering per key is required (e.g. all jobs for one user in order), you need a different design: partition by key and claim per partition.**

**Q36. How would you implement strict per-key ordering?**
Add a `partition_key`, and claim at most one running job per key — either via a unique partial index on `(partition_key) WHERE status='running'`, or by claiming the partition rather than the job.

**Q37. What is exactly-once and is it achievable?**
Not across a process boundary. You can have at-most-once (may lose) or at-least-once (may duplicate). Exactly-once *effects* are achievable by combining at-least-once delivery with idempotent handlers. **Say this precisely; it's the single most important answer in this chapter.**

**Q38. So is your resume line wrong?**
No, and know why: *"zero duplicate claims"* is a claim about claiming, which `SKIP LOCKED` does guarantee. It deliberately does not say "exactly-once execution". If asked, make the distinction yourself before they do.

**Q39. How do you make handlers idempotent?**
Give each job an idempotency key; the handler records "I processed key K" atomically with its side effect, and checks before acting. For an external API call, pass the key through so the remote side dedupes.

**Q40. What if the side effect is sending an email?**
Then you can't make it truly idempotent — you can only record intent before sending and check after. You choose: risk a duplicate email (send, then record) or risk a lost one (record, then send). Most systems choose duplicate. **Naming that as an unavoidable choice rather than a solvable problem is the mature answer.**

**Q41. What is a fencing token and why do you need one?**
A monotonically increasing number issued with each claim. The protected resource records the highest token it has seen and rejects writes with a lower one. It solves the split-brain case where a stalled worker resumes after being reaped — its write carries an old token and is rejected.

**Q42. Where does the token come from?**
A sequence, or the row's `version` column incremented on each claim. Then the completion update is `UPDATE jobs SET status='succeeded' WHERE id=$1 AND version=$2` — if the reaper re-claimed it, `version` changed and the update affects zero rows, which the worker detects.

**Q43. That's optimistic concurrency control, isn't it?**
Yes — and saying so connects it to the general pattern. The version check is a compare-and-swap.

**Q44. What's the difference between optimistic and pessimistic locking?**
Pessimistic: take the lock first, others wait (your `FOR UPDATE`). Optimistic: don't lock, detect conflict at write time via a version, retry on conflict. Pessimistic suits high contention; optimistic suits low contention with expensive locks.

**Q45. Why use pessimistic for claiming and optimistic for completion?**
Claiming is high-contention and short — locks are cheap and correct. Completion happens after a long execution you can't hold a lock across. **That's a genuinely thoughtful design point.**

**Q46. How do workers avoid busy-polling?**
Poll with a backoff when the queue is empty, and reset on a successful claim. Or `LISTEN/NOTIFY` so idle workers sleep until notified.

**Q47. Why not just poll every 100ms?**
50 workers at 10 polls/second is 500 queries/second of pure overhead on an idle system, each taking locks. Backoff matters.

**Q48. Explain your polling backoff.**
Something like: on empty, sleep `min(base * 2^consecutiveEmpty, cap)` with jitter; on success, reset. The jitter prevents 50 workers synchronising into a thundering herd every cycle.

**Q49. What's the latency cost of polling?**
Up to the poll interval. With a 5-second cap, a job enqueued just after a poll waits 5 seconds. `NOTIFY` reduces this to near-zero for the common case while polling remains the durable backstop.

**Q50. Why is `NOTIFY` not sufficient alone?**
It's not durable — a worker not connected when the notification fires never receives it. So a job enqueued during a worker restart would sit forever. **Belt and braces: NOTIFY for latency, polling for correctness.**

**Q51. How do you handle a worker that receives SIGTERM mid-job?**
Graceful shutdown: stop claiming, finish in-flight jobs up to a deadline, and for anything still running either let the reaper handle it or explicitly release the claim back to `pending`. Releasing explicitly is better — it avoids the heartbeat timeout delay.

**Q52. What does `locked_by` contain and why?**
A worker identifier (hostname + PID, or a UUID). It's for observability — "which worker has job 12345" — and for targeted recovery if you know a specific worker died.

**Q53. How do you detect a stuck job that's still heartbeating?**
Heartbeats prove liveness, not progress. A job stuck in an infinite loop heartbeats forever. You need a separate max-execution-time and a reaper that kills or fails jobs exceeding it regardless of heartbeat.

**Q54. Should the reaper kill the worker or just re-queue?**
Re-queueing alone creates the double-execution window. Ideally the worker self-enforces its own timeout (a `context.WithTimeout` around the handler) so it stops itself. **In Go this is exactly what `context` is for and it's the clean answer.**

**Q55. How many workers is optimal?**
Depends on whether jobs are I/O- or CPU-bound. I/O-bound: many more workers than cores. CPU-bound: roughly cores. And the real constraint is often the database connection pool — 50 workers each holding a connection is 50 connections, which is where PgBouncer comes in.

---

## Section C — Failure handling (Q56–85)

**Q56. Describe your retry policy.**
Exponential backoff with jitter, capped, with a maximum attempt count, after which the job goes to a dead-letter queue.

**Q57. Write the backoff formula.**
`delay = min(base * 2^attempts, cap)`, then apply jitter — full jitter is `rand(0, delay)`, equal jitter is `delay/2 + rand(0, delay/2)`. AWS's analysis found full jitter performs best for contention.

**Q58. Why jitter at all?**
Without it, N jobs that failed simultaneously (because a downstream went down) retry simultaneously, re-killing the recovering downstream. It's the thundering herd, and it's why a naive retry can turn a brief outage into a sustained one.

**Q59. Which errors should you retry?**
Transient: network timeouts, 5xx, 429, connection resets, deadlocks. Not: validation errors, 400, 404, auth failures, and anything deterministic. Retrying a permanent error wastes N attempts and delays the DLQ signal by hours.

**Q60. How does the handler communicate which kind it is?**
A typed error — in Go, a sentinel error or a custom type checked with `errors.Is`/`errors.As`. `ErrPermanent` short-circuits to the DLQ.

**Q61. What is a dead-letter queue?**
A holding area for jobs that exhausted retries, preserving the payload, the final error and the attempt history, so a human can inspect, fix and replay. It's the alternative to silently dropping or retrying forever.

**Q62. Is yours a separate table or a status?**
A status is simpler and keeps the history in one place; a separate table keeps the hot table small. Either is defensible — have a reason. *"A status, because the hot-path index is partial on `status='pending'` so dead-lettered rows cost the claim path nothing."*

**Q63. How do you replay from the DLQ?**
Reset `status='pending'`, `attempts=0`, `run_at=now()`. The important part is that replay must be safe, which again means idempotent handlers.

**Q64. What if the whole DLQ fills up because a downstream is broken?**
That's the signal working. You need alerting on DLQ growth rate — a sudden influx means a systemic failure, not individual bad jobs.

**Q65. What should you alert on?**
Queue depth and its rate of change, oldest pending job age (the best single latency indicator), DLQ arrival rate, worker heartbeat count, and claim latency.

**Q66. Why is "oldest pending job age" the best metric?**
Because queue *depth* can be high and healthy (a burst being processed) or low and unhealthy (workers dead, nothing enqueuing). Age directly measures "is work getting done".

**Q67. Explain heartbeat-based recovery.**
Workers update `last_heartbeat_at` on their claimed rows periodically. A reaper finds `running` rows whose heartbeat is older than a threshold and resets them to `pending`.

**Q68. How do you choose the threshold?**
Comfortably larger than the worst realistic pause: heartbeat interval × 3 or more, accounting for GC pauses and transient network issues. Too small causes false reaps (double execution); too large delays recovery.

**Q69. What's the failure mode of heartbeating?**
Split brain: a worker alive but stalled stops heartbeating, gets reaped, and then resumes. Two executions. Fencing tokens are the mitigation (Q41).

**Q70. How expensive is heartbeating?**
One UPDATE per worker per interval per held job. With 50 workers × 10 jobs × every 10 seconds that's 50 updates/second, each creating a dead tuple. **This is the vacuum pressure problem — and keeping `last_heartbeat_at` out of every index makes those HOT updates, which is a real optimisation (Chapter 09 Q86).**

**Q71. Could you heartbeat per worker instead of per job?**
Yes — a `workers` table with one row per worker, and the reaper finds jobs whose `locked_by` has a stale worker row. That's 50 updates/second regardless of job count. **Better design, and proposing it is a strong improvement.**

**Q72. What happens if the reaper dies?**
Stalled jobs are never recovered. So the reaper needs its own liveness monitoring, and ideally every worker can run the reaper logic guarded by an advisory lock so it's not a single point of failure.

**Q73. How do you ensure only one reaper runs?**
`pg_try_advisory_lock(constant)` — whoever gets it runs; others skip. Released automatically on disconnect.

**Q74. What's a poison-pill job?**
One that crashes the worker every time — so it's claimed, kills the process, gets reaped, claimed by the next worker, and takes down the entire fleet. Defence: track attempts and dead-letter aggressively, and isolate handler execution (panic recovery in Go) so a bad job fails the job rather than the process.

**Q75. How do you recover panics in Go?**
`defer func() { if r := recover(); r != nil { /* fail the job, log the stack */ } }()` inside the job execution goroutine. **Without this, one bad handler kills the worker.**

**Q76. Should you recover panics generally in Go?**
Generally no — a panic means an invariant is broken and continuing is unsafe. A worker executing untrusted handlers is one of the legitimate exceptions, and that nuance is worth stating.

**Q77. What if a job succeeds but the status write fails?**
The job is re-run. Same at-least-once story. The result recording should itself be idempotent.

**Q78. How do you handle a database failover?**
In-flight transactions abort; claimed jobs are stuck `running` until reaped. Workers need connection retry with backoff, and the reaper handles the rest. Nothing is lost because everything durable is committed.

**Q79. What if Postgres is down entirely?**
The system halts — no claims, no enqueues. That's correct behaviour for a system whose durability comes from the database. The API should return 503 rather than accepting jobs it can't persist.

**Q80. Is Postgres a single point of failure?**
Yes. Mitigate with streaming replication and automatic failover (Patroni), accepting a brief unavailability window. Avoiding it entirely would mean a distributed consensus store, which is a much bigger system.

**Q81. How do you test failure handling?**
Deliberately: kill workers mid-job and assert recovery; inject failures in handlers and assert backoff timings; run a chaos test that randomly kills processes and asserts every job eventually reaches a terminal state.

**Q82. What invariant would you assert in a chaos test?**
*"Every enqueued job eventually reaches `succeeded` or `dead_letter`, and every job's side effect occurred at least once and — given idempotent handlers — took effect exactly once."* Being able to state the invariant is the point.

**Q83. How would you test `SKIP LOCKED` correctness?**
Enqueue N jobs, start M workers, record every claim, assert every job was claimed exactly once and all N were claimed. Run it repeatedly, ideally with `-race`.

**Q84. How do you test time-dependent behaviour like backoff?**
Inject a clock interface rather than calling `time.Now()` directly, so tests can advance time instantly. **This is a major Go testing pattern and worth naming.**

**Q85. What's the hardest bug you hit building this?**
Have a real story. Good shapes: a claim that duplicated because the select and update were in separate transactions; a reaper threshold too aggressive causing double execution under load; connection pool exhaustion because workers held connections while executing.

---

## Section D — API, auth, rate limiting (Q86–110)

**Q86. Describe the API surface.**
`POST /jobs` (enqueue), `GET /jobs/:id` (status), `GET /jobs` (list, filtered, paginated), `DELETE /jobs/:id` (cancel), `POST /jobs/:id/retry`, plus cron CRUD and metrics.

**Q87. How do you cancel a running job?**
You can only *request* cancellation — set a `cancel_requested` flag that the worker checks, ideally by cancelling the handler's `context`. You cannot forcibly stop arbitrary code. A `pending` job can be cancelled outright by a status change.

**Q88. How does the worker observe cancellation?**
Polling the flag is one way; better is `LISTEN` on a cancellation channel, or simply checking `ctx.Done()` where the context is cancelled by the worker's own supervision loop after it sees the flag.

**Q89. How do you make enqueue idempotent?**
An `Idempotency-Key` header stored as a unique column; a duplicate insert returns the existing job rather than creating a second. This is what Stripe does and citing that is a good reference point.

**Q90. What does the unique constraint do on a duplicate?**
Raises a unique violation, which you catch and translate into "return the existing job, 200 instead of 201". `INSERT ... ON CONFLICT DO NOTHING RETURNING` combined with a follow-up select is the clean form.

**Q91. Describe your JWT setup.**
Chapter 08 covers the general material. Specific to this: tokens carry `tenant_id` and role, and the tenant is taken from the token — never from the request body. **Contrast this deliberately with the SmartClass bug; it shows you learned.**

**Q92. Describe your RBAC.**
Roles like `admin` (full tenant control), `operator` (enqueue, retry, cancel), `viewer` (read-only). Middleware checks the role against the required permission per endpoint.

**Q93. RBAC vs ABAC — which did you implement and why?**
RBAC, because the permission model is small and static. ABAC (policy on attributes) is warranted when permissions depend on resource properties — "can edit jobs of type X in environment Y".

**Q94. How do you prevent a tenant reading another's jobs?**
Every query scoped by the token's `tenant_id`, plus RLS as a backstop.

**Q95. Describe your rate limiter.**
Which algorithm, keyed on what (tenant + endpoint), implemented in Redis with atomicity via `INCR`+`EXPIRE` or Lua. Chapter 09 §E has all the detail.

**Q96. Why rate limit at all if jobs are queued anyway?**
Because unbounded enqueue lets one tenant fill the table, consume all workers and blow up storage. The queue smooths execution, not ingestion.

**Q97. Should you rate limit enqueue or execution?**
Both, for different reasons. Enqueue limiting protects the API and storage; execution concurrency limiting (per tenant) protects fairness and downstreams.

**Q98. What happens when a tenant is rate limited?**
429 with `Retry-After`, and clear error semantics so clients back off rather than hammering.

**Q99. Why must the limiter be atomic?**
Chapter 09 Q99 — a read-then-write races and undercounts exactly under load.

**Q100. What if Redis is down?**
Decide: fail open (accept the jobs, risk overload) or fail closed (reject, risk a full outage from a cache failure). For enqueue, a degraded in-process limiter as fallback is the pragmatic answer.

**Q101. Why Redis and not Postgres for the limiter?**
Because rate-limit counters are high-frequency, short-lived and disposable. Putting them in Postgres means write amplification and vacuum pressure on the same database that's doing the real work.

**Q102. What's the dashboard for?**
Queue depth, throughput, failure rates, DLQ contents with replay, per-tenant usage, and individual job inspection. The DLQ replay UI is the operationally important one.

**Q103. How does the dashboard get live updates?**
Polling, SSE or WebSocket. For a dashboard, SSE is a good fit — server-to-client only and simpler than WebSocket.

**Q104. What metrics would you expose?**
Prometheus-style: `jobs_enqueued_total{tenant,type}`, `jobs_completed_total{status}`, `job_duration_seconds` histogram, `queue_depth` gauge, `oldest_pending_seconds` gauge, `worker_count`.

**Q105. Counter vs gauge vs histogram?**
Counter: monotonically increasing total (enqueued). Gauge: a value that goes up and down (queue depth). Histogram: a distribution with buckets, letting you compute percentiles (job duration).

**Q106. Why not just average job duration?**
Averages hide the tail. A p99 of 30 seconds with a mean of 200ms is a completely different system from a uniform 200ms, and users experience the tail.

**Q107. How do you trace a job end to end?**
Propagate a trace ID from the enqueuing request into the job payload, and start a span in the worker linked to it. Otherwise the async boundary breaks the trace and you lose the causal chain.

**Q108. How do you version job payloads?**
A `version` field in the payload, with handlers supporting the current and previous versions during a rollout. Because jobs enqueued by the old code are executed by the new code, **handler changes must be backward compatible for at least one deploy cycle.** That's a subtle deployment constraint worth raising.

**Q109. What's the deployment order — API or workers first?**
Workers first, so they understand new payload shapes before the API produces them. It's the same expand/contract discipline as schema migration.

**Q110. How do you drain workers for a deploy?**
SIGTERM, stop claiming, finish in-flight with a deadline, release anything unfinished. Kubernetes gives you `terminationGracePeriodSeconds` and a `preStop` hook for this.

---

## Section E — Comparisons and design extensions (Q111–130)

**Q111. How does this compare to Kafka?**
Kafka is a distributed log — ordered per partition, consumers track offsets, replay is trivial, throughput is enormous. It's not a task queue: there's no per-message acknowledgement, no per-message retry, no delayed delivery. **Different tool for a different problem.**

**Q112. Compare to RabbitMQ.**
A real message broker with acknowledgements, dead-letter exchanges, priorities and delayed delivery via plugins. It's closer to your system than Kafka. The reason to still use Postgres is transactional coupling to your data.

**Q113. Compare to SQS.**
Managed, at-least-once, visibility timeouts (which are functionally your heartbeat/lock), and a built-in DLQ. It's your design as a managed service. Knowing that the visibility timeout is the same idea as your lock-with-heartbeat is a good connection to make.

**Q114. Compare to Temporal.**
A different abstraction entirely — durable execution of workflows, where the *code* is replayable and state is persisted between steps. It solves long-running multi-step processes rather than individual tasks. Mentioning it shows breadth.

**Q115. When would you use Kafka over this?**
Very high throughput event streaming, multiple independent consumers of the same stream, and replay of history. Not for "run this task with retries".

**Q116. How would you add a priority-with-fairness scheme?**
Weighted fair queuing: each tenant has a weight, and the claim selects proportionally. Implementable by picking a tenant first (weighted random or deficit round-robin) and then claiming within it.

**Q117. What is deficit round robin?**
Each queue accumulates a quantum of credit per round and can send while it has credit. It gives proportional fairness with O(1) per-packet cost. Applying it to job claiming is a nice answer.

**Q118. How would you support job dependencies (job B after job A)?**
A `depends_on` column, and the claim filters out jobs whose dependencies aren't `succeeded`. For a general DAG you need a proper workflow engine — which is where Temporal or Airflow come in.

**Q119. How would you support job timeouts per type?**
A `timeout_seconds` column, and the worker wraps handler execution in `context.WithTimeout`. The reaper's threshold should then be per-job rather than global.

**Q120. How would you handle jobs that need to run on specific workers?**
A `queue` or `tags` column, with workers claiming only from queues they serve. Necessary when jobs need specific hardware (GPU) or network access.

**Q121. How would you shard the jobs table?**
Partition by `status` (so the hot `pending` partition stays small) or by time range for completed jobs so old partitions can be dropped cheaply. Declarative partitioning in Postgres handles both.

**Q122. Why is dropping a partition better than deleting rows?**
`DROP TABLE` on a partition is instant metadata work; deleting millions of rows creates dead tuples and enormous vacuum load. **This is the standard answer for time-series retention.**

**Q123. How would you archive completed jobs?**
Move to a separate table or object storage on a schedule, keeping the hot table small. Retention should be a policy, not an accident.

**Q124. How would you add multi-region?**
The hard version. Options: one primary region with cross-region workers (simple, high latency), or independent regional deployments with routing by tenant (simpler than it sounds, and usually correct). Global consensus for a job queue is rarely worth it.

**Q125. What's the most under-appreciated part of this system?**
The reaper. Everyone builds the claim; the reaper is what makes it survive a crash, and it's where the subtle correctness problems (double execution, fencing, thresholds) actually live.

**Q126. What's the most over-engineered part?**
Be willing to criticise your own work. Candidate: batch job tracking, if you didn't have a real use case for it.

**Q127. If you had to cut one feature to ship a week earlier?**
Cron — it's the most self-contained and the least essential for a v1. Being able to identify the cut line shows product judgement.

**Q128. How does this project connect to your CNCF work?**
Directly: both are Go, both are about correctness under concurrency, and the race conditions you fixed in Kubescape's shared cluster state are the same class of problem as coordinating 50 workers. **Making that connection explicitly ties your resume together into one story rather than a list.**

**Q129. What did you learn?**
*"That most of the difficulty in a distributed system isn't the happy path — it's enumerating the ways a process can die between two lines of code, and making each of those survivable. The claim query is five lines; the reaper, the fencing and the idempotency requirements exist because of what happens in the gaps."*

**Q130. Sell this project in 30 seconds.**
*"A multi-tenant job scheduler in Go on Postgres. Fifty workers claim from one table with `SELECT FOR UPDATE SKIP LOCKED`, so nobody blocks and nobody duplicates a claim. Failures retry with jittered exponential backoff and dead-letter after a cap; stalled workers are detected by heartbeat and their jobs recovered. It supports immediate, delayed, cron and batch jobs, with JWT auth, RBAC and a Redis rate limiter. The thing I'd most want to talk about is why 'exactly-once' is the wrong goal and what I did instead."*

That last sentence is bait for the best possible follow-up question. Use it.

---

*Next: [Chapter 13 — Go](13-QA-GO-LANGUAGE.md)*
