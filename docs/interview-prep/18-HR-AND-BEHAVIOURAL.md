# Chapter 18 — HR and Behavioural (120 questions with scripted answers)

> Behavioural rounds are not a formality. They are where offers get withdrawn from technically strong candidates who came across as inflexible, dishonest, or impossible to work with. They are also the easiest round to prepare, because the questions are almost entirely predictable.

---

## 18.1 Build your story bank first

You need **eight stories**. Every behavioural question maps onto one of them. Write each one out once, in STAR form, and practise it out loud until it takes 90 seconds.

| # | Story | Source material | Covers |
|---|---|---|---|
| 1 | **The hardest bug** | The Kubescape race in global cluster state | Debugging, persistence, technical depth |
| 2 | **The security find** | The path traversal in Kubescape handler resolution | Initiative, security thinking, responsible disclosure |
| 3 | **The mistake I owned** | The IDOR in SmartClass authorisation | Honesty, root-cause analysis, learning |
| 4 | **The disagreement** | A maintainer wanting a minimal fix over your refactor | Receiving feedback, ego management |
| 5 | **The large piece of work** | The 25-package Ginkgo migration in Fluid | Scale, consistency, planning |
| 6 | **Leading others** | Pragyaa web lead | Delegation, review, accountability |
| 7 | **The scoping decision** | Shipping `meetLink` classes before the WebRTC path | Product judgement, pragmatism |
| 8 | **Failure / loss** | A hackathon you didn't win, and why | Reflection, resilience |

**Rule for every story: "we" for context, "I" for action.** Interviewers listen for pronouns specifically to work out what you personally did.

---

## 18.2 The core questions (Q1–30)

**Q1. Tell me about yourself.**
Chapter 02 §2.2. Sixty seconds, ending with a pointer.

**Q2. Why do you want to work here?**
**RISK: the generic answer is a real negative.** Do 20 minutes of research per company. Structure: something specific about what they build → how it connects to what you've done → what you'd want to learn there.

*"You're running [specific system] at a scale where [specific problem] is real. The closest I've come is the job scheduler — coordinating fifty workers on one Postgres table with `SKIP LOCKED` — and the thing I wanted next was to see how those problems change when the coordination is across machines rather than within one database. That's the gap I'd want to close here."*

Never: "great company culture", "I've heard good things", "I want to learn and grow".

**Q3. Why should we hire you?**
Three specific things, not adjectives.
*"Three reasons. I've shipped production fixes into Kubernetes tooling used by real clusters — race conditions and a path traversal in Kubescape — so I can work in a codebase I didn't write. I've built systems where correctness under concurrency was the actual problem, not an afterthought. And I find my own bugs — I can tell you the most serious flaw in my own project before you find it, which is the habit I'd bring to your code."*

**Q4. What's your greatest strength?**
Pick one, give evidence.
*"Reading unfamiliar code fast. It's the thing 185 PRs across three projects I didn't write actually trained. Most of contributing to a large codebase is building enough context to be confident a change is correct rather than just locally plausible, and I've done that repeatedly under review from people who don't have time to explain things."*

**Q5. What's your greatest weakness?**
**RISK.** "Perfectionist" and "I work too hard" are heard as evasion and score negatively.

*"I over-invest in the interesting part of a problem. On SmartClass I spent weeks on WebRTC renegotiation — genuinely hard, and the part I enjoyed — while the authorisation layer had a serious flaw sitting in it that I'd have found in an hour if I'd audited it. What I do about it now is force a boring pass: before I call something done, I go through the unglamorous parts — authorisation, input validation, error paths — deliberately, as a checklist, not by feel."*

Why this works: it's a real weakness, it cost something concrete, the fix is specific and behavioural, and it seamlessly sets up your best technical story.

**Q6. Where do you see yourself in five years?**
*"Deep rather than broad. I'd want to be the person a team trusts with the distributed-systems problems — the ones where correctness under failure is the whole difficulty. Probably still writing code, probably mentoring, and I'd like to still be contributing to open source because that's how I learn fastest."*

