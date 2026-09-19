# Chapter 10 — Node.js and Express (130 questions)

---

## Section A — The event loop and runtime (Q1–35)

**Q1. What is Node.js?**
A JavaScript runtime built on V8, with libuv providing an event loop and asynchronous I/O, so a single thread can handle many concurrent connections.

**Q2. Is Node single-threaded?**
Your JavaScript runs on one thread. Node itself is not single-threaded — libuv maintains a thread pool (default 4) for filesystem operations, DNS lookups, and CPU-bound crypto/zlib work. Network I/O uses the OS's event notification (epoll/kqueue/IOCP), not the pool.

**Q3. Name the event loop phases in order.**
timers → pending callbacks → idle/prepare → **poll** → check → close callbacks. Between each phase (and between each callback in modern Node), the microtask queues drain.

**Q4. What runs in each phase?**
timers: `setTimeout`/`setInterval` callbacks whose time has elapsed. pending callbacks: deferred system errors. poll: retrieve new I/O events and run their callbacks — this is where the loop spends most of its time and where it blocks waiting. check: `setImmediate`. close: `'close'` event handlers.

**Q5. `setTimeout(fn, 0)` vs `setImmediate(fn)` — which runs first?**
From the main module, it's non-deterministic — it depends on how long process startup took relative to the timer threshold. **Inside an I/O callback, `setImmediate` always runs first**, because you're in the poll phase and check comes immediately after, whereas timers must wait for the next loop iteration.

**Q6. Where does `process.nextTick` fit?**
It's not a phase — it's a separate queue drained after the current operation completes and **before** the promise microtask queue, between every phase transition. It has higher priority than promises.

**Q7. Give me the full ordering.**
Synchronous code → `process.nextTick` queue → promise microtask queue → then the next event loop phase. Within microtasks, the nextTick queue is fully drained before any promise callback.

**Q8. Why can `process.nextTick` starve the loop?**
Because the queue is drained completely before continuing, a `nextTick` callback that schedules another `nextTick` loops forever and I/O never runs. `setImmediate` doesn't have this problem — it yields to the loop.

**Q9. What is a microtask?**
A callback queued to run at the end of the current synchronous execution: promise reactions, `queueMicrotask`, `MutationObserver` in browsers. They run before any macrotask.

**Q10. Trace this output:**
```js
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
process.nextTick(() => console.log('4'));
setImmediate(() => console.log('5'));
console.log('6');
```
`1, 6, 4, 3, 2, 5` — sync first, then nextTick, then promises, then timers, then check. (The 2/5 order is the non-deterministic case from the main module; in practice with a 0ms timer already elapsed, 2 usually precedes 5.) **Be able to explain each step, not just recite it.**

**Q11. What blocks the event loop?**
Any synchronous CPU work: big JSON parse/stringify, synchronous crypto, regex backtracking, large array operations, `fs.readFileSync`. While it runs, no other request progresses.

**Q12. How do you detect blocking?**
Measure event loop lag: schedule a timer for N ms and measure the actual delay. `perf_hooks.monitorEventLoopDelay()` gives a histogram. Rising p99 lag is the signal.

**Q13. How do you handle CPU-bound work in Node?**
Worker threads (shared memory via `SharedArrayBuffer`, good for CPU work in-process), child processes (isolation), or offload to a separate service/queue. For SmartClass none of this is needed — everything is I/O-bound.

**Q14. `cluster` vs `worker_threads`?**
`cluster` forks whole processes that share a listening socket — used to use all CPU cores for a web server. `worker_threads` are threads inside one process with shared memory — used for CPU-bound computation. For an HTTP server you want cluster (or a process manager), not workers.

**Q15. Would clustering help SmartClass?**
It would use more cores, but **it would break the app**, because the `broadcasters` Map, `otpStore` and Socket.IO rooms are per-process. Clustering has the same prerequisite as horizontal scaling: move that state out first. **That connection is the answer they want.**

**Q16. What is libuv?**
The C library providing Node's event loop, thread pool, async filesystem, networking abstraction, and cross-platform event notification.

