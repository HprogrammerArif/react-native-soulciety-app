// Gemini API Key — must be set via EXPO_PUBLIC_GEMINI_API_KEY env variable
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const GEMINI_MODEL = "gemini-1.5-flash";

export async function askGemini(prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 256, // ✅ COST CONTROL
        },
      }),
    }
  );

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}
