import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Company } from "../../company/entities/company.entity";

@Entity('whatsapp_configs')
export class WhatsAppConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: "varchar", default: "v22.0" })
  apiVersion: string;

  @Column({ type: "varchar", default: "https://graph.facebook.com" })
  apiBaseUrl: string;

  @Column({ unique: true })
  businessId: string;

  @Column({ type: 'varchar', length: 512 })
  accessToken: string;

  @Column()
  phoneNumberId: string;

  @Column({ type: 'varchar', length: 512 })
  webhookUrl: string;

  @Column({ type: 'varchar', length: 256 })
  webhookVerifyToken: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}