**Q17. What's in the thread pool by default and how do you change it?**
4 threads, set with `UV_THREADPOOL_SIZE` (max 1024). Relevant if you do heavy `fs` or `crypto` work — those queue on the pool and can be a hidden bottleneck.

**Q18. Does network I/O use the thread pool?**
No — sockets use epoll/kqueue/IOCP directly. This surprises people and is a good discriminating question.

**Q19. Callbacks vs promises vs async/await?**
Callbacks: the original, leads to nesting and has no built-in error propagation. Promises: composable, chainable, with `.catch`. async/await: promises with synchronous-looking syntax and `try/catch` — strictly the best default.

**Q20. What is callback hell and how does promisification help?**
Deep nesting from sequential async calls. `util.promisify` converts a callback API (error-first) into a promise-returning one, which then composes with `await`.

**Q21. `Promise.all` vs `allSettled` vs `race` vs `any`?**
`all` — resolves when all resolve, rejects immediately on the first rejection. `allSettled` — always resolves with per-promise status. `race` — settles with the first to settle, resolved or rejected. `any` — resolves with the first *fulfilled*, rejects only if all reject.

**Q22. Which does your dashboard use and is it right?**
`Promise.all`. It's right — if one count query fails, the dashboard is wrong anyway, so failing fast is correct. `allSettled` would be right if you wanted a partial dashboard.

**Q23. What's the bug in your `Promise.all` call?**
An `await` inside the array literal — `{$in: await Assignment.find(...).distinct("_id")}` — evaluates sequentially before `Promise.all` even starts, so that query isn't concurrent (Chapter 04 §4.6).

**Q24. What happens on an unhandled promise rejection?**
Since Node 15 the process crashes by default. Before that it was a warning. This is why every async handler needs error handling.

**Q25. How do you handle uncaught exceptions properly?**
Log with full context, then **exit and let the supervisor restart**. Continuing after an uncaught exception means running with corrupt state. `process.on('uncaughtException')` is for logging and cleanup, not for recovery.

**Q26. What are streams and why use them?**
An interface for processing data incrementally. Four types: Readable, Writable, Duplex, Transform. They let you handle data larger than memory and start work before the input finishes.

**Q27. What is backpressure?**
When a writable can't keep up with a readable. `write()` returns false; a correct producer pauses until `'drain'`. `pipe()` and `pipeline()` handle it for you; manual `write()` loops often don't, causing unbounded memory growth.

**Q28. `pipe()` vs `pipeline()`?**
`pipeline()` propagates errors and destroys all streams on failure. `pipe()` doesn't — an error in the middle leaks file descriptors. Always use `pipeline`.

**Q29. Where should SmartClass use streams?**
File uploads. Currently multer buffers the whole file in memory and then sends it to Cloudinary. Streaming directly from the request to Cloudinary would cap memory regardless of file size.

**Q30. What is the `EventEmitter`?**
Node's observer implementation — `on`, `once`, `emit`, `off`. Socket.IO, streams and the HTTP server are all built on it.

**Q31. What's the max listeners warning about?**
Node warns at 11 listeners on one event because it usually indicates a leak — listeners added in a loop or per-request and never removed. Raising the limit to silence it is almost always the wrong fix.

**Q32. CommonJS vs ESM?**
CJS: `require`, synchronous, dynamic, `module.exports`, has `__dirname`. ESM: `import`, statically analysable (enabling tree shaking), asynchronous loading, top-level await, no `__dirname`. **Your project is ESM (`"type": "module"`), which is why `app.js` reconstructs `__dirname` from `import.meta.url`.**

**Q33. Can you `require` an ESM module?**
Not traditionally — you use dynamic `import()`, which returns a promise. (Recent Node versions added limited synchronous require of ESM.) You *can* import CJS from ESM with default-export semantics.

**Q34. What's hoisting in ESM and why does it matter to your bootstrap?**
`import` statements are hoisted and evaluated before the module body. That's why `import "dotenv/config"` works as a side-effect import but a `dotenv.config()` call in the body would run too late for modules that read `process.env` at import time (Chapter 04 §4.3).

