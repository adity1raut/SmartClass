# Chapter 08 — Authentication, Authorisation and Security (140 questions)

> Your codebase contains two authentication-level vulnerabilities and one systemic authorisation flaw. That sounds bad; handled correctly it is the strongest material you have, because *finding and explaining real vulnerabilities in your own code* is exactly what a security-conscious interviewer wants to see.

---

## Section A — The OWASP Top 10, applied to your code (Q1–25)

**Q1. Name the OWASP Top 10 (2021).**
A01 Broken Access Control · A02 Cryptographic Failures · A03 Injection · A04 Insecure Design · A05 Security Misconfiguration · A06 Vulnerable and Outdated Components · A07 Identification and Authentication Failures · A08 Software and Data Integrity Failures · A09 Security Logging and Monitoring Failures · A10 Server-Side Request Forgery.

**Q2. Which is #1 and why did it move there?**
Broken Access Control. It moved to #1 in 2021 because it's the most commonly found category in real applications — 94% of tested applications had some form of it. It's also the hardest to catch with automated tools, because "should this user be allowed to do this" is application-specific logic, not a pattern a scanner recognises.

**Q3. Does your application have A01?**
Yes, systemically. Controllers read the actor's identity (`teacherId`, `studentId`, `userId`) from the request body rather than from the verified JWT on `req.user`. Every ownership check therefore compares a database value against attacker-controlled input.

**Q4. Show me the exploit.**
```
# Alice is a student, authenticated normally.
PATCH /api/submissions/<bob_submission_id>/grade
Cookie: sc_token=<alice's valid token>
Content-Type: application/json

{ "score": 100, "feedback": "Great", "teacherId": "<the real teacher's id>" }
```
The middleware verifies Alice's token and sets `req.user`. The controller ignores `req.user`, reads `teacherId` from the body, compares it to `submission.assignment.createdBy`, they match, and the grade is written. Alice just graded Bob's work.

**Q5. Where do you get the teacher's ID from?**
It's not secret — course listings return `teacher: {id, name}`. `formatLiveClass` and `formatAssignment` expose IDs throughout. So the "secret" the check depends on is published by the API itself.

**Q6. What's the fix?**
```js
// Before
const { teacherId } = req.body;
if (submission.assignment.createdBy.toString() !== teacherId) return res.status(403)...

// After
if (submission.assignment.createdBy.toString() !== req.user.id) return res.status(403)...
```
Plus: remove the ID fields from every request body so they can't be reintroduced, add a `requireRole('teacher')` middleware, and write a negative test per protected route.

**Q7. Why didn't your tests catch it?**
Because every test is a happy path that supplies the *correct* ID. There is no test that says "a student attempts a teacher action and expects 403." **The gap in the tests and the gap in the code are the same gap**, and that's the real lesson.

**Q8. What class of bug is this?**
IDOR (Insecure Direct Object Reference) in the broader sense, and more precisely a **confused deputy**: the server has authority the client lacks, and it exercises that authority on the basis of the client's claim about who it is.

**Q9. What's the general principle you'd state to a junior?**
*"Identity comes from the credential, never from the payload. The request body is input to be validated, not a statement of fact about who is asking."*

**Q10. Does your app have A07 (Authentication Failures)?**
Yes, two:
- The Google OAuth `isAccessToken` branch accepts `email` and `googleId` from the request body with no verification — a complete authentication bypass.
- No rate limiting or attempt capping on OTP verification, making a 6-digit code brute-forceable within its 5-minute window.

**Q11. Rank those two.**
The OAuth bypass is worse: it requires no brute force, no timing, and no prior access. One request forges a session as any user whose email you know. The OTP issue requires volume and luck.

**Q12. Fix the OAuth one.**
Never trust client-supplied profile data. If you're given an access token, call Google's userinfo endpoint server-side with that token and use *Google's* response as the identity. If you're given an ID token, `verifyIdToken` with the correct audience, which the other branch already does correctly.

**Q13. Does your app have A02 (Cryptographic Failures)?**
Partly good, partly not. Good: bcrypt for passwords with a per-password salt, `crypto.randomInt` for the OTP, HTTPS in production, and no home-grown crypto. Not good: the OTP is stored in plaintext in the in-memory store, and `jwt.verify` is called without pinning the allowed algorithms.

**Q14. Does your app have A03 (Injection)?**
Not SQL injection — there's no SQL. NoSQL injection is a live risk though (Q26–30). And **prompt injection** is a genuine injection class that applies directly (Chapter 07 §C).

