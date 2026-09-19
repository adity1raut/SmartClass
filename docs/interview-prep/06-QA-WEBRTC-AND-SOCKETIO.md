# Chapter 06 — WebRTC and Real-Time (140 questions)

> This is the chapter where your resume is most exposed (the SFU claim) and also where you can score highest, because most candidates who list WebRTC know only `getUserMedia`.

---

## Section A — WebRTC fundamentals (Q1–35)

**Q1. What is WebRTC in one sentence?**
A browser API and protocol suite for real-time peer-to-peer audio, video and data, with NAT traversal, encryption and congestion control built in.

**Q2. Name the three main JavaScript APIs.**
`getUserMedia` (capture camera/mic), `RTCPeerConnection` (the connection, transport and codecs), `RTCDataChannel` (arbitrary data over the same transport).

**Q3. Why does WebRTC need a signalling server at all if it's peer-to-peer?**
Because two browsers have no way to find each other. Something has to carry the SDP offer/answer and ICE candidates between them before a connection exists. WebRTC deliberately does *not* specify signalling — you pick the transport. Yours is Socket.IO.

**Q4. Is signalling part of the WebRTC spec?**
No, and that's intentional so it can be layered onto existing systems (SIP, XMPP, WebSocket, HTTP polling — anything).

**Q5. What is SDP?**
Session Description Protocol — a plain-text format (`key=value` lines) describing the session: media types, codecs and their parameters, transport info, ICE ufrag/password, DTLS fingerprint, and the direction of each media line (`sendrecv`, `sendonly`, `recvonly`, `inactive`).

**Q6. Walk me through the offer/answer exchange.**
Caller creates an offer (`createOffer`), sets it locally (`setLocalDescription`), sends it. Callee sets it remotely (`setRemoteDescription`), creates an answer, sets it locally, sends it back. Caller sets it remotely. Both now agree on codecs and transport parameters. This is the JSEP model.

**Q7. Why must `setLocalDescription` be called before sending the offer?**
Because setting it is what starts ICE gathering and finalises the description the peer must match. Sending a description you haven't committed to locally means the two sides can diverge.

**Q8. What is ICE?**
Interactive Connectivity Establishment — a framework for discovering a working network path between two peers behind NATs and firewalls. Each side gathers candidate addresses, they exchange them, then they pair them up and probe each pair with STUN binding requests until one succeeds.

**Q9. Name the candidate types.**
`host` — a local interface address. `srflx` (server-reflexive) — your public mapped address as observed by a STUN server. `relay` — an address on a TURN server that relays for you. `prflx` (peer-reflexive) — discovered during connectivity checks when a peer sees a source address it didn't expect.

**Q10. What is STUN?**
Session Traversal Utilities for NAT. A tiny protocol where you ask a server "what address do you see this request coming from", and it tells you. That reveals your NAT's public mapping. It's cheap — a STUN server handles enormous load and carries no media.

**Q11. What is TURN and why is it expensive?**
Traversal Using Relays around NAT. When no direct path works, both peers connect to a relay and the relay forwards their media. It's expensive because **all media flows through your server** — you pay full bandwidth for every stream, unlike STUN which handles a handful of packets.

**Q12. What fraction of connections need TURN?**
Commonly cited figures are 8–15%, higher on mobile and corporate networks. Your app has no TURN, so those users simply fail.

**Q13. What is trickle ICE?**
Sending candidates to the peer as they're discovered, rather than waiting for gathering to complete and bundling them into the SDP. It cuts connection setup time substantially because checks can start on the first candidate.

**Q14. Does your code use trickle ICE?**
Yes — `pc.onicecandidate` emits each candidate individually via the `ice-candidate` socket event.

**Q15. What happens if an ICE candidate arrives before `setRemoteDescription`?**
`addIceCandidate` throws (or in some implementations silently fails). The standard fix is to queue early candidates and flush them after the remote description is set. **Check whether your code does this — it's a very common bug and the source of intermittent connection failures.**

**Q16. Explain NAT types and why they matter.**
Full-cone, restricted-cone, port-restricted-cone, and symmetric. The first three map an internal address to a stable external one, so STUN's discovered address is usable by the peer. **Symmetric NAT** allocates a different external port per destination, so the address the STUN server saw is useless to the peer — that's when you need TURN.

**Q17. What is hole punching?**
Both peers send packets outward simultaneously, which causes each NAT to create a mapping for the other's address, after which inbound packets are permitted. It works because most NATs allow inbound traffic from an address you've already sent to.

**Q18. Is WebRTC media encrypted?**
Always, mandatorily. A DTLS handshake runs over the established transport and derives keys used for SRTP (media) and SCTP-over-DTLS (data channels). There is no unencrypted mode.

