# Chapter 02 — How to Start: The First Five Minutes

> Interviews are decided early more often than anyone admits. Not because the decision is final at minute five, but because the interviewer forms a hypothesis at minute five and spends the rest of the hour testing it. You want them testing "this person is strong" rather than "let me find out if this person is weak."

---

## 2.1 Before you say a word

### The 24 hours before

| When | Do |
|---|---|
| Night before | Re-read your own PRs. Re-read Chapter 21 (red flags). Sleep. Do not learn new topics. |
| Night before | Re-draw the SmartClass architecture and the WebRTC sequence diagram on paper, from memory, twice. |
| Night before | Write your three numbers on a card: 185 PRs, 50 workers, 25+ packages. Know the story behind each. |
| 2 hours before | Skim Chapter 22 (rapid fire) only. Nothing new. |
| 1 hour before | Eat. Hydration matters more than you think for a 60-minute talking session. |
| 30 min before | Test the setup (below). Open your GitHub in one tab and the SmartClass repo in another. |
| 10 min before | Stop reading. Walk. Slow your breathing. |

### The technical setup (remote interviews)

This is worth real points because a broken setup eats 6 minutes of a 45-minute round and puts you on the back foot.

- [ ] Wired ethernet if possible; if not, sit near the router and kill other devices.
- [ ] Test camera, mic and *screen share* in the actual platform they're using, not a different one.
- [ ] Headphones with a mic. Laptop speakers + laptop mic = echo, which makes the interviewer repeat themselves, which costs time and patience.
- [ ] Close Slack, WhatsApp Web, email. Notification sounds during an interview read as unprofessional.
- [ ] Plain background, light in front of you not behind you.
- [ ] A physical notebook and pen on the desk. Using paper to think is a positive signal, and it stops you from tabbing away.
- [ ] Have a backup: phone number exchanged, or a phone ready to dial in if video dies.
- [ ] Know your platform's shortcuts. If it's CoderPad/HackerRank, open it once beforehand and type in it.

### What to have open (and what not to)

**Open:** the coding environment, one tab with your GitHub profile, one tab with the SmartClass repo. That's it.

**Not open:** this guide. Reading from a document while answering is detectable — the eye movement, the sudden fluency shift, the pauses in the wrong places. It will cost you more than the answer gains you.

---

## 2.2 The self-introduction — three versions

They will open with "tell me about yourself" roughly 85% of the time. This is the most predictable question in the entire process and the one most candidates handle worst, because they treat it as small talk instead of as the moment they set the agenda.

**The strategic goal:** end your introduction pointing at the thing you most want to be asked about. Interviewers follow the thread you hand them.

### Version A — 30 seconds (use when they say "briefly")

> "I'm Aditya, final-year CSE at SGGS Nanded. Most of my work is backend and distributed systems — I've got around 185 merged PRs across three CNCF projects, mainly Go work on Kubescape and Fluid, and I've built two systems end to end: a distributed job scheduler in Go on Postgres and Redis, and a MERN learning platform with WebRTC live classes and an LLM-backed assistant. The scheduler's the one I'd most like to talk about — exactly-once job claiming was the interesting part."

Count it: that's 28 seconds spoken at a normal pace. Time yourself.

### Version B — 60 seconds (the default)

> "I'm Aditya Raut, final year Computer Science at SGGS Institute of Engineering and Technology, Nanded.
>
> The thread through most of my work is backend and systems. The largest chunk is open source — around 185 merged pull requests across three CNCF projects. In Kubescape, which is a Kubernetes security scanner, that meant patching a path traversal in handler resolution and cleaning up race conditions in shared cluster state. In Fluid I migrated test suites across 25-odd packages to Ginkgo and Gomega and took the mountinfo package to full coverage. Both are Go codebases, so that's where I'm most comfortable.
>
> Alongside that I've built two things end to end. A distributed job scheduler in Go — multi-tenant, handles immediate, delayed, cron and batch jobs, and the part I found most interesting was getting exactly-once claiming across fifty workers using Postgres `SKIP LOCKED`. And SmartClass, a learning management platform in the MERN stack with real-time live classes over WebRTC and an AI layer built on Claude's tool-use API.
>
> I'm looking for backend or platform work where I can keep going deeper on distributed systems. Happy to start wherever's most useful to you."

That's ~60 seconds. Note the structure: **identity → the strongest evidence → the two systems → what you want → hand control back.**

### Version C — 2 minutes (when they say "walk me through your background")

Version B, plus: one sentence on *why* you got into open source, one concrete story hook you want them to bite on ("the hardest one was a race in the policy handler singleton that only reproduced under `-race` in CI"), and one sentence on what you're currently learning.

### What NOT to do in the introduction

