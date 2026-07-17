import { ApiProperty } from '@nestjs/swagger';
import { SeoWarningCode } from '../interfaces/seo-warning.interface';

export class SeoWarningDto {
  @ApiProperty({ enum: SeoWarningCode })
  code!: SeoWarningCode;

  @ApiProperty()
  field!: string;

  @ApiProperty()
  message!: string;
}

/** Deterministic warnings only — no AI, no scoring algorithm (per
 * instruction). See `utils/seo-analysis.util.ts`. */
export class SeoAnalysisDto {
  @ApiProperty({ type: [SeoWarningDto] })
  warnings!: SeoWarningDto[];
}
