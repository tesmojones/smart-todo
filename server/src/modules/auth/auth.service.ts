import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../../database/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface GoogleUser {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateGoogleUser(googleUser: GoogleUser): Promise<User> {
    this.logger.log(`Validating Google user: ${googleUser.email}`);

    // Check if user exists by Google ID
    let user = await this.usersService.findByGoogleId(googleUser.googleId);

    if (!user) {
      // Check if user exists by email
      user = await this.usersService.findByEmail(googleUser.email);
      
      if (user) {
        // Update existing user with Google ID
        user = await this.usersService.update(user.id, {
          googleId: googleUser.googleId,
          picture: googleUser.picture,
        });
      } else {
        // Create new user
        user = await this.usersService.create({
          googleId: googleUser.googleId,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
        });
      }
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    this.logger.log(`User validated: ${user.id}`);
    return user;
  }

  async validateJwtPayload(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  generateJwtToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.sign(payload);
  }

  async login(user: User): Promise<{ access_token: string; user: Partial<User> }> {
    const access_token = this.generateJwtToken(user);
    
    // Return user without sensitive information
    const { id, email, name, picture, createdAt } = user;
    
    return {
      access_token,
      user: { id, email, name, picture, createdAt },
    };
  }
}