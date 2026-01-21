import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { SentimentLabel } from "./sentiment-label.enum";
import { Analysis } from "../analysis.entity";

@Entity()
@Check(`"scorePos" BETWEEN 0 AND 1`)
@Check(`"scoreNeu" BETWEEN 0 AND 1`)
@Check(`"scoreNeg" BETWEEN 0 AND 1`)
export class SentimentAnalysis {
  @PrimaryColumn('uuid')
  SentimentAnalysisId: string;

  @Column({
    type: 'enum',
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

  @OneToOne(() => Analysis, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'analysisId' })
  analysis: Analysis;

  @CreateDateColumn() createdAt: Date;

  @UpdateDateColumn() updateAt: Date;
}
