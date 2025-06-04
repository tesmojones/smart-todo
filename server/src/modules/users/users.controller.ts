import { Controller, Get, Put, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { UpdateWhatsAppDto } from './dto/update-whatsapp.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: User): Promise<User> {
    return await this.usersService.findById(user.id);
  }

  @Put('whatsapp')
  @ApiOperation({ summary: 'Update user WhatsApp number' })
  @ApiResponse({ status: 200, description: 'WhatsApp number updated successfully', type: User })
  @ApiResponse({ status: 400, description: 'Invalid WhatsApp number format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateWhatsAppNumber(
    @CurrentUser() user: User,
    @Body() updateWhatsAppDto: UpdateWhatsAppDto,
  ): Promise<User> {
    return await this.usersService.updateWhatsAppNumber(user.id, updateWhatsAppDto.whatsappNumber);
  }
}