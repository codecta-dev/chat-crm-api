import { Company } from "@modules/companies/entities/company.entity";
import { User } from "@modules/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";
import type { MemberRole, MemberStatus } from "./members.types";

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @RelationId((member: Member) => member.user)
  userId: string;

  @ManyToOne(() => Company)
  company: Company;

  @RelationId((member: Member) => member.company)
  companyId: string;

  @Column({ default: 'agent' })
  role: MemberRole;

  @Column({ default: 'active' })
  status: MemberStatus;
}
