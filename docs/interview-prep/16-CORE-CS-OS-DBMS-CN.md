# Chapter 16 — Core CS: OS, Networks, DBMS, OOP (200 questions)

> Your resume lists Operating Systems and Distributed Computing as coursework, and your CNCF work is Linux-adjacent (`mountinfo`, namespaces, `/proc`). Core CS rounds are common in Indian campus and service-company processes, and fundamentals questions appear in product-company rounds too.

---

## Section A — Operating Systems (Q1–60)

### Processes and threads

**Q1. Process vs thread?**
A process has its own address space, file descriptors and resources. Threads within a process share the address space and descriptors but have their own stack, registers and program counter. Context switching between threads is cheaper because the memory map doesn't change (no TLB flush).

**Q2. What's in a Process Control Block?**
PID, process state, program counter, registers, memory management info (page table pointer), open file table, scheduling info, accounting data.

**Q3. What are the process states?**
New, Ready, Running, Waiting/Blocked, Terminated. Some systems add Suspended (swapped out) variants.

**Q4. What is a context switch and what does it cost?**
Saving one process's CPU state and restoring another's. Direct cost is microseconds; the larger indirect cost is cache and TLB pollution — the new process runs with a cold cache.

**Q5. How does `fork()` work?**
Creates a child that's a copy of the parent, returning 0 in the child and the child's PID in the parent. Modern implementations use copy-on-write — the pages are shared read-only and copied only when written.

**Q6. What's a zombie process?**
A terminated child whose exit status hasn't been reaped by the parent with `wait()`. It holds a PID table entry. Many zombies exhaust the PID space. **This is why PID 1 in a container must reap children** (Chapter 14 Q122).

**Q7. What's an orphan process?**
A process whose parent exited. It's re-parented to init (PID 1), which reaps it.

**Q8. What is a daemon?**
A background process detached from a terminal, usually created by forking twice and calling `setsid()`.

**Q9. Name the IPC mechanisms.**
Pipes (anonymous and named/FIFO), message queues, shared memory, semaphores, sockets (including Unix domain sockets), signals, memory-mapped files.

**Q10. Which is fastest and why?**
Shared memory — no kernel copy. The trade-off is you must implement synchronisation yourself.

**Q11. What's a Unix domain socket and why does it matter in containers?**
A socket in the filesystem namespace rather than the network stack. Faster than TCP loopback and permission-controlled by file permissions. It's how the kubelet talks to the container runtime over CRI, and how Docker's socket works — which is why mounting `/var/run/docker.sock` into a container is equivalent to giving it root on the host.

**Q12. What are signals?**
Asynchronous notifications. SIGTERM (polite termination, catchable), SIGKILL (immediate, uncatchable), SIGINT (Ctrl-C), SIGSEGV, SIGCHLD, SIGHUP. **Graceful shutdown means handling SIGTERM; Kubernetes sends SIGTERM then SIGKILL after the grace period.**

**Q13. Can you catch SIGKILL or SIGSTOP?**
No — deliberately, so the system always has a way to stop a process.

### Scheduling

**Q14. Name the scheduling algorithms.**
FCFS, SJF (Shortest Job First), SRTF (preemptive SJF), Priority, Round Robin, Multilevel Queue, Multilevel Feedback Queue, Completely Fair Scheduler (Linux).

**Q15. What's the problem with SJF?**
Requires knowing burst times in advance (you estimate), and it starves long jobs.

**Q16. What is starvation and what's the fix?**
A process never getting CPU because higher-priority work keeps arriving. Fix: ageing — increase priority with waiting time. **Your job scheduler has exactly this problem with priority queues** (Chapter 12 Q102), which is a nice connection to make.

**Q17. What is priority inversion?**
A high-priority task blocked on a lock held by a low-priority task, which is itself preempted by a medium-priority task. The famous instance is the Mars Pathfinder. Fix: priority inheritance — temporarily boost the lock holder.

**Q18. How does Linux CFS work?**
Tracks virtual runtime per task, weighted by nice value, and always runs the task with the smallest vruntime, using a red-black tree. It approximates giving every task an equal fair share rather than using fixed time slices.

**Q19. Preemptive vs non-preemptive?**
Preemptive can interrupt a running process; non-preemptive waits for it to yield or block. **This is the same distinction as Go's scheduler pre- and post-1.14** (Chapter 13 Q36).

**Q20. What is the convoy effect?**
Under FCFS, one long job holds up many short ones, tanking average waiting time.

### Synchronisation

**Q21. What is a critical section?**
Code accessing shared resources that must not be executed concurrently by more than one thread.

