import type { Message } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Sends the question (plus earlier messages for context) to the Python backend.
export async function sendMessage(message: string, history: Message[]): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history: history.filter((m) => !m.isError).map(({ role, content }) => ({ role, content })),
      }),
    });
  } catch {
    throw new Error("Unable to connect to the server. Please try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Something went wrong while generating the response. Please try again.");
  }
  return data.response;
}
