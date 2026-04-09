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
import { MessageSenderType, MessageType, MessageStatus, MessageDirection } from "./message.enum";

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid', { name: 'message_id' })
  id: string;

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

  @Column({ nullable: true, type: 'text' })
  content: string;

  @Column({ type: 'simple-enum', enum: MessageType, default: MessageType.TEXT })
  type?: MessageType;

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
}