Don't say "managing a team" unless you mean it; don't say "running my own startup" in an interview for a job.

**Q7. Why did you choose computer science?**
Have a genuine answer. Specific beats grand. Avoid "I've loved computers since childhood" unless it's true and you can make it concrete.

**Q8. Tell me about a time you failed.**
Story 3 or 8. **The structure that works:** what happened → what you specifically did wrong → the cost → what you changed. Spend most of the time on the last part.

*"I shipped SmartClass thinking it was reasonably secure, and later found that every ownership check in the API compared a database value against an ID from the request body. Any authenticated student could act as any teacher. The cost was that a project I'd been showing to people had a critical vulnerability in it for months. What I got wrong wasn't the code — it was that my tests only ever covered the happy path, so nothing could have caught it. Now I write the negative test first for anything involving permissions: 'wrong user attempts this, expects 403'. That's a structural change, not a resolution to be more careful."*

**Q9. Tell me about a conflict with a teammate.**
Story 4. Keep it professional, never personal. Show that you changed your mind or genuinely understood the other position.

*"On a Kubescape PR I'd written a broader refactor along with the fix. The maintainer wanted only the fix. My first reaction was that the surrounding code had the same problem and we should solve it once. I made that argument in the thread, they explained that a smaller diff is easier to review and easier to revert if it's wrong, and that the refactor should be its own PR with its own discussion. They were right. I split it, the fix merged that day, and the refactor got a proper conversation instead of riding along unreviewed."*

**Q10. Tell me about a time you received difficult feedback.**
Similar shape. The key beat: you acted on it.

**Q11. Tell me about a time you disagreed with your manager.**
If you haven't had a manager, use a maintainer or a team lead and say so. Structure: made the case with evidence → they decided → you committed fully to their decision → what the outcome was.

**Q12. Describe a time you had to learn something quickly.**
WebRTC is your best answer. *"I knew nothing about it. I went from `getUserMedia` to per-viewer peer connections with mid-call renegotiation in about three weeks, mostly by reading the spec's offer/answer model rather than tutorials — tutorials give you a working 1:1 demo and then abandon you the moment you need a second peer."*

**Q13. Tell me about a time you went above what was asked.**
Story 2. Nobody asked you to look for a path traversal.

**Q14. How do you prioritise when everything is urgent?**
*"By blast radius and reversibility. Something that's currently causing damage beats something that might; something irreversible beats something I can undo. On SmartClass's fix list, authorisation came before performance, because one is a breach and the other is a degradation."*

**Q15. How do you handle pressure?**
Use a hackathon story. Concrete beats reassuring.

**Q16. Describe your ideal work environment.**
*"Code review that's substantive rather than rubber-stamping, and people who'll tell me when I'm wrong. The most useful feedback I've had came from maintainers who had no reason to be polite about a bad approach."*

**Q17. How do you like to be managed?**
*"Clear on the what and the why, loose on the how, and direct with feedback. I'd rather hear a problem early and bluntly than discover it in a review cycle."*

**Q18. Are you a team player or do you work better alone?**
Refuse the false choice. *"Both — they're different modes. Deep debugging I do alone; I need uninterrupted time. Design decisions I want to argue about with someone, because I've been wrong often enough to know I don't catch my own blind spots."*

**Q19. How do you handle a teammate not pulling their weight?**
Escalation ladder: ask privately whether something's blocking them → offer to help or redistribute → if it continues, raise it with the lead with specifics rather than complaints.

**Q20. Tell me about a time you helped someone.**
Documentation for KubeStellar, mentoring on the Pragyaa team, or answering a first-time contributor's question. Small and specific beats grand.

**Q21. What motivates you?**
Be honest and specific. *"Problems where I don't immediately know the shape of the answer. The `SKIP LOCKED` thing was fun because 'fifty workers, no duplicates' sounds impossible until you find the primitive."*