**Q19. How do you know you're talking to the right peer and not a MITM?**
The SDP carries a DTLS fingerprint — a hash of the peer's certificate. Because the SDP came through your *authenticated* signalling channel, you can verify the certificate presented in the DTLS handshake matches. **This is why signalling channel security matters: compromise signalling and you can MITM the media.** Your signalling is unauthenticated at the socket level, which is a real link in this chain.

**Q20. RTP vs SRTP vs RTCP?**
RTP carries the media payload with sequence numbers and timestamps. SRTP is RTP encrypted and authenticated. RTCP is the control channel alongside it, carrying receiver reports (loss, jitter, round-trip time) that drive congestion control and quality adaptation.

**Q21. What is jitter and how is it handled?**
Variation in packet arrival time. The receiver holds a jitter buffer — a small delay that smooths out variation so playback is continuous. Bigger buffer = smoother but higher latency. It's an explicit latency/quality trade-off.

**Q22. How does WebRTC handle packet loss?**
Several mechanisms: NACK (request retransmission of a specific packet, viable only within the jitter buffer window), FEC (forward error correction — send redundant data), PLI/FIR (request a new keyframe when the decoder is broken), and for audio, concealment that synthesises plausible audio over a gap.

**Q23. What is congestion control in WebRTC?**
GCC (Google Congestion Control) / the transport-cc feedback mechanism estimates available bandwidth from packet arrival timing and loss, and adjusts the encoder's target bitrate. This is why WebRTC video degrades gracefully instead of stalling.

**Q24. Which video codecs?**
VP8 and H.264 are mandatory to implement; VP9 and AV1 are widely available. The codec is negotiated in SDP — both sides list what they support and the intersection is used. H.264 has hardware decode on more devices; AV1 has much better compression at higher CPU cost.

**Q25. Which audio codec?**
Opus, essentially always. It's mandatory, adaptive from 6kbps to 510kbps, handles both speech and music, and has built-in FEC and packet loss concealment.

**Q26. What is `RTCDataChannel` and when would you use it?**
An arbitrary bidirectional data channel over the same peer connection, running SCTP over DTLS. Configurable as reliable/ordered (like TCP) or unreliable/unordered (like UDP) with `maxRetransmits`/`maxPacketLifeTime`. Use it for anything that should go peer-to-peer rather than through your server: file transfer, game state, cursor positions. **You could use it for in-class chat instead of Socket.IO** — worth mentioning as a design option, with the caveat that it would only work between connected peers, so server-relayed chat is actually the right call for a classroom.

**Q27. What are the `RTCPeerConnection` states and what do they mean?**
- `signalingState` — where you are in offer/answer (`stable`, `have-local-offer`, `have-remote-offer`, …).
- `iceGatheringState` — `new` / `gathering` / `complete`.
- `iceConnectionState` — `new`, `checking`, `connected`, `completed`, `failed`, `disconnected`, `closed`.
- `connectionState` — an aggregate of ICE and DTLS. This is the one to watch in application code.

**Q28. `disconnected` vs `failed`?**
`disconnected` is transient — connectivity checks are failing but ICE may recover. `failed` means all candidate pairs have been exhausted and it will not recover without an ICE restart.

**Q29. What is an ICE restart?**
Re-running ICE with new credentials (`createOffer({iceRestart: true})`) to recover from a failure or a network change (Wi-Fi to cellular). It reuses the peer connection and the media state.

**Q30. What is `onnegotiationneeded` and when does it fire?**
When the set of tracks or transceivers changes such that the current session description is stale — adding a track, removing one, changing direction. Your code uses it to trigger renegotiation when the teacher adds a screen share. Say so — it means you handled the hard case rather than only the initial connection.

**Q31. What is glare and how is it solved?**
Both peers send an offer simultaneously, so each receives an offer while in `have-local-offer` and neither can proceed. The modern solution is the **perfect negotiation** pattern: designate one peer "polite" and one "impolite". On a collision, the polite peer rolls back its own offer and accepts the remote one; the impolite peer ignores the incoming offer. This is a strong thing to know by name.

**Q32. What is `replaceTrack` and why is it better than remove+add?**
It swaps the media source on an existing `RTCRtpSender` **without renegotiation** — no new offer/answer, no interruption. It's how you switch from camera to screen share seamlessly. Remove+add fires `onnegotiationneeded` and causes a visible glitch. **Your code keeps a `screenSendersRef` map of senders — that's exactly the structure you need for `replaceTrack`.**

**Q33. What is a transceiver?**
An `RTCRtpTransceiver` pairs a sender and a receiver for one m-line in the SDP, with a direction. It's the modern, explicit way to control media sections, replacing the older implicit stream-based API.

**Q34. What does `contentHint` do?**
Tells the encoder what the content is so it can pick the right trade-off: `"motion"` prioritises frame rate (good for camera), `"detail"` prioritises spatial resolution (good for screen share of text), `"text"` is the extreme of that. **Your code sets `contentHint = "motion"` on camera tracks and `"detail"` on screen tracks.** That's a genuinely non-obvious optimisation and you should absolutely mention it — very few candidates know this API exists.

