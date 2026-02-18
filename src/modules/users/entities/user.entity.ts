import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Notification } from '../../notifications/entities/notification.entity';
import { Exclude } from "class-transformer";

export type UserRole = 'admin' | 'supervisor' | 'support' | 'agent' | 'system';
export type UserStatus = 'online' | 'offline' | 'busy';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, nullable: true })
  firstName?: string;

  @Column({ length: 255, nullable: true })
  lastName?: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', nullable: true })
  phoneNumber?: string;

  @Column({ length: 255, unique: true, nullable: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  avatar?: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: 'offline' })
  status: UserStatus;

  @Column({ type: 'varchar', length: 512, nullable: true })
  address?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[]
}
