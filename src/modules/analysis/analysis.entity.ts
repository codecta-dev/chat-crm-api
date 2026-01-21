import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { AnalysisType } from './analysis.enum';
import { Message } from '@modules/message/message.entity';

@Entity('analysis')
export class Analysis {
  @PrimaryGeneratedColumn('uuid')
  analysisId: string;

  @Column({ type: 'enum', enum: AnalysisType })
  type: AnalysisType;

  @Column({ nullable: true })
  model: string;

  @Column({ type: 'json', nullable: true })
  summary: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(
    () => Message, (message) => message.analyses, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'messageId' })
  message: Message;
}