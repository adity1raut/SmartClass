# Chapter 14 — Kubernetes, CNCF and Open Source (140 questions)

> **This chapter covers your strongest differentiator.** Very few student candidates have merged security fixes and race-condition fixes in CNCF projects. Prepare this like it's the headline, because for infra/platform roles it is.

---

## Section A — Your open-source narrative (Q1–25)

**Q1. Tell me about your open-source work.**
Structure it: scale → projects → the kind of work → one concrete example. *"Around 185 merged PRs, mostly across three CNCF projects — Kubescape, a Kubernetes security scanner; Fluid, a data-orchestration project at Incubating level; and KubeStellar, multi-cluster management, where I was an IFOS intern. The work splits into three kinds: security fixes, concurrency fixes, and test infrastructure. The one I'd point to is a path traversal in Kubescape's handler resolution."*

**Q2. How did you get started?**
Be honest and concrete. A good shape: *"I started with documentation and `good first issue` labels, which got me familiar with the contribution process. After a few of those I stopped looking at the issue tracker and started reading code around things I'd already touched, because bugs cluster."*

**Q3. What's the hardest part of contributing to a large unfamiliar codebase?**
*"Building enough context to be confident a fix is correct rather than locally plausible. In a 500k-line Go codebase you can make a change that passes tests and still be wrong about the invariant. I read the tests first in any new repo — they're the fastest map of what the maintainers actually care about."*

**Q4. How do you handle code review from maintainers?**
Have a real story about being wrong. *"On one of the Fluid PRs a maintainer pointed out my `Eventually` timeout was masking a real ordering issue rather than handling async convergence. They were right — I'd made the test pass instead of making the code correct."* Stories where you were corrected land better than stories where you were right.

**Q5. Have you had a PR rejected?**
Say yes and tell it. "All 185 merged" is either untrue or means the work was trivial.

**Q6. Have you reviewed other people's PRs?**
If yes, that's a strong signal — it means the maintainers trust your judgement. If no, say you'd like to and what you'd look for.

**Q7. How do you decide what's worth fixing?**
*"Impact over difficulty. A race condition in shared cluster state affects every user under load; a cosmetic refactor affects nobody. I'd rather fix one thing that silently corrupts state than ten things that annoy people."*

**Q8. What did you learn from open source that you couldn't learn alone?**
*"How to write a change someone else has to review. Alone, I optimise for 'it works'. In a PR, I optimise for 'a reviewer who has never seen this can tell it's correct in five minutes' — which changes how I scope commits, write tests and explain the why in the description."*

**Q9. What's the CNCF and what do the maturity levels mean?**
Cloud Native Computing Foundation, part of the Linux Foundation. Sandbox (early, experimental), Incubating (production users, healthy contributor base, meets governance requirements), Graduated (widely adopted, security audited, sustainable governance). Kubernetes, Prometheus, Envoy and etcd are graduated; Fluid is Incubating; Kubescape and KubeStellar are Sandbox.

**Q10. What does a security audit involve at that level?**
A third-party review covering threat model, code review of critical paths, dependency analysis and fuzzing, with published findings and remediation. It's a graduation requirement, which is why security PRs in these projects matter.

**Q11. Which project taught you the most?**
Pick one and justify. Fluid is a good answer if the test migration was your largest volume; Kubescape if the security work was the most conceptually demanding.

**Q12. Would you keep contributing after joining a company?**
Have a position. Many companies encourage it; some require approval. *"Yes, and I'd want to know the company's policy early."*

**Q13. What's your GitHub contribution graph going to tell me?**
Make sure it tells a good story. Consistent contribution over months beats a burst.

**Q14. Explain IFOS.**
One sentence on the programme, then straight to what you shipped. Interviewers care about the work.

**Q15. What's the most complex PR you've written?**
Pick the Fluid test migration if you want to talk about scale and mechanics; pick a Kubescape race fix if you want to talk about depth. **The race fix is the better choice for a backend role.**

