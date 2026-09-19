# The Complete Interview Preparation Guide — Aditya Raut

> **Built from:** `Aditya_Resume2.pdf` + a full source-code audit of the `adity1raut/SmartClass` repository.
> **Target:** SDE / Backend / Full-Stack / Platform-Engineering roles (2026 batch, on-campus + off-campus).
> **Size:** 115,000+ words ≈ 256 printed pages (A4, 11pt, 1.15 line spacing — roughly 450 words per page).
> **Last built:** 2026-09-19

---

## 0.1 What this document is

This is not a generic "top 100 interview questions" list. Every question in this guide is either:

1. **Derived from a specific line on your resume** — if it is printed on the page, an interviewer can ask about it, so it is in here.
2. **Derived from a specific file in your SmartClass repository** — including the parts of the code that are *weak*, because those are exactly what a senior engineer will find in five minutes of reading.
3. **Core CS fundamentals** that every company asks regardless of resume (DSA, OS, DBMS, CN, System Design).
4. **Behavioural / HR** questions, with answer scripts written in your voice using your real projects.

The guide is deliberately blunt in places. There are three or four things on your resume and in your code that will not survive a serious technical interview unchanged. Those are marked with a **RISK** callout. Fixing them is a bigger win than memorising another fifty questions.

---

## 0.2 Chapter map

| # | File | What it covers | Approx. pages |
|---|------|----------------|---------------|
| 00 | `00-INDEX-AND-HOW-TO-USE.md` | This file. Map, method, study plan overview. | 5 |
| 01 | `01-RESUME-LINE-BY-LINE.md` | Every single line of your resume decomposed into the questions it invites, with model answers. | 12 |
| 02 | `02-HOW-TO-START-THE-INTERVIEW.md` | The first 5 minutes. Self-introduction scripts (30s / 60s / 2min), framing, STAR, tone, remote setup, what to do before you say a word. | 10 |
| 03 | `03-SYSTEM-ARCHITECTURE-DIAGRAMS.md` | Every diagram you need to be able to draw from memory on a whiteboard: SmartClass HLD, request lifecycle, WebRTC signalling, Socket.IO rooms, AI agent loop, deployment, job scheduler. | 12 |
| 04 | `04-SMARTCLASS-REPO-WALKTHROUGH.md` | File-by-file, module-by-module explanation of the actual repository. What each file does, why, and what the interviewer will ask about it. | 14 |
| 05 | `05-QA-SMARTCLASS-CORE.md` | ~220 questions on the SmartClass project itself. | 16 |
| 06 | `06-QA-WEBRTC-AND-SOCKETIO.md` | ~140 questions on real-time: WebRTC, ICE/STUN/TURN, SDP, SFU vs mesh, Socket.IO internals, scaling. | 12 |
| 07 | `07-QA-AI-CLAUDE-AND-AGENTS.md` | ~120 questions on LLM integration, prompt design, tool-use/agent loops, cost, latency, failure modes. | 11 |
| 08 | `08-QA-AUTH-AND-SECURITY.md` | ~140 questions on JWT, cookies, OAuth, OTP, OWASP Top 10, and the specific vulnerabilities in your code. | 12 |
| 09 | `09-QA-DATABASES.md` | ~150 questions on MongoDB/Mongoose, PostgreSQL (incl. `SKIP LOCKED`), Redis, indexing, transactions, isolation. | 13 |
| 10 | `10-QA-NODE-EXPRESS.md` | ~130 questions on Node.js internals, the event loop, Express 5, streams, clustering, error handling. | 11 |
| 11 | `11-QA-REACT-FRONTEND.md` | ~150 questions on React 19, hooks, rendering, Vite, code splitting, performance, Tailwind, routing. | 12 |
| 12 | `12-QA-DISTRIBUTED-JOB-SCHEDULER.md` | ~130 questions on your Go scheduler: claiming, retries, DLQ, heartbeats, cron, multi-tenancy, rate limiting. | 12 |
| 13 | `13-QA-GO-LANGUAGE.md` | ~120 questions on Go: goroutines, channels, context, memory model, races, testing, `go` tooling. | 10 |
| 14 | `14-QA-KUBERNETES-CNCF.md` | ~140 questions on Kubernetes, your Kubescape / Fluid / KubeStellar contributions, K8s security, operators, Ginkgo. | 13 |
| 15 | `15-DSA-QUESTION-BANK.md` | ~200 DSA problems organised by pattern, with the approach and complexity for each. | 14 |
| 16 | `16-CORE-CS-OS-DBMS-CN.md` | ~200 core CS questions: OS, DBMS theory, computer networks, OOP. | 14 |
| 17 | `17-SYSTEM-DESIGN-ROUNDS.md` | 14 full system-design problems worked end-to-end, plus the framework to attack any new one. | 13 |
| 18 | `18-HR-AND-BEHAVIOURAL.md` | ~120 HR/behavioural questions with scripted answers using your real stories. | 11 |
| 19 | `19-MOCK-INTERVIEW-TRANSCRIPTS.md` | 7 full mock interviews written as dialogue — including the ones that go badly and how to recover. | 12 |
| 20 | `20-WORKFLOWS-AND-STUDY-PLAN.md` | Day-by-day plans (7 / 30 / 90 day), daily workflows, checklists, tracking sheets. | 10 |
| 21 | `21-RED-FLAGS-AND-HOW-TO-FIX-THEM.md` | The honest audit. What is wrong on your resume and in your code, what a senior will catch, and exactly how to fix it. | 9 |
| 22 | `22-RAPID-FIRE-BANK.md` | 800+ one-line questions with one-line answers, for last-24-hour revision. | 14 |
| | **Total** | | **~250** |