**Q35. How does `require` resolution work?**
Core modules → `node_modules` walking up the directory tree → `package.json` `main`/`exports` → `index.js`. ESM adds `exports` maps with conditional resolution (`import`/`require`/`node`/`browser`).

---

## Section B — Express (Q36–70)

**Q36. What is middleware?**
A function `(req, res, next)` in an ordered chain. It can modify `req`/`res`, end the response, or call `next()` to continue. Express is essentially a middleware runner.

**Q37. What are the middleware types?**
Application-level (`app.use`), router-level (`router.use`), error-handling (four arguments), built-in (`express.json`, `express.static`), and third-party (`cors`, `cookie-parser`).

**Q38. How does Express identify error middleware?**
By arity — a function with four parameters `(err, req, res, next)`. **If you write it with three, it's treated as normal middleware and never receives errors.** Classic bug and classic question.

**Q39. How do you pass an error to it?**
`next(err)`. In Express 4, an async function that rejects does *not* automatically do this — you need `try/catch` or a wrapper. **Express 5 forwards rejected promises from async handlers automatically, which is one of its headline changes and directly relevant since you're on Express 5.**

**Q40. What else changed in Express 5?**
Dropped support for old Node versions, removed deprecated APIs (`app.del`, `res.json(status, obj)`), stricter path-route matching (no more bare `*` — you need a named wildcard), `req.query` getter changes, and the promise rejection handling above.

**Q41. What's the difference between `app.use` and `app.get`?**
`app.use` matches any method and treats the path as a prefix. `app.get` matches the method and the full path pattern.

**Q42. Does middleware order matter?**
Critically. `cookieParser` before anything reading `req.cookies`; `express.json` before anything reading `req.body`; error middleware last; a catch-all 404 after all routes.

**Q43. Explain routers.**
`express.Router()` creates a mountable mini-application with its own middleware and routes. Your app mounts eleven of them under path prefixes.

**Q44. Why does `router.use(requireAuth)` in `ai.js` protect everything?**
Because it's registered before the route definitions, so it runs for every request into that router. It's the right pattern — a route added later is protected by default rather than by remembering.

**Q45. What's the difference between `res.send`, `res.json` and `res.end`?**
`res.json` serialises and sets `Content-Type: application/json`. `res.send` infers the type from the argument. `res.end` ends without a body or content type.

**Q46. What happens if you call `res.json()` twice?**
`ERR_HTTP_HEADERS_SENT`. Usually caused by a missing `return` before a response in a guard clause — `if (!x) res.status(400).json(...)` without `return` continues executing. **Check your controllers; most of yours do `return res.status(...)` correctly.**

**Q47. What is `req.params` vs `req.query` vs `req.body`?**
Route parameters from the path pattern; the query string; the parsed request body.

**Q48. How does `express.json()` work and what should you configure?**
It's `body-parser` — buffers the body and parses JSON. Configure `limit` (default 100kb) to cap payload size; without a sensible limit you have a memory DoS.

**Q49. What is `express.static` and its risks?**
Serves files from a directory. Risks: serving files you didn't intend, no access control, and directory traversal if you compose paths from user input (the same class as the Kubescape bug you fixed).

