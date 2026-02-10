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
import { User } from "../../users/entities/user.entity";
import { Message } from "@modules/message/message.entity";

export enum ChatStatus {
  OPEN = 'open',
  PENDING = 'pending',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}
export enum ChatPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}
export enum ChatChannel {
  WHATSAPP = 'whatsapp',
  TELEGRAM = 'telegram',
  MESSENGER = 'messenger',
  SMS = 'sms',
  EMAIL = 'email'
}

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'simple-enum',
    enum: ChatStatus,
    default: ChatStatus.OPEN
  })
  status: ChatStatus;

  @ManyToOne(() => Message, { nullable: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'last_message_id' })
  lastMessage?: Message;

  @Column({ type: 'datetime', nullable: true })
  lastMessageAt?: Date;

  @Column({
    type: 'simple-enum',
    enum: ChatPriority,
    default: ChatPriority.LOW
  })
  priority: ChatPriority;

  @Column({
    type: 'simple-enum',
    enum: ChatChannel,
    default: ChatChannel.WHATSAPP
  })
  channel: ChatChannel;

  @Column({ type: 'datetime', nullable: true })
  endedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date

  @ManyToOne(() => Contact, { nullable: true, onDelete: 'SET NULL' })
  client: Contact;

  /**
   * @deprecated remove in the future
   */
  @ManyToOne(() => Contact, (contact) => contact.chats, { nullable: true, onDelete: 'SET NULL' })
  contact: Contact;

  /**
   * @deprecated remove in the future
   */
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  assignedAgent: User;

  @OneToMany(() => Message, (message) => message.chat, { nullable: true, onDelete: 'SET NULL' })
  messages: Message[];
}