| Anti-pattern | Why it hurts |
|---|---|
| Starting from 10th standard marks | Signals you don't know what's relevant. |
| Listing every technology you've touched | Sounds like a skills section read aloud. Nobody retains it. |
| "I'm a passionate developer who loves to learn" | Zero information. Every candidate says it. |
| Going 4+ minutes | The interviewer stops listening around 90 seconds and starts planning their next question. |
| Ending with "...yeah, that's it" trailing off | Ends on low energy. End on a question or a pointer instead. |
| Mentioning something you can't defend | You have just chosen the topic of the next 15 minutes. Never name-drop in the intro what you can't go deep on. |

### The single highest-leverage sentence

End with a **pointer**: *"The scheduler's the one I'd most like to dig into"* or *"happy to start wherever's useful."* The first one steers them to your strongest ground. The second is politer and works when you don't know the interviewer's focus. Use the first with campus/startup interviewers, the second with structured big-company loops where they have a fixed script.

---

## 2.3 The first technical question — how to receive it

Whatever it is, do these four things before you start answering:

**1. Repeat it back in one compressed sentence.**
*"So — design a rate limiter that works across multiple API servers, right?"*
This catches misunderstandings while they cost nothing, and it buys you four seconds of thinking time that look like diligence rather than hesitation.

**2. Ask one clarifying question. Exactly one, at the start.**
Not five (looks like stalling), not zero (looks like you assume). For a coding problem: input size, or whether the input is sorted, or what to do on invalid input. For a design problem: scale, or read/write ratio. For a project question: *"Do you want the architecture first or the specific mechanism?"*

**3. State your plan before executing it.**
*"I'll start with the brute force so we have a correct baseline, then optimise the lookup with a hash map."*
This is the biggest differentiator in coding rounds. An interviewer who knows where you're going can course-correct you at minute 3 instead of watching you fail at minute 20.

**4. Then go — and narrate.**

---

## 2.4 Thinking out loud, correctly

"Think out loud" is standard advice and most people do it badly. There is a difference between narration and noise.

**Noise:** *"Okay so... hmm... let me think... so if we have... no wait... hmm..."*

**Narration:** *"Two options here. A hash map gives me O(1) lookup but O(n) extra space. Sorting first gives me O(1) space with two pointers but costs O(n log n) and destroys the input order. The problem says nothing about preserving order, so I'll take the sort. Let me code that."*

The rule: **narrate decisions, not confusion.** When you're genuinely stuck and have nothing to narrate, say so explicitly and buy time honestly: *"Give me twenty seconds to think through the edge case here."* That is completely acceptable and far better than filling the silence with "hmm".

### Handling a blank

When your mind goes empty — and it will, once per interview season at least:

1. **Say it.** *"I've gone blank on this for a second."* Humanising it releases the pressure that's causing it.
2. **Go to first principles out loud.** *"Let me build up from the simplest case — what if there were only one worker?"*
3. **Ask for a nudge if 60 seconds pass.** *"Could you give me a hint on the direction?"* Asking for a hint costs you a little. Sitting in silence for four minutes costs you a lot.

---

## 2.5 The three sentences that buy the most credibility

**"I don't know — here's how I'd find out."**
Use this once, early, on purpose. Every candidate bluffs at some point; the ones who admit a gap get believed on everything else. Always attach the recovery: *"I haven't used Kafka in anger. I know the broad model — partitioned log, consumer groups, offsets — but I'd be guessing on rebalancing details. I'd start from the docs on consumer group protocols and build a toy producer/consumer before claiming to know it."*

**"That's a trade-off — here's the cost of what I chose."**
Volunteering the downside of your own decision is the fastest way to signal seniority. Juniors defend their choices; seniors price them.

**"Let me correct something I said earlier."**
If you realise mid-interview you said something wrong, fix it explicitly. It reads as rigour, not weakness. It also stops the interviewer writing down the wrong thing.

---

## 2.6 The STAR framework (and when to break it)

For any behavioural question:

- **S**ituation — one sentence of context. *"In Fluid, the runtime package tests were taking eight minutes and failing intermittently in CI."*
- **T**ask — what was specifically yours. *"I owned migrating that package's suite to Ginkgo."*
- **A**ction — what *you* did, in detail. This should be 60% of the answer. Use "I", not "we".
- **R**esult — what changed, with a number if you have one. *"Suite time dropped, the flakes went away because we replaced sleeps with `Eventually`, and the pattern got applied to the other 24 packages."*

**When to break it:** for technical deep-dives, STAR is too rigid. Use the 3-layer method from Chapter 00 instead. STAR is for "tell me about a time when"; 3-layer is for "how does X work".

### The "we" problem

Interviewers listen for pronouns. If every sentence is "we", they cannot tell what you did. Rule: **"we" for context, "I" for action.** *"We decided to migrate the suite; I took the runtime and webhook packages and wrote the shared fixture helpers the others used."*

---

## 2.7 Reading the interviewer

