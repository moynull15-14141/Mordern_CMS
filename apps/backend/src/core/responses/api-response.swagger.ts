import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, ApiResponseOptions, getSchemaPath } from '@nestjs/swagger';

/**
 * Swagger-only mirror of the runtime envelope in ./api-response.ts (kept
 * separate because Swagger needs decorated classes, not plain interfaces).
 * `ApiWrappedResponse(Model)` is the ONE generic wrapper every endpoint
 * documents through (Milestone 4.1 §9) — no controller hand-rolls its own
 * response shape anymore.
 */
export class ApiResponseMetaDto {
  requestId?: string;
  timestamp!: string;
}

export class ApiErrorItemDto {
  code!: string;
  message!: string;
  details?: unknown;
}

export class ApiResponseDto<T> {
  success!: boolean;
  message!: string;
  data!: T;
  meta!: ApiResponseMetaDto;
  errors!: ApiErrorItemDto[];
}

/**
 * Documents an endpoint's success response as the frozen envelope wrapping
 * `model` in `data`, via OpenAPI `allOf` composition — the standard
 * NestJS-recommended pattern for generic Swagger responses. `isArray` wraps
 * `data` as `model[]` instead of `model` (added Milestone 6 for Settings'
 * list endpoints — the first callers needing it; every existing call site
 * is unaffected since the option defaults to false).
 */
export function ApiWrappedResponse<TModel extends Type<unknown>>(
  model: TModel,
  options: Omit<ApiResponseOptions, 'schema'> & { isArray?: boolean } = {}
) {
  const { isArray, ...responseOptions } = options;
  const dataSchema = isArray
    ? { type: 'array' as const, items: { $ref: getSchemaPath(model) } }
    : { $ref: getSchemaPath(model) };

  return applyDecorators(
    ApiExtraModels(ApiResponseDto, model),
    ApiResponse({
      status: 200,
      ...responseOptions,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: dataSchema,
            },
          },
        ],
      },
    })
  );
}