That comfortably exceeds the 120-page minimum you asked for. Chapters 01, 04, 05, 21 are the ones that are uniquely yours — nobody else has them. Chapters 15, 16, 22 are the commodity ones you can share with friends.

---

## 0.3 How to actually use this (do not read it front to back)

Reading 250 pages linearly will not help you. Use this order:

### Phase 1 — Truth pass (Day 1, 3 hours)
Read **Chapter 21 (Red Flags)** first. Before anything else, you need to know which claims on your resume you cannot currently defend. Fix the resume wording or fix the code — both are two-hour jobs. Do not walk into an interview with an undefendable line.

### Phase 2 — Own your own work (Days 2–5)
Read **Chapters 01, 03, 04, 05**. This is your project. If you are fluent here, you control 40% of every interview, because most interviewers spend the first half of a technical round on "tell me about your project." Being the person who can *draw the architecture from memory* puts you in the top 10% immediately.

### Phase 3 — Depth on the stack (Days 6–15)
Chapters **06–14**, in the order that matches the job you are applying to:
- Backend / platform role → 10, 09, 08, 12, 13, 14
- Full-stack role → 11, 10, 09, 06, 08
- Infra / SRE / DevOps role → 14, 13, 12, 09
- AI-adjacent role → 07, 05, 10

### Phase 4 — Rounds you cannot skip (Days 16–25)
Chapters **15, 16, 17**. DSA and system design are gatekeepers. No amount of project fluency rescues a failed DSA round at most product companies.

### Phase 5 — Delivery (Days 26–30)
Chapters **02, 18, 19**. How you say it. Do at least four of the mock transcripts out loud, timed, preferably with a friend playing interviewer.

### Phase 6 — The day before
Chapter **22** only. Nothing new.

---

## 0.4 The three-layer answer method (use this for every technical question)

Almost everyone answers interview questions at one layer. Strong candidates answer at three, in this order, in under 90 seconds:

**Layer 1 — The direct answer (10–15 seconds).**
One or two sentences. No preamble, no "so basically", no restating the question. If asked "how does your auth work", the first sentence is: *"JWT in an HTTP-only cookie, issued after email-OTP verification, verified by an Express middleware on every protected route."*

**Layer 2 — The mechanism (30–45 seconds).**
How it actually works, with the real names from your code. *"On register I generate a six-digit OTP with `crypto.randomInt`, hold it in an in-memory Map keyed by email with a five-minute `setTimeout` eviction, and mail it with Nodemailer. On verify I compare, mark `isVerified: true`, then sign a JWT with `{id, email, role}` and set it as an `httpOnly`, `sameSite=none`, `secure` cookie."*

**Layer 3 — The trade-off and what you'd change (20–30 seconds).**
This is the layer that separates a 6/10 from a 9/10. *"The weak point is the in-memory OTP store — it dies on restart and breaks the moment I run more than one instance. In production I'd move it to Redis with a TTL key, which also gives me atomic attempt-counting for brute-force protection."*

Then **stop talking.** Silence after Layer 3 is a power move. Rambling past it is where candidates talk themselves into a follow-up they can't answer.

> **Drill:** take any twenty questions from Chapter 05 and answer them out loud in this 3-layer shape until it is automatic. This single habit is worth more than 200 extra memorised facts.

---

## 0.5 The four things interviewers are actually scoring

Regardless of what they ask, they are filling in a rubric that looks roughly like this:

