import { io } from "socket.io-client";

let socket = null;

/**
 * Socket.IO client singleton — one connection per tab.
 *
 * The server derives the user identity from the JWT in the httpOnly `sc_token`
 * cookie, which the browser attaches to the handshake because of
 * `withCredentials`. It is deliberately NOT passed as a query parameter: the
 * server used to trust `query.userId`, which let any client join another user's
 * personal room and receive their notifications and grades.
 *
 * The `userId` argument is kept only so callers can signal that the identity
 * changed — it is never sent.
 */
export function getSocket(userId) {
  if (socket && socket.__userId !== userId) disconnectSocket();

  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      withCredentials: true, // sends the auth cookie with the handshake
      autoConnect: true,
    });
    socket.__userId = userId;
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
