import dayjs from "dayjs";
import { supabase } from "./supabase";
import { generateNaturalReply } from "./llm";

export type Role = "user" | "assistant";

export interface ChatMessage {
  role: Role;
  content: string;
  timestamp: Date;
}

export interface BookingData {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  pickup_location?: string;
  dropoff_location?: string;
  booking_date?: string; // ISO YYYY-MM-DD
  booking_time?: string; // HH:mm:ss
  service_type?: string;
  vehicle_preference?: string;
  passenger_count?: number;
  special_requirements?: string;
}

const REQUIRED: (keyof BookingData)[] = [
  "customer_name",
  "customer_email",
  "customer_phone",
  "service_type",
  "pickup_location",
  "dropoff_location",
  "booking_date",
  "booking_time",
  "passenger_count",
];

const NON_UK = [/\b(new york|paris|berlin|dubai|tokyo|usa|france|germany|spain|italy|japan|india|pakistan|outside uk|international|abroad)\b/i];
const CANCEL = [/(cancel(\s+the)?\s+booking|not interested|changed my mind|stop booking)/i];
const UPDATE = [/(change|update|modify|edit|correction|i meant|replace)/i];

export class VIPBookingAssistant {
  private conversation: ChatMessage[] = [];
  private data: BookingData = {};
  private sessionId: string;
  private bookingId: string | null = null;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.saveConversation("initiated");
  }

  private isNonUK(msg: string) {
    return NON_UK.some((r) => r.test(msg));
  }
  private isCancel(msg: string) {
    return CANCEL.some((r) => r.test(msg));
  }
  private isUpdate(msg: string) {
    return UPDATE.some((r) => r.test(msg));
  }

  private extract(message: string): Partial<BookingData> {
    const m = message.toLowerCase();
    const out: Partial<BookingData> = {};

    const email = message.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
    if (email) out.customer_email = email[0];

    const phone = message.match(/\+?\d[\d\s-]{8,}/);
    if (phone) out.customer_phone = phone[0].replace(/\s+/g, " ").trim();

    const pax = m.match(/(\d+)\s*(passengers?|pax|people|persons?)/);
    if (pax) out.passenger_count = Number(pax[1]);

    if (/\b(airport|wedding|corporate|prom|event|security|chauffeur)\b/i.test(message)) {
      const map: Record<string, string> = {
        airport: "Airport Transfer",
        wedding: "Wedding Transport",
        corporate: "Corporate Transport",
        prom: "Prom Parties",
        event: "Event Transport",
        security: "Security Services",
        chauffeur: "Chauffeur Service",
      };
      const key = Object.keys(map).find((k) => new RegExp(k, "i").test(message));
      if (key) out.service_type = map[key];
    }

    const route = message.match(/from\s+([^\n]+?)\s+to\s+([^\n]+?)([\.,\n]|$)/i);
    if (route) {
      out.pickup_location = route[1].trim();
      out.dropoff_location = route[2].trim();
    }

    if (/\btoday\b/i.test(message)) out.booking_date = dayjs().format("YYYY-MM-DD");
    if (/\btomorrow\b/i.test(message)) out.booking_date = dayjs().add(1, "day").format("YYYY-MM-DD");

    const dmy = message.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);
    if (dmy) {
      const [, d, mth, y] = dmy;
      const year = y.length === 2 ? `20${y}` : y;
      out.booking_date = dayjs(`${year}-${mth}-${d}`).format("YYYY-MM-DD");
    }

    const ymd = message.match(/(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})/);
    if (ymd) {
      const [, y, mth, d] = ymd;
      out.booking_date = dayjs(`${y}-${mth}-${d}`).format("YYYY-MM-DD");
    }

    const ampm = message.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
    if (ampm) {
      let h = Number(ampm[1]);
      const min = ampm[2] ? Number(ampm[2]) : 0;
      const mer = ampm[3].toLowerCase();
      if (mer === "pm" && h !== 12) h += 12;
      if (mer === "am" && h === 12) h = 0;
      out.booking_time = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}:00`;
    }

    const hhmm = message.match(/\b(\d{1,2}):(\d{2})\b/);
    if (hhmm) out.booking_time = `${hhmm[1].padStart(2, "0")}:${hhmm[2]}:00`;

    const name = message.match(/(?:i'm|i am|my name is|call me)\s+([A-Za-z][A-Za-z\s]{1,30})/i);
    if (name) out.customer_name = name[1].trim();

    return out;
  }

  private missing(): (keyof BookingData)[] {
    return REQUIRED.filter((k) => !this.data[k]);
  }
  private complete(): boolean {
    return this.missing().length === 0;
  }

  private async saveConversation(status: string) {
    await supabase.from("chat_conversations").upsert(
      {
        session_id: this.sessionId,
        messages: this.conversation,
        booking_id: this.bookingId,
        status,
      },
      { onConflict: "session_id" }
    );
  }

  private async saveBooking() {
    if (!this.complete() || this.bookingId) return;

    const { data, error } = await supabase
      .from("ai_bookings")
      .insert([
        {
          conversation_id: this.sessionId,
          ...this.data,
          extracted_data: this.data,
        },
      ])
      .select("id")
      .single();

    if (!error && data) {
      this.bookingId = data.id;
      await supabase
        .from("chat_conversations")
        .update({ booking_id: this.bookingId })
        .eq("session_id", this.sessionId);
    }
  }

  async processMessage(userMessage: string): Promise<{ response: string; bookingReady: boolean }> {
    this.conversation.push({ role: "user", content: userMessage, timestamp: new Date() });

    const mode: "normal" | "confirm" | "cancelled" | "nonUK" | "update" =
      this.isCancel(userMessage) ? "cancelled" : this.isNonUK(userMessage) ? "nonUK" : this.isUpdate(userMessage) ? "update" : this.complete() ? "confirm" : "normal";

    const extracted = this.extract(userMessage);
    this.data = { ...this.data, ...extracted };

    const reply = await generateNaturalReply({
      userMessage,
      extracted: this.data,
      missing: this.missing(),
      mode,
    });

    this.conversation.push({ role: "assistant", content: reply, timestamp: new Date() });

    let bookingReady = false;
    if (this.complete()) {
      await this.saveBooking();
      bookingReady = true;
    }

    await this.saveConversation(mode);

    return { response: reply, bookingReady };
  }
}
