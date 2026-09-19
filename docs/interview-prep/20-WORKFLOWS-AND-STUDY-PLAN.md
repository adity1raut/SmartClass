# Chapter 20 — Workflows, Study Plans and Checklists

> Preparation fails from lack of structure, not lack of material. This chapter is the operating system: what to do each day, in what order, and how to know whether it's working.

---

## 20.1 The overall workflow

```
┌──────────────────────────────────────────────────────────────────────┐
│  PHASE 0 — TRUTH PASS (Day 1, 3 hours)                               │
│  Read Chapter 21. Fix the resume. Start fixing the code.             │
│  Nothing else matters until this is done.                            │
└──────────────────────────┬───────────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│  PHASE 1 — OWN YOUR WORK (Days 2–5)                                  │
│  Ch 01 (resume) · Ch 03 (diagrams) · Ch 04 (repo) · Ch 05 (Q&A)      │
│  Exit criterion: draw all 10 diagrams from memory, timed.            │
└──────────────────────────┬───────────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│  PHASE 2 — STACK DEPTH (Days 6–15)   ── runs in parallel with ──►    │
│  Ch 06–14, ordered by the role you're targeting                      │
│  Exit criterion: answer any 20 random questions in 3-layer form      │
└──────────────────────────┬───────────────────────────────────────────┘
                           ▼                                    ┌──────────────────────┐
┌──────────────────────────────────────────────────────────────┐│  DAILY DSA           │
│  PHASE 3 — GATEKEEPER ROUNDS (Days 16–25)                    ││  2 problems/day      │
│  Ch 15 (DSA) · Ch 16 (core CS) · Ch 17 (system design)       ││  from Day 1          │
│  Exit criterion: medium LeetCode in 25 min; design in 45     ││  NEVER SKIP          │
└──────────────────────────┬───────────────────────────────────┘└──────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│  PHASE 4 — DELIVERY (Days 26–30)                                     │
│  Ch 02 (opening) · Ch 18 (HR) · Ch 19 (mocks, OUT LOUD)              │
│  Exit criterion: 4 timed mocks completed with a partner              │
└──────────────────────────┬───────────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│  MAINTENANCE — until you have an offer                               │
│  2 DSA/day · 1 system design/week · 1 mock/week · Ch 22 before each   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 20.2 The 7-day plan (interview is next week)

Emergency mode. Triage hard.

| Day | Morning (3h) | Afternoon (3h) | Evening (2h) |
|---|---|---|---|
| **1** | Ch 21 — fix every resume item tonight | Ch 03 — draw all diagrams twice | 2 DSA (arrays, hashing) |
| **2** | Ch 01 — every resume line, out loud | Ch 04 + Ch 05 §A–D | 2 DSA (two pointers, sliding window) |
| **3** | Ch 05 §E–H | Ch 06 (WebRTC) or Ch 12 (scheduler) — whichever matches the role | 2 DSA (binary search, linked lists) |
| **4** | Ch 08 (security) — the three bugs cold | Ch 09 (databases) §A–D | 2 DSA (trees) |
| **5** | Ch 17 — work Designs 1 and 2 on paper, timed | Ch 10 or Ch 13 (Node or Go) | 2 DSA (graphs) |
| **6** | Ch 18 — write your 8 stories out | Ch 19 — Mocks 1, 4, 6 out loud | 2 DSA (DP basics) |
| **7** | Ch 22 rapid-fire, full pass | Re-draw all diagrams from memory | **Stop. Sleep.** |

**What to cut if you're short:** Ch 16 (core CS) and Ch 11 (React) unless the role is frontend. Never cut Ch 21, Ch 03, or the daily DSA.

---

## 20.3 The 30-day plan (the realistic one)

### Week 1 — Foundation
| Day | Focus | Deliverable |
|---|---|---|
| 1 | Ch 21 truth pass | Resume fixed, `client/.env` untracked, fix list written |
| 2 | Fix the OAuth bypass + socket auth | Committed and pushed |
| 3 | Fix the IDOR across all controllers | Committed and pushed |
| 4 | Write the authorisation negative tests | Tests passing (and one that failed before) |
| 5 | Ch 01 + Ch 03 | All 10 diagrams drawn from memory |
| 6 | Ch 04 + Ch 05 §A–D | Can give the 6-file walkthrough |
| 7 | Review + Ch 05 §E–H | — |

*Daily throughout: 2 DSA problems.*

### Week 2 — Your stack
| Day | Focus |
|---|---|
| 8 | Ch 06 (WebRTC) §A–B |
| 9 | Ch 06 §C–E |
| 10 | Ch 08 (security) — all of it |
| 11 | Ch 09 (databases) §A–C |
| 12 | Ch 09 §D–F (Postgres + Redis) |
| 13 | Ch 12 (job scheduler) §A–C |
| 14 | Ch 12 §D–E + review |

### Week 3 — Breadth and gatekeepers
| Day | Focus |
|---|---|
| 15 | Ch 13 (Go) or Ch 10 (Node) — whichever the role needs |
| 16 | Ch 14 (Kubernetes/CNCF) |
| 17 | Ch 07 (AI) + Ch 11 (React) skim |
| 18 | Ch 16 (OS + networks) |
| 19 | Ch 16 (DBMS + OOP) |
| 20 | Ch 17 — Designs 1–4 on paper |
| 21 | Ch 17 — Designs 5–8 |

### Week 4 — Delivery
| Day | Focus |
|---|---|
| 22 | Ch 02 — record your intro until it's 60s and clean |
| 23 | Ch 18 — write all 8 stories in STAR form |
| 24 | Mock 1 + Mock 2, with a partner, timed |
| 25 | Mock 3 (system design), with a partner |
| 26 | Mock 4 (recovery) + Mock 6 (hiring manager) |
| 27 | Weak-area review — whatever the mocks exposed |
| 28 | Full loop simulation: DSA + technical + HR back to back |
| 29 | Ch 22 rapid-fire, full pass |
| 30 | Light review, re-draw diagrams, rest |

---

## 20.4 The 90-day plan (start now, place well)

**Month 1:** the 30-day plan above, plus fix every item in Ch 21.

**Month 2 — build the gap closers.**
- **Week 5–6:** Add an SFU to SmartClass (LiveKit is the fastest path). This makes the strongest line on your resume true and gives you a genuinely impressive story about migrating an architecture.
- **Week 7:** Move the in-memory state to Redis, add the Socket.IO Redis adapter, and demonstrate the app running on two instances. That's a concrete "I made it horizontally scalable" claim.
- **Week 8:** Add observability — structured logging, a real health check, and basic metrics. Then you can answer "what's your p99" with a number.

**Month 3 — depth and volume.**
- 150 more DSA problems, weighted toward your weak patterns.
- One system design per week, written up.
- One mock interview per week with a different person.
- Keep contributing to CNCF projects — new merged PRs keep the story current.

---

## 20.5 The daily workflow (60–90 minutes, sustainable)

Use this between and after the intensive phases.

```
 15 min │ Warm-up: 10 questions from Ch 22, out loud
 30 min │ DSA problem 1 — timed, 25 min cap, then read the solution if stuck
 25 min │ DSA problem 2 — a pattern you're weak at
 15 min │ One chapter section, or one diagram drawn from memory
  5 min │ Log it (see §20.7)