**Q16. Walk me through a PR from idea to merge.**
Issue or observation → reproduce → understand the invariant → minimal fix → test that fails before and passes after → PR with a description explaining *why* → review cycles → merge. **The "test that fails before" step is the one that signals discipline.**

**Q17. How do you write a good PR description?**
What the problem is, how you know (reproduction, stack trace, failing test), what the fix does, what you considered and rejected, and how to verify. A reviewer should not have to read the diff to understand the intent.

**Q18. How do you handle a maintainer who's unresponsive?**
Ping politely after a week, offer to split the PR smaller, and ask in the project's Slack/CNCF channel. Escalating aggressively is how contributors get ignored.

**Q19. How do you handle a disagreement with a maintainer?**
*"Make the argument once, with evidence. If they still disagree, it's their project and their maintenance burden, and I defer. On the Kubescape TLS change I initially wanted a broader refactor; the maintainer wanted the minimal fix, and they were right — a smaller change is easier to review and easier to revert."*

**Q20. Why do maintainers prefer small PRs?**
Review cost is superlinear in diff size, and a small PR is revertible. A 2,000-line PR gets rubber-stamped or ignored — neither is good.

**Q21. You added 5,300 lines of tests in one area. Isn't that a large PR?**
Good challenge. Answer: *"It was split across many PRs, one package or one concern at a time. Test-only diffs also review differently from logic diffs — a reviewer checks the assertions are meaningful rather than tracing control flow."*

**Q22. What's a DCO and why does it matter?**
Developer Certificate of Origin — a `Signed-off-by` line certifying you have the right to submit the code. CNCF projects require it; a missing sign-off blocks the merge. Knowing this is a small signal you've actually contributed.

**Q23. What's a CLA and how does it differ?**
A Contributor License Agreement grants the project rights to your contribution. Heavier than DCO; the CNCF standardised on DCO for most projects.

**Q24. What's the governance model of a CNCF project?**
Maintainers, sometimes a technical steering committee, documented in `GOVERNANCE.md`, with `OWNERS` files controlling approval per directory in Kubernetes-style repos.

**Q25. What is Prow?**
The Kubernetes CI/automation system — `/lgtm`, `/approve`, `/retest` bot commands, `OWNERS`-based approval, and the tide merge queue. If you've used it, say so; it's a specific detail that's hard to fake.

---

## Section B — Kubernetes fundamentals (Q26–70)

**Q26. What is Kubernetes in one sentence?**
A declarative container orchestration system: you describe the desired state, and controllers continuously reconcile actual state toward it.

**Q27. What's the single most important idea?**
The reconciliation loop. Everything else — Deployments, Services, operators — is an instance of it. **Level-triggered, not edge-triggered**: controllers observe current state rather than reacting to events, so a missed event self-heals on the next sync.

**Q28. Why does level-triggered matter?**
Because an edge-triggered system that misses an event is permanently wrong. A level-triggered one re-observes and converges. It's what makes Kubernetes robust to controller restarts and network blips.

**Q29. Name the control plane components.**
kube-apiserver (the only thing that talks to etcd), etcd (state), kube-scheduler (assigns pods to nodes), kube-controller-manager (built-in controllers), cloud-controller-manager.

**Q30. Node components?**
kubelet (manages pods on the node, talks to the container runtime via CRI), kube-proxy (implements Service networking), and the container runtime (containerd, CRI-O).

**Q31. What is etcd?**
A distributed, strongly consistent key-value store using Raft. Kubernetes's only persistent state. Its performance characteristics (write latency, watch fan-out) are the practical scale limit of a cluster.

**Q32. What does the apiserver do to a request?**
Authentication → authorisation (RBAC) → mutating admission → schema validation → validating admission → persist to etcd. **Knowing that mutating runs before validating is the detail that gets asked.**

**Q33. Why does mutating come first?**
So that defaulting and injection (sidecars, labels) happen before validation, and the validating webhooks see the final object.

**Q34. What is a Pod?**
The smallest deployable unit: one or more containers sharing a network namespace (same IP and port space) and optionally volumes. They're scheduled together and live and die together.

