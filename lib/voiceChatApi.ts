import api from "./axios";

export async function sendToBackend(message: string): Promise<string> {
  const res = await api.post("https://your-backend.com/voice-chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
    }),
  });

  if (!res.ok) {
    throw new Error("Backend error");
  }

  const data = await res.json();
  return data.reply; // backend returns { reply: string }
}