**Q35. How do you get statistics from a connection?**
`pc.getStats()` returns a report with entries for inbound/outbound RTP (bytes, packets, loss, jitter, frame rate, resolution), candidate pairs (which one was selected, RTT), and codecs. It's the basis of any real quality monitoring.

---

## Section B — Topologies: mesh, SFU, MCU (Q36–60)

**Q36. What topology does your app use?**
Star-topology mesh — the teacher holds one `RTCPeerConnection` per student and uploads a separate encoded stream to each. Be direct about this (Chapter 03 §3.5).

**Q37. What is an SFU?**
Selective Forwarding Unit. A media server that terminates each publisher's RTP stream and forwards packets to subscribers without decoding or re-encoding. Publishers upload once; the server fans out.

**Q38. Why is an SFU cheap on CPU?**
Because it's forwarding packets, not transcoding. It has to decrypt and re-encrypt SRTP (it terminates the DTLS session with each peer) and rewrite some RTP headers, but it never touches the video codec. The cost is bandwidth, not compute.

**Q39. What is an MCU?**
Multipoint Control Unit. It decodes every incoming stream, composites them into a single mixed output, re-encodes, and sends one stream per participant. Very high server CPU, but minimal client cost and a single stream to record.

**Q40. Compare the three quantitatively for N participants.**

| | Mesh | SFU | MCU |
|---|---|---|---|
| Publisher upstream | (N−1)×B | 1×B | 1×B |
| Publisher encodes | 1 (shared) to N (per-peer params) | 1 (or 3 with simulcast) | 1 |
| Client downstream | (N−1)×B | (N−1)×B | 1×B |
| Client decodes | N−1 | N−1 | 1 |
| Server CPU | 0 | low | very high |
| Server bandwidth | 0 | N×(N−1)×B | N×B |

**Q41. Why does mesh break down?**
Publisher upstream grows linearly. Home upstream is typically 5–20 Mbps; at 1.5 Mbps per stream you're saturated at 4–13 peers, and that's before CPU. Mobile is worse.

**Q42. When is mesh the right choice?**
Two to four participants, where the zero-infrastructure and lowest-latency properties dominate. 1:1 calls should essentially always be mesh.

**Q43. Name real SFUs.**
mediasoup (Node.js, library not server), Janus (C, plugin-based), Jitsi Videobridge (Java), LiveKit (Go, with a good managed offering), Pion (Go, library), ion-sfu. **Knowing three by name with their language is what makes the SFU discussion credible.**

**Q44. What is simulcast?**
The publisher encodes and sends the same video at several resolutions/bitrates simultaneously (e.g. 180p/360p/720p as separate RTP streams). The SFU picks which layer to forward to each subscriber based on that subscriber's estimated bandwidth and their UI (a thumbnail gets 180p, the pinned speaker gets 720p).

**Q45. What is SVC and how does it differ?**
Scalable Video Coding — a single encoded bitstream with nested layers, where dropping the top layers yields a lower quality/frame-rate stream. AV1 and VP9 support it. It's more efficient than simulcast (no duplicated encoding) but requires codec support and more sophisticated server logic.

**Q46. Can you do simulcast on a mesh?**
Not usefully. The point of simulcast is a server choosing per subscriber. In a mesh you're already sending a separate connection per peer, so you can just set a different bitrate per connection directly — which your topology could actually do via `sender.setParameters()`. Worth mentioning as a mesh optimisation you *could* add.

**Q47. How would you migrate your app to an SFU?**
*"The client-side signalling shape barely changes — instead of N peer connections to N peers, the teacher has one peer connection to the SFU and each student has one to the SFU. My `broadcaster`/`viewer` events map onto publish/subscribe. What's new is server-side: running the SFU process, routing (rooms on the SFU), and handling the SFU's own transport setup, which in mediasoup means creating a Router, WebRtcTransports, Producers and Consumers. I'd use LiveKit rather than mediasoup for a first version because it handles the room abstraction and scaling for you."*

**Q48. What's a Producer and a Consumer in mediasoup?**
A Producer represents media arriving at the SFU from a client; a Consumer represents media the SFU sends to a client. A Router is a room-level media routing context. Transports carry them. Knowing this vocabulary makes the migration answer concrete.

**Q49. How do you scale an SFU beyond one machine?**
Route participants of the same room to the same SFU instance (simplest), or cascade — connect SFUs to each other so a room can span instances, which is what large conferencing systems do for geographic distribution. Cascading trades a hop of latency for capacity and locality.

