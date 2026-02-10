import { Chat, User } from "@entities";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ReasonAssignment } from "../chat.enum";

@Entity()
export class ChatAssignments {
  @PrimaryGeneratedColumn('uuid', { name: 'chat_assignment_id' })
  id: string;

  @ManyToOne(() => Chat)
  chat: Chat;

  @ManyToOne(() => User)
  agent: User;

  @Column({ type: 'datetime' })
  assignedAt: Date;

  @Column({ type: 'datetime' })
  unassignedAt: Date;

  @Column({
    type: 'simple-enum',
    enum: ReasonAssignment,
    default: ReasonAssignment.AUTO
  })
  reason: ReasonAssignment;
}