**Q35. Why would a Pod have multiple containers?**
The sidecar pattern: a logging agent, a service mesh proxy, or — relevant to Fluid — a cache client. Also init containers for setup that must complete first.

**Q36. Deployment vs ReplicaSet vs StatefulSet vs DaemonSet?**
Deployment manages ReplicaSets to give you rolling updates and rollback for stateless pods. ReplicaSet maintains a replica count. StatefulSet gives stable network identities and per-pod persistent volumes with ordered rollout — for databases. DaemonSet runs one pod per node — for agents like log collectors or a node-level scanner.

**Q37. Which would Kubescape's node scanner be?**
A DaemonSet, because it needs to inspect every node. The control-plane-facing parts would be a Deployment.

**Q38. What is a Service and what types exist?**
A stable virtual IP and DNS name fronting a set of pods selected by labels. ClusterIP (internal), NodePort (a port on every node), LoadBalancer (cloud LB), ExternalName (a CNAME).

**Q39. How does a Service actually route traffic?**
kube-proxy programs iptables (or IPVS, or eBPF with Cilium) rules on each node to DNAT the service IP to a pod IP. There's no proxy process in the data path in iptables mode.

**Q40. What's an Endpoints/EndpointSlice?**
The list of pod IPs backing a Service. EndpointSlice replaced Endpoints to scale better — one huge object per Service didn't scale to thousands of pods.

**Q41. What is Ingress vs Gateway API?**
Ingress is the older HTTP routing resource, extended chaotically through annotations. Gateway API is its successor: role-oriented (infrastructure provider / cluster operator / application developer), typed, and extensible without annotations.

**Q42. What is a ConfigMap and a Secret?**
Both hold key-value config; Secrets are base64-encoded (**not encrypted by default**) and can be encrypted at rest with an encryption provider. The base64 point is a very common question — base64 is encoding, not security.

**Q43. How would you actually secure Secrets?**
etcd encryption at rest, RBAC restricting who can read them, an external secrets operator pulling from Vault or a cloud KMS, and avoiding mounting secrets the workload doesn't need.

**Q44. What are requests and limits?**
Requests are what the scheduler reserves; limits are the hard cap enforced by cgroups. Exceeding a memory limit gets the container OOM-killed; exceeding a CPU limit throttles it.

**Q45. What are the QoS classes?**
Guaranteed (requests == limits for all resources), Burstable (requests set, lower than limits), BestEffort (nothing set). Under node memory pressure, BestEffort is evicted first, then Burstable, then Guaranteed.

**Q46. Should you set CPU limits?**
Contested, and having a view is good. The argument against: CFS throttling causes latency spikes even when the node has idle CPU. The argument for: predictability and preventing noisy neighbours. Common modern advice is to set memory limits (== requests) and omit CPU limits while setting CPU requests.

**Q47. How does this interact with Go?**
Directly — `GOMAXPROCS` reading host CPUs instead of the cgroup limit causes excessive parallelism and throttling, and `GOMEMLIMIT` prevents the Go heap exceeding the memory limit and getting OOM-killed (Chapter 13 Q35, Q96). **This is a great answer because it connects language runtime to orchestration.**

**Q48. Liveness vs readiness vs startup probes?**
Liveness: failing restarts the container. Readiness: failing removes it from Service endpoints but doesn't restart. Startup: disables the other two until the app has booted, for slow starters.

**Q49. What's the classic liveness probe mistake?**
Pointing it at something that depends on an external service. If the database is down, every pod fails liveness and restarts in a loop, turning a dependency outage into a total outage. **Liveness should only check "is this process wedged".**

**Q50. What are namespaces for?**
Logical partitioning with scoped names, RBAC boundaries and ResourceQuotas. Not a security boundary on their own — network policy and admission control are needed for that.

**Q51. Explain RBAC.**
Role (namespaced) and ClusterRole (cluster-wide) define verbs on resources; RoleBinding and ClusterRoleBinding bind them to subjects (users, groups, ServiceAccounts). Purely additive — no deny rules.