**Q50. How would you record a class?**
Three options: client-side `MediaRecorder` (which your code uses — simple, but depends on the teacher's machine and upload); server-side on an SFU (subscribe a headless consumer and write to disk); or an MCU-style composite. Your `MediaRecorder` approach is fine for a small project; say the trade-off is that a teacher who closes the tab loses the recording.

**Q51. What container/codec does `MediaRecorder` produce?**
Usually WebM with VP8/VP9 + Opus in Chromium; `mimeType` support varies by browser, which is why you must feature-detect with `MediaRecorder.isTypeSupported`. Safari historically produced MP4 only.

**Q52. How would you add live transcription server-side?**
Currently it's client-side Web Speech API. Server-side would mean routing audio to a speech service — which requires the audio to reach the server, which requires an SFU. **That's a good argument for the SFU beyond scale: it unlocks server-side processing (recording, transcription, moderation) that's impossible in a mesh.** Making that connection is a strong architectural point.

**Q53. What's the latency difference between mesh and SFU?**
Mesh is one network hop (peer to peer). SFU adds a hop through the server. In practice SFU latency is often *lower* for geographically distant peers, because the server is well-connected and the peers might otherwise route badly. So "mesh is lower latency" is only reliably true for nearby peers.

**Q54. Does an SFU see your media in plaintext?**
Yes, in the normal case — it terminates DTLS with each peer, so it decrypts and re-encrypts. That's why end-to-end encryption in conferencing needs a separate mechanism: **insertable streams / SFrame**, where the media payload is encrypted with a key the SFU doesn't have, so it can still forward but not view. Knowing this distinction is an advanced signal.

**Q55. What is E2EE in a conferencing context and why is it hard?**
The SFU must read RTP headers to route and to make forwarding decisions, but must not read the payload. SFrame encrypts the payload with a key distributed only among participants. The hard parts are key distribution and rotation as people join and leave, and the loss of server-side features (recording, transcription).

**Q56. How many participants can your current design handle?**
Be quantitative: *"Teacher upstream is the binding constraint. At 1.5 Mbps per stream and a typical 10 Mbps home upstream, that's about six students before quality collapses — and CPU may bind earlier since each peer connection has its own encoder parameters. So realistically four to six."*

**Q57. How would you make the mesh work for slightly more people without an SFU?**
Reduce per-peer bitrate via `sender.setParameters({encodings: [{maxBitrate}]})`, lower resolution, drop to audio-only for non-speakers, and only send video to participants who are actually rendering it. That last one — demand-driven streams — buys a lot.

**Q58. What's the students-see-each-other story in your app?**
Students can turn cameras on (`student-cam-on`, `student-offer`, `teacher-reanswer`), which negotiates a bidirectional track with the teacher. But it's a *star* — the teacher is the hub. Students don't connect to each other, so a student's camera reaches the teacher, and the teacher would have to forward it. **Know exactly what your code does here and describe it accurately.** If students only send to the teacher, say that.

**Q59. So the teacher's browser is acting as an SFU?**
That's actually a fair framing and a good one to offer: *"In effect the teacher's browser plays the role an SFU would, which is exactly why it doesn't scale — a browser is a bad media server."* That sentence shows you understand the architecture rather than just the label.

**Q60. If you had to defend the mesh choice to a senior engineer?**
*"Zero infrastructure, zero cost, lowest latency for small groups, and the whole media path is encrypted end-to-end by construction with no server that can read it. For a classroom of five in a project with no budget, that's the right trade. For a classroom of thirty it's the wrong one, and I'd have to change it before that."*

---

## Section C — Your specific implementation (Q61–90)

**Q61. Walk me through `makePeerForViewer`.**
Creates an `RTCPeerConnection` with `ICE_CONFIG`; adds camera tracks (setting `contentHint = "motion"`); adds the screen track if screen sharing is active (setting `contentHint = "detail"`) and stores the sender in `screenSendersRef` keyed by viewer socket ID; wires `onicecandidate` to emit to that viewer; wires `onnegotiationneeded` to create and send an offer; wires `ontrack` to handle incoming student audio and video.

**Q62. Why store the screen sender per viewer?**
So you can later call `replaceTrack` or `removeTrack` on that specific sender when the teacher stops sharing — without it you'd have to search the connection's senders each time.

**Q63. Why is the offer created in `onnegotiationneeded` rather than directly?**
Because it's the correct place — adding tracks triggers it, so you get a single code path for both the initial offer and every subsequent renegotiation. Creating offers manually alongside `onnegotiationneeded` is how you end up with duplicate offers and glare.

**Q64. What happens when a new student joins mid-class?**
Student emits `viewer` → server looks up `broadcasters.get(liveClassId)` → emits `new-viewer` to the teacher's socket → teacher calls `makePeerForViewer` → tracks are added → `onnegotiationneeded` fires → offer → answer → ICE → media.

**Q65. What happens when the teacher starts screen sharing mid-class?**
`getDisplayMedia` → for each existing peer connection, `addTrack` the screen track → `onnegotiationneeded` fires on each → N renegotiations. **A better implementation uses `replaceTrack` on the existing video sender if you're switching rather than adding.** Know which yours does and why.

**Q66. N renegotiations at once — any issue?**
Yes: a burst of signalling traffic and a burst of SDP processing on the teacher's main thread. With 20 viewers that's noticeable. Staggering them, or using `replaceTrack` to avoid renegotiation entirely, is the fix.

**Q67. How does a student turn on their camera?**
`getUserMedia` → `addTrack` on the student's peer connection → this fires the student's own `onnegotiationneeded` → student emits `student-offer` → server routes it to the teacher via `broadcasters` → teacher answers → `teacher-reanswer` back to the student socket.

**Q68. Why is there a separate `student-offer` event rather than reusing `offer`?**
Because the routing differs: `offer` is addressed with an explicit `to` socket ID, whereas `student-offer` needs the server to look up who the broadcaster is. It's a reasonable design; the alternative is for the client to learn the teacher's socket ID and use the generic path.

**Q69. Is `broadcasters` a single point of failure?**
Yes — it's process memory. Restart, or a second instance, and signalling breaks. Redis fixes it.

**Q70. What cleans up peer connections?**
`broadcaster-stop`, `end-class`, and the `disconnect` handler on the server. On the client, you must call `pc.close()` and stop all tracks, or you leak the camera (light stays on) and the connection.

**Q71. What happens if you don't call `track.stop()`?**
The camera/microphone stays active — the hardware indicator stays lit — which users notice and report as a privacy bug. Stopping the `MediaStreamTrack`s is mandatory cleanup.

**Q72. Where should that cleanup live in React?**
In the `useEffect` return function, and on explicit leave/unmount. Missing it is the most common WebRTC-in-React bug.

**Q73. Your `ICE_CONFIG` has only STUN. What's the consequence?**
Users behind symmetric NAT or UDP-blocking firewalls cannot connect at all, and the failure is silent — the connection just never reaches `connected`.

**Q74. How would you detect and surface that failure?**
Listen on `pc.onconnectionstatechange`; on `failed`, show a specific message ("we couldn't establish a direct connection — your network may be restricted") rather than a spinner. And log it, so you can measure how often it happens.

**Q75. How would you add TURN?**
Run coturn or use a hosted provider; add `{urls: 'turn:host:3478', username, credential}` to `iceServers`. **Crucially, use short-lived credentials** — a static TURN password in client-side JavaScript will be scraped and used to relay someone else's traffic on your bill. The standard approach is time-limited HMAC credentials generated by your server.

**Q76. How would you test whether TURN is being used?**
`pc.getStats()`, find the selected candidate pair, and check whether either candidate has `candidateType: 'relay'`. Also `iceTransportPolicy: 'relay'` forces relay-only for testing.

**Q77. Your subtitle feature — where does the speech recognition run?**
In the teacher's browser via `window.SpeechRecognition || window.webkitSpeechRecognition`. Browser-native, no audio sent to your server for recognition.

**Q78. What are the limitations of the Web Speech API?**
Chromium-only in practice; in Chrome it actually sends audio to Google's servers (so the "no audio leaves the browser" framing is wrong — worth being precise about); it needs network; accuracy varies with accent and background noise; continuous recognition can time out and needs restarting.

**Q79. Interim vs final results?**
Interim results are low-confidence partial transcripts emitted continuously as you speak; final results are emitted at phrase boundaries with higher confidence. Your code relays interim immediately (latency wins) and sends final to Claude for cleanup.

**Q80. Why not send interim results to Claude too?**
Cost and churn — interim results change several times a second, so you'd be paying for corrections that are immediately superseded. Correct decision, say it deliberately.

**Q81. The out-of-order correction bug — explain it.**
Two `speech:final` events fire in quick succession. Each triggers an async Claude call. If the second resolves first, the first's correction arrives last and overwrites the newer caption. There's no sequence number, so the client can't detect it. Fix: attach an incrementing ID and have the client drop corrections older than what it's showing.

**Q82. How would you reduce subtitle cost?**
Batch several finals into one call; skip very short utterances; debounce; and honestly, question whether the correction is worth paying for at all given the raw transcript is already displayed.

**Q83. `new Anthropic()` inside the socket handler — what's wrong?**
A new client object per event. The SDK client is designed to be reused; creating one per message wastes allocations and, depending on the implementation, may not reuse the HTTP connection pool. Hoist it to module scope.

**Q84. How do you handle a student joining before the teacher?**
`broadcasters.get(liveClassId)` returns undefined, so no `new-viewer` is sent and the student sits waiting. When the teacher later emits `broadcaster`, the server emits `broadcaster-ready` to the room — the student must listen for that and re-emit `viewer`. **Check your client does this**; if not, early joiners never connect.

**Q85. How do you handle a network switch (Wi-Fi → mobile)?**
ICE goes to `disconnected` then `failed`. Recovery requires an ICE restart. If your code doesn't do one, the user must rejoin. Honest answer: *"Currently they have to rejoin; an ICE restart on `failed` is the fix."*

**Q86. How would you add a "poor connection" indicator?**
Poll `getStats()` every few seconds, read `packetsLost`, `jitter`, `roundTripTime` and `framesPerSecond` from the inbound RTP report, and map them to a three-level indicator. That's exactly how every commercial product does it.

**Q87. How would you mute a student remotely?**
You cannot mute their microphone from outside their browser — that's a security property. What you do is stop rendering/forwarding their audio and signal their client to disable the track. A malicious client can ignore the signal, which is why a server-side SFU (which controls forwarding) is the only real enforcement.

**Q88. Security of the live class room — who can join?**
`socket.on('join-liveclass')` joins any room ID with no check. So anyone who knows or guesses a live class ID can join the room, receive signalling, and receive chat and questions. **That's a real vulnerability.** Fix: verify the JWT in socket middleware and check enrolment before joining.

**Q89. Could they receive the video?**
They'd receive `broadcaster-ready` and could emit `viewer`, and the teacher's client would happily create a peer connection for them — because the teacher's client trusts the server's `new-viewer` event. So yes. The authorisation must be server-side at the room-join boundary.

**Q90. Summarise the security posture of your real-time layer.**
*"The media itself is strongly protected — DTLS-SRTP, always on, no server in the path. The weakness is entirely in signalling authorisation: the socket connection is unauthenticated, room joins aren't checked against enrolment, and user rooms are joined from a client-supplied ID. So the crypto is fine and the access control isn't, which is the usual pattern."*

---

## Section D — Socket.IO and WebSockets (Q91–120)

**Q91. How does a WebSocket connection start?**
An HTTP GET with `Upgrade: websocket`, `Connection: Upgrade`, `Sec-WebSocket-Key` and `Sec-WebSocket-Version`. The server responds 101 Switching Protocols with `Sec-WebSocket-Accept` (a hash of the key plus a fixed GUID). After that, the same TCP connection carries WebSocket frames.

**Q92. Why the magic GUID in the handshake?**
So a server that doesn't understand WebSocket can't accidentally produce a valid-looking response, and to prevent cache-poisoning attacks against intermediaries. It proves the server deliberately spoke the protocol.

**Q93. What's in a WebSocket frame?**
FIN bit, opcode (text/binary/close/ping/pong/continuation), mask bit, payload length (with extended forms), masking key (client→server frames are always masked), and payload.

**Q94. Why are client→server frames masked?**
To prevent cache poisoning of intermediaries that might misinterpret the traffic as HTTP. It's not a security measure for confidentiality — the mask key is in the frame.

**Q95. `ws://` vs `wss://`?**
`wss` is WebSocket over TLS. Always use `wss` in production — besides confidentiality, plain `ws` is far more likely to be mangled or blocked by proxies.

**Q96. WebSocket vs SSE vs long polling — decide for me.**
Bidirectional and low latency → WebSocket. Server→client only, want simplicity and automatic reconnection over plain HTTP → SSE. Need maximum compatibility with hostile proxies → long polling, accepting the overhead. For SmartClass, WebSocket is required because signalling is bidirectional.

**Q97. What does Socket.IO add?**
Reconnection with backoff, transport fallback (polling ↔ websocket), rooms, namespaces, acknowledgements, automatic JSON/binary serialisation, and heartbeats. It is *not* a WebSocket implementation — it's a protocol on top, so a raw WebSocket client cannot talk to a Socket.IO server.

**Q98. Explain namespaces vs rooms.**
A namespace is a separate communication channel with its own middleware and handlers, multiplexed over one connection (`/admin`, `/chat`). A room is a subset of sockets *within* a namespace used for fan-out. Namespaces are for separation of concerns; rooms are for addressing.

**Q99. How do acknowledgements work?**
`socket.emit('event', data, (response) => {...})` — the receiver's handler gets a callback as the last argument and invokes it. It gives you request/response semantics over the socket. Useful for "did the server accept this" without a separate event.

**Q100. What's the default `pingInterval`/`pingTimeout`?**
25s and 20s in Socket.IO v4. The server sends a ping; if no pong within the timeout, the connection is considered dead.

**Q101. How does reconnection work?**
Automatic, with exponential backoff and randomisation, configurable via `reconnectionAttempts`, `reconnectionDelay`, `reconnectionDelayMax`. The key gotcha: **a reconnect is a new socket with a new ID and no room memberships.** You must re-join rooms on `connect`.

**Q102. What's `socket.recovery` / connection state recovery?**
A Socket.IO v4.6+ feature that can restore a socket's rooms and missed packets after a short disconnection, by buffering server-side. It's opt-in and bounded. Knowing it exists is a nice detail.

**Q103. How do you authenticate a Socket.IO connection?**
`io.use((socket, next) => { ... next() })` middleware, reading the token from `socket.handshake.auth.token` (preferred) or the cookie header, verifying it, and attaching the result to `socket.data`. Rejecting means calling `next(new Error(...))`.

**Q104. Why `handshake.auth` rather than `handshake.query`?**
Query strings end up in logs, in Referer headers, and in proxy access logs. `auth` is a dedicated payload for credentials sent in the handshake body. **Your code uses `query` for the user ID — which is both unauthenticated and the wrong channel.**

**Q105. How do you scale Socket.IO horizontally?**
The Redis adapter: each instance subscribes to Redis channels, and `io.to(room).emit()` publishes so every instance delivers to its local room members. Plus sticky sessions if polling transport is enabled.

**Q106. What exactly does the Redis adapter do?**
It replaces the in-memory broadcast implementation. Broadcasts become Redis pub/sub messages; room membership stays local to each instance but the *fan-out* becomes cluster-wide. It also supports cross-instance operations like fetching all sockets.

**Q107. What if Redis goes down with the adapter in place?**
Cross-instance broadcasts stop; each instance still works locally. So users on the same instance still see each other's messages and users on different instances don't — a partial, confusing failure. You need to alert on it.

**Q108. Alternatives to the Redis adapter?**
The cluster adapter (for `node:cluster` on one machine), the MongoDB adapter, and the Postgres adapter. Or a dedicated managed service (Ably, Pusher, Socket.IO's own managed offering).

**Q109. How would you implement presence (who's online)?**
Redis set per room, added on join and removed on disconnect, with a TTL heartbeat so crashed instances don't leave ghosts. The hard part is the crash case, which is why the TTL matters.

**Q110. Backpressure — what if a client can't keep up?**
Socket.IO buffers per socket. An unbounded buffer for a slow client is a memory leak. You need to monitor the buffer and drop or disconnect slow consumers. This is a real production concern most candidates have never thought about.

**Q111. How do you handle a message that must not be lost?**
Sockets give you no durability. Either persist first and let the socket be a notification (which is what your `pushNotification` does — good), or use acknowledgements with retries and idempotency.

**Q112. How do you version socket events?**
Namespaces (`/v2`), or an envelope with a version field. Breaking an event shape breaks every connected old client instantly — unlike HTTP where old clients just keep calling the old endpoint.

**Q113. How do you test socket handlers?**
`socket.io-client` connecting to a server started on an ephemeral port, emitting and asserting on received events, with explicit timeouts. Your suite mocks `socketService` entirely, so you have zero coverage here — say so.

**Q114. What's the memory cost per connection?**
A few KB for the socket itself, plus whatever you attach (`socket.data`), plus buffers. Tens of thousands of connections per process is realistic; the binding constraint is usually your per-connection application state, not the socket.

**Q115. `ulimit -n` — why does it matter?**
Each connection is a file descriptor. The default soft limit (often 1024) caps concurrent connections far below what the process could handle. Raising it is a standard deployment step.

**Q116. How do you gracefully shut down a server with open sockets?**
On SIGTERM: stop accepting new connections, emit a "server restarting" event so clients can prepare, close sockets, drain in-flight HTTP requests with a timeout, then exit. Just calling `process.exit()` drops everyone mid-operation.

**Q117. What is head-of-line blocking and does it affect WebSocket?**
Yes — WebSocket runs over TCP, so a lost packet stalls everything behind it in the stream. That's precisely why WebRTC media uses UDP: for real-time media, a late packet is worse than a lost one. **This is the single best answer for "why doesn't WebRTC just use WebSocket for video".**

**Q118. Could you send video over a WebSocket?**
Technically yes, and some systems do for low-volume or unidirectional cases. But you'd lose UDP's loss tolerance, the congestion control tuned for media, the jitter buffer, and the NAT traversal — you'd be rebuilding WebRTC badly.

**Q119. What is QUIC and does it change this?**
QUIC is UDP-based with per-stream reliability, eliminating head-of-line blocking across streams. WebTransport (built on HTTP/3) exposes it to browsers with both reliable streams and unreliable datagrams — which makes it a plausible future transport for media without the full WebRTC stack. Knowing WebTransport exists is a strong forward-looking signal.

**Q120. When would you *not* use Socket.IO?**
When you need a raw WebSocket protocol for interop (Socket.IO's framing is proprietary), when payload overhead matters, when you're in a serverless environment that can't hold connections, or when SSE would do and you want the operational simplicity.

---

## Section E — Scenario and debugging (Q121–140)

**Q121. A user reports "the video freezes every 30 seconds."**
Hypotheses in order: keyframe interval issues combined with packet loss (a lost keyframe freezes until the next one — check `pliCount` in stats); bandwidth estimation oscillating; CPU throttling on the encoder (check `qualityLimitationReason` in outbound stats — it reports `cpu`, `bandwidth` or `none`). That last stat is exactly the tool for this and naming it is impressive.

**Q122. Audio works, video doesn't.**
Video m-line rejected in SDP negotiation (codec mismatch), the video track never added, the track is muted/ended, bandwidth so constrained the encoder dropped video, or an autoplay policy blocked the video element (audio-only autoplay is sometimes permitted where video isn't). Check `pc.getStats()` for an outbound video RTP entry with increasing `bytesSent`.

**Q123. Video plays for the teacher locally but students see black.**
Local preview uses the local stream and doesn't prove anything about the connection. Check: were tracks added *before* `createOffer`? Is `iceConnectionState` connected? Is there an inbound video RTP report on the student side with increasing `framesDecoded`?

**Q124. Works on localhost, fails in production.**
Classic list: `getUserMedia` requires a secure context (HTTPS) — localhost is exempt, production isn't; mixed content blocking; `wss` vs `ws`; CORS on the signalling; no TURN so real NATs now matter; and a reverse proxy not configured to pass through WebSocket upgrades.

**Q125. How do you configure nginx for WebSocket?**
`proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade";` plus a generous `proxy_read_timeout`, because the default will kill an idle WebSocket. Forgetting the timeout is a very common production bug.

**Q126. Connections drop every 60 seconds in production.**
Almost certainly a proxy or load balancer idle timeout. Fix on the infrastructure side (raise the timeout) and on the application side (heartbeats inside the timeout window).

**Q127. A student joins and everyone else's video stalls briefly.**
The teacher's renegotiation burst plus a new encoder. This is the mesh cost surfacing. `replaceTrack` where possible, and staggering, help.

**Q128. Echo in the call.**
Someone has speakers plus microphone without echo cancellation, or the same user is joined twice on one device. `getUserMedia` constraints `echoCancellation: true`, `noiseSuppression: true`, `autoGainControl: true` are the first-line fix, plus detecting duplicate joins.

**Q129. How do you debug WebRTC in Chrome?**
`chrome://webrtc-internals` — live graphs of every peer connection, all `getStats()` values, and the full SDP for offers and answers. **Naming this URL is a strong signal that you've actually debugged WebRTC rather than read about it.**

**Q130. What do you look for first in webrtc-internals?**
The selected candidate pair (did ICE succeed, and is it relay or direct), `bytesSent`/`bytesReceived` climbing, `packetsLost`, and `qualityLimitationReason`.

**Q131. How would you monitor WebRTC in production?**
Periodically sample `getStats()` client-side and ship aggregates to your backend: connection success rate, time-to-connect, relay usage percentage, mean packets lost, and failure reasons. Connection success rate is the single most important product metric for a video feature and you currently don't measure it.

**Q132. A class of 15 is unusable. What do you tell the teacher?**
The honest engineering answer: *"The architecture can't support 15 — the teacher's uplink is carrying 15 copies of the stream. The fix isn't a tuning change, it's an SFU."* Being able to say "this is an architectural limit, not a bug" is a valuable distinction.

**Q133. Someone asks you to add breakout rooms.**
In a mesh, a breakout room is just a separate set of peer connections among a subset — actually feasible for small groups since each room is small. With an SFU it's a routing change. This is one place mesh is genuinely not worse.

**Q134. How would you add a virtual background?**
Client-side: capture the track, run segmentation (MediaPipe/TensorFlow.js) on a canvas, and use `canvas.captureStream()` as the source, or Insertable Streams to transform frames. It's CPU-heavy, which in a mesh competes with N encoders.

**Q135. How would you add live polls during class?**
Don't use WebRTC — it's a Socket.IO event plus a database write. Recognising which features belong on which transport is the point.

**Q136. The chat message order is wrong for some users.**
Server timestamps rather than client timestamps, and order by the server's receipt order. Client clocks are unsynchronised and unsynchronisable.

**Q137. How do you prevent a user opening the same class twice?**
Track active sessions per user in the room and reject or replace the second. Worth noting it's a UX guard, not security.

**Q138. Teacher loses internet for 20 seconds.**
Sockets reconnect; peer connections go `disconnected` and may recover, or `failed`. Without ICE restart handling, students need to rejoin. `LiveClass.status` remains `live` in the database throughout, which is correct here — but the earlier crash case leaves it wrong.

**Q139. How would you build "raise hand" so it survives a refresh?**
Move it server-side: a set of raised-hand user IDs per live class, held in Redis (or in the `LiveClass` document), emitted on join so a late joiner sees current state. This is the general pattern: **ephemeral UI state is fine client-side; shared state must be server-held.**

**Q140. Design a live class feature for 500 students.**
The answer is not WebRTC mesh. It's: SFU for the teacher's stream with simulcast, or for one-to-many at that scale, HLS/LL-HLS or WebRTC-to-CDN — accept 2–5 seconds of latency and get near-infinite scale and cheap CDN delivery. Interaction (chat, hands, polls) stays on WebSocket. **The key insight: at 500 viewers it's broadcasting, not conferencing, and those are different problems with different solutions.** Give that framing first and you've answered the question before discussing any technology.

---

*Next: [Chapter 07 — AI, Claude and agents](07-QA-AI-CLAUDE-AND-AGENTS.md)*
