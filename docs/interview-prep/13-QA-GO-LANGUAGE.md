# Chapter 13 — Go (120 questions)

> Go is your strongest language claim — it backs both the CNCF work and the job scheduler. Expect deep questions on concurrency, because that's what your resume advertises ("eliminated races and leaks").

---

## Section A — Language basics (Q1–30)

**Q1. Why does Go exist?**
Designed at Google for large-scale systems: fast compilation, simple syntax with a small spec, built-in concurrency, garbage collection, and a static binary with no runtime dependencies. It deliberately omits features (generics until 1.18, inheritance, exceptions) to keep codebases readable across large teams.

**Q2. Array vs slice?**
An array has a fixed length that's part of its type (`[5]int` and `[6]int` are different types) and is a value — assigning copies it. A slice is a view: a struct of pointer, length and capacity, pointing into a backing array.

**Q3. What happens on `append` when capacity is exceeded?**
A new, larger backing array is allocated (roughly doubling for small slices, growing more slowly for large ones), the elements are copied, and the new slice points at the new array. **The old slice still points at the old array** — which is the source of a lot of aliasing bugs.

**Q4. Show me the classic slice aliasing bug.**
```go
a := []int{1, 2, 3, 4, 5}
b := a[:2]          // len 2, cap 5 — shares backing array
b = append(b, 99)   // writes into a[2]!
// a is now [1 2 99 4 5]
```
The fix is a full slice expression `a[:2:2]` which caps capacity, forcing `append` to allocate.

**Q5. What does `copy` do?**
Copies `min(len(dst), len(src))` elements, returning the count. The correct way to get an independent slice.

**Q6. `make` vs `new`?**
`make` initialises slices, maps and channels and returns the type itself. `new(T)` allocates zeroed memory and returns `*T`. You almost always want `make`.

**Q7. What's the zero value concept?**
Every type has a usable zero value: `0`, `""`, `false`, `nil` for pointers/slices/maps/channels/interfaces/functions. Go's design encourages types that are useful at zero — `sync.Mutex` and `bytes.Buffer` both are.

**Q8. Is a nil slice usable?**
Yes — `len`, `range` and `append` all work on it. A nil *map* is readable but panics on write. That asymmetry is a common gotcha.

**Q9. How do maps work?**
Hash tables with buckets of 8 key-value pairs, chaining via overflow buckets, and incremental growth. Iteration order is deliberately randomised to stop code depending on it.

**Q10. Are maps safe for concurrent use?**
No. Concurrent read+write causes a runtime throw ("concurrent map writes") — Go deliberately detects and crashes rather than corrupting. Use a mutex or `sync.Map`.

**Q11. When is `sync.Map` the right choice?**
Narrow cases: a key written once and read many times, or disjoint key sets per goroutine. For general use, a plain map with a `sync.RWMutex` is faster and clearer.

**Q12. What are struct tags?**
Metadata strings read via reflection — `json:"name,omitempty"`, `db:"user_id"`. They're how encoding libraries map fields.

**Q13. Value receiver vs pointer receiver?**
A value receiver gets a copy; a pointer receiver can mutate and avoids copying large structs. **Rule: be consistent per type. If any method needs a pointer receiver, use pointer receivers for all of them**, because the method set rules otherwise surprise you.

**Q14. Explain the method set rule.**
A `*T` has methods with both value and pointer receivers. A `T` has only value-receiver methods. So `*T` may satisfy an interface that `T` doesn't — which is why you often need `&x` rather than `x` to pass something as an interface.

**Q15. What is an interface in Go?**
A set of method signatures. Satisfaction is implicit — no `implements` keyword. This means you can define an interface in the consuming package for a type in a package you don't control.

**Q16. What's the idiom about interface placement?**
*"Accept interfaces, return structs."* Define interfaces where they're consumed, keep them small. `io.Reader` with one method is the canonical example.

**Q17. What is an interface value physically?**
A two-word pair: a type descriptor and a data pointer.

**Q18. Explain the nil interface gotcha.**
```go
var p *MyError = nil
var err error = p
fmt.Println(err == nil)  // false!
```
The interface has a non-nil *type* word even though the data word is nil, so it isn't equal to the nil interface. **This is the single most-asked Go gotcha.** It's why you should return a bare `nil`, not a typed nil pointer.

