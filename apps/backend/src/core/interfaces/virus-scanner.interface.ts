import { Provider } from './provider.interface';

export interface VirusScanResult {
  clean: boolean;
  /** Signature/threat name, only present when `clean` is false. */
  threat?: string;
}

/**
 * Interface only has a real (always-clean) default today —
 * `NoopVirusScanner`. A real integration (ClamAV daemon over TCP, or a
 * VirusTotal-style HTTP API) would implement this same contract and be
 * bound in place of the Noop default; nothing else in the media pipeline
 * would need to change (`MediaProcessorService` only ever calls `scan()`).
 */
export interface VirusScanner extends Provider {
  scan(buffer: Buffer): Promise<VirusScanResult>;
}
