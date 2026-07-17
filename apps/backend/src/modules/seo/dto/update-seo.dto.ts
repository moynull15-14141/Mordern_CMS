import { SeoFieldsDto } from './seo-fields.dto';

/** `siteId` is immutable after creation — not on this DTO, matching every
 * other frozen-table module's convention of never allowing a site
 * reassignment through a generic update. */
export class UpdateSeoDto extends SeoFieldsDto {}