| Signal | What it means | What to do |
|---|---|---|
| They interrupt your answer | You're too long, or they got what they needed | Stop immediately. Don't finish the sentence. |
| "Okay, and...?" | Your answer was Layer 1 only | Go to Layer 2 — the mechanism |
| They ask the same thing rephrased | You didn't answer what they asked | Say *"Let me re-read the question — are you asking about X or Y?"* |
| They go quiet and let you talk | Either you're doing well, or they've disengaged | Check in: *"Is this the level of detail you want?"* |
| They start typing a lot | They're taking notes on something you said | Usually good. Keep going. |
| They jump to a totally different area | They're done evaluating this one | Don't try to return to it. Move with them. |
| "That's interesting, why did you do it that way?" | Genuine curiosity OR they think it's wrong | Give the reasoning, then explicitly invite critique: *"Is there a problem with that I'm not seeing?"* |

That last move — inviting critique — is underused and very strong. It turns a potential "candidate was defensive" note into "candidate is coachable".

---

## 2.8 Round-by-round opening strategy

### Online Assessment / DSA round
No introduction. Read *all* questions before starting any. Budget time explicitly (e.g. 90 min / 3 questions = 25 min each + 15 buffer). Do the one you're most confident on first to bank a full solve. A complete brute-force beats a half-written optimal solution — partial credit usually means passing test cases, not elegant intent.

### Technical round 1 (usually projects + fundamentals)
Version B intro, ending with a pointer to the scheduler or SmartClass. Have the architecture diagram ready to screen-share or draw.

### Technical round 2 (usually deeper / system design)
Shorter intro if the same company — *"I think you've got my background from the first round, so let's go straight in."* This reads as confident and respectful of time.

### Hiring manager round
They care about impact, ownership, and whether you're annoying to work with. Lead with outcomes, not mechanisms. This is where the "185 PRs, and here's what I learned about working with maintainers" story lands best.

### HR round
Do not go technical. They're screening for red flags, compensation alignment, and joining timeline. Chapter 18.

---

## 2.9 Questions to ask them (you must have these)

"Do you have any questions for us?" is not a formality. Having none reads as disinterest. Having good ones is a real positive signal.

**Strong questions (pick 2–3, match to the interviewer's level):**

*To an engineer:*
- "What does the code review culture look like — how long does a PR usually sit?"
- "What's the thing about the codebase that would surprise a new joiner?"
- "How much of your week is feature work versus operational load?"
- "What's on-call like?"

*To a hiring manager:*
- "What does someone doing well in this role look like at six months?"
- "What's the biggest technical problem the team is facing right now?"
- "How do decisions about architecture get made here?"

*To anyone:*
- "What made you stay?" — genuinely revealing, and people enjoy answering it.

**Weak questions (avoid):**
- "What does the company do?" (You should know.)
- "What's the salary?" (Not in a technical round. HR round only.)
- "Do you provide training?" (Sounds like you need it.)
- Anything answered on the careers page.

---

## 2.10 Closing the interview

When they say "that's all from my side":

1. **Ask your questions** (2.9).
2. **Close a loop if one is open.** If there was a question you fumbled and you've since figured it out, say so: *"Earlier I couldn't remember why we use jitter in backoff — it's to prevent synchronised retries creating a thundering herd on the recovering service. It came back to me."* Interviewers remember this. It converts a miss into a positive note about persistence.
3. **Ask about next steps and timeline.** One sentence. *"What are the next steps, and roughly when should I expect to hear?"*
4. **Thank them specifically**, not generically. *"Thanks — the question about heartbeat split-brain was a good one, I hadn't thought about the fencing angle that way."*

Do not ask "how did I do?" It puts them in an awkward position and they'll give you a non-answer.

---

## 2.11 The 60-second pre-interview mantra

Read this immediately before joining the call:

> I have 185 merged PRs in CNCF projects. I have fixed race conditions in production Kubernetes tooling. I have built a job scheduler that handles exactly-once claiming across fifty workers. I have shipped a real-time video platform. I know what I don't know, and I will say so plainly when it comes up. My job in the next hour is not to be flawless — it is to be clear, honest, and to show how I think. If I get something wrong, I will say so and move on.

---

## 2.12 Common opening mistakes, ranked by cost

| Mistake | Cost | Fix |
|---|---|---|
| Claiming something in the intro you can't defend | **Severe** | Only name-drop what you can go 3 layers deep on |
| 4-minute introduction | High | Time yourself. 60 seconds. |
| No clarifying question on a coding problem | High | Always ask exactly one |
| Starting to code before stating the approach | High | Plan out loud first, always |
| Saying "we" for everything | Medium | "We" for context, "I" for action |
| Broken audio/screen share | Medium | Test in the actual platform beforehand |
| No questions at the end | Medium | Prepare three |
| Apologising repeatedly | Medium | Correct once, move on |
| Arguing when corrected | High | *"You're right — let me redo that."* |

---

*Next: [Chapter 03 — System architecture diagrams](03-SYSTEM-ARCHITECTURE-DIAGRAMS.md)*
