import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { DatabaseConfig } from './config/database.config';
import { JwtConfig } from './config/jwt.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { AiModule } from './modules/ai/ai.module';
// import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database module
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),

    // Passport module
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JWT module
    JwtModule.registerAsync({
      useClass: JwtConfig,
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    TasksModule,
    AiModule,
    // WhatsappModule, // Temporarily disabled
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}