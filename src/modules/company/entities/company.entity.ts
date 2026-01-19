import { IsOptional, IsPhoneNumber } from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Contact } from '../../contacts/entities/contact.entity';
import { WhatsAppConfig } from '../../whatsapp/entities';

export type CompanyStatus = 'active' | 'inactive' | 'suspended';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true, nullable: true })
  email?: string;

  @Column({ length: 50, nullable: true })
  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ default: 'active' })
  status: CompanyStatus;

  @OneToMany(
    () => WhatsAppConfig,
    whatsappConfig => whatsappConfig.company, { cascade: ['insert', 'update', 'soft-remove'] })
  whatsAppConfigs: WhatsAppConfig[];

  @OneToMany(() => Contact, contact => contact.company)
  contacts: Contact[];

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
