const DEFAULT_GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_GEMINI_MODEL = "gemini-1.5-flash";

export async function generateGeminiContent({
  apiKey,
  prompt,
  model = DEFAULT_GEMINI_MODEL,
  baseUrl = DEFAULT_GEMINI_BASE_URL,
  generationConfig = { temperature: 0.2, maxOutputTokens: 400 },
}) {
  const url = `${baseUrl}/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        ...generationConfig,
        response_mime_type: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    const err = new Error(`Gemini request failed: ${response.status} ${errorBody}`);
    err.statusCode = 502;
    throw err;
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    const err = new Error("Gemini returned an empty response");
    err.statusCode = 502;
    throw err;
  }

  return text;
}
