import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { SentimentLabel } from "./sentiment.enum";
import { Analysis } from "../analysis.entity";

@Entity()
export class SentimentAnalysis {
  @PrimaryGeneratedColumn('uuid')
  SentimentAnalysisId: string;

  @Column({
    type: 'simple-enum',
    enum: SentimentLabel,
    default: SentimentLabel.NEUTRAL
  })
  label: SentimentLabel;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  scorePos: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  scoreNeu: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  scoreNeg: number;

  @OneToOne(() => Analysis, {
    onDelete: 'SET NULL',
    nullable: true,
    cascade: ['insert']
  })
  @JoinColumn({ name: 'analysis_id' })
  analysis: Analysis;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn({ nullable: true }) deletedAt?: Date;
}