**Q52. What does Kubescape check about RBAC?**
Over-permissioned bindings: wildcards on verbs or resources, `cluster-admin` bound broadly, the ability to create pods (which is effectively node-level access), secret read access, and privilege-escalation paths like `escalate`/`bind`/`impersonate`.

**Q53. Why is "can create pods" equivalent to cluster admin?**
Because you can create a pod that mounts the host filesystem or the node's ServiceAccount token, and from there take over the node and potentially the cluster. It's the canonical Kubernetes privilege-escalation path and a great answer.

**Q54. What is a ServiceAccount?**
An identity for processes in pods. Tokens are projected into the pod and used to authenticate to the apiserver. **`automountServiceAccountToken: false` is a hardening step most workloads should take** — if your app never calls the apiserver, it shouldn't carry a token.

**Q55. What are Pod Security Standards?**
Privileged / Baseline / Restricted profiles, enforced by the built-in Pod Security Admission controller (which replaced PodSecurityPolicy). Restricted requires non-root, no privilege escalation, dropped capabilities, and a seccomp profile.

**Q56. What is a NetworkPolicy?**
Namespaced firewall rules on pod-to-pod traffic by label selector. **Default is allow-all; policies are additive deny-by-default once any policy selects a pod.** Requires a CNI that implements them — not all do.

**Q57. What is an admission webhook?**
An HTTP callback the apiserver invokes during admission. Mutating ones can patch objects; validating ones can reject them. **Fluid uses one to inject cache volumes into pods** — that's the webhook package you migrated tests for.

**Q58. What's dangerous about an admission webhook?**
It's in the critical path of every matching API request. If it's down and `failurePolicy: Fail`, you can't create the objects it matches — including, potentially, the pods that would restore the webhook. It's a classic self-inflicted cluster outage.

**Q59. How do you avoid that?**
Scope the webhook narrowly with `objectSelector`/`namespaceSelector`, exclude `kube-system`, set a short timeout, run multiple replicas, and think hard before using `failurePolicy: Fail`.

**Q60. What is a CRD?**
Custom Resource Definition — extends the API with your own types, which then get the full apiserver treatment: validation, RBAC, watch, versioning.

**Q61. What is an operator?**
A CRD plus a controller that encodes operational knowledge for an application. Fluid and KubeStellar are both operator-pattern projects.

**Q62. How does a controller work internally?**
An informer maintains a local cache via list+watch; event handlers enqueue object keys onto a rate-limited workqueue; workers pop keys, read the object from the cache (not the API), compute the desired state, and act.

**Q63. Why enqueue keys rather than objects?**
Deduplication — multiple events for one object collapse to one work item, and the worker always reads the latest state from the cache. It's what makes the loop level-triggered.

**Q64. What is an informer and why does it matter?**
A shared cache that keeps controllers from hammering the apiserver. Every controller reading from its own cache is the reason a cluster with hundreds of controllers doesn't melt etcd.

**Q65. What is resync and what's it for?**
A periodic re-delivery of all cached objects, so a controller that dropped work or has drifted reconciles anyway. It's the safety net that makes level-triggering real.

**Q66. What are finalizers?**
Strings on an object that block deletion until removed. The controller sees `deletionTimestamp` set, does cleanup, then removes its finalizer. **The classic failure: a controller that's removed while its finalizer remains, leaving objects permanently undeletable.**

**Q67. What are owner references?**
A parent link that enables garbage collection — deleting the parent cascades to children. It's how a Deployment's ReplicaSets and Pods get cleaned up.

**Q68. How do you handle conflicts on update?**
`resourceVersion` gives optimistic concurrency; a stale update gets a 409 Conflict and you retry with `RetryOnConflict`, re-reading first. **Server-side apply is the modern alternative with field ownership.**

**Q69. What's the difference between `status` and `spec`?**
`spec` is desired state, written by users. `status` is observed state, written by the controller. They have separate subresources so RBAC and updates can be split.

**Q70. What is the `observedGeneration` pattern?**
Recording which `metadata.generation` the status corresponds to, so consumers can tell whether the status reflects the current spec or a stale one. A detail that signals real controller experience.

---

