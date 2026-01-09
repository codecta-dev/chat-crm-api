import * as bcrypt from 'bcrypt';
import { BeforeInsert, Column, CreateDateColumn, DeleteDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Chat } from '../../chats/entities/chat.entity';
import { Notification } from '../../notifications/entities/notification.entity';

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

  @OneToMany(() => Chat, chat => chat.assignedAgent)
  chats: Chat[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[]

  // Hash password before inserting into the database
  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10); // cost factor: 10
  }
}