**Q15. A04 — Insecure Design. What's the design-level problem?**
Role self-assignment at registration: `role: role || 'student'` takes the role from the request body, so any user can register as a teacher. That's not an implementation bug, it's a missing design control — teacher accounts in an institution should be provisioned or approved.

**Q16. A05 — Security Misconfiguration. Examples in your stack?**
The hardcoded production origin alongside the env-configured one in the CORS allowlist; `maxHttpBufferSize: 1e7` raising the DoS surface; `/uploads` served statically with no access control; and no security headers (CSP, HSTS, X-Content-Type-Options) — Helmet isn't in your dependencies.

**Q17. What does Helmet actually do?**
Sets a group of security headers: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options`, `Referrer-Policy`, and removes `X-Powered-By`. One line of middleware for a meaningful baseline.

**Q18. Why does removing `X-Powered-By` matter?**
Marginal — it's fingerprinting reduction, not a control. Worth doing, not worth claiming as security.

**Q19. A06 — how do you manage vulnerable dependencies?**
`npm audit` and Dependabot. **Neither is in your CI.** That's a concrete, one-PR improvement worth naming.

**Q20. A09 — Logging and monitoring. What's your posture?**
`console.error` in catch blocks. No structured logs, no levels, no correlation IDs, no alerting, no audit trail of who graded what. If the IDOR above were exploited, you'd have no way to know.

**Q21. What would an audit log look like here?**
An append-only record of security-relevant events: authentication attempts, role changes, grade changes, enrolment approvals — with actor (from the verified token), target, timestamp and source IP. For an education system, grade changes specifically must be auditable.

**Q22. A10 — SSRF. Are you exposed?**
Consider anywhere the server fetches a URL supplied by a user. Materials can be links — if the server ever fetches them (for previewing or summarising), a user could supply `http://169.254.169.254/latest/meta-data/` (the cloud metadata endpoint) and exfiltrate credentials. **Check whether any code path fetches user-supplied URLs server-side.** If not, say so confidently; if yes, that's a finding.

**Q23. How do you defend against SSRF?**
Allowlist schemes and hosts, resolve the DNS name and reject private/link-local address ranges (and re-check after redirects to defeat DNS rebinding), disable redirects or validate each hop, and if possible route outbound fetches through a proxy with egress rules.

**Q24. What's A08 — Software and Data Integrity Failures?**
Trusting code or data from untrusted sources without verification: unsigned updates, CI/CD pipelines that run untrusted code, insecure deserialisation. Relevant to you: a GitHub Actions workflow triggered by `pull_request_target` with a checkout of the PR head would let a fork run code with your secrets. **Check your workflows use `pull_request`, not `pull_request_target`.** Yours use `pull_request` — good, and worth knowing why.

**Q25. Give me your overall security summary.**
Deliver it as a structured list (Chapter 05 Q195) — strengths first, then weaknesses ranked by exploitability. Organisation is the signal.

---

## Section B — NoSQL injection (Q26–40)

**Q26. What is NoSQL injection?**
Supplying a structured object where the application expected a scalar, so that MongoDB's query operators get injected into the query.

**Q27. Show me an attack against your login.**
```js
const user = await User.findOne({ email });        // email from req.body
```
If the client posts `{"email": {"$ne": null}, "password": "x"}`, `email` becomes an object and the query means "any user whose email is not null" — returning the first user in the collection. Then `comparePassword` runs against that user's hash and fails, so this particular endpoint survives. But a query written as `findOne({ email, password })` would be fully bypassed by `{"password": {"$ne": null}}`.

**Q28. So are you vulnerable?**
Analyse honestly rather than asserting: the login flow compares the password with bcrypt separately, so it resists the classic bypass. But any endpoint that puts unvalidated body values into a query filter is exposed — and with `express.json()` a client can send objects anywhere a string is expected.

**Q29. What about `$where`?**
`$where` executes JavaScript server-side and is the most dangerous operator — it enables arbitrary code execution in the query context. It's disabled by default in modern MongoDB and should never be enabled.

**Q30. What about `$regex`?**
An injected regex is a ReDoS vector — a catastrophic-backtracking pattern like `(a+)+$` against a long string will pin a CPU core. Also, `$regex` on an unindexed field is a full scan.

