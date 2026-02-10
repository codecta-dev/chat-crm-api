import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Chat } from "@modules/chats/entities";
import { Contact } from "@modules/contacts/entities/contact.entity";
import { User } from "@modules/users/entities/user.entity";

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  AUDIO = 'audio',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

export enum MessageSenderType {
  AGENT = 'agent',
  USER = 'user',
  CLIENT = 'client',
  SYSTEM = 'system',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  RECEIVED = 'received',
  READ = 'read',
  FAILED = 'failed',
}

export enum MessageDirection {
  IN = 'in',
  OUT = 'out',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid', { name: 'message_id' })
  id: string;

  @Column({ unique: true, nullable: true })
  waId?: string;

  @Column({
    type: 'simple-enum',
    enum: MessageSenderType,
    default: MessageSenderType.SYSTEM
  })
  senderType: MessageSenderType;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  senderId: string;

  /**
   * @deprecated This deleted and replace with content in the future
   */
  @Column({ nullable: true, type: 'text' })
  body: string;

  @Column({ nullable: true, type: 'text' })
  content: string;

  @Column({ type: 'simple-enum', enum: MessageType, default: MessageType.TEXT })
  type: MessageType;

  @Column({ nullable: true })
  mediaUrl?: string;

  @Column({ type: 'simple-enum', enum: MessageStatus, default: MessageStatus.SENT })
  status: MessageStatus;

  @Column({ type: 'simple-enum', enum: MessageDirection, default: MessageDirection.IN })
  direction: MessageDirection;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date

  @ManyToOne(() => Chat, chat => chat.messages, {
    nullable: true, cascade: ['insert'], onDelete: 'SET NULL'
  })
  chat?: Chat;

  /**
   * @deprecated This relation replace with sender_type in the future
   */
  @ManyToOne(() => Contact, contact => contact.messages, {
    nullable: true, cascade: ['insert'], onDelete: 'SET NULL'
  })
  contact?: Contact;

  /**
   * @deprecated This relation replace with sender_type in the future
   */
  @ManyToOne(() => User, {
    nullable: true, cascade: ['insert'], onDelete: 'SET NULL'
  })
  agent?: User;
}