**Q22. The three requirements for a correct solution?**
Mutual exclusion, progress (a thread not in its critical section can't block others indefinitely), bounded waiting (no starvation).

**Q23. Mutex vs semaphore?**
A mutex is a lock with ownership — only the locker unlocks it, and it's binary. A semaphore is a counter with no ownership, usable for signalling between threads and for limiting concurrent access to N resources.

**Q24. What is a counting semaphore used for?**
Bounded concurrency — exactly the semaphore-channel pattern in Go (Chapter 13 Q72) and the connection pool limit in your scheduler.

**Q25. What's a condition variable?**
A way to wait for a predicate to become true while holding a mutex, releasing it atomically while waiting. Always use it in a `while` loop, not an `if`, because of spurious wakeups.

**Q26. What's a spurious wakeup?**
A wait that returns without the condition being true. The standard permits it, so the `while` loop re-checks.

**Q27. What is a spinlock and when is it right?**
Busy-waiting rather than sleeping. Right when the expected wait is shorter than the cost of a context switch — typically in kernel code on multiprocessors. Wrong in userspace for long waits.

**Q28. What are the four conditions for deadlock?**
Mutual exclusion, hold-and-wait, no preemption, circular wait. **All four must hold simultaneously**, so breaking any one prevents deadlock.

**Q29. How do you handle deadlock?**
Prevention (break a condition — e.g. impose a global lock ordering), avoidance (Banker's algorithm, needs advance knowledge), detection and recovery (build a wait-for graph, find cycles, abort a victim — **this is what Postgres does**), or ignore it (the ostrich algorithm, which most OSes use for user-level deadlocks).

**Q30. Explain the readers-writers problem.**
Many readers can read concurrently; a writer needs exclusive access. Reader-preference starves writers; writer-preference starves readers. **`sync.RWMutex` in Go implements a fair variant** — a pending writer blocks new readers.

**Q31. Explain the producer-consumer problem.**
A bounded buffer between producers and consumers, requiring a mutex plus two semaphores (empty slots, full slots). **This is literally your job scheduler**, with the queue as the buffer.

**Q32. Explain the dining philosophers problem.**
Five philosophers, five forks, each needs two. Naive "pick up left then right" deadlocks. Solutions: impose an ordering (one philosopher picks right first), limit to four simultaneous diners, or use an arbiter. **The "impose a global ordering" solution is the same lock-ordering rule used to prevent deadlock in real code.**

### Memory

**Q33. What is virtual memory?**
Each process sees a private contiguous address space, mapped to physical frames by the MMU via page tables. It gives isolation, allows more memory than physically present, and simplifies allocation.

**Q34. What is paging?**
Dividing memory into fixed-size pages (typically 4KB) and frames, with a page table mapping between them.

**Q35. What is the TLB?**
Translation Lookaside Buffer — a cache of recent page-table translations. A miss costs a page table walk. **A TLB flush on context switch is a major part of switching cost, which is why thread switches are cheaper than process switches.**

**Q36. What is a page fault?**
Accessing a page not currently in physical memory. A minor fault is satisfied from memory (e.g. copy-on-write, page cache); a major fault requires disk I/O.

**Q37. What is thrashing?**
The system spending most of its time paging rather than executing, because the working set exceeds physical memory. **Exactly analogous to MongoDB's working set exceeding the WiredTiger cache** (Chapter 09 Q51).

**Q38. Name page replacement algorithms.**
FIFO, Optimal (theoretical benchmark), LRU, LFU, Clock/Second-chance (LRU approximation used in practice because true LRU is too expensive).

**Q39. What is Belady's anomaly?**
With FIFO, adding more frames can *increase* page faults. LRU and other stack algorithms don't suffer from it.

**Q40. Internal vs external fragmentation?**
Internal: allocated space larger than requested (the tail of the last page). External: free memory split into unusable small pieces. Paging eliminates external fragmentation; segmentation suffers from it.

**Q41. What is copy-on-write?**
Sharing pages read-only and copying on first write. Makes `fork()` cheap, and is how container image layers work conceptually.

**Q42. What is `mmap`?**
Mapping a file into the address space so it's accessed as memory, with the kernel handling paging. Used by databases (and by MongoDB's old MMAPv1 engine) for zero-copy file access.

**Q43. What is the OOM killer?**
When Linux can't satisfy an allocation, it picks a process by an `oom_score` heuristic and kills it. **In Kubernetes, exceeding a memory limit triggers cgroup-level OOM kill of the container** — which is why `GOMEMLIMIT` matters (Chapter 13 Q96).

### Filesystems, I/O, Linux

**Q44. What is an inode?**
A structure holding a file's metadata — permissions, owner, size, timestamps, and pointers to data blocks — but **not** the filename. Filenames live in directory entries that map names to inode numbers.

**Q45. Hard link vs symbolic link?**
A hard link is another directory entry pointing to the same inode — indistinguishable from the original, can't cross filesystems, can't link directories. A symlink is a file containing a path — can cross filesystems, breaks if the target moves. **Symlinks are why path-prefix checks are insufficient for the path-traversal fix** (Chapter 14 Q72).

**Q46. What is `/proc`?**
A virtual filesystem exposing kernel and process state as files. `/proc/self/mountinfo`, `/proc/[pid]/status`, `/proc/[pid]/fd`. **This is the filesystem the Fluid `mountinfo` package parses.**

**Q47. Describe `/proc/self/mountinfo`'s format.**
Chapter 01 Q20 and Chapter 14 Q92.

**Q48. What are Linux namespaces?**
Chapter 14 Q113. The mount namespace is the one that makes each container see a different `/proc/self/mountinfo`.

**Q49. What are cgroups?**
Chapter 14 Q114.

**Q50. What are Linux capabilities?**
Root's privileges split into ~40 units (`CAP_NET_BIND_SERVICE`, `CAP_SYS_ADMIN`, `CAP_CHOWN`). A process can hold some without being full root. **Restricted Pod Security requires dropping ALL and adding back only what's needed** — this is a good Kubescape-adjacent answer.

**Q51. What is `CAP_SYS_ADMIN` and why is it criticised?**
It's a catch-all covering mount, namespace operations and much more — effectively root. Granting it defeats most of the purpose of capability separation.

**Q52. Blocking vs non-blocking vs async I/O?**
Blocking: the call waits. Non-blocking: returns immediately with EAGAIN if not ready, requiring polling. Async: the kernel notifies on completion (io_uring, IOCP).

**Q53. `select` vs `poll` vs `epoll`?**
`select` and `poll` are O(n) in the number of watched descriptors per call. `epoll` (Linux) registers interest once and returns only ready descriptors — O(1) amortised. **This is what makes Node.js and Go able to handle tens of thousands of connections.**

**Q54. What is io_uring?**
A modern Linux async I/O interface using shared ring buffers between userspace and kernel, minimising syscalls. Significantly faster than epoll for high-IOPS workloads.

**Q55. What is a system call and what does it cost?**
A controlled entry into kernel mode. It costs a mode switch plus, since Spectre/Meltdown mitigations, significantly more than it used to — which is why batching syscalls (io_uring, sendmmsg) matters.

**Q56. User mode vs kernel mode?**
Hardware-enforced privilege levels. User mode can't execute privileged instructions or access kernel memory directly, so it must trap into the kernel via syscalls.

**Q57. What is DMA?**
Direct Memory Access — devices transfer to memory without CPU involvement, interrupting only on completion.

**Q58. What is an interrupt vs a trap?**
An interrupt is asynchronous, from hardware. A trap (or exception) is synchronous, caused by the executing instruction — a syscall, a page fault, a divide by zero.

**Q59. What's the difference between concurrency and parallelism?**
Concurrency is dealing with many things at once (structure); parallelism is doing many things at once (execution). Rob Pike's formulation. **Go's goroutines give you concurrency; `GOMAXPROCS` determines parallelism.**

**Q60. What is Amdahl's Law?**
Speedup is bounded by the serial fraction: `S = 1 / ((1-p) + p/n)`. With 5% serial work, the maximum speedup is 20× regardless of core count. It's why parallelising isn't a universal answer.

---

## Section B — Computer Networks (Q61–120)

**Q61. Describe the OSI model.**
Physical, Data Link, Network, Transport, Session, Presentation, Application. The TCP/IP model collapses this into Link, Internet, Transport, Application.

**Q62. Which layer is each protocol?**
Ethernet — Link. IP, ICMP — Network. TCP, UDP — Transport. HTTP, DNS, TLS(ish) — Application/Presentation.

**Q63. TCP vs UDP?**
TCP: connection-oriented, reliable, ordered, flow- and congestion-controlled, higher overhead. UDP: connectionless, unreliable, unordered, minimal overhead. **WebRTC media uses UDP precisely because retransmitting a late video frame is worse than dropping it** (Chapter 06 Q117).

**Q64. Describe the TCP three-way handshake.**
SYN (client, with its ISN) → SYN-ACK (server, its ISN + ack) → ACK. Three messages because both sides must exchange and acknowledge an initial sequence number.

**Q65. Why random initial sequence numbers?**
To prevent sequence-prediction attacks where an off-path attacker injects data into a connection.

**Q66. Describe connection teardown.**
FIN → ACK → FIN → ACK, four messages, because each direction closes independently (half-close).

**Q67. What is TIME_WAIT and why does it exist?**
The state the closing side sits in for 2×MSL. It ensures the final ACK is delivered (retransmitting if the peer resends FIN) and that delayed duplicates from the old connection don't corrupt a new one on the same tuple. **Many TIME_WAIT sockets on a busy server is the classic port-exhaustion problem.**

**Q68. What is head-of-line blocking?**
A lost or delayed packet stalls everything behind it in the ordered stream. It affects TCP, and therefore HTTP/2 despite its multiplexing. **QUIC solves it with per-stream reliability over UDP** (Chapter 06 Q119).

**Q69. Explain TCP flow control.**
The receiver advertises a window size; the sender never has more unacknowledged data in flight than that. It prevents overwhelming a slow receiver.

**Q70. Explain TCP congestion control.**
Slow start (exponential growth of the congestion window until a threshold), congestion avoidance (linear growth), fast retransmit and fast recovery on duplicate ACKs. Algorithms: Reno, CUBIC (Linux default), BBR (Google's, model-based rather than loss-based).

**Q71. Why is BBR different?**
Loss-based algorithms assume loss means congestion, which is false on lossy wireless links and causes them to under-utilise. BBR models bottleneck bandwidth and round-trip propagation time directly.

**Q72. What is Nagle's algorithm and when do you disable it?**
It buffers small writes to reduce packet overhead. Disable with `TCP_NODELAY` for latency-sensitive interactive traffic — which is why every real-time system does it.

**Q73. What is the MTU and what is fragmentation?**
Maximum Transmission Unit, typically 1500 bytes on Ethernet. Packets larger than the path MTU are fragmented (IPv4) or dropped with an ICMP message (IPv6, and IPv4 with DF set). **Path MTU discovery breaking because a firewall blocks ICMP is a classic "works for small requests, hangs for big ones" bug.**

**Q74. Walk me through what happens when I type a URL and press Enter.**
The canonical question. Structure it:
1. Browser checks its cache, then HSTS preload.
2. DNS resolution: browser cache → OS cache → hosts file → resolver → root → TLD → authoritative.
3. TCP handshake to the resolved IP (or QUIC).
4. TLS handshake: ClientHello with SNI → certificate → key exchange → verified against the trust store.
5. HTTP request sent with headers and cookies.
6. Server processes; possibly a CDN edge answers.
7. Response received; browser parses HTML, builds the DOM, fetches subresources, builds the CSSOM, constructs the render tree, layout, paint, composite.
8. JavaScript executes, possibly triggering more requests.

**Go as deep as the interviewer wants.** This question is a depth probe — they'll pick a step and drill.

**Q75. How does DNS resolution work?**
Recursive resolver queries root nameservers → TLD nameservers → authoritative nameservers, caching at each level per the TTL.

**Q76. What DNS record types matter?**
A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail), TXT (verification, SPF/DKIM), NS (delegation), SRV (service location), CAA (which CAs may issue).

**Q77. Why can't you CNAME the apex domain?**
Because a CNAME can't coexist with other records at the same name, and the apex must have NS and SOA records. Providers work around it with ALIAS/ANAME records.

**Q78. What is DNS TTL and why does it matter operationally?**
How long resolvers cache a record. Lower it *before* a planned migration so the cutover is fast; a 24-hour TTL means a 24-hour tail of traffic to the old IP.

**Q79. What is Anycast?**
The same IP announced from many locations; BGP routes each client to the nearest. It's how DNS root servers and CDNs work.

**Q80. Explain the TLS handshake.**
Chapter 08 Q76.

**Q81. What is SNI and why does it matter?**
Server Name Indication — the client sends the hostname in the ClientHello so a server hosting many sites on one IP can present the right certificate. It's sent in plaintext (hence ECH/encrypted ClientHello work).

**Q82. What is certificate pinning?**
Hardcoding the expected certificate or public key. Defends against a compromised CA; risks bricking your app when you rotate. Largely deprecated on the web in favour of Certificate Transparency.

**Q83. What is Certificate Transparency?**
Public append-only logs of all issued certificates, so a mis-issued certificate for your domain is detectable. Browsers require CT proof.

**Q84. HTTP/1.1 vs HTTP/2 vs HTTP/3?**
1.1: one request at a time per connection (pipelining never worked), so browsers open 6 connections. 2: binary framing, multiplexed streams on one connection, header compression (HPACK), server push (now deprecated) — but still TCP head-of-line blocked. 3: QUIC over UDP, per-stream reliability, 0-RTT resumption, connection migration across network changes.

**Q85. Why does HTTP/3 matter for mobile?**
Connection migration — a QUIC connection is identified by a connection ID, not the 4-tuple, so switching from Wi-Fi to cellular doesn't break it.

**Q86. What are idempotent and safe HTTP methods?**
Safe: GET, HEAD, OPTIONS (no side effects). Idempotent: safe methods plus PUT and DELETE.

**Q87. Explain the status code classes.**
1xx informational, 2xx success, 3xx redirection, 4xx client error, 5xx server error.

**Q88. 301 vs 302 vs 307 vs 308?**
301 permanent (cached, may change method to GET), 302 found/temporary (historically also changed method), 307 temporary preserving the method, 308 permanent preserving the method.

**Q89. Explain HTTP caching headers.**
`Cache-Control` (max-age, no-cache, no-store, private/public, immutable), `ETag`/`If-None-Match` for validation, `Last-Modified`/`If-Modified-Since`. `no-cache` means revalidate, not "don't cache" — that's `no-store`. **That distinction is a favourite question.**

**Q90. How would you cache a hashed JS bundle?**
`Cache-Control: public, max-age=31536000, immutable` — the hash in the filename means a new build gets a new URL, so you can cache forever. The HTML shell gets `no-cache` so it's always revalidated.

**Q91. What is a CDN and how does it work?**
Geographically distributed caches near users, with origin pull on miss. Reduces latency and origin load. **Your Vercel deployment is this.**

**Q92. What is a reverse proxy vs a forward proxy?**
Reverse sits in front of servers (load balancing, TLS termination, caching) — the client doesn't know it's there. Forward sits in front of clients (egress control, filtering) — the server doesn't know.

**Q93. Layer 4 vs Layer 7 load balancing?**
L4 routes by IP and port — fast, protocol-agnostic, can't inspect HTTP. L7 parses HTTP — can route by path or header, terminate TLS, retry — at higher cost.

**Q94. Load balancing algorithms?**
Round robin, weighted round robin, least connections, least response time, IP hash (for stickiness), consistent hashing.

**Q95. What is consistent hashing and why does it matter?**
Mapping keys and nodes onto a ring so adding or removing a node only remaps K/N keys instead of nearly all of them. Used by CDNs, distributed caches, and Cassandra/DynamoDB-style systems. **Virtual nodes even out the distribution.**

**Q96. What is NAT and why does it complicate WebRTC?**
Network Address Translation maps private addresses to a public one. It breaks the assumption that a host is directly addressable, which is the entire reason ICE, STUN and TURN exist (Chapter 06).

**Q97. What is a symmetric NAT?**
One that allocates a different external port per destination, so an address learned from a STUN server is useless for a different peer. It forces TURN relay.

**Q98. What's the difference between a switch, a router and a hub?**
Hub: repeats to all ports (Layer 1, obsolete). Switch: forwards by MAC address within a LAN (Layer 2). Router: forwards by IP between networks (Layer 3).

**Q99. What is ARP?**
Address Resolution Protocol — maps an IP to a MAC on the local network. ARP spoofing is a classic LAN MITM technique.

**Q100. What is a subnet mask and CIDR?**
The mask splits an address into network and host portions. CIDR notation (`10.0.0.0/16`) expresses the prefix length. `/16` gives 65,534 usable hosts.

**Q101. What are the private address ranges?**
10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. Plus 169.254.0.0/16 link-local — **which includes 169.254.169.254, the cloud metadata endpoint that SSRF attacks target** (Chapter 08 Q22).

**Q102. What is DHCP?**
Dynamic Host Configuration Protocol — DISCOVER, OFFER, REQUEST, ACK to assign addresses and configuration.

**Q103. What is BGP?**
Border Gateway Protocol — the routing protocol between autonomous systems on the internet. Path-vector, policy-driven, and famously fragile — BGP misconfigurations cause large outages.

**Q104. What is ICMP and what uses it?**
Control messages — `ping` (echo), `traceroute` (TTL exceeded), and Path MTU Discovery (fragmentation needed). Blocking ICMP entirely breaks PMTUD.

**Q105. How does traceroute work?**
Sends packets with incrementing TTL; each router that decrements TTL to zero replies with ICMP Time Exceeded, revealing the path hop by hop.

**Q106. What is a socket?**
An endpoint identified by (protocol, local IP, local port, remote IP, remote port). That 5-tuple uniquely identifies a connection.

**Q107. How many connections can a server accept on one port?**
Limited by the tuple space — since the client IP and port vary, one server port can hold enormous numbers of connections. The practical limits are file descriptors and memory.

**Q108. What is ephemeral port exhaustion?**
A client making many outbound connections runs out of source ports (typically ~28k in the default range), often worsened by TIME_WAIT. Fix: connection pooling and keep-alive.

**Q109. What is keep-alive?**
Reusing a TCP connection for multiple HTTP requests, avoiding repeated handshakes. Default in HTTP/1.1.

**Q110. What is a WebSocket handshake?**
Chapter 06 Q91.

**Q111. What is SSE and how does it differ from WebSocket?**
Chapter 06 Q96.

**Q112. What is long polling?**
The client requests and the server holds the connection open until it has data or times out. Universal compatibility, high overhead.

**Q113. What's the difference between latency, bandwidth and throughput?**
Latency: time for one message (RTT). Bandwidth: maximum capacity. Throughput: actual achieved rate. High bandwidth with high latency ("long fat pipe") requires large TCP windows to fill.

**Q114. What is the bandwidth-delay product?**
Bandwidth × RTT — the amount of data in flight to saturate the link. If the TCP window is smaller, you can't reach full bandwidth regardless of capacity.

**Q115. What causes jitter and why does it matter for video?**
Variation in packet delay from queuing and routing changes. Handled by a jitter buffer at the cost of latency (Chapter 06 Q21).

**Q116. What is QoS?**
Prioritising traffic classes — DSCP marking, traffic shaping, policing. WebRTC marks its packets so networks that honour DSCP can prioritise them.

**Q117. What is a DDoS and how do you mitigate it?**
Distributed denial of service. Mitigations: CDN and anycast absorption, rate limiting, SYN cookies for SYN floods, upstream scrubbing, and application-layer protections.

**Q118. What are SYN cookies?**
Encoding connection state into the initial sequence number so the server doesn't allocate memory until the handshake completes — defeating SYN flood memory exhaustion.

**Q119. What is TLS termination and where should it happen?**
Decrypting TLS at the load balancer or ingress rather than the application. Simplifies certificate management; means internal traffic is plaintext unless you re-encrypt (which is what a service mesh does with mTLS).

**Q120. What is mTLS?**
Mutual TLS — both sides present certificates, so the server authenticates the client too. It's the basis of zero-trust service-to-service authentication in service meshes.

---

## Section C — DBMS Theory (Q121–165)

**Q121. What is a primary key vs a candidate key vs a super key?**
A super key uniquely identifies a row. A candidate key is a minimal super key. The primary key is the chosen candidate key.

**Q122. What is a foreign key?**
A column referencing another table's primary key, enforcing referential integrity. **MongoDB has none, which is why your cascade deletes are hand-coded** (Chapter 05 Q81).

**Q123. Explain normalisation and the normal forms.**
1NF: atomic values, no repeating groups. 2NF: 1NF + no partial dependency on part of a composite key. 3NF: 2NF + no transitive dependency on non-key attributes. BCNF: every determinant is a candidate key.

**Q124. Why normalise?**
Eliminates update, insert and delete anomalies, and reduces redundancy.

**Q125. When would you denormalise?**
Read-heavy workloads where joins are the bottleneck, and reporting tables. **`Course.enrolledStudents[]` in your app is a denormalisation for a fast membership check** — with the drift risk you should name (Chapter 03 §3.9).

**Q126. What is a transaction?**
A unit of work that is atomic, consistent, isolated and durable.

**Q127. Explain each ACID property with a failure it prevents.**
Atomicity prevents a half-completed transfer. Consistency prevents violating a constraint. Isolation prevents one transaction seeing another's partial work. Durability prevents losing a committed transaction on a crash.

**Q128. How is durability implemented?**
Write-ahead logging — the log record is flushed to stable storage before the data page. On recovery, redo committed transactions and undo uncommitted ones (ARIES).

**Q129. What is a checkpoint?**
A periodic flush of dirty pages plus a log marker, bounding how much log must be replayed on recovery.

**Q130. Name the isolation levels and anomalies.**
Chapter 09 Q77.

**Q131. What's a dirty read, a non-repeatable read and a phantom read?**
Dirty: reading uncommitted data. Non-repeatable: re-reading the same row gives a different value. Phantom: re-running the same query returns different *rows* because another transaction inserted or deleted.

**Q132. What is two-phase locking?**
A growing phase acquiring locks and a shrinking phase releasing them, with no acquisition after the first release. Strict 2PL holds all locks until commit, which guarantees serialisability and recoverability.

**Q133. 2PL vs 2PC — don't confuse them.**
Two-Phase Locking is a concurrency control protocol within one database. Two-Phase Commit is a distributed atomic commit protocol across multiple participants. **Interviewers ask this specifically to see if you conflate them.**

**Q134. Explain 2PC and its weakness.**
Prepare phase: coordinator asks all participants to prepare; they vote and durably promise. Commit phase: if all voted yes, commit; otherwise abort. The weakness is blocking — if the coordinator fails after prepare, participants hold locks indefinitely. Three-phase commit reduces but doesn't eliminate this.

**Q135. What is the saga pattern?**
A sequence of local transactions with compensating actions for rollback, used instead of distributed transactions in microservices. Trades atomicity for availability — you get eventual consistency with explicit compensation.

**Q136. What are database indexes and which structures are used?**
B+ trees (the default — all data in leaves, leaves linked for range scans), hash indexes (equality only), bitmap (low-cardinality, analytics), GiST/GIN (Postgres, for full-text and arrays), LSM trees (write-optimised, used by RocksDB, Cassandra).

**Q137. B-tree vs B+ tree?**
B+ trees store data only in leaves and link leaves, making range scans and full scans efficient. Internal nodes hold only keys, so fanout is higher and the tree is shallower.

**Q138. B-tree vs LSM tree?**
B-trees: read-optimised, in-place updates, write amplification from page writes. LSM: write-optimised, append to a memtable then flush sorted runs, with background compaction. Reads may check multiple levels (mitigated by Bloom filters). **The choice reflects the read/write ratio.**

**Q139. What is a Bloom filter?**
A probabilistic set with no false negatives and tunable false positives, using k hash functions over a bit array. Used to avoid disk reads for keys that definitely aren't present.

**Q140. Clustered vs non-clustered index?**
A clustered index determines the physical row order (one per table). A non-clustered index is a separate structure pointing at rows. In InnoDB the primary key is clustered, so secondary indexes store the primary key and require a second lookup.

**Q141. What is a covering index?**
Chapter 09 Q36.

**Q142. What is the cardinality of an index and why does it matter?**
The number of distinct values. Low cardinality (a boolean) means an index rarely helps because the optimiser will prefer a scan.

**Q143. Explain the query execution pipeline.**
Parse → rewrite → plan/optimise (cost-based, using statistics) → execute. The optimiser's choices depend entirely on statistics, which is why stale statistics cause bad plans.

**Q144. What is a view and a materialised view?**
A view is a stored query, evaluated on access. A materialised view stores the results and must be refreshed.

**Q145. What is a stored procedure and why is it contentious?**
Code stored in the database. Fast (no round trips) but hard to version, test and deploy alongside application code.

**Q146. What is a trigger and when should you avoid it?**
Code fired on data changes. Avoid for business logic — it's invisible action-at-a-distance that surprises everyone debugging. Acceptable for auditing and denormalised-field maintenance.

**Q147. What are the SQL join types?**
INNER (matches only), LEFT/RIGHT OUTER (all from one side), FULL OUTER (all from both), CROSS (Cartesian), SELF (a table to itself).

**Q148. What's the difference between `WHERE` and `HAVING`?**
`WHERE` filters rows before grouping; `HAVING` filters groups after aggregation.

**Q149. Logical order of SQL clause evaluation?**
FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT. **This explains why you can't reference a SELECT alias in WHERE but can in ORDER BY** — a common question.

**Q150. `UNION` vs `UNION ALL`?**
`UNION` removes duplicates (requiring a sort or hash — expensive); `UNION ALL` doesn't. Use ALL unless you need deduplication.

**Q151. What is a window function?**
An aggregate computed over a partition without collapsing rows: `ROW_NUMBER() OVER (PARTITION BY course ORDER BY score DESC)`. **The canonical use is "top N per group"**, which is awkward without them.

**Q152. Write a query for the second-highest salary.**
```sql
SELECT DISTINCT salary FROM employees ORDER BY salary DESC OFFSET 1 LIMIT 1;
-- or, robustly with ties and groups:
SELECT * FROM (SELECT *, DENSE_RANK() OVER (ORDER BY salary DESC) r FROM employees) t WHERE r = 2;
```
Discuss the tie-handling difference between `RANK`, `DENSE_RANK` and `ROW_NUMBER` — that's where the follow-up goes.

**Q153. Find duplicate rows.**
```sql
SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;
```

**Q154. Find employees earning more than their manager.**
```sql
SELECT e.name FROM employees e JOIN employees m ON e.manager_id = m.id WHERE e.salary > m.salary;
```
A self-join — very commonly asked.

**Q155. What is a correlated subquery and why is it slow?**
A subquery referencing the outer query, so it's re-evaluated per outer row — effectively a nested loop. Usually rewritable as a join or a window function.

**Q156. What is `EXISTS` vs `IN`?**
`EXISTS` short-circuits on the first match and handles NULLs predictably. `IN` with a subquery returning NULL behaves surprisingly (`NOT IN` with any NULL returns no rows). **That NULL trap is a favourite question.**

**Q157. Explain NULL semantics.**
NULL is unknown, not a value. `NULL = NULL` is unknown, not true — which is why you use `IS NULL`. Aggregates skip NULLs, but `COUNT(*)` counts all rows.

**Q158. What is sharding vs partitioning vs replication?**
Partitioning splits a table within one database. Sharding distributes data across separate databases. Replication copies data for availability and read scaling. They're orthogonal and often combined.

**Q159. What is a hotspot in a sharded system?**
Uneven load because the shard key concentrates traffic — e.g. sharding by timestamp puts all new writes on one shard (Chapter 09 Q26).

**Q160. What is eventual consistency and what are the read guarantees you can layer on?**
Chapter 09 Q139–141. Read-your-writes, monotonic reads, consistent prefix.

**Q161. Explain the PACELC theorem.**
Chapter 09 Q30.

**Q162. What is a quorum?**
Requiring R reads and W writes out of N replicas. If R + W > N, reads see the latest write. Dynamo-style systems expose this as a tunable.

**Q163. What is a vector clock?**
A per-node counter vector that establishes causality between events across nodes, detecting concurrent updates that a single timestamp can't. Used for conflict detection in eventually-consistent stores.

**Q164. What is a CRDT?**
Conflict-free Replicated Data Type — structures (counters, sets, sequences) whose merge operation is commutative, associative and idempotent, so replicas converge without coordination. It's how collaborative editors work.

**Q165. What is Raft, briefly?**
A consensus algorithm with leader election, log replication and safety guarantees, designed to be more understandable than Paxos. **etcd uses it, so it underpins every Kubernetes cluster** — which connects this to your CNCF work.

---

## Section D — OOP and design principles (Q166–200)

**Q166. What are the four pillars of OOP?**
Encapsulation (hide internal state behind an interface), Abstraction (expose what, hide how), Inheritance (reuse via an is-a relationship), Polymorphism (one interface, many implementations).

**Q167. Compile-time vs runtime polymorphism?**
Overloading (resolved at compile time by signature) vs overriding (resolved at runtime by the object's actual type via a vtable).

**Q168. Abstract class vs interface?**
An abstract class can hold state and implementation and supports single inheritance. An interface is a contract, supports multiple implementation, and (in modern Java) can have default methods. **Go has only interfaces, and satisfaction is implicit** (Chapter 13 Q15).

**Q169. Why does Go have no inheritance?**
Because composition is more flexible and avoids the fragile base class problem. Go embeds structs for reuse and uses interfaces for polymorphism. **"Prefer composition over inheritance" is a design principle; Go enforces it.**

**Q170. Explain SOLID.**
**S**ingle Responsibility — one reason to change. **O**pen/Closed — open for extension, closed for modification. **L**iskov Substitution — subtypes must be usable wherever the base type is, without weakening guarantees. **I**nterface Segregation — many small interfaces beat one large one. **D**ependency Inversion — depend on abstractions, not concretions.

**Q171. Give a SOLID violation from your own code.**
**This is the question that separates memorisation from understanding.** Good answer: *"My Express controllers violate Single Responsibility — `submitAssignment` does HTTP parsing, authorisation, the sequential-gating business rule, file upload and notification dispatch. That's five reasons to change, which is why it's 100 lines and can only be tested through HTTP."*

**Q172. Give an Interface Segregation example from Go.**
`io.Reader` with one method is used by hundreds of types. A hypothetical `io.ReadWriteCloseSeeker` would force implementers to stub methods they don't support. Small interfaces compose.

**Q173. What is DRY and when does it mislead?**
Don't Repeat Yourself. It misleads when you deduplicate things that are *coincidentally* similar but change for different reasons — you create a coupling that later needs a flag parameter, then two. **"Duplication is far cheaper than the wrong abstraction" is the counterweight, and citing it shows judgement.**

**Q174. What is YAGNI?**
You Aren't Gonna Need It — don't build for speculative requirements. Relevant to your own answer about not adding an SFU before you needed one.

**Q175. What is KISS?**
Keep It Simple. The practical form: the simplest solution that solves the actual problem, because complexity is paid every time someone reads the code.

**Q176. What is coupling and cohesion?**
Coupling: interdependence between modules (want low). Cohesion: how related a module's responsibilities are (want high). **Your `app.js` doing both HTTP composition and the entire socket layer is low cohesion.**

**Q177. Explain the Singleton pattern and its criticism.**
One instance, globally accessible. Criticised because it's global state, makes testing hard (you can't substitute it), and hides dependencies. **Your `socketService` and the Anthropic client are both singletons** — worth acknowledging the trade-off you accepted.

**Q178. How do you make a Singleton thread-safe in Go?**
`sync.Once` (Chapter 13 Q48). **And this is precisely the Kubescape singleton race you fixed** — the connection makes the pattern concrete.

**Q179. Explain the Factory pattern.**
A function or class that creates objects without exposing the construction logic. **`buildApp()` in your server is a factory**, and the reason it exists (testability without binding a port) is a perfect example of why factories matter.

**Q180. Explain the Observer pattern.**
Subjects notify registered observers of state changes. **Socket.IO events and Node's `EventEmitter` are both this.** React's state subscriptions too.

**Q181. Explain the Strategy pattern.**
Interchangeable algorithms behind a common interface. **Your rate limiter with pluggable algorithms (fixed window / sliding window / token bucket) is this**, as is the AI tool dispatch map.

**Q182. Explain the Decorator pattern.**
Wrapping an object to add behaviour without changing it. **Express middleware is a decorator chain** — each layer wraps the next.

**Q183. Explain the Adapter pattern.**
Converting one interface into another. Your `format*()` functions adapt Mongoose documents into the API wire format.

**Q184. Explain the Repository pattern.**
Abstracting data access behind a collection-like interface, so business logic doesn't depend on the database. **Your controllers call Mongoose models directly, which means they're coupled to MongoDB** — that's why "move to Postgres" would be a large change rather than a swap.

**Q185. Explain Dependency Injection.**
Providing dependencies from outside rather than constructing them internally, so they can be substituted in tests.

**Q186. What is the Builder pattern?**
Constructing complex objects step by step. In Go, the functional options pattern (`WithTimeout(5)`, `WithRetries(3)`) is the idiomatic version and is worth naming.

**Q187. What is composition over inheritance, concretely?**
Instead of `class AdminUser extends User`, have `User` hold a `Role`. It avoids deep hierarchies that become impossible to change.

**Q188. What is the Law of Demeter?**
Don't talk to strangers — `a.getB().getC().doThing()` couples you to the whole chain. In your code, `submission.assignment.createdBy` is a mild instance.

**Q189. What is technical debt?**
The future cost of a shortcut taken now. It's not always bad — deliberate, documented debt to ship faster is a legitimate strategy. Undocumented, accidental debt is the problem.

**Q190. Name a piece of technical debt in your project and whether it was deliberate.**
*"The in-memory OTP store was deliberate — I knew it wouldn't survive multi-instance and accepted it to ship. The authorisation flaw was accidental — I didn't know it was there, which is worse, and it's why I'd add authorisation negative tests as a structural control rather than relying on care."* **Distinguishing deliberate from accidental debt is a senior distinction.**

**Q191. What is a code smell? Name three.**
Long method, large class, long parameter list, feature envy, shotgun surgery, primitive obsession, duplicated code.

**Q192. Which smells are in your code?**
Long method (`submitAssignment`), large class (`LiveClassRoom.jsx`, `app.js`), duplicated code (the SignIn/SignUp component pairs), primitive obsession (passing raw ID strings everywhere instead of typed identifiers).

**Q193. What is refactoring and what's the discipline?**
Changing structure without changing behaviour. The discipline is that tests must pass before and after, unchanged — otherwise you're rewriting, not refactoring.

**Q194. What is TDD and do you practise it?**
Red-green-refactor. Be honest: *"Not strictly. I write tests alongside rather than before for feature work, but for bug fixes I do write the failing test first, because it proves the fix actually addresses the reported behaviour."* That's a defensible, real position.

**Q195. What makes code readable?**
Names that state intent, functions that do one thing at one level of abstraction, comments explaining *why* not *what*, and consistency with the surrounding code.

**Q196. When should you comment?**
When the reason isn't derivable from the code. **Your `setup.js` comment explaining why the OTP regex anchors on `>` and `<` (hex colours in the HTML) is exactly the right kind of comment** — it captures knowledge that would otherwise be lost.

**Q197. What is defensive programming and can you overdo it?**
Validating inputs and handling unexpected states. You overdo it when every function re-validates what its callers already guaranteed — it's noise that hides the real logic. Validate at the boundary, trust inside.

**Q198. What is fail-fast?**
Detecting errors as early as possible and stopping, rather than continuing with bad state. Go's panic on concurrent map writes is fail-fast by design.

**Q199. How do you review code?**
Correctness first (does it do what it claims, what happens on failure), then security (Chapter 08 Q113), then design (is this the right place for this), then style (which should mostly be automated away). And the reviewer's job is to ask questions, not issue orders.

**Q200. What makes a good engineer, in your view?**
Have a real answer. Strong one: *"Someone who reduces uncertainty for everyone around them. That means writing code that's obviously correct rather than cleverly correct, saying when they don't know, and finding the problem in their own work before someone else does."*

---

*Next: [Chapter 17 — System design rounds](17-SYSTEM-DESIGN-ROUNDS.md)*
