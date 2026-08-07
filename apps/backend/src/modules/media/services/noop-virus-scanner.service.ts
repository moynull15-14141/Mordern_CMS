import { Injectable } from '@nestjs/common';
import type {
  VirusScanner,
  VirusScanResult,
} from '../../../core/interfaces/virus-scanner.interface';

/**
 * Default `VirusScanner` — always reports clean. A real integration (ClamAV
 * daemon over TCP, or a VirusTotal-style HTTP API) would implement the same
 * `VirusScanner` interface and be swapped in here; `MediaProcessorService`
 * only ever calls `scan()`, so nothing else in the pipeline would change.
 */
@Injectable()
export class NoopVirusScanner implements VirusScanner {
  readonly name = 'noop';

  async scan(_buffer: Buffer): Promise<VirusScanResult> {
    return { clean: true };
  }
}