## Section C — Your specific project work (Q71–110)

### Kubescape

**Q71. What does Kubescape do?**
Scans Kubernetes clusters and manifests against security frameworks (NSA-CISA, MITRE ATT&CK, CIS Benchmarks), reporting misconfigurations, RBAC risks and vulnerabilities. Runs as a CLI, in CI, and as an in-cluster operator.

**Q72. Explain the path traversal you fixed, in depth.**
Chapter 01 Q13. Then go further: the fix pattern is
```go
clean := filepath.Clean(filepath.Join(base, userInput))
if !strings.HasPrefix(clean, base+string(os.PathSeparator)) { return ErrInvalidPath }
```
and the caveat that prefix-checking is still TOCTOU-racy against a symlink swapped between check and open. `os.OpenRoot` (Go 1.24) or `openat2` with `RESOLVE_BENEATH` is the robust answer.

**Q73. Why is `filepath.Join` not enough?**
Because it cleans but doesn't confine — `filepath.Join("/base", "../../etc/passwd")` returns `/etc/passwd`. It resolves the traversal rather than rejecting it.

**Q74. What's the CWE and typical severity?**
CWE-22. Severity depends on what's reachable — arbitrary file read in a security scanner running with cluster credentials is serious, because it can reach ServiceAccount tokens at `/var/run/secrets/...`.

**Q75. How would you find other instances of this bug class?**
`grep` for `filepath.Join` with request-derived variables, `gosec` (rule G304 covers file path from variable), and CodeQL taint-tracking from HTTP handlers to file operations. **Naming the tooling is what separates a systematic answer from an anecdotal one.**

**Q76. Explain the pprof fix.**
Chapter 01 Q14 and Chapter 13 Q92–93.

**Q77. How would you verify pprof is no longer publicly reachable?**
A test that starts the server and asserts a request to `/debug/pprof/` on the public listener 404s, plus a manual check that it still works via loopback. **A test that encodes the security property is the right answer.**

**Q78. Explain the Helm TLS conflation fix.**
Chapter 01 Q15.

**Q79. How do you test a Helm chart change?**
`helm template` to render and assert on the output, `helm lint`, and `helm unittest` for assertions on rendered manifests. Chart bugs are configuration bugs, so rendering-based tests are the right level.

**Q80. Describe the global cluster state race.**
Structure: shared cache of cluster objects, written by a watch/sync goroutine and read by scan handlers. Without synchronisation you get concurrent map access, which Go detects and throws on — so the symptom is a crash under load. Fix: guard with `RWMutex` (read-heavy) or replace with a copy-on-write pointer swapped atomically.

**Q81. Which fix would you choose and why?**
*"`RWMutex` if readers hold the data briefly; an `atomic.Pointer` to an immutable snapshot if readers do long work, because then readers never block the writer and never hold a lock across expensive operations."* The second is the better design for a scanner.

**Q82. Describe the policy-handler singleton race.**
Lazy initialisation from multiple goroutines. Chapter 13 Q49. Fix: `sync.Once`.

**Q83. Describe the gRPC reuse leak.**
Chapter 01 Q17. Add: the symptom is climbing goroutine count and file descriptors, visible in a goroutine profile as many goroutines in gRPC transport loops.

**Q84. How did you find these?**
Have the real story. Plausible and strong shapes: a flaky CI test that only failed under `-race`; a reported panic with "concurrent map writes"; or reading a goroutine profile from a long-running instance.

**Q85. How did you prove the fixes worked?**
A test exercising the concurrent path, run with `-race` and `-count`, in CI. Plus, for the leak, asserting `runtime.NumGoroutine()` returns to baseline (or using `goleak`).

**Q86. What's `goleak`?**
Uber's library that fails a test if goroutines outlive it. `defer goleak.VerifyNone(t)`. **Exactly the right tool for the gRPC leak and naming it is a strong detail.**

### Fluid

**Q87. What does Fluid do?**
Orchestrates data access for cloud-native workloads: it abstracts a Dataset as a CRD and manages a distributed cache runtime (Alluxio, JuiceFS, GooseFS) close to compute, so ML and analytics jobs don't repeatedly pull from remote object storage.

