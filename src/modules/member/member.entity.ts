import { Company } from "@modules/company/entities/company.entity";
import { User } from "@modules/users/entities/user.entity";
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MemberRole, MemberStatus } from "./member.types";

@Entity('members')
@Index(['user', 'company'], { unique: true })
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Company)
  company: Company;

  @Column({ type: 'simple-enum', enum: MemberRole, default: MemberRole.AGENT })
  role: MemberRole;

  @Column({ type: 'simple-enum', enum: MemberStatus, default: MemberStatus.ACTIVE })
  status: MemberStatus;
}
