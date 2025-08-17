export class VIPBookingAssistant {
  private extractedData: any;
  private askedQuestions: Set<string>;

  constructor() {
    this.extractedData = {
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      pickup_location: "",
      dropoff_location: "",
      booking_date: "",
      booking_time: "",
      passenger_count: ""
    };
    this.askedQuestions = new Set();
  }

  // ✅ Reset state
  resetConversation() {
    this.extractedData = {
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      pickup_location: "",
      dropoff_location: "",
      booking_date: "",
      booking_time: "",
      passenger_count: ""
    };
    this.askedQuestions.clear();
  }

  // ✅ Extract structured data
  extractMultipleDataFromResponse(userMessage: string): string[] {
    const extracted: string[] = [];

    // Name
    const nameMatch = userMessage.match(/(?:my name is|i am|this is)\s+([a-zA-Z\s]+)/i);
    if (nameMatch && !this.extractedData.customer_name) {
      this.extractedData.customer_name = nameMatch[1].trim();
      extracted.push(`name (${this.extractedData.customer_name})`);
    }

    // Email
    const emailMatch = userMessage.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch && !this.extractedData.customer_email) {
      this.extractedData.customer_email = emailMatch[0];
      extracted.push("email");
    }

    // Phone
    const phoneMatch = userMessage.match(/\b\+?\d[\d\s\-()]{7,}\b/);
    if (phoneMatch && !this.extractedData.customer_phone) {
      this.extractedData.customer_phone = phoneMatch[0];
      extracted.push("phone number");
    }

    // Pickup & Dropoff (UK-style)
    const fromToPattern = /(?:from|pick\s*up\s*from|collect\s*from)\s+([A-Za-z0-9\s,.-]+?\b[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2})\s+(?:to|drop\s*(?:off\s*)?(?:at|to)|and\s*drop\s*(?:off\s*)?(?:at|to)|going\s*to)\s+([A-Za-z0-9\s,.-]+?\b[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2})/i;
    const fromToMatch = userMessage.match(fromToPattern);
    if (fromToMatch) {
      if (!this.extractedData.pickup_location) {
        this.extractedData.pickup_location = fromToMatch[1].trim();
        extracted.push("pickup location");
      }
      if (!this.extractedData.dropoff_location) {
        this.extractedData.dropoff_location = fromToMatch[2].trim();
        extracted.push("dropoff location");
      }
    }

    // Dropoff only
    const dropoffMatch = userMessage.match(/(?:drop\s*at|to)\s+([A-Za-z0-9\s,.-]+?\b[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2})/i);
    if (dropoffMatch && !this.extractedData.dropoff_location) {
      this.extractedData.dropoff_location = dropoffMatch[1].trim();
      extracted.push("dropoff location");
    }

    // Date
    const dateMatch = userMessage.match(/\b(?:tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/i);
    if (dateMatch && !this.extractedData.booking_date) {
      this.extractedData.booking_date = dateMatch[0];
      extracted.push("date");
    }

    // Time
    const timeMatch = userMessage.match(/\b(?:\d{1,2}:\d{2}\s?(?:am|pm)?|\d{1,2}\s?(?:am|pm))\b/i);
    if (timeMatch && !this.extractedData.booking_time) {
      this.extractedData.booking_time = timeMatch[0];
      extracted.push("time");
    }

    // Passenger count
    const passengerMatch = userMessage.match(/\b(\d+)\s*(?:passengers?|people|seats?)\b/i);
    if (passengerMatch && !this.extractedData.passenger_count) {
      this.extractedData.passenger_count = passengerMatch[1];
      extracted.push("passenger count");
    }

    return extracted;
  }

  // ✅ Generate natural response
  generateIntelligentResponse(userMessage: string): string {
    const newlyExtracted = this.extractMultipleDataFromResponse(userMessage);

    // Build acknowledgment of everything collected so far
    const collectedSoFar: string[] = [];
    if (this.extractedData.customer_name) collectedSoFar.push(`✅ Name: ${this.extractedData.customer_name}`);
    if (this.extractedData.customer_email) collectedSoFar.push(`✅ Email: ${this.extractedData.customer_email}`);
    if (this.extractedData.customer_phone) collectedSoFar.push(`✅ Phone: ${this.extractedData.customer_phone}`);
    if (this.extractedData.pickup_location) collectedSoFar.push(`✅ Pickup: ${this.extractedData.pickup_location}`);
    if (this.extractedData.dropoff_location) collectedSoFar.push(`✅ Dropoff: ${this.extractedData.dropoff_location}`);
    if (this.extractedData.booking_date) collectedSoFar.push(`✅ Date: ${this.extractedData.booking_date}`);
    if (this.extractedData.booking_time) collectedSoFar.push(`✅ Time: ${this.extractedData.booking_time}`);
    if (this.extractedData.passenger_count) collectedSoFar.push(`✅ Passengers: ${this.extractedData.passenger_count}`);

    let acknowledgment = "";
    if (collectedSoFar.length > 0) {
      acknowledgment = `Here’s what I have so far:\n${collectedSoFar.join("\n")}`;
    }

    // Check for missing fields
    const missingFields = [];
    if (!this.extractedData.customer_name) missingFields.push("your full name");
    if (!this.extractedData.customer_email) missingFields.push("your email address");
    if (!this.extractedData.customer_phone) missingFields.push("a contact number");
    if (!this.extractedData.pickup_location) missingFields.push("the pickup location");
    if (!this.extractedData.dropoff_location) missingFields.push("the dropoff location");
    if (!this.extractedData.booking_date) missingFields.push("the booking date");
    if (!this.extractedData.booking_time) missingFields.push("the booking time");
    if (!this.extractedData.passenger_count) missingFields.push("how many passengers");

    let nextQuestion = "";
    if (missingFields.length > 0) {
      nextQuestion = `Could you please provide ${missingFields[0]}?`;
    } else {
      return `${acknowledgment}\n\n🎉 Perfect! I have all the details I need to confirm your VIP booking.`;
    }

    // If user went off-topic
    if (newlyExtracted.length === 0 && acknowledgment === "") {
      return `I appreciate what you shared. Just to keep us on track with your VIP booking, could you tell me ${missingFields[0]}?`;
    }

    return `${acknowledgment}\n\n${nextQuestion}`;
  }
}
