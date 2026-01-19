import { Company } from "@modules/company/entities/company.entity";
import { User } from "@modules/users/entities/user.entity";
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { MemberRole, MemberStatus } from "./member.types";

@Entity('members')
@Index(['user', 'company'], { unique: true })
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Company)
  company: Company;

  @Column({ default: 'agent' })
  role: MemberRole;

  @Column({ default: 'active' })
  status: MemberStatus;
}