**Q22. What demotivates you?**
*"Work where nobody can tell me why it matters. I'll do unglamorous work happily if I understand what breaks without it."*

**Q23. How do you keep learning?**
Be concrete: which sources, which recent thing you learned. *"Mostly by reading source. Recently I read through how mediasoup structures routers and transports, because I wanted to know what migrating my mesh implementation would actually involve rather than guess."* Vague answers ("blogs and YouTube") signal nothing.

**Q24. What did you learn most recently?**
Have an answer ready. It should be within the last month.

**Q25. What do you do outside of work?**
Answer like a person. This is rapport, not evaluation.

**Q26. What's your biggest achievement?**
Pick one and justify the choice. *"185 merged PRs is the number, but the achievement I'd name is the path traversal fix — because nobody asked for it, it was in code used by real clusters, and it's the first time my work meaningfully protected someone I'll never meet."*

**Q27. Tell me about a project you're proud of.**
The job scheduler. Lead with the hard problem, not the feature list.

**Q28. What would your friends say about you?**
Keep it light and honest.

**Q29. What would a past teammate say is difficult about working with you?**
**Harder version of the weakness question.** *"That I go quiet when I'm deep in something. I'm not being unresponsive, but if you need an answer you'd have to actually interrupt me. I've started flagging it — 'I'm heads-down until 4, ping me if it's urgent' — so people know the rules."*

**Q30. Do you have any questions for us?**
Chapter 02 §2.9. Always yes.

---

## 18.3 Questions specific to your profile (Q31–60)

**Q31. Your CGPA is 7.6. Explain.**
Chapter 01 Q3. Own it, name the trade, don't dismiss marks.

**Q32. Why is your CGPA lower than your project work suggests?**
Same answer, more directly. *"Because I chose where to spend my time and it had a cost. I'd make the same choice."*

**Q33. Would you have done anything differently academically?**
*"I'd have protected a floor. I don't regret the allocation, but letting it drift below 7.5 closed doors I didn't need to close."* That's mature without being apologetic.

**Q34. You do a lot of open source — will you actually focus on our work?**
*"Yes. Open source was how I got access to serious codebases as a student; if I'm working on serious codebases all day, that need is met. I'd want to keep contributing on my own time, and I'd want to know your policy on it early."*

**Q35. Why not do a master's?**
Have a real position either way. *"I learn fastest by building and being reviewed, and I've got a clearer picture of what I don't know from open source than I would from more coursework. I'd reconsider later if I found myself hitting a theory ceiling."*

**Q36. You've worked alone on both projects. How do you know you can work in a team?**
*"Open source is the answer. 185 PRs means 185 times my work was reviewed by someone who didn't have to be nice about it, in codebases with conventions I didn't set. That's closer to working on your team than a group project would be."*

**Q37. Your projects are all backend. Can you do frontend?**
*"SmartClass's frontend is mine — React 19, about 90 components, a 2,000-line WebRTC room. I can do it and I'm competent at it. I'd rather be judged on backend because that's where I'm strongest, but I'm not one-sided."*

**Q38. Kubernetes is on your resume. Have you actually operated a cluster?**
**Be precise about the distinction.** *"I've contributed to tooling that runs in clusters and I've run clusters locally for development and testing — kind and minikube. I haven't been on-call for a production cluster, and I'd rather say that than let you assume otherwise."*

**Q39. What's the difference between contributing to open source and working on a product?**
*"Accountability for outcomes. In open source I own a change; on a product you own the thing continuing to work, including at 3am. I've never had that, and it's the part of the job I most want to experience."*

**Q40. You list a lot of technologies. Which do you actually know?**
Volunteer the ranking honestly (Chapter 01 Q32).

**Q41. Talk me through a technical decision you now think was wrong.**
*"Choosing MongoDB for SmartClass. The quiz-with-embedded-questions case is genuinely document-shaped, but enrolments, submissions and grades are relational, and I ended up hand-writing joins with `populate` and re-implementing referential integrity in application code. Postgres with `jsonb` would have given me both."*

