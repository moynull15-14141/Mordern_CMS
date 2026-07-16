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
 * NestJS-recommended pattern for generic Swagger responses.
 */
export function ApiWrappedResponse<TModel extends Type<unknown>>(
  model: TModel,
  options: Omit<ApiResponseOptions, 'schema'> = {},
) {
  return applyDecorators(
    ApiExtraModels(ApiResponseDto, model),
    ApiResponse({
      status: 200,
      ...options,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
  );
}
