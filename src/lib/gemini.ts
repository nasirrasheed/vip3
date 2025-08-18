import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(apiKey);

const MODEL = 'gemini-1.5-flash'; // fast + good enough for UI conversations

export interface NLGInput {
  userMessage: string;
  extracted: Record<string, any>;
  missing: string[];
  mode: 'normal' | 'confirm' | 'cancelled' | 'nonUK' | 'update';
}

const SYSTEM_RULES = `
You are Alex, a warm, professional VIP transport assistant for the UK.
GOALS:
1) Sound natural and human.
2) Gently guide users to provide required booking info: name, email, phone, service_type, pickup_location, dropoff_location, booking_date, booking_time, passenger_count. Then optional: vehicle_preference, special_requirements.
3) When off-topic or silly questions appear, respond kindly, then steer back to booking.
STYLE:
- Brief, friendly, emoji-light (😊 max), no walls of text.
- Always acknowledge what the user already told you.
- Ask **one** next best question at a time, unless summarizing.
- If all required details are present, ask for confirmation in a crisp checklist.
EDGE CASES:
- If request is outside UK: clarify we only operate within the UK and ask location within UK.
- If user cancels: be polite, close gracefully.
- If user wants updates/changes: acknowledge and confirm the updated field, then ask next best question.
`;

export async function generateNaturalReply(input: NLGInput): Promise<string> {
  const { userMessage, extracted, missing, mode } = input;

  const prompt = `
${SYSTEM_RULES}

CURRENT STATE JSON:
${JSON.stringify({ extracted, missing, mode }, null, 2)}

USER SAID:
"""
${userMessage}
"""

Write your reply now.`;

  const model = genAI.getGenerativeModel({ model: MODEL });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return text.trim();
}