**Q19. What's the empty interface and what replaced it?**
`interface{}` accepts anything. Go 1.18 added `any` as an alias, and generics mean you need it far less.

**Q20. What are generics and when should you use them?**
Type parameters with constraints: `func Map[T, U any](s []T, f func(T) U) []U`. Use when you'd otherwise write the same code for several types or reach for `interface{}` plus reflection. Don't use them to be clever — Go's culture still favours concrete code.

**Q21. What is a type switch?**
```go
switch v := x.(type) {
case string: ...
case int: ...
default: ...
}
```

**Q22. What's a type assertion and its two forms?**
`v := x.(T)` panics on failure; `v, ok := x.(T)` doesn't. Always use the two-value form unless a failure genuinely is a bug.

**Q23. How does Go handle errors?**
Errors are values returned explicitly. No exceptions. The pattern is `if err != nil { return err }`.

**Q24. Is that verbose, and is that a problem?**
It is verbose, and the trade is deliberate: every error site is visible, so you can't accidentally ignore one the way an unchecked exception allows. Having a view on this is good; complaining without the trade-off is not.

**Q25. How do you wrap errors?**
`fmt.Errorf("claiming job: %w", err)` — `%w` wraps so `errors.Is` and `errors.As` can unwrap through the chain.

**Q26. `errors.Is` vs `errors.As`?**
`Is` compares against a sentinel value (`errors.Is(err, sql.ErrNoRows)`). `As` extracts a concrete type into a target so you can read its fields.

**Q27. What is a sentinel error?**
A package-level `var ErrNotFound = errors.New("not found")` used for comparison. Useful, but it becomes part of your API contract.

**Q28. What is `panic` for?**
Unrecoverable programmer errors — a broken invariant. Not for expected failures. Library code should almost never panic across a package boundary.

**Q29. How does `recover` work?**
Only inside a deferred function, and it stops the panic unwinding. Legitimate uses: a server not dying because one request handler panicked, and a worker not dying because one job handler panicked (Chapter 12 Q75).

**Q30. How does `defer` work and what's the gotcha?**
Deferred calls run LIFO when the function returns. **Arguments are evaluated at defer time, not at execution time** — so `defer fmt.Println(i)` captures the current `i`. And `defer` in a loop accumulates until the function returns, which is how you leak file handles.

---

## Section B — Concurrency (Q31–75)

> This section is the heart of your Go credibility. Your resume says you eliminated races, so these must be effortless.

**Q31. What's a goroutine?**
A lightweight thread managed by the Go runtime. Starts at ~2KB of stack which grows and shrinks dynamically, so hundreds of thousands are practical.

**Q32. Goroutine vs OS thread?**
OS threads have fixed large stacks (often 1–8MB) and context switches go through the kernel. Goroutines are multiplexed onto threads by the Go scheduler in userspace, so switching is far cheaper.

**Q33. Explain the GMP model.**
**G** — goroutine. **M** — machine, an OS thread. **P** — processor, a scheduling context holding a local run queue. The number of Ps is `GOMAXPROCS`. An M must hold a P to run Go code. Work stealing balances load between Ps.

**Q34. Why does P exist?**
It decouples "how many goroutines can run in parallel" from "how many OS threads exist". When an M blocks in a syscall, it releases its P so another M can pick it up and keep running goroutines.

**Q35. What is `GOMAXPROCS`?**
The number of Ps, defaulting to the CPU count. In a container it historically read the host's CPU count rather than the cgroup limit — causing excessive parallelism and throttling. `automaxprocs` fixed this; **recent Go versions are cgroup-aware.** This is a great Kubernetes-adjacent answer.

**Q36. Is the Go scheduler preemptive?**
Since 1.14, yes — asynchronous preemption via signals. Before that it was cooperative, so a tight loop with no function calls could starve the scheduler and block GC indefinitely.

**Q37. What's a channel?**
A typed conduit for communication and synchronisation between goroutines.

**Q38. Buffered vs unbuffered?**
Unbuffered: send blocks until a receiver is ready — a rendezvous, which gives you a happens-before synchronisation point. Buffered: send blocks only when full.

**Q39. What happens on a nil channel?**
Send and receive block forever. Useful deliberately: setting a channel to nil in a `select` disables that case.

**Q40. What happens on a closed channel?**
Receive returns immediately with the zero value; `v, ok := <-ch` gives `ok == false`. **Sending to a closed channel panics. Closing a closed channel panics.**

