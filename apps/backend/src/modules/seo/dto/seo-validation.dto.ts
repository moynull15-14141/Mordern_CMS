import { ApiProperty } from '@nestjs/swagger';
import { SeoFieldsDto } from './seo-fields.dto';
import { SeoAnalysisDto } from './seo-analysis.dto';

/** Request body for `POST /seo/validate` — same candidate-fields shape as
 * preview (see `SeoFieldsDto`). */
export class SeoValidateRequestDto extends SeoFieldsDto {}

export class SeoValidationErrorDto {
  @ApiProperty()
  field!: string;

  @ApiProperty()
  message!: string;
}

/**
 * `POST /seo/validate`'s response — hard validation errors (would reject a
 * real write) AND soft analysis warnings (informational only) returned
 * together, since the milestone brief's API list has no separate
 * `/seo/analyze` endpoint for `SeoAnalysisDto` to attach to — see
 * docs/51_SEO_ARCHITECTURE.md "Conflict Resolution."
 */
export class SeoValidationDto {
  @ApiProperty()
  valid!: boolean;

  @ApiProperty({ type: [SeoValidationErrorDto] })
  errors!: SeoValidationErrorDto[];

  @ApiProperty({ type: SeoAnalysisDto })
  analysis!: SeoAnalysisDto;
}
