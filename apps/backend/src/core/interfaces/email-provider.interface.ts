import { Provider } from './provider.interface';

export enum EmailProviderType {
  SMTP = 'smtp',
  SENDGRID = 'sendgrid',
  MAILGUN = 'mailgun',
  SES = 'ses',
}

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export interface EmailSendResult {
  messageId: string;
}

export interface EmailQueueResult {
  jobId: string;
}

export interface EmailHealthStatus {
  healthy: boolean;
  message?: string;
}

/**
 * Interface only. No SMTP/SendGrid/Mailgun/SES/nodemailer/Resend
 * implementation exists (Milestone 4.1 §5 — none of those packages are
 * installed). `send()` was the only method through Milestone 2.1; extended
 * here with the rest of the surface a real provider would need:
 * `verify()` (connection/credential check), `queue()` (async/background
 * send), `health()` (status for the platform's health checks).
 */
export interface EmailProvider extends Provider {
  send(message: EmailMessage): Promise<EmailSendResult>;
  verify(): Promise<boolean>;
  queue(message: EmailMessage): Promise<EmailQueueResult>;
  health(): Promise<EmailHealthStatus>;
}
