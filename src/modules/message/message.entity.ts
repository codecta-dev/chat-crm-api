import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Analysis } from "@modules/analysis/analysis.entity";
import { SentimentAnalysis } from "@modules/whatsapp/entities/sentiment-analysis.entity";
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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  waMessageId: string;

  @Column({ nullable: true })
  replyToMessageId: string;

  @Column({ default: MessageSenderType.SYSTEM })
  senderType: MessageSenderType;

  @Column({ nullable: true, type: 'text' })
  body: string;

  @Column({ type: 'enum', enum: MessageType, default: MessageType.TEXT })
  type: MessageType;

  @Column({ nullable: true })
  mediaUrl?: string;

  @Column({ type: 'enum', enum: MessageStatus, default: MessageStatus.SENT })
  status: MessageStatus;

  @Column({ type: 'enum', enum: MessageDirection, default: MessageDirection.IN })
  direction: MessageDirection;

  @Column('json', { nullable: true })
  reactions: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date

  @ManyToOne(() => Chat, chat => chat.messages)
  chat: Chat;

  @ManyToOne(() => Contact, contact => contact.messages, { nullable: true })
  contact: Contact;

  @ManyToOne(() => User, { nullable: true })
  agent: User;

  @OneToMany(() => SentimentAnalysis, (a) => a.message, { nullable: true })
  analysis: SentimentAnalysis[]

  @OneToMany(
    () => Analysis, (analysis) => analysis.message,
    { cascade: true }
  )
  analyses: Analysis[];
}