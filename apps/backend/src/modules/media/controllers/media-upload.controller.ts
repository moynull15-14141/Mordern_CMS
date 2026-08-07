import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { PermissionGuard } from '../../authorization/guards/permission.guard';
import { RequirePermission } from '../../authorization/decorators/require-permission.decorator';
import { PERMISSIONS } from '../../authorization/interfaces/permission.constants';
import { CurrentUser } from '../../identity/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../identity/interfaces/authenticated-user.interface';
import { MediaUploadService } from '../services/media-upload.service';
import { CreateUploadRequestDto } from '../dto/create-upload-request.dto';
import {
  AbortMultipartUploadDto,
  CompleteMultipartUploadDto,
  InitiateMultipartUploadDto,
} from '../dto/initiate-multipart-upload.dto';
import {
  MultipartUploadRequestResponseDto,
  UploadRequestResponseDto,
} from '../dto/upload-request-response.dto';
import { MediaResponseDto } from '../dto/media-response.dto';

/**
 * The real upload transport (Milestone 5) — presigned direct-to-R2 PUT for
 * single-file uploads, S3-multipart for large files, plus a confirm step
 * that enqueues async processing. Separate from `MediaController` (which
 * still handles the pre-existing "register an already-placed object"
 * flow), matching this module's existing "one controller per cohesive
 * concern" split.
 */
@ApiTags('Media Upload')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@Controller('media')
export class MediaUploadController {
  constructor(private readonly uploadService: MediaUploadService) {}

  @Post('upload-requests')
  @RequirePermission(PERMISSIONS.MEDIA_UPLOAD)
  @ApiOperation({ summary: 'Request a presigned PUT URL for a direct-to-R2 upload' })
  @ApiWrappedResponse(UploadRequestResponseDto)
  async createUploadRequest(
    @Body() dto: CreateUploadRequestDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<UploadRequestResponseDto> {
    return this.uploadService.createUploadRequest(dto, { id: user.id });
  }

  @Post('upload-requests/multipart')
  @RequirePermission(PERMISSIONS.MEDIA_UPLOAD)
  @ApiOperation({ summary: 'Initiate an S3-multipart upload for a large file' })
  @ApiWrappedResponse(MultipartUploadRequestResponseDto)
  async initiateMultipartUpload(
    @Body() dto: InitiateMultipartUploadDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MultipartUploadRequestResponseDto> {
    return this.uploadService.initiateMultipartUpload(dto, { id: user.id });
  }

  @Post('upload-requests/:id/multipart/complete')
  @RequirePermission(PERMISSIONS.MEDIA_UPLOAD)
  @ApiOperation({ summary: 'Complete a multipart upload once every part has been PUT' })
  @ApiParam({ name: 'id', description: 'mediaAssetId returned by the initiate call' })
  @ApiWrappedResponse(MediaResponseDto)
  async completeMultipartUpload(
    @Param('id') id: string,
    @Body() dto: CompleteMultipartUploadDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MediaResponseDto> {
    return this.uploadService.completeMultipartUpload(id, dto, { id: user.id });
  }

  @Post('upload-requests/:id/multipart/abort')
  @RequirePermission(PERMISSIONS.MEDIA_UPLOAD)
  @ApiOperation({ summary: 'Abort an in-progress multipart upload' })
  @ApiParam({ name: 'id', description: 'mediaAssetId returned by the initiate call' })
  async abortMultipartUpload(
    @Param('id') id: string,
    @Body() dto: AbortMultipartUploadDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<void> {
    return this.uploadService.abortMultipartUpload(id, dto, { id: user.id });
  }

  @Post(':id/confirm-upload')
  @RequirePermission(PERMISSIONS.MEDIA_UPLOAD)
  @ApiOperation({
    summary: 'Confirm the PUT actually landed and enqueue async processing (variants/scan/etc.)',
  })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MediaResponseDto)
  async confirmUpload(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MediaResponseDto> {
    return this.uploadService.confirmUpload(id, { id: user.id });
  }
}