**Q50. How would you implement request timeouts?**
`server.requestTimeout` and `server.headersTimeout` at the HTTP server level, plus per-operation timeouts on outbound calls (Mongo `maxTimeMS`, the Anthropic client's timeout). **Your AI routes have none, so a hung upstream holds the connection forever.**

**Q51. How would you add a request ID for tracing?**
Middleware that generates a UUID, attaches it to `req`, sets it as a response header, and stores it in `AsyncLocalStorage` so any log call deep in the stack can retrieve it without threading it through every function.

**Q52. What is `AsyncLocalStorage`?**
Node's mechanism for context propagation across async boundaries — analogous to thread-local storage. It's how modern tracing and per-request context works without polluting every signature.

**Q53. How do you do graceful shutdown?**
On SIGTERM: stop accepting new connections (`server.close()`), finish in-flight requests with a timeout, close the Mongo connection and the Socket.IO server, then exit. Without this, a deploy drops in-flight requests.

**Q54. What is `app.set('trust proxy')` and when do you need it?**
When behind a load balancer or reverse proxy, so Express reads the client IP and protocol from `X-Forwarded-For`/`X-Forwarded-Proto` instead of the immediate peer. Required for correct rate limiting and for `secure` cookie detection. **Not set in your app, which would break IP-based rate limiting when you add it.**

**Q55. Express vs Fastify vs Koa vs NestJS?**
Express: ubiquitous, minimal, huge ecosystem. Fastify: faster, schema-based validation and serialisation built in, better TypeScript. Koa: minimal, async-first middleware with a different composition model. NestJS: opinionated, DI, decorators, Angular-like structure — good for large teams.

**Q56. Would you pick Express again?**
Honest: *"For a solo project, yes — the ecosystem and familiarity win. For a team project I'd look at Fastify or Nest, mainly because schema-based validation being built in would have prevented the validation and authorisation problems I ended up with."* Tying the framework choice back to your actual bug is a strong answer.

**Q57. How do you structure a growing Express app?**
Routes → controllers → services → repositories, with the controller doing only HTTP concerns (parse, call, respond) and the service holding business logic. **Your controllers currently do both**, which is why they're 450 lines and hard to test in isolation.

**Q58. Why does that matter?**
Because business logic coupled to `req`/`res` can only be tested through HTTP. Extracting a service means you can unit test the sequential-assignment rule directly.

**Q59. How would you refactor `submitAssignment`?**
Pull the sequential gate into `assignmentService.assertCanSubmit(studentId, assignment)` returning a result object, the upload into `fileService`, and the notification into the existing `notificationService`. The controller becomes ten lines.

**Q60. What is dependency injection and does Express need it?**
Passing dependencies in rather than importing them directly, so they can be swapped in tests. Express doesn't provide it; you can approximate with factory functions — which is exactly what `buildApp()` does for the app itself.

**Q61. How do you validate request bodies?**
Schema middleware (Zod/Joi/express-validator) per route. Chapter 08 §B has the implementation.

**Q62. What HTTP status codes do you use and when?**
200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable, 429 Too Many Requests, 500 Internal Server Error, 502/503/504 for upstream problems.

**Q63. What should an error response body look like?**
Consistent shape across the API: a machine-readable `code`, a human `message`, and optional `details`. **Yours returns `{error: "string"}` consistently — that's good, and the `blockedBy` field in the sequential-submission error shows where you extended it usefully.**

**Q64. Should error messages include stack traces?**
Never in production — they disclose file paths, library versions and logic. Log them server-side with a correlation ID and return the ID to the client.

**Q65. What's idempotency in HTTP?**
GET, PUT, DELETE, HEAD and OPTIONS are defined as idempotent; POST and PATCH are not. Idempotency makes client retries safe.

**Q66. What's the difference between PUT and PATCH?**
PUT replaces the entire resource with the representation supplied; PATCH applies a partial modification. Your update endpoints use PATCH and only set provided fields — correct semantics.

**Q67. What is HATEOAS and do you need it?**
Hypermedia as the Engine of Application State — responses include links to available transitions. Strictly it's a REST constraint; in practice almost nobody implements it and it's fine to say so.

**Q68. REST vs GraphQL for SmartClass?**
REST fits: resources are well-defined and the clients are known. GraphQL would help with the dashboard, which fetches many related things — a single query instead of several. The cost is query-complexity limiting, caching difficulty, and N+1 resolution needing DataLoader.

**Q69. How would you add caching to your API?**
`ETag`/`If-None-Match` for conditional requests on stable resources, `Cache-Control` for genuinely public data, and a Redis layer for the expensive dashboard aggregation.

**Q70. Why is caching hard for this app specifically?**
Nearly everything is user-specific and changes on write, so the cacheable surface is small. The dashboard is the exception, and it's also the most expensive query — which is exactly where to start.

---

## Section C — JavaScript language (Q71–105)

**Q71. `var` vs `let` vs `const`?**
`var` is function-scoped and hoisted with an `undefined` initialisation. `let`/`const` are block-scoped and in the temporal dead zone until initialised. `const` prevents rebinding, not mutation.

**Q72. What is the temporal dead zone?**
The region between entering a scope and a `let`/`const` declaration being evaluated, where referencing the variable throws `ReferenceError`. It exists to catch use-before-declaration.

**Q73. What is a closure?**
A function together with the lexical environment it captured. It's why the OTP `setTimeout` can still reference `email` after `saveOtp` returned, and why event handlers can hold references to stale state in React.

**Q74. How do closures cause memory leaks?**
A retained closure retains its whole enclosing scope. An event listener never removed keeps everything its handler closed over alive. Your socket handler cleanup matters for exactly this reason.

**Q75. How does `this` work?**
Determined by call site for normal functions: method call → the object; plain call → `undefined` in strict mode; `new` → the new instance; `call`/`apply`/`bind` → explicit. **Arrow functions have no own `this`** — they capture it lexically.

**Q76. Why does the Mongoose `pre('save')` hook use `function` rather than an arrow?**
Because Mongoose calls it with `this` bound to the document. An arrow function would capture the module scope and `this.password` would be undefined. **This is a real, practical instance in your own code and a great answer.**

**Q77. What is the prototype chain?**
Every object has an internal prototype link; property lookup walks the chain until found or null. `class` is syntax over this.

**Q78. `==` vs `===`?**
`==` performs type coercion with a non-obvious algorithm; `===` compares type and value. Use `===` except for the idiomatic `x == null` which checks both `null` and `undefined`.

**Q79. What are falsy values?**
`false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`. Everything else is truthy — including `[]` and `{}`, which is why `if (await Model.find(...))` is always true.

**Q80. `??` vs `||`?**
`??` only falls back on `null`/`undefined`; `||` falls back on any falsy value. **`maxScore || 100` in your code means a legitimate `maxScore: 0` becomes 100.** A real bug class and a great example to cite.

**Q81. `?.` optional chaining — what does it guard?**
Short-circuits to `undefined` if the value before it is `null`/`undefined`. Your `req.cookies?.sc_token` and `msg.content[0]?.text` both use it.

**Q82. Shallow vs deep copy?**
Spread and `Object.assign` are shallow — nested objects are shared. Deep copies: `structuredClone` (native, handles cycles and more types), or `JSON.parse(JSON.stringify(x))` which loses `Date`, `undefined`, functions and throws on cycles.

**Q83. What is destructuring with defaults?**
`const { num_questions: numQ = 5, difficulty = "medium" } = params;` — extract, rename and default in one expression. Used throughout your `llm.js`.

**Q84. `map` vs `forEach` vs `reduce` vs `filter`?**
`map` transforms to a new array; `forEach` iterates for side effects and returns undefined; `filter` selects; `reduce` folds to any accumulator.

**Q85. Why is `forEach` with async callbacks a bug?**
`forEach` ignores returned promises, so it doesn't wait — the loop finishes before any async work completes, and rejections are unhandled. **Your `course.enrolledStudents.forEach(id => pushNotification(...))` is exactly this pattern.** It happens to be acceptable because `pushNotification` is deliberately fire-and-forget and never throws, but you should be able to say precisely why it's safe *here* and unsafe in general.

**Q86. What's the correct pattern when you do need to wait?**
`await Promise.all(items.map(async (x) => {...}))` for concurrency, or a `for...of` loop with `await` for sequential.

**Q87. Why might you want sequential rather than concurrent?**
Rate limits, ordering requirements, or bounded resource use. Unbounded `Promise.all` over 10,000 items opens 10,000 concurrent operations — you need a concurrency limiter (`p-limit`).

**Q88. What's the difference between `for...in` and `for...of`?**
`for...in` iterates enumerable string keys including inherited ones; `for...of` iterates iterable values. Use `for...of` for arrays.

**Q89. What is a `Map` and when is it better than an object?**
Any key type, preserves insertion order, has `size`, no prototype collisions, and better performance for frequent additions and deletions. **Your `broadcasters` and `otpStore` are both `Map`s — correct choice, and you should say why: the keys are dynamic and the collection mutates constantly.**

**Q90. `Set` vs array for membership?**
`Set.has` is O(1); `Array.includes` is O(n). Your sequential-assignment check builds a `Set` of completed IDs for exactly this reason.

**Q91. What are `WeakMap` and `WeakSet` for?**
Keys are held weakly, so entries don't prevent garbage collection. Used for attaching metadata to objects without leaking.

**Q92. What is `Symbol` used for?**
Unique property keys that won't collide, and well-known symbols that hook language behaviour (`Symbol.iterator`, `Symbol.asyncIterator`).

**Q93. What is a generator?**
A function that can pause and resume with `yield`, producing an iterator. Useful for lazy sequences and, historically, for coroutine-style async before async/await.

**Q94. What's an async iterator?**
An object with `Symbol.asyncIterator`, consumed by `for await...of`. It's how you idiomatically consume a stream or a paginated API.

**Q95. What is event delegation?**
Attaching one listener to a common ancestor and using `event.target` rather than one listener per element. Fewer listeners, and it handles dynamically added elements.

**Q96. What's the difference between `null` and `undefined`?**
`undefined` means never assigned; `null` is an explicit "no value". In Mongo/Mongoose, `null` is stored and `undefined` fields are omitted — which matters for queries with `$exists`.

**Q97. What is `JSON.stringify` doing with `undefined`?**
Drops it from objects, converts it to `null` in arrays. Also drops functions, throws on cycles and on `BigInt`.

**Q98. How does garbage collection work in V8?**
Generational: a small young generation collected frequently with scavenging (copying), and an old generation collected with mark-sweep-compact, mostly incrementally and concurrently to limit pause times.

**Q99. What causes a memory leak in Node?**
Unbounded caches, uncleaned event listeners, timers holding closures, and global accumulation. Diagnose with heap snapshots taken at intervals and compared.

**Q100. What is `--max-old-space-size`?**
The V8 old-generation heap limit. Raising it is sometimes necessary; more often it delays an OOM caused by a genuine leak.

**Q101. `Object.freeze` — deep or shallow?**
Shallow. Nested objects remain mutable.

**Q102. What is currying and where is it useful?**
Transforming `f(a, b)` into `f(a)(b)`. In Express it's the standard pattern for parameterised middleware: `validate(schema)` returns the actual middleware.

**Q103. What is memoization?**
Caching a pure function's results by argument. Needs bounded size or a TTL, otherwise it's a leak.

**Q104. What's the difference between throwing and rejecting?**
Inside an `async` function they're equivalent — a `throw` becomes a rejection. Outside, `throw` is synchronous and won't be caught by `.catch()`.

**Q105. What is `Error.cause`?**
The standard way to wrap an error while preserving the original: `new Error("failed to grade", { cause: err })`. Better than string concatenation because the stack is preserved.

---

## Section D — Testing, tooling, operations (Q106–130)

**Q106. Vitest vs Jest?**
Vitest is Vite-native, ESM-first, much faster startup, and uses the same config as the app. Jest is more mature with a larger ecosystem but has historically awkward ESM support. **For an ESM project like yours, Vitest is clearly the right choice — say so.**

**Q107. What does Supertest do?**
Binds your Express app to an ephemeral port and gives a fluent API for making requests and asserting on responses. It tests the real middleware chain.

**Q108. What's the difference between a unit and an integration test?**
Unit: one function in isolation with dependencies mocked. Integration: multiple real components together. Yours are integration tests.

**Q109. What's the test pyramid, and do you agree with it?**
Many unit, fewer integration, fewest E2E. The modern counterargument (the "testing trophy") is that integration tests give the best confidence-per-cost for web APIs, which is what your suite does. Having a view is what matters.

**Q110. How do you mock an ESM module in Vitest?**
`vi.mock('path', factory)`. It's hoisted above imports. Your `setup.js` mocks `socketService` and `NodeMailer` this way.

**Q111. Why mock the mailer rather than use a test SMTP?**
Speed, determinism, no external dependency, and it lets you extract the OTP directly. A local test SMTP (MailHog) is the alternative when you want to test the email content itself.

**Q112. What's a test double taxonomy?**
Dummy (passed but unused), stub (canned responses), spy (records calls), mock (asserts on interactions), fake (working lightweight implementation — `mongodb-memory-server` is a fake).

**Q113. What makes a good test?**
Deterministic, isolated, fast, one reason to fail, and readable as a specification. Names should describe behaviour, not implementation.

**Q114. How would you improve your suite?**
Negative authorisation tests per route, socket handler tests, AI layer tests with a mocked client, and at least a smoke E2E for the critical flow.

**Q115. How do you measure and use coverage?**
`vitest run --coverage` with v8. Use it to find untested areas, not as a target. Chapter 01 Q19 has the full position.

**Q116. What is snapshot testing and when is it harmful?**
Serialising output and comparing to a stored snapshot. Harmful when snapshots are large and updated reflexively — then they assert nothing.

**Q117. How do you test time-dependent code?**
Inject a clock or use `vi.useFakeTimers()`. Your OTP expiry and due-date logic both depend on time and would need this.

**Q118. What is ESLint flat config?**
The `eslint.config.js` format replacing `.eslintrc`, using plain JS exports and explicit imports of plugins. Your project uses it.

**Q119. ESLint vs Prettier — what's the division?**
ESLint finds problems (correctness, patterns); Prettier formats. Running both means disabling ESLint's formatting rules so they don't fight.

**Q120. Why enforce format in CI?**
Removes formatting from code review entirely. Your `frontend-lint` job runs `prettier --check` — say that it exists so reviewers argue about logic, not commas.

**Q121. What's missing from your CI?**
Backend lint (the script exists but isn't run), `npm audit`, a coverage threshold, and any E2E.

**Q122. How do you debug a running Node process?**
`node --inspect`, then Chrome DevTools or the VS Code debugger. For production, `--cpu-prof` and `--heap-prof`, or a continuous profiler.

**Q123. How do you profile CPU usage?**
`node --cpu-prof` produces a `.cpuprofile` you load in DevTools, or use `clinic.js` / `0x` for flame graphs.

**Q124. What is a flame graph and how do you read it?**
Stack depth on the y-axis, time on the x-axis (sorted alphabetically, not chronologically). Wide bars are where time is spent. You look for wide plateaus, not tall towers.

**Q125. How do you structure logs?**
JSON with a consistent schema: timestamp, level, message, request ID, user ID, and event-specific fields. Machine-parseable beats human-pretty in production.

**Q126. What log levels and when?**
`error` (needs attention), `warn` (unexpected but handled), `info` (business events), `debug` (development detail). The discipline is that `error` should be actionable — if nobody acts on it, it's a `warn`.

**Q127. What would you instrument first in SmartClass?**
Request rate, error rate and latency per route (RED), Mongo query duration, AI call duration and cost, Socket.IO connection count, and event loop lag.

**Q128. What is OpenTelemetry?**
A vendor-neutral standard for traces, metrics and logs, with auto-instrumentation for Express, Mongo and HTTP. It's the right default for a new service.

**Q129. What's the difference between logs, metrics and traces?**
Logs are discrete events, metrics are aggregated numbers over time, traces follow one request across components. You need all three — metrics tell you something's wrong, traces tell you where, logs tell you what.

**Q130. Your service is slow. Walk me through the diagnosis.**
*"Metrics first — is it all routes or one? Is error rate up too? Then event loop lag: if it's high, something is blocking the loop. If lag is fine, it's downstream — check Mongo query duration and the AI call duration separately, because they fail very differently. If one route is slow and the DB is slow with it, it's almost certainly a missing index, and I'd `explain` the query. If the DB is fine and the route is slow, I'd CPU-profile."*

Method over guesses. That's the answer.

---

*Next: [Chapter 11 — React and frontend](11-QA-REACT-FRONTEND.md)*
