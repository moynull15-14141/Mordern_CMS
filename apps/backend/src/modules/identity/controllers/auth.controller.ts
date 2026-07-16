import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';
import { AuthTokensDto } from '../dto/auth-tokens.dto';
import { CurrentUserDto } from '../dto/current-user.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { LoginDto } from '../dto/login.dto';
import { MessageResponseDto } from '../dto/message-response.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ResendVerificationDto } from '../dto/resend-verification.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { RequestContext } from '../interfaces/request-context.interface';
import { AuthService } from '../services/auth.service';

/**
 * All 8 endpoints from the milestone brief §3. Validation lives in the DTOs;
 * business logic lives in AuthService — this controller only translates
 * HTTP <-> service calls, per "no business logic inside controllers."
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with email and password' })
  @ApiWrappedResponse(AuthTokensDto)
  login(@Body() dto: LoginDto, @Req() req: FastifyRequest): Promise<AuthTokensDto> {
    return this.authService.login(dto, this.buildContext(req, dto.deviceName));
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a refresh token and its session' })
  @ApiWrappedResponse(MessageResponseDto)
  logout(@Body() dto: RefreshTokenDto): Promise<MessageResponseDto> {
    return this.authService.logout(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate a refresh token for a new access/refresh token pair' })
  @ApiWrappedResponse(AuthTokensDto)
  refresh(@Body() dto: RefreshTokenDto, @Req() req: FastifyRequest): Promise<AuthTokensDto> {
    return this.authService.refresh(dto, this.buildContext(req));
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset token (generic response either way)' })
  @ApiWrappedResponse(MessageResponseDto)
  forgotPassword(@Body() dto: ForgotPasswordDto): Promise<MessageResponseDto> {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset a password using a valid, single-use reset token' })
  @ApiWrappedResponse(MessageResponseDto)
  resetPassword(@Body() dto: ResetPasswordDto): Promise<MessageResponseDto> {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify an email address using a verification token' })
  @ApiWrappedResponse(MessageResponseDto)
  verifyEmail(@Body() dto: VerifyEmailDto): Promise<MessageResponseDto> {
    return this.authService.verifyEmail(dto);
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend an email verification token (generic response either way)' })
  @ApiWrappedResponse(MessageResponseDto)
  resendVerification(@Body() dto: ResendVerificationDto): Promise<MessageResponseDto> {
    return this.authService.resendVerification(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiWrappedResponse(CurrentUserDto)
  getMe(@CurrentUser() user: AuthenticatedUser): CurrentUserDto {
    return this.authService.getCurrentUser(user);
  }

  private buildContext(req: FastifyRequest, deviceName?: string): RequestContext {
    return {
      ipAddress: req.ip ?? null,
      userAgent: (req.headers['user-agent'] as string | undefined) ?? null,
      deviceName: deviceName ?? null,
      // Foundation only (Milestone 4.1 §3) — no UA parser or geo-IP lookup
      // wired in yet, so these always stay null for now.
      browser: null,
      operatingSystem: null,
      country: null,
      city: null,
    };
  }
}