```

**Non-negotiable:** the two DSA problems. Everything else can slip on a bad day; that can't, because DSA is the only skill here that decays without daily use.

---

## 20.6 Pre-interview workflows

### T-minus 1 week
- [ ] Research the company: what they build, their engineering blog, recent news, the team if you know it
- [ ] Re-read your own merged PRs
- [ ] Confirm your three numbers: 185 PRs (with the breakdown), 50 workers, 25+ packages
- [ ] Do one full mock

### T-minus 1 day
- [ ] Re-read Chapter 21 (know your own weak points)
- [ ] Draw all 10 diagrams from memory, timed
- [ ] Read your 8 STAR stories once
- [ ] Prepare 3 questions for them
- [ ] Test camera, mic and screen share **in their platform**
- [ ] Sleep 8 hours. This is worth more than three extra hours of revision.

### T-minus 2 hours
- [ ] Chapter 22 rapid-fire only. Nothing new.
- [ ] Eat something.
- [ ] Open: coding environment, GitHub profile, SmartClass repo. Close everything else.

### T-minus 10 minutes
- [ ] Stop reading
- [ ] Read the mantra (Ch 02 §2.11)
- [ ] Walk, breathe, slow down

### Immediately after
- [ ] Write down **every question you were asked**, while it's fresh
- [ ] Mark the ones you handled badly
- [ ] Those become tomorrow's study list

**This last step is the highest-leverage habit in the whole document.** After five interviews you'll have a personalised question bank that predicts the sixth.

---

## 20.7 Tracking sheets

### DSA log
| Date | Problem | Pattern | Solved unaided? | Time | Re-do date |
|---|---|---|---|---|---|
| | | | | | |

**The re-do column is the point.** Anything you didn't solve unaided gets re-solved from scratch 2 days later, then 7 days later. Reading a solution and moving on teaches you nothing.

### Chapter progress
| Ch | Title | First pass | Second pass | Confident? |
|---|---|---|---|---|
| 01 | Resume line by line | ☐ | ☐ | ☐ |
| 02 | How to start | ☐ | ☐ | ☐ |
| 03 | Diagrams | ☐ | ☐ | ☐ |
| 04 | Repo walkthrough | ☐ | ☐ | ☐ |
| 05 | SmartClass Q&A | ☐ | ☐ | ☐ |
| 06 | WebRTC | ☐ | ☐ | ☐ |
| 07 | AI/agents | ☐ | ☐ | ☐ |
| 08 | Security | ☐ | ☐ | ☐ |
| 09 | Databases | ☐ | ☐ | ☐ |
| 10 | Node/Express | ☐ | ☐ | ☐ |
| 11 | React | ☐ | ☐ | ☐ |
| 12 | Job scheduler | ☐ | ☐ | ☐ |
| 13 | Go | ☐ | ☐ | ☐ |
| 14 | Kubernetes/CNCF | ☐ | ☐ | ☐ |
| 15 | DSA | ☐ | ☐ | ☐ |
| 16 | Core CS | ☐ | ☐ | ☐ |
| 17 | System design | ☐ | ☐ | ☐ |
| 18 | HR | ☐ | ☐ | ☐ |
| 19 | Mocks | ☐ | ☐ | ☐ |
| 21 | Red flags | ☐ | ☐ | ☐ |

### Interview log
| Date | Company | Round | Questions I fumbled | Outcome | Follow-up study |
|---|---|---|---|---|---|
| | | | | | |

### Application tracker
| Company | Role | Applied | Referral? | Status | Next action | Date |
|---|---|---|---|---|---|---|
| | | | | | | |

**Referrals matter more than applications.** One referral is worth roughly ten cold applications. Use your open-source network — the maintainers you've worked with are real professional contacts, and most candidates don't realise that.

---

## 20.8 Role-specific reading order

**Backend / Platform Engineer** *(your best fit)*
21 → 01 → 03 → 04 → 12 → 13 → 09 → 08 → 10 → 14 → 17 → 15 → 05

**Full-stack Engineer**
21 → 01 → 03 → 04 → 05 → 11 → 10 → 09 → 06 → 08 → 15 → 17

**Infrastructure / SRE / DevOps**
21 → 01 → 14 → 13 → 12 → 09 → 16 (OS + networks) → 17 → 15

**AI / LLM Engineering**
21 → 01 → 07 → 05 → 10 → 09 → 17 (Design 14) → 15

**Service company / mass recruiter** *(TCS, Infosys, Wipro, Accenture)*
16 (core CS is weighted heavily) → 15 → 18 → 01 → 09

**Product company** *(Google, Microsoft, Atlassian, Uber, startups)*
15 (DSA is the gate) → 17 → 03/04/05 → 12 → 18

---

## 20.9 The application workflow

```
 1. Target list     ── 30 companies, tiered:
                        Tier 1 (10): stretch, apply anyway
                        Tier 2 (15): strong fit, focus here
                        Tier 3 (5):  safety, apply early for practice
 2. Referral hunt   ── LinkedIn, CNCF Slack, alumni, maintainers you've
                        worked with. Ask specifically, not vaguely:
                        "I'm applying to X for role Y — would you be
                         comfortable referring me?" with resume attached.
 3. Tailor          ── Reorder resume bullets to match the JD's emphasis.
                        Never lie; do reorder.
 4. Apply           ── Batch Tier 3 first so your first interviews are
                        low-stakes practice.
 5. Track           ── §20.7 sheet. Follow up after 10 days, once.
 6. Prepare         ── §20.6 workflow per interview.
 7. Debrief         ── Log every question. Always.
 8. Iterate         ── Your fumbled-question list is your study plan.
