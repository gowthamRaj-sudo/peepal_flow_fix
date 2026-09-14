export interface SendResult {
  ok: boolean;
  providerId?: string;
  error?: string;
}

export interface OutboundMessage {
  to: string;
  subject?: string;
  body: string;
}

export interface MessageProvider {
  readonly id: string;
  send(message: OutboundMessage): Promise<SendResult>;
}
