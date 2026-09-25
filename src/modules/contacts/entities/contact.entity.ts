import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Company } from "../../company/entities/company.entity";

export type ContactStatus = 'new' | 'lead' | 'prospect' | 'client';
export type ContactSource = 'whatsapp' | 'manual';

@Entity('contacts')
@Index(['phoneNumber', 'company'], { unique: true })
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  waId: string;

  @Column({ type: 'varchar', nullable: true })
  firstNames: string;

  @Column({ type: 'varchar', nullable: true })
  lastNames: string;

  @Column({ type: 'varchar', nullable: true })
  username: string;

  @Column({ type: 'varchar', nullable: true })
  profile: string;

  @Column({ type: 'varchar', nullable: false })
  phoneNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column({ default: 'new' })
  status: ContactStatus;

  @Column({ default: 'manual' })
  source: ContactSource;

  @Column({ type: 'datetime', nullable: true })
  lastInteractionAt: Date;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date

  @ManyToOne(() => Company, (company) => company.contacts, { nullable: true, onDelete: 'SET NULL' })
  company: Company;
}
