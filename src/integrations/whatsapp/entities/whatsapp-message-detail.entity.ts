import { Message, WhatsAppConfig } from "@entities";
import {
  Column, Entity, JoinColumn,
  ManyToOne, OneToOne, PrimaryGeneratedColumn
} from "typeorm";

@Entity('whatsapp_message_details')
export class WhatsAppMessageDetail {
  @PrimaryGeneratedColumn('uuid', { name: 'whatsapp_message_detail_id' })
  id: string;

  @Column({ unique: true, nullable: true })
  waId?: string;

  @ManyToOne(() => WhatsAppConfig, { onDelete: 'SET NULL', nullable: true })
  config?: WhatsAppConfig;

  @OneToOne(() => Message, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'message_id' })
  message?: Message;
}