**Q41. Who should close a channel?**
The sender, always — because only the sender knows there's nothing more coming, and a receiver closing risks a send-on-closed panic.

**Q42. What about multiple senders?**
Then no single sender can close safely. Use a `sync.WaitGroup` to wait for all senders, then close in a separate goroutine; or use a done channel for cancellation instead of closing the data channel.

**Q43. What does `select` do?**
Waits on multiple channel operations; if several are ready it picks pseudo-randomly. `default` makes it non-blocking.

**Q44. Why pseudo-random rather than in order?**
To prevent starvation — an always-ready first case would monopolise a deterministic select.

**Q45. What's the Go concurrency slogan?**
*"Don't communicate by sharing memory; share memory by communicating."* But the follow-up matters: **a mutex is often the right tool.** Channels are for transferring ownership and coordinating; a mutex is for protecting a shared data structure. Using channels for everything produces worse code.

**Q46. What's `sync.WaitGroup`?**
A counter: `Add` before starting goroutines, `Done` (deferred) in each, `Wait` to block until zero. **`Add` must be called before the goroutine starts, not inside it**, or `Wait` can return before the goroutine has incremented.

**Q47. `sync.Mutex` vs `sync.RWMutex`?**
`RWMutex` allows many concurrent readers or one writer. Better for read-heavy workloads, but it has higher overhead per operation, so for short critical sections with few readers a plain `Mutex` can be faster.

**Q48. What is `sync.Once`?**
Runs a function exactly once, safely under concurrency. **This is the correct fix for the lazy-initialisation singleton race you fixed in Kubescape** — make that connection explicitly.

**Q49. Show me the bug `sync.Once` fixes.**
```go
var instance *Client
func Get() *Client {
    if instance == nil {          // two goroutines can both see nil
        instance = newClient()    // both construct; one wins, one leaks
    }
    return instance
}
```
Two problems: a data race on `instance`, and duplicate construction leaking resources.

**Q50. What's double-checked locking and why doesn't it work naively in Go?**
Checking, locking, checking again. It's still a data race on the unsynchronised first read under Go's memory model, even if it appears to work. `sync.Once` is the correct primitive; `atomic.Pointer` is the correct manual alternative.

**Q51. What is `sync.Pool`?**
A free list of reusable objects to reduce allocation pressure. Contents can be cleared at any GC, so never store anything you need to persist.

**Q52. What's in `sync/atomic`?**
Lock-free operations on single words — `atomic.AddInt64`, `CompareAndSwap`, and the typed wrappers (`atomic.Int64`, `atomic.Pointer[T]`) added in 1.19. Use for counters and flags; a mutex for anything compound.

**Q53. What is a data race, formally?**
Two goroutines access the same memory location, at least one is a write, and there is no happens-before relationship ordering them.

**Q54. Data race vs race condition?**
A data race is the memory-model violation. A race condition is any timing-dependent correctness bug. You can have a race condition with no data race — e.g. a check-then-act where each step is individually mutex-protected.

**Q55. Give an example of a race condition with no data race.**
```go
mu.Lock(); v := m["k"]; mu.Unlock()
if v == 0 { mu.Lock(); m["k"] = 1; mu.Unlock() }   // another goroutine can interleave
```
Every access is protected; the logic is still wrong. **This is the distinction interviewers probe when your resume says you fixed races.**

**Q56. How does the race detector work?**
`go build -race` instruments memory accesses and maintains vector clocks to detect happens-before violations at runtime. It's based on ThreadSanitizer.

**Q57. What are its limitations?**
It only detects races on code paths that **actually execute concurrently during the run**. It won't find a race in an untested path. It also costs roughly 5–10× CPU and 5–10× memory, so it's a CI tool, not a production one.

**Q58. So how do you gain confidence you fixed a race?**
Write a test that deliberately exercises the concurrent paths, run it with `-race` and with `-count=100`, and run `-race` in CI on the whole suite. **"I ran -race and it passed once" is not evidence.**

**Q59. What is the Go memory model?**
The rules defining when a read is guaranteed to observe a write. Happens-before is established by: channel send/receive, mutex lock/unlock, `sync.Once`, `WaitGroup.Wait`, goroutine creation, and the atomics (which have sequentially-consistent semantics in Go).

**Q60. What is `context.Context` for?**
Carrying cancellation, deadlines and request-scoped values across API boundaries and goroutines.

