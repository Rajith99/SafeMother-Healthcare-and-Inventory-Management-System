import { generateAppointmentCheckWithGemini } from "../utils/geminiUtils.js";

export class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = process.env.GEMINI_MODEL;
    this.baseUrl = process.env.GEMINI_BASE_URL;
  }

  isConfigured() {
    return Boolean(this.apiKey);
  }

  async generateAppointmentCheck(appointmentPayload) {
    if (!this.isConfigured()) {
      const err = new Error("Gemini API is not configured. Set GEMINI_API_KEY.");
      err.statusCode = 503;
      throw err;
    }

    return await generateAppointmentCheckWithGemini({
      apiKey: this.apiKey,
      model: this.model,
      baseUrl: this.baseUrl,
      appointmentPayload,
    });
  }
}