**Q88. Why does it need a webhook?**
To inject the cache volume and scheduling affinity into pods that reference a Dataset, so the pod lands near the cached data without the user writing that into every manifest.

**Q89. What is data locality and why does it matter here?**
Scheduling compute where the data is cached rather than moving data to compute. For a training job reading the same dataset repeatedly, the difference is orders of magnitude.

**Q90. What does `mountinfo` parse and why does Fluid need it?**
`/proc/self/mountinfo` — the mount table for the process's mount namespace. Chapter 01 Q20. Fluid needs it to determine whether a path is already a mount point, what its propagation mode is, and whether a cache mount is healthy.

**Q91. What's mount propagation and why does it matter to Fluid?**
How mount events propagate between namespaces: `private`, `shared`, `slave`, `unbindable`. In Kubernetes, `mountPropagation: Bidirectional` on a volume lets a container's mounts appear on the host and in other containers — which is exactly what a CSI driver or a cache mounter needs, and also why it's a privileged operation.

**Q92. What are the tricky parts of parsing mountinfo?**
The optional fields between the mount options and the `-` separator are variable in number, so you must scan for the separator rather than indexing fixed positions. Paths are octal-escaped (space is `\040`), so naive splitting on whitespace breaks. Fields can be empty. **These are exactly the edge cases that justify 100% coverage and fuzzing.**

**Q93. How would you structure tests for that?**
Table-driven with named cases covering: a minimal valid line, optional fields present and absent, escaped characters in paths, a malformed line, an empty input, and a very long line. Plus a fuzz target asserting no panic.

**Q94. Why did the suite migrate to Ginkgo?**
Chapter 01 Q18.

**Q95. How do you test a Kubernetes controller?**
`envtest` from controller-runtime — it runs a real apiserver and etcd binary locally, so you test against real API semantics without a cluster. Then `Eventually` for convergence assertions. A fake client is faster but doesn't reproduce apiserver behaviour (defaulting, validation, conflicts).

**Q96. Fake client vs envtest — when each?**
Fake client for unit-testing reconcile logic in isolation. envtest for anything depending on real API behaviour. Both, in a good suite.

**Q97. What made the 25-package migration hard?**
Scale and consistency — 25 packages with different existing conventions, needing a shared fixture approach so the result wasn't 25 different styles. And keeping the PRs small enough to review.

### KubeStellar

**Q98. What does KubeStellar do?**
Multi-cluster configuration management: a hub holds an inventory of workload clusters and binding policies, and agents on those clusters sync down the workloads assigned to them. It addresses "deploy this to the right 40 of my 100 clusters" declaratively.

**Q99. What's hard about multi-cluster?**
Partial failure (some clusters unreachable), version skew (different Kubernetes versions), credential management per cluster, and the fact that there's no global transaction — you can never atomically change 100 clusters.

**Q100. Explain the single-click cluster import.**
Chapter 01 Q22, with the bounded-concurrency, per-cluster-status, idempotency framing.

**Q101. How would you implement bulk import correctly in Go?**
`errgroup` with `SetLimit(n)` for bounded concurrency, per-cluster result structs rather than a single error, and an idempotent import operation so a retry is safe. **That's the concrete answer and it connects to Chapter 13 Q71.**

**Q102. What does importing a cluster mean mechanically?**
Registering an inventory object on the hub, establishing credentials (usually a kubeconfig or a token), and deploying a syncing agent to the target that watches for objects bound to it.

**Q103. How do you store 100 clusters' credentials safely?**
Secrets on the hub with tight RBAC, or better, an external secrets manager. Short-lived credentials over static kubeconfigs where the provider supports it.

**Q104. Explain the 3D login interface work.**
Chapter 01 Q21, with the honest reframing of the 40% figure.

**Q105. Why is UI work in a multi-cluster project valuable?**
Because the operational surface is the product. A system that can manage 100 clusters but whose import flow takes 15 manual steps doesn't actually manage 100 clusters. Framing UX work as operational leverage rather than decoration is the right pitch.