**Q61. The context rules?**
Pass as the first parameter named `ctx`. Never store it in a struct. Never pass nil — use `context.TODO()` or `Background()`. Always call the `cancel` function, usually deferred, even if the operation completes — otherwise you leak the context's goroutine and timer.

**Q62. `WithCancel` vs `WithTimeout` vs `WithDeadline`?**
Manual cancellation; cancellation after a duration; cancellation at an instant. `WithTimeout` is `WithDeadline(now + d)`.

**Q63. How do you respect a context in a loop?**
```go
for {
    select {
    case <-ctx.Done():
        return ctx.Err()
    case job := <-jobs:
        process(job)
    }
}
```

**Q64. What is `context.WithValue` for, and what's the criticism?**
Request-scoped values like a trace ID. Criticised because it's untyped and invisible in signatures, so it becomes a hidden dependency. Use it for cross-cutting metadata only, never for required parameters.

**Q65. What's a goroutine leak?**
A goroutine that never terminates — blocked forever on a channel with no sender, or in a loop with no cancellation. It holds its stack and everything it references.

**Q66. How do you detect one?**
`runtime.NumGoroutine()` trending upward, a goroutine profile (`/debug/pprof/goroutine?debug=2` gives full stacks), or `goleak` in tests.

**Q67. What's the most common cause?**
Starting a goroutine that writes to an unbuffered channel whose reader gave up (e.g. the caller timed out). The goroutine blocks on send forever. Fix: a buffered channel of size 1, or select on `ctx.Done()` in the send.

**Q68. Show me the fix.**
```go
ch := make(chan result, 1)   // buffered so the sender never blocks
go func() { ch <- doWork() }()
select {
case r := <-ch: return r, nil
case <-ctx.Done(): return result{}, ctx.Err()   // goroutine can still send and exit
}
```

**Q69. What's the worker pool pattern?**
N goroutines ranging over a shared jobs channel, sending to a results channel, with a `WaitGroup` for completion and the sender closing the jobs channel.

**Q70. What is the fan-in/fan-out pattern?**
Fan-out: several goroutines reading from one channel to parallelise. Fan-in: merging several channels into one, typically with a goroutine per input and a `WaitGroup` to close the output.

**Q71. What is `errgroup`?**
`golang.org/x/sync/errgroup` — like `WaitGroup` but collects the first error and gives you a derived context cancelled on failure. `g.SetLimit(n)` bounds concurrency. **It's the right tool for the bulk cluster-import problem from KubeStellar** — bounded concurrency with partial failure handling.

**Q72. How do you bound concurrency without errgroup?**
A semaphore channel: `sem := make(chan struct{}, N)`, acquire with `sem <- struct{}{}` and release with `<-sem` in a defer.

**Q73. Why is `struct{}` used for semaphore and done channels?**
It occupies zero bytes — it signals without carrying data.

**Q74. What is a mutex deadlock and how do you avoid it?**
Two goroutines each holding a lock the other needs. Avoid by always acquiring locks in a consistent global order, keeping critical sections small, and never calling out to unknown code (a callback, an interface method) while holding a lock.

**Q75. What's lock contention and how do you find it?**
Goroutines spending time waiting on a mutex. `go test -mutexprofile` or `/debug/pprof/mutex` shows contended locks. Fixes: shard the lock, use `RWMutex` if read-heavy, or reduce the critical section.

---

## Section C — Tooling, testing, performance (Q76–100)

**Q76. What's in the standard toolchain?**
`go build`, `go test`, `go vet`, `go fmt`, `go mod`, `go generate`, `go tool pprof`, `go work`. Having a formatter and a test runner in the toolchain is a deliberate cultural choice.

**Q77. What does `go vet` catch?**
Suspicious constructs the compiler allows: printf format mismatches, unreachable code, struct tag errors, lock copying (copying a value containing a mutex), and loop variable capture in older versions.

**Q78. What is `staticcheck`?**
A much more thorough linter than vet — dead code, inefficient patterns, misuse of the standard library. Standard in serious Go projects, and almost certainly in the CNCF repos you contributed to.

**Q79. How do table-driven tests work?**
```go
tests := []struct{ name, input string; want Mount; wantErr bool }{
    {"basic", "36 35 98:0 /mnt1 /mnt2 rw,noatime ...", Mount{...}, false},
    {"malformed", "garbage", Mount{}, true},
}
for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) { ... })
}
```
**This is exactly the pattern for the `mountinfo` parser tests you wrote** — say so, and mention that `t.Run` gives you named subtests you can run individually with `-run`.