**Q42. What's the most complex system you've worked on?**
Kubescape or Fluid — real codebases with many contributors, not your own projects. Be clear you worked on *parts* of them.

**Q43. How do you approach a codebase you've never seen?**
*"Tests first — they're the fastest map of what the maintainers care about. Then the entry points, then one vertical slice end to end. I try to make a tiny change and get it merged early, because the contribution process teaches you as much as the code does."*

**Q44. Have you ever broken production?**
If not, say so honestly and say what you'd do. *"No — nothing I've written has been in production with real users. That's a gap in my experience and it's one of the things I'd want from this role."* Inventing an outage story is easily detected.

**Q45. What's your testing philosophy?**
Chapter 10 Q109. Have a view, including on coverage.

**Q46. How do you handle code review as the author?**
*"Assume the reviewer is right until I can explain why they aren't. And make the PR reviewable — small, with a description that explains the why, so nobody has to reconstruct my reasoning from the diff."*

**Q47. How do you review others' code?**
Chapter 16 Q199.

**Q48. How do you know when something is done?**
*"When it handles the failure cases, not just the success case, and when someone else could change it without asking me. By that standard a lot of what I've shipped wasn't done."*

**Q49. What's your debugging process?**
*"Reproduce first, always — a bug I can't reproduce I can't verify I've fixed. Then bisect: narrow where the behaviour diverges from what I expect. I try hard to form a hypothesis before changing anything, because changing things randomly until it works means I don't know what fixed it."*

**Q50. Tell me about a bug that took you a long time.**
Story 1, with the full narrative.

**Q51. How do you stay current?**
Chapter 18 Q23.

**Q52. What technology are you most excited about?**
Have an opinion with a reason. *"WebTransport, honestly — because it makes the WebRTC-or-WebSocket choice less binary. Having per-stream reliability and datagrams over one HTTP/3 connection would have simplified my live-class architecture significantly."*

**Q53. What technology is overhyped?**
Also have an opinion, stated without contempt. *"Agentic AI in production. Building a real one taught me that a model choosing its own control flow is the expensive, unpredictable option, and most of what gets called an agent should be a workflow with an LLM at two steps."*

**Q54. Do you prefer startups or large companies?**
Have a reason tied to what you want, not to stereotypes.

**Q55. What's more important, speed or quality?**
Refuse the binary. *"It depends on reversibility. A UI change I can revert in five minutes — ship it fast. An authorisation model or a data schema — those are expensive to change later, so they're worth slowing down for. I got that wrong on SmartClass in exactly the way you'd expect."*

**Q56. How do you handle ambiguous requirements?**
*"Make the assumption explicit and keep going. Blocking on a question is only right when proceeding either way would waste the work; otherwise I state what I assumed and flag it, so it's easy to correct."*

**Q57. What if you're asked to do something you disagree with?**
*"Make the argument once with evidence, then commit. Disagree-and-commit is a real skill — I've had to do it in PR reviews and the outcome was better than my version."*

**Q58. What if you're asked to do something you think is unethical?**
Don't be glib. *"Raise it, clearly and specifically, with whoever can change it. If it can't be changed and it's serious, I'd have to decide whether I can keep working on it. I'd rather have that conversation than quietly ship it."*

**Q59. How do you handle not knowing something?**
*"Say so, then say how I'd find out. I do it deliberately once early in any technical conversation, because bluffing costs more than the gap does."*

**Q60. What's a skill you're actively building?**
Something real and current. *"Production operations. I've never been responsible for something staying up, and everything I know about it I know from reading rather than from being paged."*

---

## 18.4 Situational questions (Q61–90)

**Q61. You're behind on a deadline. What do you do?**
Raise it early with a specific revised estimate and options (cut scope, add help, move the date). The failure mode is going quiet and hoping.