**Q106. What's the difference between the three projects' problem domains?**
Kubescape: security posture (read-mostly, analysis). Fluid: data locality (stateful, performance-critical). KubeStellar: multi-cluster coordination (distributed, partial-failure-heavy). Being able to characterise each in one clause shows you understood the systems, not just the diffs.

**Q107. Which codebase was best engineered and why?**
Have an opinion, phrased diplomatically. This tests judgement, and a candidate with no view on code quality across three large codebases hasn't engaged deeply.

**Q108. What would you change in one of them?**
Also have an answer. Good shapes: more integration test coverage of failure paths, better structured logging, or clearer separation between the API types and the business logic.

**Q109. Did you write any documentation?**
Yes — your resume says so for KubeStellar. Docs contributions are undervalued by candidates and valued by interviewers, because they prove you understood the system well enough to explain it.

**Q110. Why should I care that you did open source?**
The strongest framing: *"Because it's the closest thing to the actual job. I worked in a codebase I didn't write, with people who didn't have time to explain it, under a review process that rejected work that wasn't good enough. Everything about that is more like being on your team than a personal project is."*

---

## Section D — Containers, CI/CD, infrastructure (Q111–140)

**Q111. What is a container?**
A process isolated with kernel namespaces (PID, network, mount, UTS, IPC, user) and constrained with cgroups, using a layered filesystem. Not a VM — it shares the host kernel.

**Q112. Container vs VM?**
VMs virtualise hardware and run their own kernel — stronger isolation, heavier. Containers share the kernel — lighter, faster, weaker isolation boundary. That last point is why container escapes are a meaningful threat and why Kubescape exists.

**Q113. What are the namespaces and what does each isolate?**
PID (process IDs), network (interfaces, routes, ports), mount (filesystem view — the one `mountinfo` reads), UTS (hostname), IPC, user (UID mapping), cgroup, time.

**Q114. What do cgroups do?**
Limit and account for resources — CPU, memory, I/O, PIDs. cgroups v2 unified the hierarchy and is what modern Kubernetes uses.

**Q115. How do Docker image layers work?**
Each instruction creates a layer; layers are content-addressed and shared between images. The build cache reuses a layer if the instruction and its inputs are unchanged.

**Q116. How do you order a Dockerfile for cache efficiency?**
Least-frequently-changing first. Copy the dependency manifest and install dependencies *before* copying source, so a source change doesn't invalidate the dependency install.

**Q117. Write a good Dockerfile for the SmartClass server.**
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
USER node
EXPOSE 5000
CMD ["node", "server.js"]
```
Points to make: multi-stage keeps build tooling out; `npm ci` for reproducibility; `USER node` so it doesn't run as root; `.dockerignore` excluding `node_modules` and `.env`.

**Q118. And for a Go binary?**
```dockerfile
FROM golang:1.23 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /worker ./cmd/worker

