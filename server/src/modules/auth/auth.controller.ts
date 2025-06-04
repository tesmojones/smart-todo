import { Controller, Get, Post, UseGuards, Req, Res, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../../database/entities/user.entity';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @Public()
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirect to Google OAuth' })
  async googleAuth(@Req() req: Request) {
    // This route initiates the Google OAuth flow
    // The actual logic is handled by the GoogleStrategy
  }

  @Get('google/callback')
  @Public()
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirect to frontend with token' })
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req.user as User;
      const loginResult = await this.authService.login(user);
      
      // Redirect to frontend with token
      const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/auth/callback?token=${loginResult.access_token}`;
      
      this.logger.log(`Redirecting user ${user.id} to frontend`);
      res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error('Google auth callback failed:', error.message);
      const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/error`);
    }
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(): Promise<{ message: string }> {
    // Since we're using stateless JWT, logout is handled on the client side
    // by removing the token from storage
    return { message: 'Logout successful' };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req: Request): Promise<Partial<User>> {
    const user = req.user as User;
    const { id, email, name, picture, createdAt } = user;
    return { id, email, name, picture, createdAt };
  }

  @Get('user')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({ status: 200, description: 'User information retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Req() req: Request): Promise<{ user: Partial<User> }> {
    const user = req.user as User;
    const { id, email, name, picture, createdAt } = user;
    return { user: { id, email, name, picture, createdAt } };
  }
}