**Q62. Your teammate's code is bad but they're senior. What do you do?**
Ask questions rather than issue verdicts. *"I'd ask why in the review — genuinely, because half the time there's a reason I don't know about. If there isn't, the question itself usually surfaces it without a confrontation."*

**Q63. You find a bug in production on your first week. What do you do?**
Tell someone immediately. Don't fix it silently — you don't yet know the deploy process, the blast radius or who's already aware.

**Q64. You disagree with the architecture you've been asked to implement.**
Write down the concern specifically — what breaks, when, at what scale — and put it to whoever owns the decision. Then implement it. A concern with a failure scenario attached gets taken seriously; a preference doesn't.

**Q65. You're asked to estimate work you've never done.**
Give a range with the uncertainty named, and propose a timeboxed spike to narrow it. *"Two to five days; give me half a day to prototype the risky part and I'll tighten that."*

**Q66. A production incident is happening and you don't know the system.**
Don't touch anything. Be useful in the ways you can be: take notes, keep the timeline, communicate status so the people fixing it don't have to.

**Q67. Your change caused an outage.**
Mitigate first (roll back), diagnose after. Then own it publicly, write it up blamelessly, and add the control that would have caught it.

**Q68. You're given a task with no clear owner or spec.**
Find the person who'll consume the result and ask them what "done" looks like. Then write it down and confirm.

**Q69. You have two tasks and time for one.**
Ask. It's a prioritisation decision, and it's not yours to make silently.

**Q70. You've been stuck for four hours.**
Ask for help at the two-hour mark, not the eighth. *"The rule I use is: if I haven't generated a new hypothesis in an hour, I'm not stuck on the problem, I'm stuck on my model of it, and someone else's model is the fastest fix."*

**Q71. A user reports something you can't reproduce.**
Get their exact environment, version, steps and timing. Check logs for their request. Never close it as "cannot reproduce" without exhausting that.

**Q72. You're asked to ship something you know is insecure.**
State the specific risk and its exploitability, propose the minimum fix and its cost, and let the decision be made with the information. Document it either way.

**Q73. Someone takes credit for your work.**
Assume it wasn't malicious first. Address it directly and privately. Escalate only if it's a pattern.

**Q74. You're the only one who understands a system.**
That's a problem to solve, not a position to protect. Document it, pair with someone, make yourself removable.

**Q75. You're asked to review a 2,000-line PR.**
Ask for it to be split. Reviewing it honestly isn't possible, and approving it dishonestly is worse.

**Q76. A junior asks you a question you don't know.**
Say so and find out together. Modelling "I don't know" is one of the more valuable things a senior person does.

**Q77. You realise mid-sprint the approach is wrong.**
Raise it immediately. Sunk cost is not a reason to continue.

**Q78. Your manager gives you feedback you disagree with.**
Ask for a specific example. Often the disagreement dissolves into a misunderstanding about a particular incident.

**Q79. You're offered a role you're not sure you're qualified for.**
*"I'd take it and say clearly what I'd need help with. The alternative is only ever doing work I've already done."*

**Q80. How would you onboard onto our codebase?**
*"Read the tests, get one small change merged in the first week to learn the process, and spend the first fortnight reading the authentication and authorisation paths, because that's where a misunderstanding does the most damage."*

**Q81–90. Rapid situational.**
- *Task you hate?* Do it, or automate it. Complaining about it is the only unacceptable option.
- *Boring work?* Some is unavoidable; if all of it is boring, that's a conversation to have.
- *Unclear feedback?* Ask for an example.
- *Conflicting instructions from two people?* Get them in the same conversation rather than picking one.
- *Someone is rude in review?* Respond to the content, ignore the tone, address the tone privately if it repeats.
- *You break the build?* Fix or revert immediately, then investigate. Never leave main broken while you debug.
- *Asked to work a weekend?* Once for a real emergency, fine. As a pattern, it's a planning problem worth naming.
- *You want to use a new technology?* Make the case in terms of the problem it solves and its maintenance cost, not its appeal.
- *Code you wrote a year ago is bad?* Good — it means you improved. Fix it when you're next in there.
- *Team doesn't follow best practices?* Improve one thing well rather than campaigning for all of them.

