import { Message } from "@modules/message/message.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('sentiments')
export class SentimentAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Message, { onDelete: 'CASCADE' })
  message: Message;

  @Column({ type: 'enum', enum: ['NEG', 'NEU', 'POS'] })
  label: 'NEG' | 'NEU' | 'POS';

  @Column('float')
  neg: number;

  @Column('float')
  neu: number;

  @Column('float')
  pos: number;

  @Column({ nullable: true })
  model: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
