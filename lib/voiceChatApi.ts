import api from "./axios";

/**
 * Send a message to the voice chat backend and get a reply.
 * Uses the configured axios instance with proper auth headers.
 */
export async function sendToBackend(message: string): Promise<string> {
  const res = await api.post("/api/chat/voice/", {
    message,
  });

  return res.data.reply;
}
