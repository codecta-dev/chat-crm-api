import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Contact } from "../../contacts/entities/contact.entity";
import { Message } from "./message.entity";
import { User } from "../../users/entities/user.entity";

export type ChatStatus = 'open' | 'pending' | 'closed' | 'archived';
export type ChatPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ChatChannel = 'whatsapp' | 'telegram' | 'messenger' | 'sms' | 'email';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'pending' })
  status: ChatStatus;

  @ManyToOne(() => Message, { nullable: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lastMessageId' })
  lastMessage?: Message;

  @Column({ default: 'low' })
  priority: ChatPriority;

  @Column({ default: 'whatsapp' })
  channel: string;

  @Column({ type: 'datetime', nullable: true })
  endedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date

  @ManyToOne(() => Contact, (contact) => contact.chats, { nullable: true, onDelete: 'SET NULL' })
  contact: Contact;

  @ManyToOne(() => User, { nullable: true })
  assignedAgent: User;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}