**Q31. How do you prevent NoSQL injection?**
1. **Validate types at the boundary** — Zod/Joi/express-validator, so `email` must be a string matching an email pattern before it reaches any query.
2. **`express-mongo-sanitize`** to strip keys starting with `$` or containing `.`.
3. **Mongoose schema casting** helps — a `String`-typed path will reject an object on many operations — but don't rely on it as the only control.
4. Never interpolate user input into `$where` or `$regex` without escaping.

**Q32. Does Mongoose protect you automatically?**
Partially and unreliably. Schema casting applies to some operations and not others, and query filters aren't cast the way document fields are. Treating Mongoose as an injection defence is a mistake.

**Q33. Do you validate input anywhere?**
There's `app/utils/validators.js` — know what's actually in it. If it's used inconsistently, say so. Controllers mostly do manual `if (!title || !teacherId)` presence checks, which is presence validation, not type validation.

**Q34. What would you use instead?**
A schema validation library applied as middleware per route, so the controller receives a typed, validated object and every rejection is a consistent 400. Zod is the common modern choice because the schema also documents the contract.

**Q35. Show me what that looks like.**
```js
const submitSchema = z.object({ content: z.string().max(50_000).optional(),
                                fileUrl: z.string().url().optional() });
const validate = (schema) => (req, res, next) => {
  const r = schema.safeParse(req.body);
  if (!r.success) return res.status(400).json({ error: "Invalid input", details: r.error.issues });
  req.body = r.data;  // note: studentId is GONE — identity comes from req.user
  next();
};
router.post("/:id/submit", requireAuth, validate(submitSchema), submitAssignment);
```
Notice this single change fixes both the validation gap *and* the IDOR, because the validated body physically cannot contain `studentId`. **Pointing that out — that the right abstraction fixes two classes of bug at once — is a strong architectural argument.**

**Q36. What's mass assignment?**
Passing a whole request body into a model create/update, so a client can set fields you never intended — `isVerified: true`, `role: 'teacher'`, `score: 100`. The defence is an explicit allowlist of fields, which your controllers mostly do by destructuring named fields. Point that out as something you got right.

**Q37. Is `findOneAndUpdate(filter, req.body)` safe?**
No — that's mass assignment directly. Always build the update object explicitly.

**Q38. What's a ReDoS and how would one reach your app?**
Regular expression denial of service through catastrophic backtracking. Vectors: user-supplied search terms compiled into a regex, or your own regexes applied to long user input. Defences: avoid nested quantifiers, cap input length, use a linear-time engine (RE2), or precompile fixed patterns.

**Q39. Is there a regex in your codebase processing untrusted input?**
The OTP extraction regex in `tests/setup.js` processes your own generated HTML, so no. Worth checking any validators.

**Q40. What's the single highest-value input-validation change?**
A validation middleware applied to every mutating route, because it simultaneously addresses type confusion, mass assignment, oversized payloads and — by removing identity fields — the authorisation flaw.

---

## Section C — XSS, CSRF and browser security (Q41–70)

**Q41. What is XSS?**
Injecting script that executes in another user's browser in the context of your origin, giving the attacker the ability to act as that user.

**Q42. The three types?**
**Stored** — the payload is persisted (a comment, a course description) and served to every viewer. **Reflected** — the payload is in the request and echoed in the response. **DOM-based** — the payload never reaches the server; client-side JS writes untrusted data into a dangerous sink.

**Q43. Where is your app exposed?**
Anywhere user text is rendered: course titles and descriptions, assignment text, chat messages, class comments and questions, user names, and — critically — AI output rendered as markdown.

**Q44. Does React protect you?**
By default yes — JSX escapes interpolated values. The escapes are `dangerouslySetInnerHTML`, `href={userValue}` (which allows `javascript:` URLs), and any third-party renderer that emits raw HTML.

