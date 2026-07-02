import { generateGeminiContent } from "./geminiApiClient.js";
export { generateGeminiContent };

export function buildAppointmentCheckPrompt(appointmentPayload) {
  return [
    "You are an expert maternal healthcare assistant for triage.",
    "Your goal is to provide a quick-check summary based on appointment data.",
    "IMPORTANT: Do not provide a medical diagnosis. Only provide informational triage.",
    "",
    "RESPONSE FORMAT:",
    "You MUST respond ONLY with a valid JSON object. No markdown, no triple backticks, no text before or after.",
    "The JSON object MUST have these keys:",
    "- riskLevel: string (Exactly one of: 'LOW', 'MEDIUM', 'HIGH')",
    "- missingInfo: array of strings (Any vital info missing from the visit notes)",
    "- followUpAdvice: string (Practical advice for the mother/midwife)",
    "- patientFriendlySummary: string (A 2-3 sentence reassuring summary of the visit data)",
    "",
    `Appointment data to analyze: ${JSON.stringify(appointmentPayload)}`,
  ].join("\n");
}

export function parseGeminiJsonOrFallback(text) {
  const cleaned = text.trim();

  
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    
    const jsonBlock = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (jsonBlock?.[1]) {
      try {
        return JSON.parse(jsonBlock[1].trim());
      } catch (innerErr) {
        
      }
    }

    
    const rawMatch = cleaned.match(/\{[\s\S]*\}/);
    if (rawMatch) {
      try {
        return JSON.parse(rawMatch[0]);
      } catch (extractErr) {
        
      }
    }

    return asGeminiFallback(cleaned);
  }
}

export function asGeminiFallback(rawText) {
  return {
    riskLevel: "MEDIUM",
    missingInfo: [],
    followUpAdvice:
      "Review this appointment with a midwife for a final decision.",
    patientFriendlySummary: "The AI analysis is currently unavailable or in an unexpected format. Please check the vitals above.",
  };
}

export async function generateAppointmentCheckWithGemini({
  apiKey,
  model,
  baseUrl,
  appointmentPayload,
}) {
  const prompt = buildAppointmentCheckPrompt(appointmentPayload);
  const text = await generateGeminiContent({
    apiKey,
    prompt,
    model,
    baseUrl,
    generationConfig: { temperature: 0.1, maxOutputTokens: 800 },
  });

  return parseGeminiJsonOrFallback(text);
}
