import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { AnalysisType } from './analysis.enum';
import { Message } from '@modules/message/message.entity';

@Entity('analysis')
export class Analysis {
  @PrimaryGeneratedColumn('uuid')
  analysisId: string;

  @Column({ type: 'simple-enum', enum: AnalysisType })
  type: AnalysisType;

  @Column({ nullable: true })
  model: string;

  @Column({ type: 'json', nullable: true })
  summary: Record<string, any>;

  @CreateDateColumn() createdAt: Date;
  @DeleteDateColumn({ nullable: true }) deletedAt?: Date;

  @ManyToOne(() => Message, { onDelete: 'SET NULL', nullable: true, cascade: ['insert'] })
  message: Message;
}