**Q80. What's the loop variable capture gotcha?**
Before Go 1.22, `for _, tt := range tests` reused one variable, so `t.Parallel()` subtests all saw the last element. The fix was `tt := tt` inside the loop. **Go 1.22 changed the semantics so each iteration gets a new variable** — knowing both the old bug and the fix is a good version-awareness signal.

**Q81. How do you write a benchmark?**
```go
func BenchmarkParse(b *testing.B) {
    for i := 0; i < b.N; i++ { Parse(input) }
}
```
Run with `go test -bench=. -benchmem`. `b.ResetTimer()` after expensive setup.

**Q82. What does `-benchmem` show?**
Allocations per operation and bytes per operation — usually more actionable than nanoseconds, because allocation drives GC pressure.

**Q83. What is `benchstat`?**
Compares benchmark runs statistically, so you can tell a real improvement from noise. Reporting a benchmark delta without it is reporting noise.

**Q84. How does Go fuzzing work?**
```go
func FuzzParse(f *testing.F) {
    f.Add("36 35 98:0 / /mnt rw - ext4 /dev/sda1 rw")   // seed corpus
    f.Fuzz(func(t *testing.T, s string) { _, _ = Parse(s) })   // must not panic
}
```
**For a `/proc` parser this is exactly the right tool** — it finds the malformed inputs you didn't think of, which table-driven tests by definition can't (Chapter 08 Q139).

**Q85. What are Ginkgo and Gomega?**
A BDD test framework and a matcher library. Chapter 01 Q18 covers the migration rationale.

**Q86. `Eventually` vs `Consistently`?**
Poll until it passes (convergence) vs assert it keeps holding (stability). Both are essential for Kubernetes controller tests because reconciliation is asynchronous.

**Q87. What's the main risk with `Eventually`?**
A too-generous timeout hides real slowness and makes suites long; a too-tight one causes flakes. And `Eventually` with a function that has side effects is a trap.

**Q88. How do you profile a Go program?**
`net/http/pprof` for a live service, or `-cpuprofile`/`-memprofile` from tests. Then `go tool pprof` with `top`, `list`, `web` for a graph, or a flame graph.

**Q89. What profiles are available?**
CPU, heap (in-use and allocated), goroutine, block (time blocked on synchronisation), mutex (lock contention), and threadcreate.

**Q90. Which would you use for a memory leak?**
The heap profile, taken twice with a gap, compared with `-base`. That shows what grew.

**Q91. Which for a goroutine leak?**
`goroutine?debug=2` — full stack traces of every goroutine. You look for hundreds blocked at the same line.

**Q92. Why is exposing pprof publicly dangerous?**
Information disclosure (goroutine stacks reveal internals and can contain data) plus DoS (a CPU profile request costs real CPU). **This is exactly the Kubescape fix you made — bind it to loopback so it's reachable only via `kubectl port-forward`.**

**Q93. Why does importing `net/http/pprof` for its side effect matter?**
It registers handlers on `http.DefaultServeMux`. If you also serve `DefaultServeMux` publicly, you've exposed profiling without writing a line of code to do it. **That's the trap, and explaining it well is the best version of your Kubescape answer.**

**Q94. How does Go's garbage collector work?**
Concurrent, tri-colour mark-and-sweep with a write barrier, non-generational and non-compacting. Tuned for low pause times (sub-millisecond) rather than maximum throughput.

**Q95. What is `GOGC`?**
The heap growth target — at the default 100, GC triggers when the heap doubles since the last collection. Higher means fewer collections and more memory; `GOMEMLIMIT` (1.19+) adds a soft memory ceiling, which is what you want in a container.

**Q96. Why does `GOMEMLIMIT` matter in Kubernetes?**
Without it, Go sizes the heap by `GOGC` alone and can exceed the container memory limit, getting OOM-killed. `GOMEMLIMIT` set slightly below the pod limit makes the GC work harder instead of dying. **Directly relevant to CNCF work and a very good answer.**

**Q97. Stack vs heap allocation in Go?**
The compiler decides via escape analysis — if a value's lifetime can't be proven to end with the function, it escapes to the heap. `go build -gcflags='-m'` shows the decisions.