```

---

## 20.10 Practice partners

Solo preparation has a ceiling. You cannot practise being interrupted, being challenged, or recovering from a blank on your own.

**Find three people:**
1. **A peer** for DSA — take turns, 45 minutes each.
2. **Someone more senior** for system design and project deep-dives — a maintainer you've worked with, an alumnus, a senior at your college. Most people say yes if you ask specifically and respect their time.
3. **Anyone at all** for HR rounds — they don't need technical knowledge to tell you that your answer was four minutes long and rambling.

**How to run a mock properly:**
- Timed, camera on, no notes.
- The interviewer interrupts, challenges, and goes off-script.
- Feedback immediately afterwards, on **delivery** as well as content.
- Record it. Watching yourself is uncomfortable and it's the fastest feedback loop available.

---

## 20.11 Anti-patterns

| Anti-pattern | Why it fails | Do instead |
|---|---|---|
| Reading solutions instead of solving | Recognition ≠ recall. You'll freeze. | 25-minute honest attempt first, always |
| Solving 500 easy problems | Interviews are mediums and hards | 60% medium, 20% hard, 20% easy |
| Only studying, never speaking | The bottleneck is articulation, not knowledge | Practise out loud daily |
| Preparing breadth over your own projects | 40% of questions are about your resume | Ch 01/03/04/05 first |
| Cramming the night before | Degrades recall and judgement | Rapid-fire only, then sleep |
| Avoiding your weak areas | They're exactly where you'll be probed | Timebox them daily |
| No mock interviews | You practise everything except the actual task | One per week minimum |
| Not logging interview questions | You repeat the same failures | Debrief every time |
| Applying only to dream companies | No practice, then you're rusty for the one that matters | Tier 3 first |
| Memorising answers word for word | Sounds rehearsed; collapses under a follow-up | Memorise structure and nouns, not sentences |

---

## 20.12 Are you ready? The honest checklist

**Your work**
- [ ] I can draw all 10 diagrams from memory in under 90 seconds each
- [ ] I can give the 6-file code walkthrough with a story for each
- [ ] I can state the three security bugs in my own code and their fixes
- [ ] I have the SFU correction script ready — **and the resume line is already fixed**
- [ ] Every number on my resume is defensible or removed

**Technical depth**
- [ ] I can explain `SKIP LOCKED` and why exactly-once execution is impossible
- [ ] I can compare mesh, SFU and MCU with numbers
- [ ] I can explain a data race vs a race condition with an example of each
- [ ] I can name three things that break if I run two instances of my server
- [ ] I can design a rate limiter and explain why atomicity matters

**Gatekeepers**
- [ ] I solve LeetCode mediums in under 25 minutes, unaided, most of the time
- [ ] I can run a 45-minute system design without prompting
- [ ] I know the OS/DBMS/CN topics in Chapter 16

**Delivery**
- [ ] My introduction is 60 seconds and ends with a pointer
- [ ] I have 8 STAR stories written and rehearsed
- [ ] I've done at least 4 mocks with a partner
- [ ] I have 3 questions prepared for them
- [ ] I've practised saying "I don't know, here's how I'd find out"

**If more than three boxes are unticked, you are not ready — and that's fine.** Tick them in order; the list above is roughly the order of importance.

---

## 20.13 One last thing

You have genuinely unusual material for a final-year student: merged security fixes in a CNCF Kubernetes project, race conditions eliminated in production tooling, and two systems where the hard part was correctness under concurrency rather than feature count.

The gap between where you are and where you want to be is not knowledge. It's **articulation and honesty** — being able to say what you built precisely, and being the person who names the flaw before anyone else finds it.

Both of those are practised, not learned. Start today, out loud.

---

*Next: [Chapter 22 — Rapid-fire bank](22-RAPID-FIRE-BANK.md)*