FROM gcr.io/distroless/static-debian12
COPY --from=build /worker /worker
USER nonroot:nonroot
ENTRYPOINT ["/worker"]
```
~10MB, no shell, no package manager, nothing to exploit.

**Q119. Why distroless or scratch?**
Minimal attack surface — no shell means no interactive exploitation after a compromise, and dramatically fewer CVEs because there are almost no packages.

**Q120. What's the downside?**
You can't `kubectl exec` into a shell to debug. Ephemeral debug containers (`kubectl debug`) are the answer, and knowing that is the follow-up.

**Q121. `CMD` vs `ENTRYPOINT`?**
`ENTRYPOINT` is the executable; `CMD` provides default arguments, overridable at run time. Use exec form (`["cmd", "arg"]`) so the process is PID 1 and receives signals — shell form wraps it in `/bin/sh -c` which swallows SIGTERM.

**Q122. Why does PID 1 matter?**
PID 1 has special signal semantics and must reap zombies. A process that doesn't handle SIGTERM as PID 1 gets SIGKILLed after the grace period, so graceful shutdown never happens.

**Q123. What is a `.dockerignore` and why does it matter?**
Excludes files from the build context. Without it you ship `node_modules`, `.git` and possibly `.env` into the image — a real secret-leak vector.

**Q124. How do you scan an image for vulnerabilities?**
Trivy, Grype, or Docker Scout, in CI, failing the build on high/critical findings. **Kubescape also does image scanning**, so this connects to your work.

**Q125. What is an SBOM?**
Software Bill of Materials — a machine-readable inventory of components (SPDX or CycloneDX). Increasingly required, and it's what makes "am I affected by this CVE" answerable in minutes rather than days.

**Q126. What is image signing?**
Cosign/Sigstore signs images and stores signatures alongside them; admission policy verifies signatures before allowing a pod. It closes the "is this image what we built" gap.

**Q127. What is supply-chain security in this context?**
The full chain: dependency provenance, reproducible builds, signed artifacts, and verified deployment. SLSA is the framework that levels it.

**Q128. Describe a good CI pipeline for a Go service.**
Checkout → module cache restore → `go vet` and `staticcheck` → `go test -race -coverprofile` → build → image build → Trivy scan → push → deploy to staging → smoke test. Fail fast on the cheap steps.

**Q129. What's the value of `-race` in CI specifically?**
It's the only place you'll reliably run it. It's too slow for production and easy to forget locally. **Given your resume says you fixed races, "I made sure CI ran `-race`" is the natural follow-through.**

**Q130. How do you speed up CI?**
Cache dependencies keyed on the lockfile (your SmartClass CI does this for the Mongo binary), parallelise independent jobs, run expensive checks only on changed paths, and split the test suite.

**Q131. What is GitOps?**
The desired state lives in git, and an agent (Argo CD, Flux) continuously reconciles the cluster to it. Git is the audit log and the rollback mechanism; nobody runs `kubectl apply` by hand.

**Q132. Why is GitOps a good fit for Kubernetes specifically?**
Because Kubernetes is already a reconciliation system — GitOps just extends the loop to include the manifests. Push-based CD fights that model.

**Q133. Helm vs Kustomize?**
Helm: templating, packaging, releases, a values interface — good for distributing software to others. Kustomize: overlay-based patching of plain YAML, no templating — good for managing your own environments. Many teams use both.

**Q134. What's the criticism of Helm templating?**
Text templating YAML is structurally unsound — indentation bugs, and you can generate invalid YAML that only fails at apply time. Kustomize operates on parsed structures, which is why it can't produce malformed output.

**Q135. What is Terraform and where does it fit?**
Declarative infrastructure provisioning with state tracking — clusters, networks, databases. Kubernetes manifests manage what runs *in* the cluster; Terraform manages the cluster itself.

**Q136. What's the danger with Terraform state?**
It's the source of truth about what exists; losing it or having two people apply concurrently causes drift and destruction. Remote state with locking is mandatory.

**Q137. Blue-green vs canary vs rolling?**
Rolling: replace instances gradually (Kubernetes default). Blue-green: two full environments, switch traffic at once — instant rollback, double the resources. Canary: route a small percentage to the new version, watch metrics, ramp up.

**Q138. Which would you use for the job scheduler?**
Rolling for the API. For workers, **the payload-compatibility constraint matters more than the strategy** — deploy workers before the API so they understand new payloads (Chapter 12 Q109).

**Q139. What's the most important thing you learned about infrastructure from CNCF work?**
*"That the interesting failures are almost never the ones the code was written for. Every one of the bugs I fixed — the race in cluster state, the leaked gRPC connections, the exposed pprof — was correct code under the assumption of one caller, one call, or a trusted network. Distributed systems are mostly the discipline of removing those assumptions one at a time."*

**Q140. Where do you want to go from here?**
Have a real answer that connects your history to their job. *"Platform or infrastructure engineering. The common thread in everything I've enjoyed — the scheduler, the race fixes, the multi-cluster work — is systems where correctness under concurrency and failure is the actual problem, rather than a constraint on the actual problem."*

---

*Next: [Chapter 15 — DSA question bank](15-DSA-QUESTION-BANK.md)*
