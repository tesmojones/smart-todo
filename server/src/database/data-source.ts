import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { User } from './entities/user.entity';
import { Task } from './entities/task.entity';

config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL'),
  entities: [User, Task],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: configService.get<string>('NODE_ENV') === 'development',
  ssl: false,
});