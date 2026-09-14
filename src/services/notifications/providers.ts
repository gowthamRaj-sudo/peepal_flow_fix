import type { MessageProvider, SendResult } from "./provider";
import { logger } from "@/lib/logger";

export class ConsoleProvider implements MessageProvider {
  readonly id = "console";

  async send(message: { to: string; subject?: string; body: string }): Promise<SendResult> {
    logger.info("notification.console", { to: message.to, body: message.body });
    return { ok: true, providerId: this.id };
  }
}

export class MetaWhatsAppProvider implements MessageProvider {
  readonly id = "meta-whatsapp";

  constructor(
    private apiUrl: string,
    private token: string,
    private phoneNumberId: string,
  ) {}

  async send(message: { to: string; body: string }): Promise<SendResult> {
    try {
      const res = await fetch(
        `${this.apiUrl.replace(/\/$/, "")}/${this.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: message.to.replace(/^\+/, ""),
            type: "text",
            text: { preview_url: false, body: message.body },
          }),
        },
      );
      if (!res.ok) {
        const text = await res.text();
        return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 300)}` };
      }
      const data = (await res.json()) as { messages?: { id?: string }[] };
      return { ok: true, providerId: data.messages?.[0]?.id ?? this.id };
    } catch (e) {
      logger.error("whatsapp.send_failed", { err: e });
      return { ok: false, error: e instanceof Error ? e.message : "unknown" };
    }
  }
}

export class GenericHttpSmsProvider implements MessageProvider {
  readonly id = "generic-sms";

  constructor(private apiKey: string) {}

  async send(message: { to: string; body: string }): Promise<SendResult> {
    try {
      const res = await fetch("https://api.provider.example/v1/sms", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to: message.to, text: message.body }),
      });
      if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
      return { ok: true, providerId: this.id };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "unknown" };
    }
  }
}

export class ResendEmailProvider implements MessageProvider {
  readonly id = "resend-email";

  constructor(private apiKey: string, private from = "Peepal Flow Fix <noreply@peepalflowfix.in>") {}

  async send(message: { to: string; subject?: string; body: string }): Promise<SendResult> {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.from,
          to: [message.to],
          subject: message.subject ?? "Peepal Flow Fix Solutions",
          text: message.body,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
      }
      return { ok: true, providerId: this.id };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "unknown" };
    }
  }
}