| Signal | What it means | How you show it |
|---|---|---|
| **Depth** | Did you build it or assemble it? | Use exact names: `makePeerForViewer`, `SKIP LOCKED`, `stop_reason === "tool_use"`. Vague answers read as "followed a tutorial". |
| **Judgement** | Can you reason about trade-offs? | Always volunteer the cost of your choice. "I used mesh P2P because it was zero-infra; it breaks past ~6 participants and here's why." |
| **Honesty** | Will you hide problems on a real team? | Say "I don't know, here's how I'd find out" once, early, deliberately. It buys credibility for everything else. |
| **Communication** | Can a teammate follow you? | Structure. Diagram on the whiteboard before talking. Number your points. |

Notice that three of the four are not about knowing more facts.

---

## 0.6 Your profile in one paragraph (memorise the shape, not the words)

> Final-year CSE student at SGGSIE&T Nanded. ~185 merged pull requests across three CNCF projects — Kubescape (Kubernetes security), Fluid (data orchestration, CNCF Incubating), and KubeStellar (multi-cluster) — where the work was mostly Go: fixing path traversal and race conditions, migrating test suites to Ginkgo/Gomega, and taking a package to 100% coverage. Alongside that, two substantial self-built systems: a distributed job scheduler in Go on PostgreSQL and Redis that handles immediate, delayed, cron and batch jobs with exactly-once claiming via `SELECT ... FOR UPDATE SKIP LOCKED`, and SmartClass, a MERN learning-management platform with WebRTC live classes, Socket.IO real-time, and an LLM-backed teaching assistant built on Claude's tool-use API.

That paragraph is your spine. Chapter 02 turns it into spoken scripts of different lengths.

---

## 0.7 What makes your profile unusually strong — and where it is fragile

**Unusually strong (lean on these):**
- **185+ merged PRs in CNCF projects.** This is rare for a student and it is *verifiable*. Most candidates claim "open source contributions" and mean three README typos. You have race-condition fixes and security patches in a Kubernetes security scanner. Lead with this for any infra/platform/Go role.
- **You have shipped concurrency-correct code.** "Eliminated races in global cluster state" and "`SKIP LOCKED` for zero duplicate claims across 50 workers" are the two most senior-sounding things on your resume. Be able to go extremely deep on both.
- **Breadth that is actually connected.** Go + Kubernetes + Postgres + React + Node is a coherent platform-engineer profile, not a scattered one.

**Fragile (Chapter 21 handles each in detail):**
- The resume says **"SFU-based WebRTC"**. Your code does not contain an SFU. It is a star-topology mesh where the teacher opens one `RTCPeerConnection` per viewer. Any interviewer who has touched WebRTC will ask you to name the SFU, and the answer "there isn't one" after claiming it is a credibility hit. **This is the single highest-priority fix in this document.**
- **Authorisation in SmartClass is broken.** Controllers read `teacherId` / `studentId` / `userId` from the *request body* instead of from the verified JWT (`req.user`). That is a textbook IDOR. A senior backend interviewer will find it fast. Chapter 08 and 21 turn this from a liability into your best "what did you learn" story — but only if you find it before they do.
- **Two different PR counts.** The Projects section says "185+ PRs merged across multiple projects"; Achievements says "40+ merged pull requests in CNCF KubeStellar". These are consistent (40 of the 185) but a reader may see them as contradictory. Make the relationship explicit.
- **CGPA 7.60** will be below some companies' cutoffs. That is a filter, not an interview problem, and Chapter 18 has the script for when it comes up.

---

## 0.8 Conventions used in this guide

- **Q** — a question an interviewer may ask, in the phrasing they'd use.
- **A** — a model answer. Do not memorise word-for-word; memorise the *structure* and the *specific nouns*.
- **RISK** — a place where the honest answer exposes a weakness. Always includes the recovery script.
- **DEEPER** — the follow-up question that a strong interviewer asks after your first answer. Assume it is coming.
- **CODE** — a direct reference to a real file in this repository, so you can go read it.
- **DRAW** — something you should be able to sketch on a whiteboard in under 60 seconds.

---

## 0.9 One rule above all others

**Never claim a mechanism you cannot explain in three levels of depth.**

Every line on a resume is a contract. "Implemented SFU-based WebRTC" is a promise that you can (1) say what an SFU is, (2) say why you chose it over mesh and MCU, and (3) name the one you used and the trade-offs of that specific one. If you cannot honour all three, change the line. A weaker true claim beats a stronger false one every single time, because the false one doesn't just fail its own question — it makes the interviewer re-audit everything else you said.

Chapter 21 gives you the rewritten lines.

---

*Next: [Chapter 01 — Your resume, line by line](01-RESUME-LINE-BY-LINE.md)*
