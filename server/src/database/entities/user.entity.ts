import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Task } from './task.entity';

@Entity('users')
export class User {
  @ApiProperty({ description: 'User unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Google OAuth ID' })
  @Column({ name: 'google_id', unique: true, nullable: true })
  googleId: string;

  @ApiProperty({ description: 'User email address' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'User full name' })
  @Column()
  name: string;

  @ApiProperty({ description: 'User profile picture URL' })
  @Column({ nullable: true, length: 500 })
  picture: string;

  @ApiProperty({ description: 'User WhatsApp phone number' })
  @Column({ name: 'whatsapp_number', nullable: true, length: 20 })
  whatsappNumber: string;

  @ApiProperty({ description: 'User creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'User last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({ description: 'User last login timestamp' })
  @Column({ name: 'last_login', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastLogin: Date;

  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];
}