---

## 18.5 Logistics and negotiation (Q91–120)

**Q91. What are your salary expectations?**
**Deflect once, then give a range.** *"I'd rather understand the role better first — do you have a band for this position?"* If pressed: give a researched range, slightly wide, and say it's flexible for the right role. Research on Levels.fyi, Glassdoor and your college's placement data.

**Q92. What's your current/last salary?**
If you're a student, this is easy — you don't have one. Redirect to your expectations.

**Q93. Do you have other offers?**
Honesty with discretion. If yes, say so without naming numbers unless you're negotiating. If no, *"I'm in process with a few places"* is fine if true; don't invent offers.

**Q94. When can you join?**
Know your exact date.

**Q95. Are you willing to relocate?**
Have a real answer. Don't say yes to be agreeable if you mean no — it comes out later and worse.

**Q96. How do you feel about on-call?**
*"I've never done it and I'd want to understand the rotation and the alert volume. In principle, owning the thing you build including when it breaks seems right to me."*

**Q97. Remote, hybrid or office?**
Have a preference, state flexibility.

**Q98. Why are you leaving / why are you looking?**
As a student: you're graduating. Never criticise a past employer or college.

**Q99. What if we offer you a different role than you applied for?**
Ask what the work actually is. Titles vary enormously.

**Q100. Would you take a lower salary for a better learning opportunity?**
Careful. *"Learning matters more to me right now than optimising the first number, but I'd want it to be fair for the role."* Don't signal that you'll accept anything.

**Q101. What's most important to you in a job?**
*"The people I'd be reviewed by. The fastest I've ever improved was under maintainers who held a high bar."*

**Q102. How long do you plan to stay?**
*"Long enough to own something end to end and see the consequences of my decisions. That's years, not months."*

**Q103. What if you don't get this job?**
*"Keep building and keep contributing. I'd ask for feedback, because that's the part I can't get anywhere else."*

**Q104. Do you have any concerns about this role?**
Ask a real question rather than performing enthusiasm. It reads as serious.

**Q105–120. Quick answers.**
- *Weekend work?* Covered above.
- *Travel?* State your real tolerance.
- *Certifications?* Only if you have them; don't inflate.
- *Gap in your timeline?* Explain plainly.
- *Backlogs?* If you have any, be upfront — it will surface in verification.
- *Notice period?* Know it exactly.
- *References?* Have two ready, and ask them first.
- *Background check?* Consent readily; nothing to hide.
- *Bond/service agreement?* Read it. Ask about it.
- *Probation?* Normal; ask what the evaluation looks like.
- *Team assignment?* Ask how it's decided.
- *Tech stack you dislike?* Have a diplomatic version. Everything has trade-offs.
- *Something not on your resume?* Have one genuine thing.
- *Anything else we should know?* Use it to close a loop, not to ramble.
- *Questions for us?* Always. Three of them.

---

## 18.6 The three sentences to avoid

**"I'm a perfectionist."** Heard as evasion.

**"I don't have any weaknesses in that area."** Heard as either dishonesty or a lack of self-awareness. Everyone has gaps.

**"That's not really my job."** Ends the conversation badly and is remembered.

---

## 18.7 The closing note

The behavioural round is testing one thing under all the questions: **would it be good or bad to have you on the team when something goes wrong?**

Everything that scores — owning mistakes, saying "I don't know", volunteering the cost of your own decisions, changing your mind when someone makes a better argument — is evidence for the same underlying answer. Everything that loses — defensiveness, inflated claims, blaming others — is evidence against it.

You have unusually good material for this. You have a real security bug you found in your own code, real disagreements with real maintainers, and a real technical trade-off you now think you got wrong. Most candidates are inventing these. Use yours.

---

*Next: [Chapter 19 — Mock interview transcripts](19-MOCK-INTERVIEW-TRANSCRIPTS.md)*