**Q45. You use `react-markdown` — is that safe?**
`react-markdown` does not render raw HTML by default, which is the safe configuration. It becomes unsafe if `rehype-raw` is added. **You have `remark-gfm` (safe — it's a syntax extension) and not `rehype-raw`, so you're fine. Knowing exactly which plugin would break it is the detailed answer.**

**Q46. What's the risk with AI-generated markdown specifically?**
A prompt injection could make the model emit a markdown link with a `javascript:` URL or an image with an `onerror`. Markdown link URLs are a real sink — sanitising the URL scheme is the defence, and `react-markdown` does filter dangerous protocols by default.

**Q47. What's CSP and what would yours look like?**
Content Security Policy — a response header restricting where scripts, styles, images and connections may come from. A reasonable starting policy: `default-src 'self'; script-src 'self'; connect-src 'self' https://your-api https://api.anthropic.com wss://your-api; img-src 'self' https://res.cloudinary.com data:; style-src 'self' 'unsafe-inline'`. The `unsafe-inline` for styles is the usual pragmatic compromise with Tailwind and inline styles.

**Q48. Why is `unsafe-inline` for scripts so bad?**
It defeats CSP's main purpose — an injected inline `<script>` would execute. Nonces or hashes are the correct way to allow specific inline scripts.

**Q49. If XSS happened, could the attacker steal the session?**
Not directly — the token is `httpOnly`, so `document.cookie` can't read it. But XSS still lets the attacker *make requests as the user* from their browser, which is nearly as bad. `httpOnly` limits exfiltration, not abuse.

**Q50. So what does `httpOnly` actually buy you?**
It prevents the token being sent to an attacker's server for offline, persistent use. The attacker's access is limited to the duration of the XSS on that page. That's a meaningful reduction, not a solution.

**Q51. What is CSRF?**
Cross-Site Request Forgery — a third-party site causes the victim's browser to make an authenticated state-changing request to your API, exploiting the fact that browsers attach cookies automatically.

**Q52. Are you vulnerable?**
Yes, in production. `sameSite: 'none'` is required because the SPA and API are on different origins, and `none` means the cookie is sent on cross-site requests. There's no CSRF token, no double-submit cookie, and no Origin/Referer check.

**Q53. Why does `sameSite: 'lax'` prevent most CSRF?**
`lax` sends the cookie on top-level navigations (so links still work) but not on cross-site subresource requests or cross-site POSTs. Most CSRF attacks are cross-site POSTs, so `lax` blocks them. Your dev environment is same-origin so `lax` works there; production isn't.

**Q54. Fix it — what are the options?**
1. **Same origin**: serve the API and SPA from the same origin (a path prefix or a reverse proxy), then `sameSite: 'strict'` or `lax` and CSRF is largely moot. **This is the cleanest fix and would be my recommendation.**
2. **CSRF token**: server issues a token, client sends it in a header; because a cross-site attacker can't read your response bodies, they can't obtain it.
3. **Double-submit cookie**: a non-httpOnly cookie plus a matching header; simpler, no server state, weaker against subdomain attacks.
4. **Origin/Referer checking**: reject state-changing requests whose `Origin` isn't allowlisted. Cheap, effective, and a good defence-in-depth layer.

**Q55. Why do CSRF tokens work?**
Because of the same-origin policy: an attacker's page can cause a request to be *sent* with cookies, but cannot *read* your responses, so it cannot learn the token.

**Q56. Would using `Authorization: Bearer` instead of cookies fix CSRF?**
Yes — CSRF depends on the browser attaching credentials automatically, and a header set by JavaScript isn't automatic. But then the token must live somewhere JS can read, which reopens XSS exfiltration. **That's the classic trade: cookies are XSS-safer, headers are CSRF-safer. The usual resolution is httpOnly cookies + CSRF defence, which is what you should do.**

**Q57. What is clickjacking and how do you prevent it?**
Framing your site invisibly over an attacker's page so the user's clicks land on your UI. Prevent with `X-Frame-Options: DENY` or CSP `frame-ancestors 'none'`.

**Q58. What's the same-origin policy?**
The browser rule that script from one origin (scheme + host + port) cannot read data from another. CORS is a controlled relaxation of it.

**Q59. Is CORS a security control for your server?**
No — and this is a very commonly misunderstood point. CORS is enforced by the *browser* to protect the *user*. `curl`, Postman and any server-side client ignore it entirely. Your API must be secure independent of CORS.

**Q60. Then why configure CORS at all?**
To allow your legitimate frontend to read responses, and to prevent other *websites* from reading responses on behalf of a logged-in user. It's a user-protection mechanism, not a server-protection one.

**Q61. Why can't `Access-Control-Allow-Origin: *` be used with credentials?**
The spec forbids it explicitly — a wildcard plus credentials would mean any site could make authenticated requests and read the responses, which is exactly what the policy exists to prevent. You must echo a specific origin.

**Q62. What's a preflight and when does it happen?**
An `OPTIONS` request before a "non-simple" request — any method other than GET/POST/HEAD, custom headers, or a `Content-Type` outside the form/text set. `application/json` triggers it, so every one of your API calls is preflighted.

**Q63. How do you reduce preflight cost?**
`Access-Control-Max-Age` so the browser caches the preflight result. Browsers cap it (Chrome at 2 hours), but it removes the extra round trip on most requests.

**Q64. What are `Secure`, `HttpOnly`, `SameSite` and `Domain` on a cookie?**
`Secure` — HTTPS only. `HttpOnly` — not readable by JS. `SameSite` — controls cross-site sending (`strict`/`lax`/`none`). `Domain` — which hosts receive it; setting a parent domain shares it with all subdomains, which widens exposure.

**Q65. What is cookie tossing?**
A subdomain (perhaps compromised or user-controlled) sets a cookie on the parent domain that shadows the legitimate one. It's why `Domain` should be as narrow as possible and why `__Host-` prefixed cookies exist — they're only accepted with `Secure`, path `/`, and no `Domain` attribute.

**Q66. What's session fixation and are you exposed?**
An attacker sets a known session identifier before login and reuses it after. With JWTs you mint a fresh token at login, so there's no fixation — worth stating as a property of the design.

**Q67. How do you handle logout on multiple devices?**
You can't, with plain stateless JWTs — each device's token remains valid until expiry. Options: a `tokenVersion` on the user included in the token and compared on each request (bump it to invalidate everything), or server-side refresh tokens you can revoke.

**Q68. How would you implement refresh tokens?**
Short-lived access token (15 min) in memory or a cookie, long-lived refresh token in an `httpOnly`, path-scoped cookie, stored server-side so it can be revoked. On refresh, rotate the refresh token and detect reuse of an old one as a theft signal (that's refresh token rotation with reuse detection).

**Q69. Why rotate refresh tokens?**
So a stolen refresh token has a narrow window, and so reuse of a rotated token is detectable — which is the only reliable signal that a refresh token was stolen.

**Q70. Is `localStorage` a safe place for a token?**
No — any XSS reads it and exfiltrates it, giving persistent access beyond the page. `httpOnly` cookies are better for tokens. Storing a non-sensitive *profile* there, as you do, is fine.

---

## Section D — Cryptography and secrets (Q71–95)

**Q71. Hashing vs encryption vs encoding — the difference?**
Hashing is one-way and fixed-length (passwords, integrity). Encryption is reversible with a key (confidentiality). Encoding (base64, URL encoding) is reversible with no key and provides **no security whatsoever** — it's a representation change. Confusing encoding with encryption is a classic interview filter.

**Q72. Is a JWT encrypted?**
No. The header and payload are base64url-encoded and fully readable by anyone holding the token. Only the signature provides integrity. JWE exists for encrypted tokens but is rarely used.

**Q73. What can you safely put in a JWT payload?**
Non-sensitive identifiers and claims the client may see: user ID, role, expiry. Never passwords, PII beyond what's already exposed, or anything that would be harmful if read.

**Q74. Your JWT contains `email` — is that a problem?**
Mild. It's the user's own email in their own token, so it's not a disclosure to them. It becomes a problem if tokens leak into logs or URLs. Keeping the payload minimal is the better practice.

**Q75. Symmetric vs asymmetric encryption?**
Symmetric (AES) — one shared key, fast, key distribution is the hard problem. Asymmetric (RSA, ECC) — key pair, slow, solves distribution. Real systems use both: asymmetric to exchange a symmetric key, then symmetric for the bulk data. That's the TLS handshake in one sentence.

**Q76. Walk me through a TLS 1.3 handshake.**
ClientHello with supported cipher suites and a key share → ServerHello with the chosen suite, its key share and certificate → both derive the shared secret via ECDHE → encrypted handshake finished → application data. TLS 1.3 completes in one round trip (and zero with 0-RTT resumption), versus two for 1.2.

**Q77. What is forward secrecy?**
Using ephemeral key exchange (ECDHE) so that compromising the server's long-term private key later does not let an attacker decrypt previously recorded sessions. TLS 1.3 mandates it.

**Q78. What does a certificate actually prove?**
That a CA the client trusts has attested that the public key in the certificate belongs to the named domain. It proves identity, not trustworthiness.

**Q79. What is HSTS?**
`Strict-Transport-Security` — tells the browser to use HTTPS for this host for a period, preventing SSL-stripping downgrade attacks on subsequent visits. Preloading covers the very first visit.

**Q80. How do you store secrets in your app?**
Environment variables, `.env` gitignored, `.env.example` committed with placeholder values. In CI, GitHub Actions secrets.

**Q81. What's wrong with environment variables for secrets?**
They're visible in the process environment, can leak into crash dumps, logs and child processes, and there's no rotation or audit. A secrets manager (Vault, AWS Secrets Manager, Azure Key Vault) gives rotation, access control and an audit trail.

**Q82. What do you do if a secret leaks into git history?**
**Rotate it first** — that's the only thing that actually helps. Then rewrite history (`git filter-repo`) and force-push if the repo is private and coordinated. Assume anything pushed to a public repo is compromised permanently; GitHub is scraped within seconds.

**Q83. How would you detect leaked secrets?**
Pre-commit hooks (gitleaks, detect-secrets), GitHub secret scanning, and a CI check. None of these are in your repo — a concrete improvement.

**Q84. Your `client/.env` is tracked in git. Is that a problem?**
Yes, it's tracked (not just `.env.example`). Even though `VITE_` values are public by design — they're compiled into the bundle — committing the file is a bad habit that eventually commits something that isn't public. **Check what's in it and remove it from tracking.** *(This is a real finding in your repo: `client/.env` appears in the file listing.)*

**Q85. Can you put a secret in a `VITE_` variable?**
Never. Vite inlines `VITE_`-prefixed variables into the client bundle at build time, so it ships to every browser. This is a frequent and costly mistake.

**Q86. What's the difference between `JWT_SECRET` being weak vs strong?**
HS256 security rests entirely on the secret's entropy. A dictionary word can be cracked offline from a single captured token, after which the attacker mints tokens for any user with any role. It should be at least 256 bits of random data.

**Q87. How would you rotate `JWT_SECRET` without logging everyone out?**
Support multiple verification keys with a key ID (`kid`) in the header: sign new tokens with the new key, verify against both during a transition window equal to the token lifetime, then retire the old one.

**Q88. What's the risk of a 7-day token with no revocation?**
A stolen token is valid for up to a week with no way to stop it. Combined with no logging, you wouldn't know it was stolen.

**Q89. What is a timing attack and where does yours exist?**
An attack that infers secret data from response-time differences. In `login`, `if (!user || !user.password) return 401` returns before running bcrypt, so a non-existent email responds in microseconds and an existing one in ~100ms. That's a reliable user-enumeration oracle.

**Q90. Fix it.**
Always perform a bcrypt comparison against a fixed dummy hash when the user isn't found, so both paths take comparable time. And use a constant-time comparison for any token/OTP equality check.

**Q91. Why is `===` unsafe for comparing secrets?**
JavaScript string comparison short-circuits on the first differing character, leaking position information through timing. `crypto.timingSafeEqual` on buffers is the correct primitive. **Your OTP check uses `stored !== otp` — a direct string comparison. It's a weak oracle given network noise, but it's the textbook answer and worth knowing.**

**Q92. What is a nonce and where would you use one?**
A number used once, to prevent replay. Relevant to CSP script allowlisting and to any signed-request scheme.

**Q93. What is HMAC?**
A keyed hash providing integrity and authenticity — you can verify a message came from someone holding the key and wasn't modified. It's what HS256 JWTs use, and what time-limited TURN credentials use.

**Q94. What is a salt vs a pepper?**
A salt is per-password, stored alongside the hash, and defeats precomputation. A pepper is a single secret applied to all passwords, stored separately from the database (in config or an HSM), so a database dump alone is insufficient to crack. Knowing the pepper concept is a differentiator.

**Q95. How would you store an API key a *user* gives you (not your own)?**
Encrypt at rest with a key from a secrets manager, never log it, never return it (show a masked prefix), and support rotation. Hashing isn't an option because you need to use it, unlike a password.

---

## Section E — Rate limiting, abuse and operations (Q96–120)

**Q96. Where do you need rate limiting most?**
In order: `/api/auth/verify-otp` (brute force), `/api/auth/resend-otp` (email cost and spam), `/api/auth/login` (credential stuffing), `/api/ai/*` (money), and file uploads (bandwidth and storage).

**Q97. What algorithms are available?**
Fixed window (simple, allows a 2× burst across a boundary), sliding window log (exact, memory-heavy), sliding window counter (good compromise), token bucket (allows bursts up to bucket size), leaky bucket (smooths output to a constant rate).

**Q98. Which for a login endpoint?**
Sliding window or token bucket keyed on both IP and account, with a lockout escalation. Keying on account alone allows a distributed attack; keying on IP alone allows an attacker to lock out victims by hammering their account — so you need both dimensions.

**Q99. Why must the counter increment be atomic?**
`GET` then `SET` from concurrent requests races and undercounts, defeating the limit under exactly the conditions it exists for. Use `INCR` with an `EXPIRE` set on first increment, or a Lua script so the whole check-and-increment executes atomically on the Redis server.

**Q100. Show me the Lua approach conceptually.**
A script that does `INCR key`, and if the result is 1 sets `EXPIRE`, then returns the count. Because Redis executes scripts atomically, no interleaving is possible. In your job scheduler you implemented exactly this — be ready to talk about it (Chapter 12).

**Q101. Rate limiting behind a load balancer — what breaks?**
`req.ip` is the load balancer's IP unless you trust and parse `X-Forwarded-For`. Express's `trust proxy` setting controls this. Getting it wrong means either everyone shares one bucket, or clients can spoof their IP by setting the header themselves.

**Q102. Why is spoofing `X-Forwarded-For` possible?**
It's a client-settable header. You may only trust the entries appended by proxies you control, which is why `trust proxy` takes a hop count or a list of trusted addresses rather than a boolean in production.

**Q103. What happens when the rate limiter's Redis is down?**
Decide and defend. For a limiter protecting expensive AI calls: fail closed. For one protecting login: failing open risks brute force, failing closed locks everyone out — the usual answer is a local in-process fallback limiter, degraded but non-zero.

**Q104. How would you stop one user monopolising the AI budget?**
Per-user token quotas in Redis, a per-user concurrency cap, and a global circuit breaker. Quotas need to be per-period and visible to the user so the failure is comprehensible.

**Q105. What's a CAPTCHA for and where would you put one?**
Raising the cost of automation. On registration and after N failed logins. Note it's a UX cost and it's defeatable by solving services, so it's friction, not a control.

**Q106. How do you prevent email bombing through `resend-otp`?**
Rate limit per email and per IP, enforce a minimum interval between sends, cap total sends per email per day, and require the email to correspond to an existing unverified account (which your code does).

**Q107. How would you detect account takeover?**
Anomalies: login from a new country or device, many failed attempts followed by a success, a password change immediately after login. Alert the user by email on those events.

**Q108. What is the principle of least privilege and where does it apply here?**
Every component gets only the access it needs. Applies to: the Mongo user (your app doesn't need `dbAdmin`), the Cloudinary key (upload-only where possible), and roles inside the app — a teacher should only access their own courses.

**Q109. What's defence in depth?**
Multiple independent controls so a single failure isn't a breach. Your authorisation bug is a good illustration: authentication worked perfectly and the breach happens anyway, because there was only one layer doing the authorisation job and it was miswired.

**Q110. What's a security header you'd add first?**
`Content-Security-Policy`, because it mitigates an entire class (XSS) rather than a single issue.

**Q111. How would you threat-model this application?**
Name a method — STRIDE (Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege) — and apply it to one asset. Take "a student's grade": Spoofing → the IDOR; Tampering → the same; Repudiation → no audit log; Information disclosure → unauthenticated socket rooms; DoS → no rate limits; Elevation → role self-assignment at registration. **Running STRIDE live against one asset is an outstanding answer.**

**Q112. Who are your threat actors?**
A student wanting a better grade (most likely, most motivated, has legitimate access). A student wanting to disrupt a class. An external attacker looking for credentials or compute. Ranking by likelihood *and* access is the insight — the insider with legitimate credentials is your realistic adversary, which is precisely why authorisation matters more than perimeter security here.

**Q113. How would you do a security review of someone else's PR?**
Look for: identity taken from anywhere but the verified credential; new endpoints without authorisation; user input reaching a query, a filesystem path, a shell command or an HTML sink; new dependencies; secrets; and error messages that leak internals.

**Q114. Have you found a security bug in someone else's code?**
Yes — the Kubescape path traversal. Tell that story: how you found it (reading handler resolution code for an unrelated reason), why it was exploitable, how you fixed it, and what the maintainers said in review. **This is one of the strongest stories you own.**

**Q115. What's responsible disclosure?**
Report privately to the maintainers, give them a reasonable window to fix, coordinate publication, and don't exploit or publicise before the fix. For CNCF projects there's a documented security process and often a `SECURITY.md`.

**Q116. What's a CVE and does your fix have one?**
A Common Vulnerabilities and Exposures identifier, assigned by a CNA. Know whether your Kubescape fix got one — if it did, that's a significant line for your resume and you should lead with it.

**Q117. How would you make the SmartClass codebase secure-by-default for future contributors?**
Make the insecure thing impossible rather than discouraged: a validation middleware that strips identity fields, a `requireRole` middleware, a lint rule banning `req.body.userId`, and a test helper that makes writing a negative authorisation test trivial. **"Make the wrong thing hard" is the senior framing.**

**Q118. What's the first thing you'd do on day one at a company, security-wise?**
Read the authentication and authorisation code paths end to end before touching anything else, because that's where a misunderstanding causes the most damage.

**Q119. If you had to pick one security lesson from this project?**
*"A check that looks like a check isn't necessarily a check. The `if (course.teacher !== teacherId) return 403` line reads as authorisation and is actually nothing, because both sides of the comparison are under the attacker's influence. I now read authorisation code by asking, for every value: where did this come from, and could the caller control it?"*

**Q120. Would you disclose this bug publicly?**
It's your own portfolio project with no real users, so there's no third party at risk — and being open about it is more valuable than hiding it. In a repo with real users, fix first, then disclose.

---

## Section F — Rapid-fire (Q121–140)

**Q121. 401 vs 403?** 401 = not authenticated (or credentials invalid). 403 = authenticated but not permitted.
**Q122. Authentication vs authorisation?** Who you are vs what you may do.
**Q123. Authorisation models?** RBAC (roles), ABAC (attributes/policy), ReBAC (relationships — the Zanzibar model), ACLs.
**Q124. Which does your app use?** RBAC in intent (`role: student|teacher`), but ownership checks are really ReBAC ("is this the teacher *of this course*"). Recognising the mixture is a good answer.
**Q125. What's an ACL?** A per-object list of who may do what. Fine-grained, hard to audit at scale.
**Q126. What's the confused deputy problem?** A privileged component acts on behalf of a less-privileged caller using its own authority. Your IDOR is exactly this.
**Q127. What's TOCTOU?** Time-of-check to time-of-use — state changes between validating and acting. Relevant to the path-traversal fix (symlink swap) and to your `order` assignment race.
**Q128. What's a race condition in a web app?** Two concurrent requests interleaving on shared state — e.g. double-spending a one-time coupon. Defence: atomic operations or unique constraints at the database.
**Q129. Where does your app have one?** Assignment `order` assignment (read-max-then-write), and enrolment before the unique index catches it.
**Q130. What is idempotency and why does it matter for APIs?** The same request applied twice has the same effect as once. It makes retries safe. Implemented with an idempotency key the server records.
**Q131. Is your submit endpoint idempotent?** Yes, incidentally — it's an upsert keyed on (assignment, student), so a retry overwrites rather than duplicating.
**Q132. What's HTTP parameter pollution?** Sending a parameter twice so different layers parse it differently (`?role=user&role=admin`). Express turns repeats into arrays, which can break code expecting a string.
**Q133. What's a subdomain takeover?** A DNS record pointing at a deprovisioned service someone else can claim, letting them serve content on your subdomain — which then inherits cookies scoped to the parent domain.
**Q134. What's DNS rebinding?** An attacker's domain resolves first to their server, then to an internal address, bypassing origin-based protections. Relevant to SSRF defence.
**Q135. What's a supply chain attack in npm?** A compromised or typosquatted package running arbitrary code at install (`postinstall`) or runtime. Defences: lockfiles, `npm ci`, `--ignore-scripts` where feasible, audit, and pinning.
**Q136. What's SRI?** Subresource Integrity — a hash on a `<script>` or `<link>` so the browser refuses a CDN asset that doesn't match. Useful when loading third-party scripts.
**Q137. What's a security regression test?** A test encoding a previously-exploitable condition so it can't return. Every fixed vulnerability should get one.
**Q138. What's fuzzing?** Feeding random or mutated input to find crashes and unexpected states. Go has native fuzzing (`go test -fuzz`), which is directly relevant to a parser like `mountinfo`.
**Q139. Did you fuzz the mountinfo parser?** If you didn't, saying *"I didn't, and for a `/proc` parser that's exactly where fuzzing would have added value beyond the table-driven tests"* is a strong, self-aware answer.
**Q140. What's your one-sentence security philosophy?**
*"Assume every input is hostile, assume every check will be bypassed, and make sure that when one control fails the next one still holds."*

---

*Next: [Chapter 09 — Databases](09-QA-DATABASES.md)*