**Q98. What causes escape?**
Returning a pointer to a local, storing in an interface, closures capturing by reference, and values whose size isn't known at compile time.

**Q99. How do you reduce allocations?**
Preallocate slices with `make([]T, 0, n)`, reuse buffers (`sync.Pool`), avoid unnecessary `interface{}` boxing, use `strings.Builder` instead of `+=` in loops, and pass large structs by pointer.

**Q100. Why is `strings.Builder` better than `+=`?**
String concatenation allocates a new string each time — O(n²) total for n appends. `Builder` amortises with a growing buffer.

---

## Section D — Modules, idioms, rapid-fire (Q101–120)

**Q101. What is a Go module?**
A versioned collection of packages defined by `go.mod`, with dependencies and their versions recorded, and `go.sum` holding cryptographic hashes for verification.

**Q102. How does Minimal Version Selection work?**
Go picks the *minimum* version satisfying all requirements, not the latest. Builds are therefore reproducible without a lockfile, and adding a dependency can't silently upgrade others.

**Q103. What is `go.sum` for?**
Hashes of module content, verified on download, so a module can't be swapped after publication. Combined with the checksum database, it defends against supply-chain tampering.

**Q104. What is `replace` for?**
Pointing a dependency at a local path or a fork. Common during development; a `replace` directive in a published module is a smell.

**Q105. Semantic import versioning?**
Major version 2+ must appear in the import path (`example.com/pkg/v2`), so two major versions can coexist in one build.

**Q106. What's `internal/`?**
A directory whose packages are importable only by code rooted at its parent. Compiler-enforced encapsulation.

**Q107. What's the standard project layout?**
`cmd/` for binaries, `internal/` for private packages, `pkg/` for public ones (contested — many argue against it), plus `api/`, `test/`. It's a community convention, not an official standard.

**Q108. How do you organise a Go service?**
By domain, not by layer. `job/`, `tenant/`, `worker/` rather than `models/`, `controllers/`, `services/`. Go's culture strongly favours this.

**Q109. What is `go generate` used for?**
Running code generators via directives — mocks, protobuf, stringer for enums. Ubiquitous in Kubernetes codebases (deepcopy functions, clients, informers).

**Q110. Why does Kubernetes generate so much code?**
Because the API machinery needs deepcopy methods, typed clients, listers and informers per type, and writing them by hand for hundreds of types is untenable. `controller-gen` produces them from markers on the types.

**Q111.** *What is `iota`?* — An incrementing constant generator within a const block, used for enums.
**Q112.** *How do you do enums in Go?* — A named type over int plus `iota` constants plus a `String()` method (generated by `stringer`). There's no real enum type, so exhaustiveness isn't checked.
**Q113.** *How do you make a type immutable?* — You can't enforce it; you convey it by unexported fields and only value receivers.
**Q114.** *What are build tags?* — `//go:build linux` constraints controlling which files compile. Essential for the `mountinfo` package, which is Linux-specific.
**Q115.** *What does `//go:embed` do?* — Embeds files into the binary at compile time. Useful for templates and static assets in a single-binary deploy.
**Q116.** *How do you cross-compile?* — `GOOS=linux GOARCH=arm64 go build`. No toolchain installation needed, which is one of Go's genuine superpowers.
**Q117.** *How do you build a minimal container image for a Go binary?* — Multi-stage: build in a golang image, copy the static binary into `scratch` or `distroless`. Set `CGO_ENABLED=0` for a truly static binary. Image goes from ~800MB to ~10MB.
**Q118.** *Why does `CGO_ENABLED=0` matter?* — Without it, the binary dynamically links libc (for DNS and user lookup) and won't run on `scratch`. With it, Go's pure-Go resolvers are used.
**Q119.** *What's your favourite thing about Go?* — Have an opinion. Good one: *"That reading unfamiliar Go is fast. The language has few ways to express a thing, so you spend your time understanding the problem rather than the idiom."*
**Q120.** *What frustrates you about Go?* — Also have one, and make it substantive: *"Nil interfaces holding typed nils, and the fact that `context` is passed everywhere but its values are untyped. Both are places where the type system stops helping exactly where I want it to."* A candidate with no criticism of their favourite language hasn't used it seriously.

---

*Next: [Chapter 14 — Kubernetes, CNCF and open source](14-QA-KUBERNETES-CNCF.md)*
